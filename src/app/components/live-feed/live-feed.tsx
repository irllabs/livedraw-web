import { FC, useEffect, useRef, useState } from 'react';

import DraggableWindow from '../draggable-window/draggable-window';

interface LiveFeedProps {
	onVideoElementSet: (element: HTMLVideoElement) => void;
}

const LiveFeed: FC<LiveFeedProps> = ({onVideoElementSet}): JSX.Element => {
	const video = useRef<HTMLVideoElement>();

	const [aspectRatio, setAspectRatio] = useState(1);
	const [visible, setVisible] = useState(true);

	useEffect(() => {
		const getCameraFeed = async () => {
			if (navigator.mediaDevices.getUserMedia) {
				try {
					const stream = await navigator.mediaDevices.getUserMedia({ video: true });
					video.current.srcObject = stream;
	
					const videoTracks = stream.getVideoTracks();
					if (videoTracks[0]) {
						const videoSettings = videoTracks[0].getSettings();
						setAspectRatio(videoSettings.aspectRatio);
	
						onVideoElementSet(video.current);
					}
				}
				catch (e) {
					alert('Something went wrong - couldn\'t get webcam feed');
				}
			}
		}

		getCameraFeed();

		window.addEventListener('keydown', onKeyDown);

		return () => {
			window.removeEventListener('keydown', onKeyDown);
		}
	}, [video, onVideoElementSet]);

	function onKeyDown(event: KeyboardEvent) {
		if (event.key === 'u') {
			setVisible((prevState) => {
				return !prevState;
			});
		}
	}

	return (
		<div style={{opacity: visible ? 1 : 0}}>
			<DraggableWindow title='Live feed' initialPosition={{x: 24, y: 24}}>
				<video
					id='live-feed'
					ref={video}
					autoPlay
					playsInline
					muted
					style={{
						width: `${150 * aspectRatio}px`,
						height: '150px',
						opacity: visible ? 1 : 0
					}}
				/>
			</DraggableWindow>
		</div>
	);
}
export default LiveFeed;
