import { FC, useEffect, useRef, useState } from 'react';

import DraggableWindow from '../draggable-window/draggable-window';

interface LiveFeedProps {
	onVideoElementSet: (element: HTMLVideoElement) => void;
}

const LiveFeed: FC<LiveFeedProps> = ({onVideoElementSet}): JSX.Element => {
	const video = useRef<HTMLVideoElement>();

	const [aspectRatio, setAspectRatio] = useState(1);

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
	}, [video, onVideoElementSet]);

	return (
		<DraggableWindow title='Live feed' initialPosition={{x: 24, y: 24}}>
			<video
				id='live-feed'
				ref={video}
				autoPlay
				style={{
					width: `${150 * aspectRatio}px`,
					height: '150px',
				}}
			/>
		</DraggableWindow>
	);
}
export default LiveFeed;
