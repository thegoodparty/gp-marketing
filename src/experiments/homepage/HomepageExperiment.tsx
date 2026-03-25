'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { trackEvent } from '~/lib/analytics';

const FLAG_KEY = 'home_hero_layout_test';
const VALID_VARIANTS = ['control', 'variant-a', 'variant-b'] as const;

type Props = {
	control: ReactNode;
	variantA: ReactNode;
	variantB: ReactNode;
};

export function HomepageExperiment(props: Props) {
	const [variant, setVariant] = useState<string | null>(null);
	const hasTrackedExposureRef = useRef(false);

	useEffect(() => {
		const applyVariant = (resolvedVariant: string) => {
			setVariant(resolvedVariant);
			if (hasTrackedExposureRef.current) return;

			trackEvent('Experiment Viewed', {
				flag_key: FLAG_KEY,
				variant: resolvedVariant,
			});
			hasTrackedExposureRef.current = true;
		};

		const isLocal =
			typeof window !== 'undefined' &&
			(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
		if (isLocal) {
			const match = new RegExp(`${FLAG_KEY}=([^;]+)`).exec(document.cookie);
			const forced = match?.[1]?.trim();
			if (forced && (VALID_VARIANTS as readonly string[]).includes(forced)) {
				applyVariant(forced);
				return;
			}
		}

		const resolve = () => {
			const exp = window.experiment;
			if (!exp) return false;
			const v = exp.variant(FLAG_KEY);
			if (v?.value) {
				applyVariant(v.value);
				return true;
			}
			return false;
		};

		if (resolve()) return;

		const onReady = () => {
			if (!resolve()) applyVariant('control');
		};
		window.addEventListener('experiment:ready', onReady);

		const timeout = setTimeout(() => {
			if (!resolve()) applyVariant('control');
		}, 3000);

		return () => {
			window.removeEventListener('experiment:ready', onReady);
			clearTimeout(timeout);
		};
	}, []);

	if (variant === null) {
		return <>{props.control}</>;
	}
	if (variant === 'variant-a') {
		return <>{props.variantA}</>;
	}
	if (variant === 'variant-b') {
		return <>{props.variantB}</>;
	}
	return <>{props.control}</>;
}
