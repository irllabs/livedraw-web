import { useEffect, useRef, useState } from "react";
import * as THREE from 'three';
import Stats from 'stats.js';

import createLivedrawMaterial from './util/create-livedraw-material';
import LayerData from "./app/models/layer-data";
import LiveFeed from "./app/components/live-feed/live-feed";
import LayerProperties from "./app/components/layer-properties/layer-properties";

var stats1 = new Stats();
stats1.showPanel(0); // Panel 0 = fps
stats1.dom.style.cssText = 'position:absolute;top:0px;right:0px;';

var stats2 = new Stats();
stats2.showPanel(1); // Panel 1 = ms
stats2.dom.style.cssText = 'position:absolute;top:0px;right:80px;';

var stats3 = new Stats();
stats3.showPanel(2); // Panel 1 = ms
stats3.dom.style.cssText = 'position:absolute;top:0px;right:160px;';

let videoElementRef: any = null;

function App() {
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
	const cameraFeedPlane = useRef<THREE.Mesh>();

	const [layers] = useState<LayerData[]>([
		new LayerData('layer-1', true),
		new LayerData('layer-2'),
		new LayerData('layer-3'),
		new LayerData('layer-4'),
		new LayerData('layer-5'),
	]);
	const [videoElement, setVideoElement] = useState<HTMLVideoElement>(null);

	useEffect(() => {
		statsRef.current.appendChild(stats1.dom);
		statsRef.current.appendChild(stats2.dom);
		statsRef.current.appendChild(stats3.dom);
	}, []);

	const initRendering = () => {
		const canvasWidth = window.innerWidth;
		const canvasHeight = window.innerHeight;

		scene.current = new THREE.Scene();
		finalScene.current = new THREE.Scene();
		finalScene.current.background = null;
		camera.current = new THREE.OrthographicCamera(canvasWidth / -2, canvasWidth / 2, canvasHeight / 2, canvasHeight / -2, 0.1, 1000);

		canvas.current.width = window.innerWidth;
		canvas.current.height = window.innerHeight;

		renderer.current = new THREE.WebGL1Renderer({
			canvas: canvas.current,
			alpha: true,
			preserveDrawingBuffer: true,
		});
		renderer.current.setSize(canvasWidth, canvasHeight);
		renderer.current.setClearColor(0x000000, 1);

		renderTarget.current = new THREE.WebGLRenderTarget(canvasWidth, canvasHeight, {
			depthBuffer: false,
		});

		const texture = new THREE.VideoTexture(videoElement);

		const geometry = new THREE.PlaneBufferGeometry(canvasWidth, canvasHeight, 1, 1);
		const material = new THREE.MeshBasicMaterial({
			map: texture
		});

		cameraFeedPlane.current = new THREE.Mesh(geometry, material);
		scene.current.add(cameraFeedPlane.current);

		camera.current.position.set(0, 0, 0);
		camera.current.lookAt(new THREE.Vector3(1, 0, 0));

		cameraFeedPlane.current.position.set(10, 0, 0);
		cameraFeedPlane.current.lookAt(new THREE.Vector3(0, 0, 0));

		////////////////////

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
			layer.mesh.visible = layer.frames.length > 0 || layer.displayLiveView;

			if (layer.recording) {
				const capturedFrame = new THREE.DataTexture(new Uint8Array(4 * window.innerWidth * window.innerHeight), window.innerWidth, window.innerHeight);
				renderer.current.copyFramebufferToTexture(new THREE.Vector2(0, 0), capturedFrame, 0);
				layer.frames.push(capturedFrame);
			}

			if (layer.shaderDataDirty && layer.mesh.material instanceof THREE.ShaderMaterial) {
				layer.mesh.material.uniforms.thresh.value = layer.thresh;
				layer.mesh.material.uniforms.softness.value = layer.softness;
				layer.mesh.material.uniforms.invert.value = layer.invert;
				layer.mesh.material.uniforms.opacity.value = layer.opacity;

				if (layer.displayLiveView) {
					layer.playing = false;
					layer.currentFrame = 0;
					layer.playbackDirection = 1;

					layer.mesh.material.uniforms.tex0.value = renderTarget.current.texture;
				}
				else {
					// If live view is turned off - set an empty texture for a layer.
					layer.mesh.material.uniforms.tex0.value = new THREE.Texture();
				}

				layer.shaderDataDirty = false;
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

		stats1.end();
		stats2.end();
		stats3.end();

		requestAnimationFrame(render);
	}

	function onVideoElementSet(element: HTMLVideoElement) {
		setVideoElement(element);
	}

	async function onChangeCamera(label: string) {
		const stream = await navigator.mediaDevices.getUserMedia({ video: {
			deviceId: label
		}});
		videoElement.srcObject = stream;

		setVideoElement(videoElementRef);

		/*const texture = new THREE.VideoTexture(videoElement);

		if (cameraFeedPlane.current.material instanceof THREE.MeshBasicMaterial) {
			cameraFeedPlane.current.material.map = texture;
			cameraFeedPlane.current.material.map.needsUpdate = true;
		}*/

		setTimeout(initRendering, 500);
	}

	return (
		<>
			<canvas ref={canvas} />

			<div style={{display: 'flex'}}>
				<LiveFeed onVideoElementSet={onVideoElementSet} />
				<LayerProperties layers={layers} onChangeCamera={onChangeCamera} />

				<div ref={statsRef} />
			</div>
		</>
	);
}

export default App;
