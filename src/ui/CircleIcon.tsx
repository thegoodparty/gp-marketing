import type { componentColorValues } from './_lib/designTypesStore';
import { tv } from './_lib/utils';

import { IconResolver, type IconType } from './IconResolver';

const styles = tv({
	slots: {
		base: 'rounded-full w-12 h-12 flex items-center justify-center text-black',
	},
	variants: {
		iconBg: {
			blue: 'bg-blue-200',
			red: 'bg-red-200',
			waxflower: 'bg-waxflower-200',
			'bright-yellow': 'bg-bright-yellow-200',
			'halo-green': 'bg-halo-green-200',
			lavender: 'bg-lavender-200',
			midnight: 'bg-midnight-900 text-white',
			cream: 'bg-goodparty-cream',
		},
	},
});

interface CircleIconProps {
	icon: IconType;
	iconBg?: Exclude<(typeof componentColorValues)[number], 'inverse'>;
}

export const CircleIcon = ({ icon, iconBg }: CircleIconProps) => {
	const { base } = styles({ iconBg });

	return (
		<div className={base()}>
			<IconResolver icon={icon} />
		</div>
	);
};
