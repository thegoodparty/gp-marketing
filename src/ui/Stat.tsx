import { tv } from './_lib/utils.ts';
import type { componentColorValues } from './_lib/designTypesStore.ts';

import { Text } from './Text.tsx';

const styles = tv({
	slots: {
		base: 'relative flex flex-col p-8 rounded-xl',
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
			},
			cream: {
				base: 'bg-goodparty-cream',
			},
		},
	},
});

export type StatProps = {
	_key?: string;
	color?: Exclude<(typeof componentColorValues)[number], 'inverse'>;
	value?: string;
	description?: string;
};

export function Stat(props: StatProps) {
	const color = props.color ?? 'cream';
	const { base } = styles({ color });

	return (
		<article className={base()} data-component='Stat'>
			{props.value && (
				<Text as='span' styleType='heading-xl'>
					{props.value}
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
