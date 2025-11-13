import { cn, tv } from './_lib/utils.ts';
import type { leftCenterRightValues, smallLargeValues } from './_lib/designTypesStore.ts';

import type { SanityImage } from './types.ts';

import { Avatar } from './Avatar.tsx';
import { Text } from './Text.tsx';

const styles = tv({
	slots: {
		base: 'inline-flex items-center gap-responsive-xs font-secondary',
		name: 'font-bold',
		metaList: 'flex items-center gap-responsive-5xs',
		meta: 'flex items-center gap-responsive-5xs after:content-[""] after:m-0.5 after:h-0.5 after:w-0.5 after:bg-current after:rounded-full last:after:hidden',
		content: 'flex flex-col',
	},
	variants: {
		size: {
			lg: {},
			sm: {},
		},
		alignment: {
			left: {},
			right: {
				base: 'flex-row-reverse text-right',
				content: 'items-end',
			},
			center: {
				base: 'flex-col text-center',
				content: 'items-center',
			},
		},
	},
});

export type AuthorProps = {
	alignment?: (typeof leftCenterRightValues)[number];
	className?: string;
	image?: SanityImage | string;
	meta?: (string | undefined)[];
	name?: string;
	size?: (typeof smallLargeValues)[number];
};

export function Author(props: AuthorProps) {
	const alignment = props.alignment ?? 'left';
	const size = props.size ?? 'lg';
	const { base, content } = styles({ alignment, size });
	const { name, metaList } = styles({ size });

	return (
		<div className={cn(base(), props.className)} data-component='Author'>
			{props.image && <Avatar image={props.image} size={size} />}
			<div className={content()}>
				{props.name && (
					<Text as='span' className={name()} styleType={sizes[size].name}>
						{props.name}
					</Text>
				)}
				{props.meta && props.meta.length > 0 && (
					<div className={metaList()}>
						{props.meta.map((meta, index) => (
							<Text key={index} as='span' styleType={sizes[size].meta}>
								{meta}
							</Text>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

const sizes = {
	lg: {
		name: 'text-lg' as const,
		meta: 'text-md' as const,
	},
	sm: {
		name: 'text-md' as const,
		meta: 'text-sm' as const,
	},
};
