'use client';

import { useEffect, useId } from 'react';

export function Newsletter({ formId }) {
	const id = useId();
	const targetId = `hubspot-form-newsletter-${id}`;

	useEffect(() => {
		if (window['hbspt']) {
			window['hbspt'].forms.create({
				portalId: process.env['NEXT_PUBLIC_HUBSPOT_PORTAL_ID'] ?? '21589597',
				formId,
				target: `#${targetId}`,
			});
		}
	}, [formId]);

	return <div id={targetId} data-component='Newsletter' />;
}
