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
		window.addEventListener('touchend', onMouseUp);
		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('touchmove', onMouseMove);

		return () => {
			window.removeEventListener('mouseup', onMouseUp);
			window.removeEventListener('touchend', onMouseUp);
			window.removeEventListener('mousemove', onMouseMove);
			window.removeEventListener('touchmove', onMouseMove);
		}
	});

	const onHeaderMouseDown = (event: any) => {
		setGrabbed(true);

		const currentMousePosition = getMousePositionOnScreen(event);

		const headerPosition = event.currentTarget.getBoundingClientRect();

		setOffset(new THREE.Vector2().subVectors(new THREE.Vector2(headerPosition.left, headerPosition.bottom), currentMousePosition));
	}

	const onMouseMove = (event: MouseEvent) => {
		if (!grabbed) {
			return;
		}

		const currentMousePosition = getMousePositionOnScreen(event);

		const newPosition = new THREE.Vector2(currentMousePosition.x + offset.x, currentMousePosition.y - offset.y);

		setPosition(newPosition);
	}

	const onMouseUp = () => {
		setGrabbed(false);
	}

	function getMousePositionOnScreen(event: any) {
		const mousePosition = new THREE.Vector2(event.clientX, event.clientY);
		if (event.clientX && event.clientY) {
			mousePosition.set(
				event.clientX,
				event.clientY,
			)
		}
		else if (event.touches[0]) {
			mousePosition.set(
				event.touches[0].clientX,
				event.touches[0].clientY,
			)
		}
		else if (event.changedTouches[0]) {
			mousePosition.set(
				event.changedTouches[0].clientX,
				event.changedTouches[0].clientY,
			)
		}

		return mousePosition;
	}

	return (
		<div className='draggable-window-container' style={{
			left: `${hidden ? '25000px' : `${position.x}px`}`,
			top: `${position.y}px`,
			pointerEvents: 'all'
		}}>
			<div className='draggable-window-header' onMouseDown={onHeaderMouseDown} onTouchStart={onHeaderMouseDown} style={{pointerEvents: 'all'}}>
				{title}
			</div>
			{children}
		</div>
	);
}
export default DraggableWindow;
