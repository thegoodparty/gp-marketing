'use client';

import { useEffect, useRef } from 'react';

export function EmbedHtml({ html, className }: { html: string; className?: string }) {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const container = containerRef.current;
		if (!container || !html) return;

		container.innerHTML = html;

		const scripts = container.querySelectorAll('script');
		scripts.forEach((oldScript) => {
			const newScript = document.createElement('script');
			Array.from(oldScript.attributes).forEach((attr) => newScript.setAttribute(attr.name, attr.value));
			newScript.textContent = oldScript.textContent;
			oldScript.parentNode?.replaceChild(newScript, oldScript);
		});

		return () => {
			container.innerHTML = '';
		};
	}, [html]);

	return <div ref={containerRef} className={className} />;
}
