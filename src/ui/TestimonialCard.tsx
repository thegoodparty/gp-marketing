import type { ReactNode } from 'react';

import { cn, tv } from './_lib/utils.ts';
import { componentColorValues } from './_lib/designTypesStore.ts';

import { Author, type AuthorProps } from './Author.tsx';
import { Text } from './Text.tsx';
import { Logo } from '~/sanity/utils/Logo.tsx';

const styles = tv({
	slots: {
		base: 'flex flex-col gap-4 p-6 rounded-lg md:min-h-[400px] justify-between',
		quote: 'font-secondary! quote-open quote-close',
	},
	variants: {
		color: {
			red: 'bg-red-100',
			waxflower: 'bg-waxflower-100',
			'bright-yellow': 'bg-bright-yellow-100',
			'halo-green': 'bg-halo-green-100',
			blue: 'bg-blue-100',
			lavender: 'bg-lavender-100',
			midnight: 'bg-midnight-900',
			cream: 'bg-goodparty-cream',
			white: 'bg-white',
		},
		quoteStyleType: {
			'text-md': { quote: '' },
			'text-lg': { quote: '' },
			'text-3xl': { quote: 'italic font-semibold!' },
		},
	},
});

export type TestimonialCardProps = {
	author?: AuthorProps;
	className?: string;
	color?: Exclude<(typeof componentColorValues)[number], 'inverse'> | 'white';
	copy?: ReactNode;
	quoteStyleType?: 'text-md' | 'text-lg' | 'text-3xl';
};

export function TestimonialCard(props: TestimonialCardProps) {
	const color = props.color ?? 'red';
	const quoteStyleType = props.quoteStyleType ?? 'text-md';
	const { base, quote } = styles({ color, quoteStyleType });

	return (
		<article className={cn(base(), props.className)} data-component='TestimonialCard'>
			<div className='flex flex-col gap-4'>
				<Logo width={50} height={37} />
				<Text as='blockquote' className={quote()} styleType={quoteStyleType}>
					{quoteStyleType === 'text-3xl' ? `"${props.copy}"` : props.copy}
				</Text>
			</div>
			{props.author && (
				<figcaption>
					<Author alignment='left' size='sm' image={props.author.image} name={props.author.name} meta={props.author.meta} />
				</figcaption>
			)}
		</article>
	);
}
