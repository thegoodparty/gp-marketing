import type { ReactNode } from 'react';

import { cn, tv } from './_lib/utils.ts';
import type { SanityImage } from './types.ts';

import { Author, type AuthorProps } from './Author.tsx';
import { Text } from './Text.tsx';

const styles = tv({
	slots: {
		base: 'flex flex-col gap-6 p-6 bg-white rounded-xl',
		quote: 'font-secondary font-semibold',
	},
});

export type SectionQuoteCardProps = {
	_key?: string;
	className?: string;
	copy?: ReactNode;
	author?: AuthorProps;
};

export function SectionQuoteCard(props: SectionQuoteCardProps) {
	const { base, quote } = styles();

	return (
		<article className={cn(base(), props.className)} data-component='SectionQuoteCard'>
			<Text as='blockquote' className={quote()} styleType='body-xl'>
				{props.copy}
			</Text>
			{props.author && (
				<figcaption>
					<Author alignment='left' size='sm' image={props.author.image} name={props.author.name} meta={props.author.meta} />
				</figcaption>
			)}
		</article>
	);
}
