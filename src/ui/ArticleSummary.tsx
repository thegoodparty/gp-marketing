import type { ReactNode } from 'react';

import { cn } from './_lib/utils.ts';

export type ArticleSummaryProps = {
	label?: string | null;
	children: ReactNode;
	className?: string;
};

// Crawlers and AI engines quote this passage, so it stays plain server-rendered text:
// a div (never aside or a complementary/note role), and the label is a <p>, never a heading.
export function ArticleSummary(props: ArticleSummaryProps) {
	return (
		<div
			data-component='ArticleSummary'
			className={cn('rounded-lg border border-midnight-200 bg-midnight-50 px-5 py-5 text-dark md:px-8 md:py-6', props.className)}
		>
			{props.label && (
				<p className='mb-2 font-secondary text-text-sm font-semibold uppercase tracking-wide text-midnight-700'>{props.label}</p>
			)}
			<div className='font-secondary text-body-1 [&>p+p]:mt-3 [&_a]:font-semibold'>{props.children}</div>
		</div>
	);
}
