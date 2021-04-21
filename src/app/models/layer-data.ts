import * as THREE from "three";

export default class LayerData {
	public name = '';
	public displayLiveView = false;

	public frames: THREE.DataTexture[] = [];
	public recording = false;
	public playing = false;
	public currentFrame = 0;
	public playbackDirection = 1; // 1 = forward, -1 = backwards
	public opacity = 1;
	public invert = 1;
	public softness = 1;
	public thresh = 1;
	public shaderDataDirty = true;
	public material: THREE.ShaderMaterial;
	public geometry: THREE.PlaneGeometry;
	public mesh: THREE.Mesh;

	constructor(name: string, displayLiveView: boolean = false) {
		this.name = name;
		this.displayLiveView = displayLiveView;
	}
}
