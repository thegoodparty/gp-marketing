import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { LocationLandingPageHeroSection } from './LocationLandingPageHeroSection.tsx';

/**
 * The template's body copy is the editor's. The route still hands in a default
 * sentence for a template saved without one, but it must not override copy that
 * marketing wrote (Emily, 2026-10-07: every county page kept showing the old
 * "Learn what positions are up for election" line under the redesigned hero).
 */
type Props = Parameters<typeof LocationLandingPageHeroSection>[0];

const base = {
	_key: 'hero',
	_type: 'component_locationLandingPageHero',
	locationLandingPageHeroDesignSettings: { field_blockColorCreamMidnight: 'MidnightDark' },
};

const override = {
	headline: 'Upcoming elections in Peoria County, Illinois',
	bodyCopy: 'Learn what positions are up for election in Peoria County.',
	locationLevel: 'county' as const,
	stateName: 'Illinois',
	countyName: 'Peoria County',
};

async function render(props: Props): Promise<string> {
	const element = await LocationLandingPageHeroSection(props);
	return renderToStaticMarkup(element);
}

describe('LocationLandingPageHeroSection body copy', () => {
	test("the editor's template copy wins over the route's default, with tokens resolved", async () => {
		const html = await render({
			...base,
			locationLandingPageHeroContent: { field_bodyCopy: 'A free, nonpartisan guide to local elections in [County].' },
			locationOverride: override,
			tokens: { '[County]': 'Peoria County' },
		} as unknown as Props);
		expect(html).toContain('A free, nonpartisan guide to local elections in Peoria County.');
		expect(html).not.toContain('Learn what positions are up for election');
	});

	test("the route's default fills in when the template has no copy", async () => {
		const html = await render({ ...base, locationOverride: override } as unknown as Props);
		expect(html).toContain('Learn what positions are up for election in Peoria County.');
	});

	test("a cleared field counts as no copy, so the route's default still fills in", async () => {
		for (const field_bodyCopy of ['', '   ']) {
			const html = await render({ ...base, locationLandingPageHeroContent: { field_bodyCopy }, locationOverride: override } as unknown as Props);
			expect(html).toContain('Learn what positions are up for election in Peoria County.');
		}
	});
});
