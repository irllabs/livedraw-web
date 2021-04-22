import * as THREE from 'three';
import React, { FC, useEffect, useState } from 'react';

import './draggable-window.scss';

interface DraggableWindowProps {
	title: string;
	hidden?: boolean;
	initialPosition: {
		x: number;
		y: number;
	}
}

const DraggableWindow: FC<DraggableWindowProps> = ({children, title, hidden, initialPosition}): JSX.Element => {
	const [grabbed, setGrabbed] = useState(false);
	const [offset, setOffset] = useState(new THREE.Vector2());
	const [position, setPosition] = useState(new THREE.Vector2(initialPosition.x, initialPosition.y));

	useEffect(() => {
		window.addEventListener('mouseup', onMouseUp);

		return () => {
			window.removeEventListener('mouseup', onMouseUp);
		}
	});

	useEffect(() => {
		window.addEventListener('mousemove', onMouseMove);

		return () => {
			window.removeEventListener('mousemove', onMouseMove);
		}
	});

	const onHeaderMouseDown = (event: React.MouseEvent) => {
		setGrabbed(true);

		const currentMousePosition = new THREE.Vector2(event.clientX, event.clientY);
		const headerPosition = event.currentTarget.getBoundingClientRect();

		setOffset(new THREE.Vector2().subVectors(new THREE.Vector2(headerPosition.left, headerPosition.bottom), currentMousePosition));
	}

	const onMouseMove = (event: MouseEvent) => {
		if (!grabbed) {
			return;
		}

		const newPosition = new THREE.Vector2(event.clientX + offset.x, event.clientY - offset.y);

		setPosition(newPosition);
	}

	const onMouseUp = () => {
		setGrabbed(false);
	}

	return (
		<div className='draggable-window-container' style={{
			left: `${hidden ? '25000px' : `${position.x}px`}`,
			top: `${position.y}px`
		}}>
			<div className='draggable-window-header' onMouseDown={onHeaderMouseDown}>
				{title}
			</div>
			{children}
		</div>
	);
}
export default DraggableWindow;
