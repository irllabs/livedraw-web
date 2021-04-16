// External Libraries
import { FC } from 'react';

// Models
import LayerData from '../models/layer-data';

interface LayerPanelProps {
	layer: LayerData;
	onStartRecording: (layer: LayerData) => void;
	onStopRecording: (layer: LayerData) => void;
	onPlay: (layer: LayerData) => void;
	onPause: (layer: LayerData) => void;
	onDelete: (layer: LayerData) => void;
}

const LayerPanel: FC<LayerPanelProps> = function({layer, onStartRecording, onStopRecording, onPlay, onPause, onDelete}): JSX.Element {
	return (
		<div style={{display: 'flex', margin: '10px', backgroundColor: 'lightgray', padding: '5px'}}>
			<div style={{marginRight: '5px'}}>{layer.name}</div>
			<button onClick={() => {onStartRecording(layer)}} style={{marginRight: '5px'}}>Record</button>
			<button onClick={() => {onStopRecording(layer)}} style={{marginRight: '5px'}}>Stop Recording</button>
			<button onClick={() => {onPlay(layer)}} style={{marginRight: '5px'}}>Play</button>
			<button onClick={() => {onPause(layer)}} style={{marginRight: '5px'}}>Pause</button>
			<button onClick={() => {onDelete(layer)}} style={{marginRight: '5px'}}>Delete</button>
		</div>
	)
}
export default LayerPanel;
