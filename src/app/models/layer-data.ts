import * as THREE from "three";

export default class LayerData {
	public name: string = '';
	public frames: THREE.DataTexture[];
	public recording: boolean = false;
	public playing: boolean = false;
	public currentFrame: number = 0;
	// 1 = forward, -1 = backwards
	public playbackDirection: number = 1;
	public material?: THREE.ShaderMaterial;
	public geometry?: THREE.PlaneGeometry;
	public mesh?: THREE.Mesh;
}
