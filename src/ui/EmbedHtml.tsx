'use client';

import { useEffect, useRef, useState } from 'react';

import { cn } from './_lib/utils.ts';

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

const VOTE_AMERICA_HOSTS = ['voteamerica.org', 'voteamerica.com'];

function matchesHost(raw: string, hosts: string[]): boolean {
	try {
		const url = new URL(raw);
		return hosts.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`));
	} catch {
		return false;
	}
}

function isAllowedUrl(raw: string): boolean {
	return matchesHost(raw, ALLOWED_EMBED_HOSTS);
}

export type EmbedProvider = 'voteamerica';

type EmbedResult =
	| { type: 'iframe'; src: string; provider?: EmbedProvider }
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
			provider: 'voteamerica',
		};
	}

	const iframe = doc.querySelector('iframe[src]');
	if (iframe) {
		const src = iframe.getAttribute('src')!;
		if (matchesHost(src, VOTE_AMERICA_HOSTS)) return { type: 'iframe', src, provider: 'voteamerica' };
		if (isAllowedUrl(src)) return { type: 'iframe', src };
	}

	const clean = DOMPurify.sanitize(html, {
		FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'textarea', 'select', 'button', 'iframe'],
		FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
	});

	return clean ? { type: 'html', sanitized: clean } : null;
}

// VoteAmerica's embed page speaks the iframe-resizer v4 protocol that their own snippet's script
// would drive: the parent announces itself with a settings string, and the page then reports its
// height every time the form changes. The frame is cross-origin, so this is the only way to know
// how tall the form is; without it the frame is a fixed box that clips the form.
const RESIZER_PREFIX = '[iFrameSizer]';
const RESIZER_READY = '[iFrameResizerChild]Ready';
const RESIZER_NON_SIZE_TYPES = new Set(['scrollTo', 'scrollToOffset', 'pageInfo', 'inPageLink', 'reset', 'close']);

export function resizerInitMessage(id: string): string {
	return `${RESIZER_PREFIX}${id}:8:false:false:32:true:true:0 0:taggedElement:null:null:0:false:parent:scroll`;
}

export type ResizerMessage = { kind: 'ready' } | { kind: 'height'; px: number } | { kind: 'scrollToTop' };

export function parseResizerMessage(data: unknown, id: string): ResizerMessage | null {
	if (typeof data !== 'string') return null;
	if (data === RESIZER_READY) return { kind: 'ready' };
	if (!data.startsWith(`${RESIZER_PREFIX}${id}:`)) return null;

	const [, height, , type, ...rest] = data.slice(RESIZER_PREFIX.length).split(':');
	if (type === 'message') {
		try {
			const payload: unknown = JSON.parse(rest.join(':'));
			if (typeof payload === 'object' && payload !== null && 'type' in payload && payload.type === 'scrollToTop') {
				return { kind: 'scrollToTop' };
			}
		} catch {
			return null;
		}
		return null;
	}
	if (type === undefined || RESIZER_NON_SIZE_TYPES.has(type)) return null;

	const px = Number.parseInt(height ?? '', 10);
	return Number.isFinite(px) && px > 0 ? { kind: 'height', px } : null;
}

function useSelfSizingIframe(iframeRef: React.RefObject<HTMLIFrameElement | null>, enabled: boolean, src: string | null) {
	useEffect(() => {
		const iframe = iframeRef.current;
		if (!enabled || !iframe || !src) return;

		const id = `embed-${Math.random().toString(36).slice(2, 10)}`;
		const sendInit = () => iframe.contentWindow?.postMessage(resizerInitMessage(id), '*');
		const onMessage = (event: MessageEvent) => {
			if (event.source !== iframe.contentWindow) return;
			const message = parseResizerMessage(event.data, id);
			if (!message) return;
			if (message.kind === 'ready') sendInit();
			if (message.kind === 'height') iframe.style.height = `${message.px}px`;
			if (message.kind === 'scrollToTop') iframe.scrollIntoView({ block: 'start', behavior: 'smooth' });
		};

		window.addEventListener('message', onMessage);
		iframe.addEventListener('load', sendInit);
		return () => {
			window.removeEventListener('message', onMessage);
			iframe.removeEventListener('load', sendInit);
		};
	}, [iframeRef, enabled, src]);
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
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const [iframeSrc, setIframeSrc] = useState<string | null>(null);
	const [provider, setProvider] = useState<EmbedProvider | null>(null);

	useEffect(() => {
		if (!html) return;

		void import('dompurify').then((mod) => {
			const result = parseEmbed(html, mod.default);
			if (!result) return;

			if (result.type === 'iframe') {
				setIframeSrc(result.src);
				setProvider(result.provider ?? null);
			} else if (containerRef.current) {
				containerRef.current.innerHTML = result.sanitized;
			}
		});

		return () => {
			setIframeSrc(null);
			setProvider(null);
			if (containerRef.current) containerRef.current.innerHTML = '';
		};
	}, [html]);

	const selfSizing = provider === 'voteamerica' && !fullPage;
	useSelfSizingIframe(iframeRef, selfSizing, iframeSrc);

	const iframeStyle: React.CSSProperties = fullPage
		? { width: '100%', height: '100dvh', border: 'none' }
		: selfSizing
			? { width, border: 'none' }
			: { width, height, border: 'none' };

	if (iframeSrc) {
		const iframe = (
			<iframe
				ref={iframeRef}
				src={iframeSrc}
				className={cn(className, selfSizing && 'block')}
				style={iframeStyle}
				scrolling="no"
				loading="lazy"
				allow="microphone; camera; fullscreen"
			/>
		);

		// VoteAmerica draws its form flush against the frame's edges on a white canvas, so the card
		// here is what gives the form breathing room; the two whites merge into one shape.
		return selfSizing ? <div className="rounded-3xl bg-white p-6 md:p-12">{iframe}</div> : iframe;
	}

	return <div ref={containerRef} className={className} />;
}
