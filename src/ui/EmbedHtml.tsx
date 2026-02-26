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

function parseEmbed(html: string, DOMPurify: typeof import('dompurify').default): EmbedResult | null {
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

export function EmbedHtml({ html, className }: { html: string; className?: string }) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [iframeSrc, setIframeSrc] = useState<string | null>(null);

	useEffect(() => {
		if (!html) return;

		import('dompurify').then((mod) => {
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

	if (iframeSrc) {
		return (
			<iframe
				src={iframeSrc}
				className={className}
				style={{ width: '100%', height: 900, border: 'none' }}
				scrolling="no"
				loading="lazy"
				allow="microphone; camera"
			/>
		);
	}

	return <div ref={containerRef} className={className} />;
}
