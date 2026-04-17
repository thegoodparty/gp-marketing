'use client';

import { useState, type CSSProperties } from 'react';
import MuxPlayer from '@mux/mux-player-react';
import { cn, tv } from './_lib/utils.ts';
import { IconResolver } from './IconResolver.tsx';

const styles = tv({
	slots: {
		wrapper: 'relative h-full group',
		videoWrapper: 'relative h-full w-full aspect-video',
		video: 'w-full max-w-none h-full object-cover',
		buttonBase:
			'absolute top-1/2 left-1/2 -translate-1/2 rounded-full bg-white p-5 h-16 w-16 flex items-center justify-center transition-opacity duration-200',
	},
});

export type VideoPlayerProps = {
	className?: string;
	playButtonText?: string;
	video?: string;
};

export function Video(props: VideoPlayerProps) {
	const playButtonText = props.playButtonText ?? 'Play';

	const [videoPlaying, setVideoPlaying] = useState(false);

	if (!props.video) return null;

	const { wrapper, videoWrapper, video, buttonBase } = styles();

	const muxUiStyle = {
		'--center-controls': 'none',
		'--play-button': 'none',
	} satisfies CSSProperties;

	return (
		<div className={cn(wrapper(), props.className)} data-component='VideoPlayer' data-mode='dark'>
			<div className={videoWrapper()}>
				<MuxPlayer className={video()} playbackId={props.video} paused={!videoPlaying} style={muxUiStyle} />
			</div>

			<button
				aria-label={playButtonText}
				onClick={() => setVideoPlaying(!videoPlaying)}
				className={cn(buttonBase(), videoPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100')}
			>
				{videoPlaying ? <IconResolver icon='pause' /> : <IconResolver icon='play' />}
			</button>
		</div>
	);
}
