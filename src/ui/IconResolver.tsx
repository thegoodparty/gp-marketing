import type { SVGProps } from 'react';
import { stegaClean } from '@sanity/client/stega';

import { designTypeResolve } from '~/ui/_lib/designTypeResolve';
import { cn, tv } from '~/ui/_lib/utils';
import type { mediumLargeValues } from './_lib/designTypesStore';

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
	'goodparty-logo': props => (
		<svg {...props} width='100%' height='100%' viewBox='0 0 48 36' fill='none' xmlns='http://www.w3.org/2000/svg'>
			<path
				d='M24.0029 31.9598C31.8495 28.1454 37.0583 23.8652 39.7182 19.4742C41.9569 15.7485 42.245 12.1337 40.8264 9.13985C39.5408 6.43428 36.9475 4.5049 33.933 3.99483C30.7191 3.46259 27.4608 4.59361 24.8896 7.41006L23.9808 8.38583L23.072 7.41006C20.4787 4.59361 17.2204 3.46259 14.0285 3.99483C11.0362 4.48272 8.42071 6.43428 7.13512 9.13985C5.71654 12.1115 6.00469 15.7485 8.24339 19.4742C10.9032 23.8652 16.1121 28.1454 23.9586 31.9598H24.0029Z'
				fill='white'
			/>
			<path
				fillRule='evenodd'
				clipRule='evenodd'
				d='M24.003 6.21206C21.1437 3.2182 17.4643 1.93194 13.807 2.55289C10.327 3.12949 7.31254 5.36935 5.80529 8.51845C4.14289 12.0446 4.54186 16.2138 7.00221 20.25C9.86153 24.9958 15.3807 29.4312 23.3602 33.2899L24.003 33.6004L24.6458 33.2899C32.6253 29.409 38.1223 24.9736 41.0038 20.25C43.442 16.2138 43.8632 12.0446 42.2008 8.51845C40.6935 5.34717 37.679 3.12949 34.1991 2.55289C30.5418 1.95412 26.8623 3.2182 24.003 6.21206ZM21.986 8.45192C19.7029 5.96812 16.9323 5.05887 14.2724 5.50241C11.7456 5.92377 9.55122 7.56484 8.48728 9.80469C7.33468 12.2441 7.48984 15.3267 9.52905 18.7198C11.9007 22.6451 16.622 26.6369 23.9809 30.2961C31.3397 26.6369 36.0388 22.6451 38.4327 18.7198C40.494 15.3267 40.627 12.2441 39.4744 9.80469C38.4105 7.54266 36.2161 5.92377 33.6893 5.50241C31.0294 5.05887 28.2588 5.96812 25.9757 8.45192L23.9809 10.6252L21.986 8.45192Z'
				fill='#DC1438'
			/>
			<path
				d='M23.2046 21.2485L21.0767 22.3573C20.8551 22.4682 20.5891 22.3795 20.4783 22.1799C20.4339 22.0912 20.4118 22.0025 20.4339 21.8916L20.8329 19.563C20.9216 19.0086 20.7443 18.4542 20.3453 18.0772L18.6164 16.4139C18.4391 16.2365 18.4391 15.9704 18.6164 15.793C18.6829 15.7264 18.7715 15.6821 18.8824 15.6599L21.2762 15.3273C21.8304 15.2386 22.318 14.9059 22.5618 14.3958L23.6257 12.2669C23.7366 12.0451 24.0026 11.9564 24.2242 12.0673C24.3129 12.1116 24.3794 12.1781 24.4237 12.2669L25.4876 14.3958C25.7314 14.8837 26.2191 15.2386 26.7732 15.3273L29.1671 15.6599C29.4109 15.7043 29.5882 15.926 29.5439 16.1478C29.5439 16.2365 29.4774 16.3252 29.4109 16.3917L27.682 18.055C27.283 18.432 27.0835 19.0086 27.1944 19.5409L27.5934 21.8694C27.6377 22.1133 27.4825 22.3351 27.2387 22.3795C27.15 22.3795 27.0392 22.3795 26.9505 22.3351L24.8227 21.2263C24.3129 20.9602 23.7144 20.9602 23.2268 21.2263L23.2046 21.2485Z'
				fill='#0048C2'
			/>
		</svg>
	),
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
