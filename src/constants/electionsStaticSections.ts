import { resolveTextSize } from '~/ui/_lib/resolveTextSize';

/**
 * Static content for Carousel and Stepper blocks on elections state pages.
 * Extracted from template-elections-subset (tmpl-dta.json).
 */

export const CAROUSEL_QUOTE_COLLECTION_ID = '689fccfa-f1cd-48c5-b9c0-622aae0f760d';

export const CAROUSEL_HEADER = {
	title: 'Real people. Real victories. Real change.',
	copy: 'How Independents are empowered to run, win, and serve, by the powerful campaigning tools at GoodParty.org.',
} as const;

export const STEPPER_HEADER = {
	title: 'Build a better democracy with us.',
	copy: 'Ready to join the movement? Support candidates, run for office, or join our online community of like-minded individuals.',
} as const;

const STEPPER_TEXT_SIZE = resolveTextSize('Medium');

export const STEPPER_ITEMS = [
	{
		_key: '3ab77600ddb4',
		title: 'Run for office',
		copy: 'Discover how you can run for office and make a real impact in your community.',
		layout: 'media-left' as const,
		showFullImage: true,
		textSize: STEPPER_TEXT_SIZE,
		image: {
			_type: 'img_image' as const,
			asset: {
				_ref: 'image-e4daa7ca2fa896c337d1c7a58d6fe068fc8b7984-996x985-png',
				_type: 'reference' as const,
			},
		},
		buttons: [
			{
				_key: '368a62a20fce',
				buttonType: 'external' as const,
				label: 'Start your campaign',
				href: 'https://app.goodparty.org/sign-up',
				buttonProps: { styleType: 'primary' as const },
			},
		],
	},
	{
		_key: 'eddbf127bb73',
		title: 'GoodParty.org Community',
		copy: 'Connect with other Independents, and explore free training to learn how to run for office.',
		layout: 'media-left' as const,
		showFullImage: true,
		textSize: STEPPER_TEXT_SIZE,
		image: {
			_type: 'img_image' as const,
			asset: {
				_ref: 'image-a1bb7d9df1d5b2bb30a35f706575b6aa075aaf9c-908x829-png',
				_type: 'reference' as const,
			},
		},
		buttons: [
			{
				_key: 'f399c85bee81',
				buttonType: 'external' as const,
				label: 'Join the Community',
				href: 'https://community.goodparty.org',
				buttonProps: { styleType: 'primary' as const },
			},
		],
	},
	{
		_key: 'e1f2aa1e89fc',
		title: 'Run Independent. Win local.',
		copy: 'A step-by-step guide to running and winning as an Independent. Free to download, built to help you win local.',
		layout: 'media-right' as const,
		showFullImage: true,
		textSize: STEPPER_TEXT_SIZE,
		image: {
			_type: 'img_image' as const,
			asset: {
				_ref: 'image-fd4b76b12be319729607bc8508953e0849471eab-1144x1230-png',
				_type: 'reference' as const,
			},
		},
		buttons: [
			{
				_key: '738cc4a44dd6',
				buttonType: 'internal' as const,
				label: 'Download the free e-book',
				href: '/download',
				buttonProps: { styleType: 'primary' as const },
			},
		],
	},
] as const;
