import React, { FC, useState } from 'react';

import LayerData from '../../../models/layer-data';

import './layer-data-panel.scss';

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
	const [playing, setPlaying] = useState(layer.playing);

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
		setPlaying(false);
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
		setPlaying(true);
	}

	function onPlay(layer: LayerData) {
		if (layer.recording) {
			return;
		}

		layer.playing = true;
		layer.displayLiveView = false;

		setPlaying(true);
		setThru(false);
	}

	function onPause(layer: LayerData) {
		layer.playing = false;

		setPlaying(false);
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
			<p>
				{layer.name}
			</p>

			<div>
				{!recording && <button onClick={() => {onStartRecording(layer)}} style={{marginRight: '5px'}}>Record</button>}
				{recording && <button onClick={() => {onStopRecording(layer)}} style={{marginRight: '5px'}}>Stop Recording</button>}
				{!playing && <button onClick={() => {onPlay(layer)}} style={{marginRight: '5px'}}>Play</button>}
				{playing && <button onClick={() => {onPause(layer)}} style={{marginRight: '5px'}}>Pause</button>}
				<button onClick={() => {onDelete(layer)}} style={{marginRight: '5px'}}>Clear</button>
			</div>

			<div>
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
			</div>

			<div className='layer-data-panel-sliders-container'>
				<div className='layer-data-panel-slider-container'>
					<input
						type="range"
						min="0"
						max="100"
						value={opacity * 100}
						id={`opacity-${layer.name}`}
						onChange={onOpacityChange}
					/>
					<label htmlFor={`opacity-${layer.name}`}>
						Opacity
					</label>
				</div>

				<div className='layer-data-panel-slider-container'>
					<input
						type="range"
						min="0"
						max="100"
						value={invert * 100}
						id={`invert-${layer.name}`}
						onChange={onInvertChange}
					/>
					<label htmlFor={`invert-${layer.name}`}>
						Invert
					</label>
				</div>

				<div className='layer-data-panel-slider-container'>
					<input
						type="range"
						min="0"
						max="100"
						value={softness * 100}
						id={`softness-${layer.name}`}
						onChange={onSoftnessChange}
					/>
					<label htmlFor={`softness-${layer.name}`}>
						Softness
					</label>
				</div>

				<div className='layer-data-panel-slider-container'>
					<input
						type="range"
						min="0"
						max="100"
						value={thresh * 100}
						id={`thresh-${layer.name}`}
						onChange={onThreshChange}
					/>
					<label htmlFor={`thresh-${layer.name}`}>
						Thresh
					</label>
				</div>
			</div>
		</>
	);
}
export default LayerDataPanel;
