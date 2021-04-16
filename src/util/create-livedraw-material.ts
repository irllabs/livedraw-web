import * as THREE from 'three';

// Tell webpack to use raw-loader to load this file as string
// Since create-react-app does not expose webpack config we have to do it like this
import vert from '!!raw-loader!./../shaders/livedraw.vert';
import frag from '!!raw-loader!./../shaders/livedraw.frag';

export default function createLivedrawMaterial(colorMap?: THREE.Texture) {
	return new THREE.ShaderMaterial({
		vertexShader: vert,
		fragmentShader: frag,
		uniforms: {
			thresh: { value: 1.0 },
			softness: { value: 1.0 },
			invert: { value: 1.0 },
			opacity: { value: 1.0 },
			tex0: { value: colorMap || new THREE.Texture() },
			maskTex: { value: new THREE.Texture() }
		},
		defines: {
			USE_OPACITY: 'true',
		},
		extensions: {
			derivatives: true,
		},
		name: 'livedraw-shader-material',
		transparent: true,
	})
}
