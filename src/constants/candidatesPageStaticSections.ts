/**
 * Static content for candidates page sections.
 * Extracted from Sanity document 84ce14b8-bbeb-45bd-8e51-3f81c88423c3 (cdates.json).
 * Placeholders [office] and [location] are replaced at runtime.
 */

import { POSITION_PAGE_TWO_UP_CARD } from './positionPageStaticSections';

export const CANDIDATES_PAGE_CTA_BANNER = {
	title: "Don't see your name?",
	copy: 'Add or claim your campaign here',
	backgroundColor: 'cream' as const,
	color: 'bright-yellow' as const,
	button: {
		buttonType: 'external' as const,
		href: 'https://app.goodparty.org/sign-up',
		label: 'Claim profile',
		buttonProps: { styleType: 'primary' as const },
	},
} as const;

export const CANDIDATES_PAGE_CTA_IMAGE = {
	title: 'Not running for [office]?',
	copy: 'Browse other available offices in [location]',
	backgroundColor: 'cream' as const,
	color: 'blue' as const,
	showFullImage: true,
	primaryButton: {
		buttonType: 'internal' as const,
		href: '', // Replaced with locationHref at runtime
		label: 'Get started',
		buttonProps: { styleType: 'primary' as const },
	},
	imageAssetRef: 'image-a7f5762418e642b4acce5f248624451300a126b9-1354x1350-png',
} as const;

export { POSITION_PAGE_TWO_UP_CARD as CANDIDATES_PAGE_TWO_UP_CARD };
