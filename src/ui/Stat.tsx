'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'motion/react';
import { tv } from './_lib/utils.ts';
import type { componentColorValues } from './_lib/designTypesStore.ts';

import { Text } from './Text.tsx';

const styles = tv({
	slots: {
		base: 'relative flex flex-col p-8 rounded-xl',
		value: '',
	},
	variants: {
		color: {
			red: {
				base: 'bg-red-100',
			},
			waxflower: {
				base: 'bg-waxflower-100',
			},
			'bright-yellow': {
				base: 'bg-bright-yellow-100',
			},
			'halo-green': {
				base: 'bg-halo-green-100',
			},
			blue: {
				base: 'bg-blue-100',
			},
			lavender: {
				base: 'bg-lavender-100',
			},
			midnight: {
				base: 'bg-midnight-900 text-white',
				value: 'text-goodparty-gold',
			},
			cream: {
				base: 'bg-goodparty-cream',
			},
		},
	},
	defaultVariants: {
		color: 'cream',
	},
});

function parseAnimatedValue(value: string): { prefix: string; target: number; suffix: string } | null {
	const match = /^([^\d]*)([\d,]+)(.*)$/.exec(value);
	if (!match) return null;
	const [, prefix, numStr, suffix] = match;
	const target = parseInt(numStr.replace(/,/g, ''), 10);
	if (Number.isNaN(target)) return null;
	return { prefix, target, suffix };
}

function AnimatedNumber({ value }: { value: string }) {
	const ref = useRef<HTMLSpanElement>(null);
	const inView = useInView(ref, { threshold: 0.3, once: true });
	const [display, setDisplay] = useState(0);
	const parsed = parseAnimatedValue(value);
	const hasAnimated = useRef(false);

	useEffect(() => {
		if (!parsed || !inView || hasAnimated.current) return;
		hasAnimated.current = true;

		const { target } = parsed;
		const duration = 2000;
		const start = performance.now();

		function update(now: number) {
			const elapsed = now - start;
			const progress = Math.min(elapsed / duration, 1);
			const eased = 1 - Math.pow(1 - progress, 3);
			setDisplay(Math.floor(target * eased));
			if (progress < 1) requestAnimationFrame(update);
		}

		requestAnimationFrame(update);
	}, [inView, value]);

	if (!parsed) {
		return <span>{value}</span>;
	}

	const { prefix, suffix } = parsed;
	const formatted = display.toLocaleString();

	return (
		<span ref={ref}>
			{prefix}
			{formatted}
			{suffix}
		</span>
	);
}

export type StatProps = {
	_key?: string;
	color?: Exclude<(typeof componentColorValues)[number], 'inverse'>;
	value?: string;
	description?: string;
};

export function Stat(props: StatProps) {
	const color = props.color ?? 'cream';
	const { base, value } = styles({ color });
	const parsed = props.value ? parseAnimatedValue(props.value) : null;

	return (
		<article className={base()} data-component='Stat'>
			{props.value && (
				<Text as='span' styleType='heading-xl' className={value()}>
					{parsed ? <AnimatedNumber value={props.value} /> : props.value}
				</Text>
			)}
			{props.description && (
				<Text as='span' styleType='body-2'>
					{props.description}
				</Text>
			)}
		</article>
	);
}
