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
			midnight:
				'bg-midnight-900 text-white relative overflow-hidden border border-white/10 transition-all duration-300 hover:-translate-y-1 hover:border-goodparty-gold/30',
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
	avatar?: string;
	className?: string;
	color?: Exclude<(typeof componentColorValues)[number], 'inverse'> | 'white';
	copy?: ReactNode;
	quoteStyleType?: 'text-md' | 'text-lg' | 'text-3xl';
};

export function TestimonialCard(props: TestimonialCardProps) {
	const color = props.color ?? 'red';
	const quoteStyleType = props.quoteStyleType ?? 'text-md';
	const { base, quote } = styles({ color, quoteStyleType });

	const isMidnight = color === 'midnight';

	return (
		<article className={cn(base(), props.className)} data-component='TestimonialCard'>
			{isMidnight && (
				<Logo
					width={32}
					height={32}
					className="absolute top-5 right-5 opacity-25 object-contain"
					aria-hidden
				/>
			)}
			<div className='flex flex-col gap-4'>
				{isMidnight && props.avatar ? (
					<div className="w-16 h-16 rounded-full bg-gradient-to-br from-goodparty-red to-goodparty-blue flex items-center justify-center text-3xl mb-5">
						{props.avatar}
					</div>
				) : !isMidnight ? (
					<Logo width={50} height={37} />
				) : null}
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
