import { FC, useEffect, useState } from 'react';

import LayerData from '../../models/layer-data';

import DraggableWindow from '../draggable-window/draggable-window';
import LayerDataPanel from './layer-data/layer-data-panel';

import './layer-properties.scss';

interface LayerPropertiesProps {
	layers: LayerData[];
}

const LayerProperties: FC<LayerPropertiesProps> = ({layers}): JSX.Element => {
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

	return (
		<DraggableWindow title='Layer Properties' initialPosition={{x: 24, y: 250}} hidden={!visible}>
			<div className='layer-properties-container'>
				{layers.map((layer) => {
					return (
						<LayerDataPanel key={layer.name} layer={layer} />
					);
				})}
			</div>
		</DraggableWindow>
	)
}
export default LayerProperties;
