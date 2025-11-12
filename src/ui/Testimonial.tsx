import type { ReactNode } from 'react';

import { cn, tv } from './_lib/utils.ts';
import { componentColorValues } from './_lib/designTypesStore.ts';

import { Author, type AuthorProps } from './Author.tsx';
import { Text } from './Text.tsx';

const styles = tv({
	slots: {
		base: 'flex flex-col gap-4 p-6 rounded-lg min-h-[400px] justify-between',
		quote: 'font-secondary!',
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
		},
	},
});

export type TestimonialProps = {
	author?: AuthorProps;
	className?: string;
	color?: Exclude<(typeof componentColorValues)[number], 'inverse'>;
	copy?: ReactNode;
};

export function Testimonial(props: TestimonialProps) {
	const color = props.color ?? 'red';
	const { base, quote } = styles({ color });

	return (
		<article className={cn(base(), props.className)} data-component='CTACard'>
			<div className='flex flex-col gap-4'>
				<svg width='50' height='37' fill='none' xmlns='http://www.w3.org/2000/svg'>
					<path
						d='M25.004 32.847c8.173-3.92 13.599-8.32 16.37-12.832 2.332-3.83 2.632-7.545 1.154-10.622-1.34-2.78-4.04-4.763-7.18-5.288-3.348-.547-6.742.616-9.42 3.51l-.947 1.003-.947-1.003c-2.701-2.894-6.096-4.057-9.42-3.51-3.117.502-5.842 2.508-7.181 5.288-1.478 3.054-1.178 6.793 1.154 10.622 2.771 4.513 8.197 8.912 16.37 12.832h.047Z'
						fill='#fff'
					/>
					<path
						fillRule='evenodd'
						clipRule='evenodd'
						d='M25.003 6.384c-2.978-3.077-6.81-4.399-10.62-3.76-3.625.592-6.766 2.894-8.336 6.13-1.731 3.625-1.316 7.91 1.247 12.058 2.979 4.878 8.728 9.436 17.04 13.402l.67.32.669-.32c8.312-3.988 14.038-8.547 17.04-13.402 2.54-4.148 2.978-8.433 1.246-12.057-1.57-3.26-4.71-5.539-8.335-6.131-3.81-.616-7.642.683-10.62 3.76Zm-2.1 2.302c-2.379-2.552-5.265-3.487-8.036-3.031-2.632.433-4.918 2.12-6.026 4.422-1.2 2.507-1.039 5.675 1.085 9.162 2.47 4.035 7.389 8.137 15.054 11.898 7.666-3.76 12.56-7.863 15.054-11.898 2.148-3.487 2.286-6.655 1.085-9.162-1.108-2.325-3.394-3.989-6.026-4.422-2.77-.456-5.657.479-8.035 3.031L24.98 10.92l-2.078-2.234Z'
						fill='#DC1438'
					/>
					<path
						d='m24.172 21.838-2.217 1.14a.479.479 0 0 1-.623-.183.43.43 0 0 1-.046-.296l.415-2.393a1.701 1.701 0 0 0-.508-1.528l-1.8-1.709a.437.437 0 0 1 0-.638.53.53 0 0 1 .276-.137l2.494-.342c.577-.091 1.085-.433 1.34-.957l1.107-2.188a.466.466 0 0 1 .832 0l1.108 2.188c.254.501.762.866 1.34.957l2.493.342c.254.046.438.273.392.502 0 .09-.069.182-.138.25l-1.801 1.71c-.416.387-.624.98-.508 1.527l.415 2.393a.445.445 0 0 1-.369.524c-.092 0-.208 0-.3-.045l-2.217-1.14a1.786 1.786 0 0 0-1.662 0l-.023.023Z'
						fill='#0048C2'
					/>
				</svg>
				<Text as='blockquote' className={quote()} styleType='text-lg'>
					{props.copy}
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
