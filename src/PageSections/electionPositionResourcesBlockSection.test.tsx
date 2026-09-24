import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { ElectionPositionResourcesBlockSection, resolveGuideButton } from './ElectionPositionResourcesBlockSection.tsx';

/**
 * Runs the section through GROQ-shaped props. The card fields flow through the
 * `...` spread under their schema names, but each card's button is projected by
 * `buttonGroq` (`action`, `text`, `field_externalLink`, ...), so a wrong name on
 * either side renders an empty card with no type error.
 */
const card = (label: string, title: string, buttonText: string, href: string, color: string, icon = 'book-open') => ({
	field_label: label,
	field_title: title,
	field_description: `${title} description.`,
	field_icon: icon,
	field_componentColor6ColorsInverse: color,
	button: {
		_key: `${label}-button`,
		action: 'External',
		hierarchy: 'Secondary',
		text: buttonText,
		field_externalLink: href,
	},
});

const section = {
	_type: 'component_electionPositionResourcesBlock',
	_key: 'test',
	guideCard: card('Guide', 'How to Run for [office name]', 'Read the guide', 'https://goodparty.org/blog', 'Waxflower'),
	ebookCard: card('E-book', '2026 Political Campaign Playbook', 'Read the guide', 'https://goodparty.org/e-book', 'Lavender'),
	supportCard: card('Free support', 'Get free training and support', 'Connect with us', 'https://community.goodparty.org', 'BrightYellow', 'headset'),
	electionPositionResourcesBlockDesignSettings: { field_blockColorCreamMidnight: 'Cream' },
	componentSettings: { field_anchorId: 'resources' },
} as unknown as Parameters<typeof ElectionPositionResourcesBlockSection>[0];

const tokens = { '[office name]': 'City Council' };

describe('ElectionPositionResourcesBlockSection', () => {
	test('renders all three cards from the CMS fields, with the office token resolved', () => {
		const html = renderToStaticMarkup(<ElectionPositionResourcesBlockSection {...section} tokens={tokens} />);

		expect(html).toContain('How to Run for City Council');
		expect(html).toContain('2026 Political Campaign Playbook');
		expect(html).toContain('Get free training and support');
		expect(html).toContain('Connect with us');
		expect(html).toContain('href="https://community.goodparty.org"');
		expect(html).toContain('bg-waxflower-200');
		expect(html).toContain('bg-lavender-200');
		expect(html).toContain('bg-bright-yellow-200');
		expect(html).toContain('id="resources"');
	});

	test("the page's guide article replaces the editor-set guide link", () => {
		const html = renderToStaticMarkup(
			<ElectionPositionResourcesBlockSection
				{...section}
				tokens={tokens}
				resourcesOverride={{ guideHref: '/blog/article/how-to-run-for-city-council' }}
			/>,
		);

		expect(html).toContain('href="/blog/article/how-to-run-for-city-council"');
		expect(html).not.toContain('href="https://goodparty.org/blog"');
		expect(html).toContain('Read the guide');
	});

	test('without a guide link from either source the guide card is left out and the others stay', () => {
		const html = renderToStaticMarkup(
			<ElectionPositionResourcesBlockSection {...section} guideCard={{ ...section.guideCard, button: null }} tokens={tokens} />,
		);

		expect(html).not.toContain('How to Run for');
		expect(html).toContain('2026 Political Campaign Playbook');
		expect(html).toContain('Get free training and support');
	});

	test('renders nothing when hidden', () => {
		const html = renderToStaticMarkup(<ElectionPositionResourcesBlockSection {...section} resourcesOverride={{ hidden: true }} />);

		expect(html).toBe('');
	});

	test('a midnight background is passed through', () => {
		const html = renderToStaticMarkup(
			<ElectionPositionResourcesBlockSection
				{...section}
				electionPositionResourcesBlockDesignSettings={{ field_blockColorCreamMidnight: 'MidnightDark' }}
			/>,
		);

		expect(html).toContain('bg-midnight-900');
	});
});

describe('resolveGuideButton', () => {
	test('uses the page article with the editor button text', () => {
		expect(resolveGuideButton(section.guideCard, '/blog/article/how-to-run-for-mayor')).toEqual({
			buttonType: 'internal',
			href: '/blog/article/how-to-run-for-mayor',
			label: 'Read the guide',
		});
	});

	test('falls back to a default label when the editor set no button at all', () => {
		expect(resolveGuideButton(undefined, '/blog/article/how-to-run-for-mayor')).toEqual({
			buttonType: 'internal',
			href: '/blog/article/how-to-run-for-mayor',
			label: 'Read the guide',
		});
	});

	test('keeps the editor link when the page supplies none', () => {
		const button = resolveGuideButton(section.guideCard, undefined);

		expect(button?.buttonType).toBe('external');
		expect(button && 'href' in button ? button.href : undefined).toBe('https://goodparty.org/blog');
	});

	test('is undefined with no link from either source', () => {
		expect(resolveGuideButton(undefined, undefined)).toBeUndefined();
	});
});
