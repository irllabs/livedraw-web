import React, { FC, useState } from 'react';

import LayerData from '../../../models/layer-data';

interface LayerDataProps {
	layer: LayerData;
}

const LayerDataPanel: FC<LayerDataProps> = ({layer}): JSX.Element => {
	const [opacity, setOpacity] = useState(layer.opacity);
	const [invert, setInvert] = useState(layer.invert);
	const [softness, setSoftness] = useState(layer.softness);
	const [thresh, setThresh] = useState(layer.thresh);
	const [thru, setThru] = useState(layer.displayLiveView);
	const [recording, setRecording] = useState(layer.recording);

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

		setRecording(true);
	}

	function onStopRecording(layer: LayerData) {
		if (!layer.recording) {
			return;
		}

		layer.recording = false;
		layer.playing = true;
		layer.displayLiveView = false;

		setThru(false);
		setRecording(false);
	}

	function onPlay(layer: LayerData) {
		if (layer.recording) {
			return;
		}

		layer.playing = true;
		layer.displayLiveView = false;

		setThru(false);
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

	function onThruToggled(event: React.ChangeEvent<HTMLInputElement>) {
		layer.displayLiveView = event.target.checked;
		layer.shaderDataDirty = true;

		setThru(event.target.checked);
	}

	function onOpacityChange(event: React.ChangeEvent<HTMLInputElement>) {
		layer.opacity = Number(event.target.value) / 100;
		layer.shaderDataDirty = true;

		setOpacity(layer.opacity);
	}

	function onInvertChange(event: React.ChangeEvent<HTMLInputElement>) {
		layer.invert = Number(event.target.value) / 100;
		layer.shaderDataDirty = true;

		setInvert(layer.invert);
	}

	function onSoftnessChange(event: React.ChangeEvent<HTMLInputElement>) {
		layer.softness = Number(event.target.value) / 100;
		layer.shaderDataDirty = true;

		setSoftness(layer.softness);
	}

	function onThreshChange(event: React.ChangeEvent<HTMLInputElement>) {
		layer.thresh = Number(event.target.value) / 100;
		layer.shaderDataDirty = true;

		setThresh(layer.thresh);
	}

	return (
		<>
			<div key={layer.name}>
				<p>
					{layer.name}
				</p>

				<div>
					{!recording && <button onClick={() => {onStartRecording(layer)}} style={{marginRight: '5px'}}>Record</button>}
					{recording && <button onClick={() => {onStopRecording(layer)}} style={{marginRight: '5px'}}>Stop Recording</button>}
					<button onClick={() => {onPlay(layer)}} style={{marginRight: '5px'}}>Play</button>
					<button onClick={() => {onPause(layer)}} style={{marginRight: '5px'}}>Pause</button>
					<button onClick={() => {onDelete(layer)}} style={{marginRight: '5px'}}>Delete</button>
				</div>

				<label htmlFor="live-view">
					Thru
				</label>
				<input
					type="checkbox"
					id="live-view"
					name="live-view"
					checked={thru}
					onChange={onThruToggled}
				/>
				<br/>

				<label htmlFor={`opacity-${layer.name}`}>
					Opacity
				</label>
				<input
					type="range"
					min="0"
					max="100"
					value={opacity * 100}
					id={`opacity-${layer.name}`}
					onChange={onOpacityChange}
				/>
				<br />
				<label htmlFor={`invert-${layer.name}`}>
					Invert
				</label>
				<input
					type="range"
					min="0"
					max="100"
					value={invert * 100}
					id={`invert-${layer.name}`}
					onChange={onInvertChange}
				/>
				<br />
				<label htmlFor={`softness-${layer.name}`}>
					Softness
				</label>
				<input
					type="range"
					min="0"
					max="100"
					value={softness * 100}
					id={`softness-${layer.name}`}
					onChange={onSoftnessChange}
				/>
				<br />
				<label htmlFor={`thresh-${layer.name}`}>
					Thresh
				</label>
				<input
					type="range"
					min="0"
					max="100"
					value={thresh * 100}
					id={`thresh-${layer.name}`}
					onChange={onThreshChange}
				/>
			</div>
		</>
	);
}
export default LayerDataPanel;
