'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
	HOME_HERO_LAYOUT_EXPERIMENT_FLAG_KEY,
	HOMEPAGE_EXPERIMENT_VARIANT_A,
	HOMEPAGE_EXPERIMENT_VARIANT_B,
	HOMEPAGE_EXPERIMENT_VARIANT_CONTROL,
	VALID_HOMEPAGE_EXPERIMENT_VARIANTS,
	trackEvent,
} from '~/lib/analytics';

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
				flag_key: HOME_HERO_LAYOUT_EXPERIMENT_FLAG_KEY,
				variant: resolvedVariant,
			});
			hasTrackedExposureRef.current = true;
		};

		const isLocal =
			typeof window !== 'undefined' &&
			(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
		if (isLocal) {
			const match = new RegExp(`(?:^|;\\s*)${HOME_HERO_LAYOUT_EXPERIMENT_FLAG_KEY}=([^;]+)`).exec(document.cookie);
			const forced = match?.[1]?.trim();
			if (forced && (VALID_HOMEPAGE_EXPERIMENT_VARIANTS as readonly string[]).includes(forced)) {
				applyVariant(forced);
				return;
			}
		}

		const resolve = () => {
			const exp = window.experiment;
			if (!exp) return false;
			const v = exp.variant(HOME_HERO_LAYOUT_EXPERIMENT_FLAG_KEY);
			if (v?.value) {
				applyVariant(v.value);
				return true;
			}
			return false;
		};

		if (resolve()) return;

		const onReady = () => {
			if (!resolve()) applyVariant(HOMEPAGE_EXPERIMENT_VARIANT_CONTROL);
		};
		window.addEventListener('experiment:ready', onReady);

		const timeout = setTimeout(() => {
			if (!resolve()) applyVariant(HOMEPAGE_EXPERIMENT_VARIANT_CONTROL);
		}, 3000);

		return () => {
			window.removeEventListener('experiment:ready', onReady);
			clearTimeout(timeout);
		};
	}, []);

	const resolved = variant !== null;
	const content =
		variant === HOMEPAGE_EXPERIMENT_VARIANT_A
			? props.variantA
			: variant === HOMEPAGE_EXPERIMENT_VARIANT_B
				? props.variantB
				: props.control;

	return (
		<div
			aria-busy={!resolved}
			style={{
				opacity: resolved ? 1 : undefined,
				transition: resolved ? 'opacity 150ms ease-in' : undefined,
			}}
		>
			{content}
		</div>
	);
}
