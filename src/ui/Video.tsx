'use client';

import { useState } from 'react';
import MuxPlayer from '@mux/mux-player-react';

import { cn, tv } from './_lib/utils.ts';

import { IconResolver } from './IconResolver.tsx';

const styles = tv({
	slots: {
		videoWrapper: 'relative h-full w-full aspect-video',
		video: 'w-full max-w-none h-full object-cover',
		playButton:
			'absolute top-1/2 left-1/2 -translate-1/2 rounded-full bg-white p-5 h-16 w-16 flex items-center justify-center absolute bottom-0 z-2',
	},
});

export type VideoPlayerProps = {
	className?: string;
	playButtonText?: string;
	video?: string;
};

export function Video(props: VideoPlayerProps) {
	const playButtonText = props.playButtonText ?? 'Play';

	const [videoPlaying, setVideoPlaying] = useState(true);

	const { videoWrapper, video, playButton } = styles();

	const videoSettings = {
		// autoPlay: videoPlaying,
		paused: !videoPlaying,
		// playsInline: false,
		// loop: false,
		// muted: true,
	};

	if (!props.video) {
		return;
	}

	return (
		<div className={cn('h-full relative', props.className)} data-component='VideoPlayer' data-mode='dark'>
			<div className={videoWrapper()}>
				<MuxPlayer className={video()} {...videoSettings} playbackId={props.video} />
			</div>
			<button aria-label={playButtonText} className={playButton()} onClick={() => setVideoPlaying(!videoPlaying)}>
				{videoPlaying ? <IconResolver icon='pause' /> : <IconResolver icon='play' />}
			</button>
		</div>
	);
}
