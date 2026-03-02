'use client';

import { cn } from './_lib/utils.ts';
import { EmbedHtml } from './EmbedHtml';
import { Container } from './Container';

export type EmbeddedBlockProps = {
	html: string;
	className?: string;
	height?: number | string;
	fullPage?: boolean;
	maxWidth?: 'unset' | 'xl' | 'lg' | 'md';
};

export function EmbeddedBlock({ html, className, height, fullPage, maxWidth = 'xl' }: EmbeddedBlockProps) {
	if (!html) return null;

	return (
		<article
			className={cn(fullPage ? 'p-0' : 'py-(--container-padding)', className)}
			data-component="EmbeddedBlock"
		>
			<Container size={fullPage ? 'unset' : maxWidth}>
				<EmbedHtml html={html} className="w-full" height={height} fullPage={fullPage} />
			</Container>
		</article>
	);
}
