'use client';

import { useEffect, useRef, useState } from 'react';

const ALLOWED_EMBED_HOSTS = [
	'meetings.hubspot.com',
	'share.hsforms.com',
	'js.hsforms.net',
	'app.hubspot.com',
	'www.youtube.com',
	'player.vimeo.com',
	'calendly.com',
	'capture.navattic.com',
	'voteamerica.org',
	'voteamerica.com',
];

function isAllowedUrl(raw: string): boolean {
	try {
		const url = new URL(raw);
		return ALLOWED_EMBED_HOSTS.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`));
	} catch {
		return false;
	}
}

type EmbedResult =
	| { type: 'iframe'; src: string }
	| { type: 'html'; sanitized: string };

export function parseEmbed(html: string, DOMPurify: typeof import('dompurify').default): EmbedResult | null {
	const doc = new DOMParser().parseFromString(html, 'text/html');

	const hubspot = doc.querySelector('.meetings-iframe-container[data-src]');
	if (hubspot) {
		const src = hubspot.getAttribute('data-src')!;
		if (isAllowedUrl(src)) return { type: 'iframe', src };
	}

	const calendly = doc.querySelector('.calendly-inline-widget[data-url]');
	if (calendly) {
		const src = calendly.getAttribute('data-url')!;
		if (isAllowedUrl(src)) return { type: 'iframe', src };
	}

	// VoteAmerica's snippet is a script plus a placeholder div; the script (which we strip) would
	// build this same iframe URL, so we build it ourselves from the placeholder's attributes.
	const voteAmerica = doc.querySelector('.voteamerica-embed');
	const subscriber = voteAmerica?.getAttribute('data-subscriber');
	const tool = voteAmerica?.getAttribute('data-tool');
	if (subscriber && tool) {
		return {
			type: 'iframe',
			src: `https://www.voteamerica.org/embed/${encodeURIComponent(tool)}/?subscriber=${encodeURIComponent(subscriber)}`,
		};
	}

	const iframe = doc.querySelector('iframe[src]');
	if (iframe) {
		const src = iframe.getAttribute('src')!;
		if (isAllowedUrl(src)) return { type: 'iframe', src };
	}

	const clean = DOMPurify.sanitize(html, {
		FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'textarea', 'select', 'button', 'iframe'],
		FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
	});

	return clean ? { type: 'html', sanitized: clean } : null;
}

export type EmbedHtmlProps = {
	html: string;
	className?: string;
	height?: number | string;
	width?: number | string;
	fullPage?: boolean;
};

export function EmbedHtml({
	html,
	className,
	height = 900,
	width = '100%',
	fullPage = false,
}: EmbedHtmlProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [iframeSrc, setIframeSrc] = useState<string | null>(null);

	useEffect(() => {
		if (!html) return;

		void import('dompurify').then((mod) => {
			const result = parseEmbed(html, mod.default);
			if (!result) return;

			if (result.type === 'iframe') {
				setIframeSrc(result.src);
			} else if (containerRef.current) {
				containerRef.current.innerHTML = result.sanitized;
			}
		});

		return () => {
			setIframeSrc(null);
			if (containerRef.current) containerRef.current.innerHTML = '';
		};
	}, [html]);

	const iframeStyle: React.CSSProperties = fullPage
		? { width: '100%', height: '100dvh', border: 'none' }
		: { width, height, border: 'none' };

	if (iframeSrc) {
		return (
			<iframe
				src={iframeSrc}
				className={className}
				style={iframeStyle}
				scrolling="no"
				loading="lazy"
				allow="microphone; camera; fullscreen"
			/>
		);
	}

	return <div ref={containerRef} className={className} />;
}
