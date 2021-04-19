import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../../store';

export interface VideoState {
	element: HTMLVideoElement;
}

const initialState: VideoState = {
	element: null,
};

export const videoSlice = createSlice({
	name: 'video',
	initialState: initialState,
	reducers: {
		setVideo: (state, action: PayloadAction<HTMLVideoElement>) => {
			state.element = action.payload as any;
		},
	},
});

export const { setVideo } = videoSlice.actions;

export const selectVideoElement = (state: RootState) => state.video.element;

export default videoSlice.reducer;
