import type { ReactNode } from 'react';
import { cn } from './_lib/utils.ts';
import type { SanityImage } from './types.ts';
import { Anchor } from './Anchor.tsx';
import { Author, type AuthorProps } from './Author.tsx';
import { Media } from './Media.tsx';
import { Text } from './Text.tsx';

export type BlogCardProps = {
	author?: AuthorProps;
	className?: string;
	href: string;
	image?: SanityImage;
	label?: string;
	copy?: ReactNode;
	title: string;
};

export function BlogCard(props: BlogCardProps) {
	return (
		<article className={cn('group relative flex flex-col p-4 rounded-lg bg-white gap-4', props.className)} data-component='BlogCard'>
			<div className='relative rounded-md overflow-hidden '>
				<Media className='transition-transform duration-normal ease-smooth [&_img]:h-full group-hover:scale-105' image={props.image} />
			</div>

			<div className='flex flex-col gap-4 '>
				{props.label && (
					<span className='text-neutral-500'>
						<Text as='span' styleType='overline'>
							{props.label}
						</Text>
					</span>
				)}

				<Anchor className={`before:content[""] before:absolute before:inset-0`} href={props.href}>
					<Text as='h2' styleType='subtitle-1'>
						{props.title}
					</Text>
				</Anchor>
			</div>

			{props.author && (
				<figcaption className='mt-auto pt-2 md:pt-8'>
					<Author alignment='left' image={props.author.image} name={props.author.name} meta={props.author.meta} size='sm' />
				</figcaption>
			)}
		</article>
	);
}
