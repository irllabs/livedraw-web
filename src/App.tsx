import { useEffect, useRef, useState } from "react";
import * as THREE from 'three';
import Stats from 'stats.js';
import * as dat from 'dat.gui';

import createLivedrawMaterial from './util/create-livedraw-material';
import LayerPanel from "./app/components/layer-panel";
import LayerData from "./app/models/layer-data";

var stats1 = new Stats();
stats1.showPanel(0); // Panel 0 = fps
stats1.dom.style.cssText = 'position:absolute;top:0px;right:0px;';

var stats2 = new Stats();
stats2.showPanel(1); // Panel 1 = ms
stats2.dom.style.cssText = 'position:absolute;top:0px;right:80px;';

var stats3 = new Stats();
stats3.showPanel(2); // Panel 1 = ms
stats3.dom.style.cssText = 'position:absolute;top:0px;right:160px;';

const shaderValues = {
	thresh: 1,
	softness: 1,
	invert: 1,
	opacity: 1,
}

const gui = new dat.GUI({autoPlace: false});
gui.domElement.style.cssText = 'position:absolute;bottom:20px;right:0px;'
gui.add(shaderValues, 'thresh', 0, 1);
gui.add(shaderValues, 'softness', 0, 1);
gui.add(shaderValues, 'invert', 0, 1);
gui.add(shaderValues, 'opacity', 0, 1);

// const capturedFrames: THREE.DataTexture[] = [];

function App() {
	const video = useRef<HTMLVideoElement>();
	const canvas = useRef<HTMLCanvasElement>();
	const statsRef = useRef<HTMLDivElement>();
	
	const currentTime = useRef<number>(0);
	const previousFrameTime = useRef<number>(0);
	const elapsedTime = useRef<number>(0);
	const targetFrameTime = useRef(1000 / 35);

	const renderer = useRef<THREE.WebGLRenderer>();
	const scene = useRef<THREE.Scene>();
	const camera = useRef<THREE.Camera>();
	const renderTarget = useRef<THREE.WebGLRenderTarget>();
	const finalScene = useRef<THREE.Scene>();
	const planeFinal = useRef<THREE.Mesh>();
	
	const [aspectRatio, setAspectRatio] = useState(1);
	const [layers] = useState<LayerData[]>([{
		name: 'layer-1',
		frames: [],
		recording: false,
		playing: false,
		playbackDirection: 1,
		currentFrame: 0
	}, {
		name: 'layer-2',
		frames: [],
		recording: false,
		playing: false,
		playbackDirection: 1,
		currentFrame: 0
	}, {
		name: 'layer-3',
		frames: [],
		recording: false,
		playing: false,
		playbackDirection: 1,
		currentFrame: 0
	}, {
		name: 'layer-4',
		frames: [],
		recording: false,
		playing: false,
		playbackDirection: 1,
		currentFrame: 0
	}, {
		name: 'layer-5',
		frames: [],
		recording: false,
		playing: false,
		playbackDirection: 1,
		currentFrame: 0
	}]);

	useEffect(() => {
		getCameraFeed();

		statsRef.current.appendChild(stats1.dom);
		statsRef.current.appendChild(stats2.dom);
		statsRef.current.appendChild(stats3.dom);
		statsRef.current.appendChild(gui.domElement);
	}, []);

	useEffect(() => {
		initRendering();
	}, [aspectRatio]);

	const getCameraFeed = async () => {
		if (navigator.mediaDevices.getUserMedia) {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({ video: true });
				video.current.srcObject = stream;

				const videoTracks = stream.getVideoTracks();
				if (videoTracks[0]) {
					const videoSettings = videoTracks[0].getSettings();
					setAspectRatio(videoSettings.aspectRatio);
				}
			}
			catch (e) {
				alert('Something went wrong - couldn\'t get webcam feed');
			}
		}
	}

	const initRendering = () => {
		const canvasWidth = window.innerWidth;
		const canvasHeight = window.innerHeight;

		scene.current = new THREE.Scene();
		finalScene.current = new THREE.Scene();
		finalScene.current.background = null;
		camera.current = new THREE.OrthographicCamera(canvasWidth / -2, canvasWidth / 2, canvasHeight / 2, canvasHeight / -2, 0.1, 1000);

		canvas.current.width = window.innerWidth;
		canvas.current.height = window.innerHeight;

		renderer.current = new THREE.WebGLRenderer({
			canvas: canvas.current,
			alpha: true,
		});
		renderer.current.setSize(canvasWidth, canvasHeight);
		renderer.current.setClearColor(0xffffff, 0);

		renderTarget.current = new THREE.WebGLRenderTarget(canvasWidth, canvasHeight, {
			depthBuffer: false,
		});

		const texture = new THREE.VideoTexture(video.current);

		const geometry = new THREE.PlaneBufferGeometry(canvasWidth, canvasHeight, 1, 1);
		const material = new THREE.MeshBasicMaterial({
			map: texture
		});

		const plane = new THREE.Mesh(geometry, material);
		scene.current.add(plane);

		camera.current.position.set(0, 0, 0);
		camera.current.lookAt(new THREE.Vector3(1, 0, 0));

		plane.position.set(10, 0, 0);
		plane.lookAt(new THREE.Vector3(0, 0, 0));

		////////////////////

		const geometryFinal = new THREE.PlaneBufferGeometry(canvasWidth, canvasHeight, 1, 1);
		const materialFinal = createLivedrawMaterial(renderTarget.current.texture);

		planeFinal.current = new THREE.Mesh(geometryFinal, materialFinal);
		finalScene.current.add(planeFinal.current);

		planeFinal.current.position.set(1, 0, 0);
		planeFinal.current.lookAt(new THREE.Vector3(0, 0, 0));

		layers.forEach((layer, index) => {
			layer.geometry = new THREE.PlaneBufferGeometry(canvasWidth, canvasHeight, 1, 1);
			layer.material = createLivedrawMaterial();

			layer.mesh = new THREE.Mesh(layer.geometry, layer.material);

			finalScene.current.add(layer.mesh);

			layer.mesh.position.set(index + 2, 0, 0);
			layer.mesh.lookAt(0, 0, 0);
		});

		//////////////////////

		previousFrameTime.current = performance.now();

		render();
	}

	const render = () => {
		currentTime.current = performance.now();

		elapsedTime.current = currentTime.current - previousFrameTime.current;
		if (elapsedTime.current < targetFrameTime.current) {
			requestAnimationFrame(render);
			return;
		}
		previousFrameTime.current = performance.now();

		stats1.begin();
		stats2.begin();
		stats3.begin();

		// Render camera feed into a framebuffer
		renderer.current.setRenderTarget(renderTarget.current);
		renderer.current.render(scene.current, camera.current);
		//

		layers.forEach((layer) => {
			if (layer.recording) {
				const capturedFrame = new THREE.DataTexture(new Uint8Array(4 * window.innerWidth * window.innerHeight), window.innerWidth, window.innerHeight);
				renderer.current.copyFramebufferToTexture(new THREE.Vector2(0, 0), capturedFrame, 0);
				layer.frames.push(capturedFrame);
			}

			if (layer.playing) {
				layer.material.uniforms.tex0.value = layer.frames[layer.currentFrame];
				layer.currentFrame += layer.playbackDirection;

				if (layer.currentFrame >= layer.frames.length - 1) {
					layer.playbackDirection = -1;
				}
				if (layer.currentFrame === 0) {
					layer.playbackDirection = 1;
				}
			}
		});

		// Render final processed image to screen
		renderer.current.setRenderTarget(null);
		renderer.current.render(finalScene.current, camera.current);
		
		// renderer.current.render(scene.current, camera.current);

		if (planeFinal.current.material instanceof THREE.ShaderMaterial) {
			planeFinal.current.material.uniforms.thresh.value = shaderValues.thresh;
			planeFinal.current.material.uniforms.softness.value = shaderValues.softness;
			planeFinal.current.material.uniforms.invert.value = shaderValues.invert;
			planeFinal.current.material.uniforms.opacity.value = shaderValues.opacity;
		}

		stats1.end();
		stats2.end();
		stats3.end();

		requestAnimationFrame(render);
	}

	function onStartRecording(layer: LayerData) {
		if (layer.recording) {
			return;
		}

		layer.playing = false;

		layer.frames.forEach((frame) => {
			frame.dispose();
		});
		layer.frames = [];

		layer.recording = true;
	}

	function onStopRecording(layer: LayerData) {
		if (!layer.recording) {
			return;
		}

		layer.recording = false;
		layer.playing = true;
	}

	function onPlay(layer: LayerData) {
		if (layer.recording) {
			return;
		}

		layer.playing = true;
	}

	function onPause(layer: LayerData) {
		layer.playing = false;
	}

	function onDelete(layer: LayerData) {
		layer.frames.forEach((frame) => {
			frame.dispose();
		});
		layer.frames = [];
	}

	return (
		<>
			<canvas ref={canvas} />

			<div style={{display: 'flex'}}>
				<video ref={video} autoPlay style={{width: `${150 * aspectRatio}px`, height: '150px', position: 'fixed', left: '24px', bottom: '24px'}} />

				<div style={{display: 'flex', flexDirection: 'column', marginTop: '48px'}}>
					{layers.map((layer) => {
						return (
							<LayerPanel
								key={layer.name}
								layer={layer}
								onStartRecording={onStartRecording}
								onStopRecording={onStopRecording}
								onPlay={onPlay}
								onPause={onPause}
								onDelete={onDelete}
							/>
						);
					})}
				</div>

				<div ref={statsRef} />
			</div>
		</>
	);
}

export default App;
