import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge, type ConfigExtension } from 'tailwind-merge';
import { createTV } from 'tailwind-variants';

const tailwindMergeConfig: ConfigExtension<never, never> = {
	override: {
		classGroups: {
			'font-size': [
				{
					// Check if string ends with a shirt size
					text: [(value: string) => /^([a-z-]+-)?(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/.test(value)],
				},
			],
		},
	},
};

const twMerge = extendTailwindMerge(tailwindMergeConfig);

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const tv = createTV({ twMergeConfig: tailwindMergeConfig });