const IFRAME_ATTRS =
	'width="560" height="315" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen';

function isHostname(url: URL, hostname: string): boolean {
	return url.hostname === hostname || url.hostname.endsWith(`.${hostname}`);
}

function wrapIframeSrc(src: string): string {
	return `<iframe src="${src}" ${IFRAME_ATTRS}></iframe>`;
}

function getYouTubeEmbedSrc(url: URL): string | null {
	if (isHostname(url, 'youtu.be')) {
		const id = url.pathname.slice(1).split('/')[0];
		return id ? `https://www.youtube.com/embed/${id}${url.search}` : null;
	}

	if (isHostname(url, 'youtube.com')) {
		if (url.pathname.startsWith('/embed/')) {
			const id = url.pathname.slice('/embed/'.length).split('/')[0];
			return id ? `https://www.youtube.com/embed/${id}${url.search}` : null;
		}

		const watchId = url.searchParams.get('v');
		if (watchId) return `https://www.youtube.com/embed/${watchId}`;
	}

	return null;
}

function toVimeoEmbedSrc(url: URL): string | null {
	if (url.hostname === 'player.vimeo.com' && url.pathname.startsWith('/video/')) {
		return url.toString();
	}

	if (url.hostname === 'vimeo.com') {
		const id = url.pathname.split('/').filter(Boolean).pop();
		return id ? `https://player.vimeo.com/video/${id}${url.search}` : null;
	}

	return null;
}

export function normalizeVideoEmbed(input: string): string | null {
	const trimmed = input.trim();
	if (!trimmed) return null;

	if (/<iframe[\s>]/i.test(trimmed)) {
		return trimmed;
	}

	try {
		const url = new URL(trimmed);

		const youtubeSrc = getYouTubeEmbedSrc(url);
		if (youtubeSrc) {
			return wrapIframeSrc(youtubeSrc);
		}

		const vimeoSrc = toVimeoEmbedSrc(url);
		if (vimeoSrc) {
			return wrapIframeSrc(vimeoSrc);
		}
	} catch {
		return null;
	}

	return null;
}
