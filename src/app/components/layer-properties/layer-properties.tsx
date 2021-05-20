import { FC, useEffect, useState } from 'react';

import LayerData from '../../models/layer-data';

import DraggableWindow from '../draggable-window/draggable-window';
import LayerDataPanel from './layer-data/layer-data-panel';

import './layer-properties.scss';

interface LayerPropertiesProps {
	layers: LayerData[];
	onChangeCamera: (label: string) => void;
}

const LayerProperties: FC<LayerPropertiesProps> = ({layers, onChangeCamera}): JSX.Element => {
	const [visible, setVisible] = useState(true);

	useEffect(() => {
		window.addEventListener('keydown', onKeyDown);

		return () => {
			window.removeEventListener('keydown', onKeyDown);
		}
	}, []);

	function onKeyDown(event: KeyboardEvent) {
		if (event.key === 'u') {
			setVisible((prevState) => {
				return !prevState;
			});
		}
	}

	function handleChangeCamera(event: React.ChangeEvent<HTMLSelectElement>) {
		onChangeCamera(event.target.value);
	}

	return (
		<DraggableWindow title='Layer Properties' initialPosition={{x: 24, y: 250}} hidden={!visible}>
			{<select onChange={handleChangeCamera} id="cameras" name="cameras">
				<option key={'none'} value={'none'}>{'select camera device'}</option>
				{(window as any).videoTracks?.map((videoTrack: MediaDeviceInfo) => {
					return (
						<option key={videoTrack.deviceId} value={videoTrack.deviceId}>{videoTrack.label}</option>
					)
				})}
			</select>}
			<div className='layer-properties-container'>
				{layers.map((layer) => {
					return (
						<LayerDataPanel key={layer.name} layer={layer} onChangeCamera={onChangeCamera} />
					);
				})}
			</div>
		</DraggableWindow>
	)
}
export default LayerProperties;
