import { cn } from './_lib/utils.ts';
import type { SanityImage } from './types.ts';
import { Anchor } from './Anchor.tsx';
import { Media } from './Media.tsx';
import { Text } from './Text.tsx';

export type TeamCardProps = {
	className?: string;
	href: string;
	image: SanityImage;
	label?: string;
	title: string;
};

export function TeamCard(props: TeamCardProps) {
	return (
		<article className={cn('group relative flex flex-col gap-4', props.className)} data-component='TeamCard'>
			<Media
				aspectRatio='1:1'
				className='overflow-hidden rounded-lg [&_img]:transition-transform [&_img]:duration-normal [&_img]:ease-smooth [&_img]:h-full group-hover:[&_img]:scale-105'
				image={props.image}
			/>
			<div className='flex flex-col gap-1 text-center'>
				<Anchor className={`before:content[""] before:absolute before:inset-0`} href={props.href}>
					<Text as='h2' styleType='heading-sm'>
						{props.title}
					</Text>
				</Anchor>

				{props.label && (
					<Text as='span' styleType='body-2'>
						{props.label}
					</Text>
				)}
			</div>
		</article>
	);
}
