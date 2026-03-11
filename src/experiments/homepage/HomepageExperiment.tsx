'use client';

import { useEffect, useState, type ReactNode } from 'react';

const FLAG_KEY = 'home_hero_layout_test';

type Props = {
	control: ReactNode;
	variantA: ReactNode;
	variantB: ReactNode;
};

export function HomepageExperiment(props: Props) {
	const [variant, setVariant] = useState<string | null>(null);

	useEffect(() => {
		const resolveVariant = () => {
			const experiment = typeof window !== 'undefined' ? window.experiment : undefined;
			if (!experiment) {
				setVariant('control');
				return;
			}
			const v = experiment.variant(FLAG_KEY);
			const value = v?.value ?? 'control';
			setVariant(value);
		};
		resolveVariant();
		const t = setTimeout(resolveVariant, 1500);
		return () => clearTimeout(t);
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
