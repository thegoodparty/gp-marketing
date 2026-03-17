'use client';

import type { ReactNode } from 'react';
import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import { cn } from './_lib/utils.ts';

const DEFAULT_OPTIONS = {
	threshold: 0.1,
	rootMargin: '0px 0px -50px 0px',
} as const;

export type FadeInProps = {
	children: ReactNode;
	delay?: number;
	duration?: number;
	className?: string;
};

export function FadeIn(props: FadeInProps) {
	const ref = useRef<HTMLDivElement>(null);
	const inView = useInView(ref, DEFAULT_OPTIONS);

	return (
		<motion.div
			ref={ref}
			initial={{ opacity: 0, y: 30 }}
			animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
			transition={{
				duration: props.duration ?? 0.8,
				delay: props.delay ?? 0,
				ease: [0.16, 1, 0.3, 1],
			}}
			className={cn(props.className)}
		>
			{props.children}
		</motion.div>
	);
}
