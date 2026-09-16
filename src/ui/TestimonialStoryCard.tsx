import { cn, tv } from './_lib/utils.ts';
import type { componentColorValues } from './_lib/designTypesStore.ts';

import { Avatar } from './Avatar.tsx';
import { Text } from './Text.tsx';
import { IconResolver } from './IconResolver.tsx';
import { ComponentButton, type ComponentButtonProps } from './Inputs/Button.tsx';
import { Logo } from '~/sanity/utils/Logo.tsx';
import type { AuthorProps } from './Author.tsx';

const styles = tv({
	slots: {
		// The card keeps its own text color: the pastel fills stay light even when the
		// surrounding block is midnight, which sets `text-white` on everything inside it.
		base: 'flex flex-col gap-6 p-8 rounded-2xl h-full text-midnight-900',
		divider: 'shrink-0 bg-black/10 h-px w-full md:h-auto md:w-px',
	},
	variants: {
		color: {
			red: { base: 'bg-red-100' },
			waxflower: { base: 'bg-waxflower-100' },
			'bright-yellow': { base: 'bg-bright-yellow-100' },
			'halo-green': { base: 'bg-halo-green-100' },
			blue: { base: 'bg-blue-100' },
			lavender: { base: 'bg-lavender-100' },
		},
	},
});

export type TestimonialStoryCardProps = {
	author?: AuthorProps;
	className?: string;
	color?: Exclude<(typeof componentColorValues)[number], 'inverse' | 'midnight' | 'cream'>;
	copy?: string;
	link?: ComponentButtonProps;
	result?: string;
};

export function TestimonialStoryCard(props: TestimonialStoryCardProps) {
	const color = props.color ?? 'halo-green';
	const { base, divider } = styles({ color });

	return (
		<article className={cn(base(), props.className)} data-component='TestimonialStoryCard'>
			{props.author && (
				<div className='flex items-center gap-[1.33rem]'>
					{props.author.image && (
						<div className='relative shrink-0'>
							<Avatar image={props.author.image} className='size-16' />
							<Logo width={28} height={21} className='absolute bottom-0 -right-1.5 w-7 h-[1.3125rem]' />
						</div>
					)}
					<div className='flex flex-col gap-0.5 font-secondary'>
						{props.author.name && (
							<Text as='span' styleType='text-md' className='font-bold'>
								{props.author.name}
							</Text>
						)}
						{props.author.meta && props.author.meta.length > 0 && (
							<Text as='span' styleType='text-sm' className='text-gray-700'>
								{props.author.meta.filter(Boolean).join(', ')}
							</Text>
						)}
					</div>
				</div>
			)}
			<div className='flex flex-col md:flex-row gap-6 grow'>
				{props.copy && (
					<Text as='blockquote' styleType='text-xl' className='md:basis-0 md:grow-[2]'>
						{`“${props.copy}”`}
					</Text>
				)}
				{(props.result || props.link) && <div className={divider()} />}
				{(props.result || props.link) && (
					<div className='flex flex-col justify-between gap-4 md:basis-0 md:grow'>
						{props.result && (
							<Text as='p' styleType='text-xl'>
								{props.result}
							</Text>
						)}
						{props.link && (
							<ComponentButton
								{...props.link}
								className='w-fit shrink-0 whitespace-nowrap bg-white text-midnight-900! hover:bg-white/70'
								iconRight={<IconResolver icon='arrow-up-right' className='min-w-4 min-h-4 w-4 h-4 max-w-4 max-h-4' />}
								buttonProps={{ styleType: 'ghost', styleSize: 'md' }}
							/>
						)}
					</div>
				)}
			</div>
		</article>
	);
}
