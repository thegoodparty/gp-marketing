import type { SVGProps } from 'react';
import { stegaClean } from '@sanity/client/stega';

import { designTypeResolve } from '~/ui/_lib/designTypeResolve';
import { cn, tv } from '~/ui/_lib/utils';
import type { mediumLargeValues } from './_lib/designTypesStore';
import { Logo } from '~/sanity/utils/Logo.tsx';

const styles = tv({
	slots: {
		base: 'block',
		initial: '',
		hover: '',
	},
	variants: {
		size: {
			md: 'min-w-6 min-h-6 w-6 h-6 max-w-6 max-h-6',
			lg: 'min-w-12 min-h-12 w-12 h-12 max-w-12 max-h-12',
		},
		animated: {
			true: {
				base: 'overflow-hidden',
				initial: 'group-hover/button:translate-x-full group-hover/button:-translate-y-full transition-transform duration-slow ease-smooth',
				hover:
					'-translate-x-full group-hover/button:translate-x-0 group-hover/button:-translate-y-full transition-transform duration-slow ease-smooth',
			},
		},
	},
});

export type IconType = string;

export function IconResolver(
	props: SVGProps<SVGSVGElement> & {
		icon?: IconType;
		className?: string;
		size?: (typeof mediumLargeValues)[number];
	},
) {
	const { icon, className, size, ...attr } = props;

	if (!icon || typeof icon !== 'string') return null;

	const cleanedIcon = stegaClean(icon);

	return <IconSvgComponent name={cleanedIcon} attr={attr} className={className} size={size} />;
}

type IconSvgComponentProps = {
	name: string;
	className?: string;
	attr?: SVGProps<SVGSVGElement>;
	size?: (typeof mediumLargeValues)[number];
};

function IconSvgComponent({ name, attr, className, ...props }: IconSvgComponentProps) {
	const size = props.size ?? 'md';

	if (!name) {
		return null;
	}
	const { base, initial, hover } = styles({ animated: name === 'arrow-up-right', size });

	const Svg = designTypeResolve(name, customIconValues) ? customIcons[name] : undefined;

	return name === 'arrow-up-right' ? (
		<span className={cn(base(), className)}>
			<IconWrapper code={'arrow-up-right'} className={initial()} {...attr} />
			<IconWrapper code={'arrow-up-right'} className={hover()} {...attr} />
		</span>
	) : Svg ? (
		<Svg className={cn(base(), className)} {...attr} />
	) : (
		<IconWrapper code={name} className={cn(base(), className)} {...attr} />
	);
}

const customIcons = {
	'goodparty-logo': props => <Logo width={48} height={36} {...props} />,
};

const customIconValues = Object.keys(customIcons) as (keyof typeof customIcons)[];

type Props = SVGProps<SVGSVGElement> & {
	code: string;
};

export function IconWrapper({ code, ...props }: Props) {
	if (!code) {
		console.error('Icon code is required');
		return null;
	}
	return (
		<svg width='100%' height='100%' viewBox={'0 0 24 24'} {...props} fill={'currentColor'}>
			<title>{convertToTitleCase(code)}</title>
			<use href={`/icons/lucide/${code}.svg#icon`} />
		</svg>
	);
}

/**
 * Converts a string to title case
 */
function convertToTitleCase(str: string): string {
	return str.replace(/[-_]/g, ' ').replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
}
