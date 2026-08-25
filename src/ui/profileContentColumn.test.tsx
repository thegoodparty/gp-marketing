import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { ProfileContentBlock } from './ProfileContentBlock.tsx';

/**
 * The hero portrait is a circle that straddles the dark band: ProfileHero caps
 * how much height it contributes with a negative bottom margin (`md` 104px,
 * `lg` 216px), so the photo renders *past* the hero and lands in the first
 * column of this block's grid.
 *
 * With a sidebar that first column is the <aside>, which offsets by the same
 * amount to clear it. With no sidebar — a person whose civics feeds name no
 * race, so there is nothing to put in an elections sidebar — the content column
 * takes that slot instead and inherits neither the clearance nor the width it
 * wants, so the photo sat on top of the first card. Measured on production
 * before the fix: 168px of collision at 1512px wide, 73px at 900px, and a card
 * squeezed to the 400px sidebar track while the wide column sat empty.
 */

const CARDS = [{ cardType: 'about-me' as const, heading: 'About Me', content: 'Body' }];

const SIDEBAR = {
	links: [],
	aboutOffice: 'Body',
	termLength: 'Body',
	electionDate: 'Body',
};

/** Class list of the element holding the content cards. */
function contentColumnClasses(html: string): string {
	// The cards' column is the last direct child of the grid; grab every class
	// attribute and take the one that owns the first card.
	const marker = html.indexOf('About Me');
	expect(marker).toBeGreaterThan(-1);
	const before = html.slice(0, marker);
	const classes = [...before.matchAll(/class="([^"]*)"/g)].map((m) => m[1] ?? '');
	const column = classes.reverse().find((c) => c.includes('min-w-0') && c.includes('w-full'));
	return column ?? '';
}

describe('the content column clears the hero portrait when there is no sidebar', () => {
	for (const cardLayout of ['separated', 'joined'] as const) {
		test(`${cardLayout}: moves to the wide second column from lg`, () => {
			const html = renderToStaticMarkup(
				<ProfileContentBlock cardLayout={cardLayout} contentCards={CARDS} />,
			);
			const column = contentColumnClasses(html);
			// Beside the portrait, not under it — and in the 1fr track, not the
			// 280-400px one the sidebar would have occupied.
			expect(column).toContain('lg:col-start-2');
		});

		test(`${cardLayout}: clears the portrait in the stacked layout below lg`, () => {
			const html = renderToStaticMarkup(
				<ProfileContentBlock cardLayout={cardLayout} contentCards={CARDS} />,
			);
			const column = contentColumnClasses(html);
			// Below `lg` the grid is a single column, so the card stacks directly
			// under the photo and has to reserve its `md` overflow.
			expect(column).toContain('md:mt-[104px]');
			// ...but not at `lg`, where col-start-2 already moves it clear.
			expect(column).toContain('lg:mt-0');
		});

		test(`${cardLayout}: leaves the column alone when a sidebar already clears it`, () => {
			const html = renderToStaticMarkup(
				<ProfileContentBlock cardLayout={cardLayout} contentCards={CARDS} sidebar={SIDEBAR} />,
			);
			const column = contentColumnClasses(html);
			// The <aside> is the first grid child and carries the clearance, so the
			// content column must stay in its natural second track.
			expect(column).not.toContain('lg:col-start-2');
			expect(column).not.toContain('md:mt-[104px]');
		});
	}

	test('the sidebar still carries the clearance it always did', () => {
		const html = renderToStaticMarkup(
			<ProfileContentBlock cardLayout='separated' contentCards={CARDS} sidebar={SIDEBAR} />,
		);
		const aside = /<aside class="([^"]*)"/.exec(html)?.[1] ?? '';
		expect(aside).toContain('md:mt-[104px]');
		expect(aside).toContain('lg:mt-[216px]');
	});
});
