'use client';

import { useEffect, useId } from 'react';

declare global {
	interface Window {
		hbspt?: {
			forms: {
				create: (options: { portalId: string; formId: string; target: string }) => void;
			};
		};
	}
}

export function NewsletterEmbed({ formId }: { formId: string }) {
	const id = useId();
	const targetId = `hubspot-form-newsletter-${id.replace(/:/g, '')}`;

	useEffect(() => {
		if (window.hbspt) {
			window.hbspt.forms.create({
				portalId: process.env['NEXT_PUBLIC_HUBSPOT_PORTAL_ID'] ?? '21589597',
				formId,
				target: `#${targetId}`,
			});
		}
	}, [formId, targetId]);

	return <div id={targetId} data-component='NewsletterEmbed' />;
}
