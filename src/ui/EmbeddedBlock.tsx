'use client';

import { cn } from './_lib/utils.ts';
import { EmbedHtml } from './EmbedHtml';
import { Container } from './Container';

export type EmbeddedBlockProps = {
	html: string;
	className?: string;
};

export function EmbeddedBlock({ html, className }: EmbeddedBlockProps) {
	if (!html) return null;

	return (
		<article className={cn('py-(--container-padding)', className)} data-component="EmbeddedBlock">
			<Container size="xl">
				<EmbedHtml html={html} className="w-full" />
			</Container>
		</article>
	);
}
