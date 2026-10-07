import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { TestimonialBlockWithLinkSection } from './TestimonialBlockWithLinkSection.tsx';

/**
 * Runs the section through GROQ-shaped props. The quote's `field_quoteState`
 * and the block's `field_filterQuotesByPageState` reach the section by name
 * only, so a schema-vs-GROQ mismatch would read as `undefined` here rather
 * than as a type error.
 */
const quoteRow = (name: string, state?: string) => ({
	_id: name,
	quote: {
		field_quote: `${name} says hello.`,
		field_quoteState: state,
		ref_quoteBy: { _type: 'person', personOverview: { field_personName: name, field_jobTitleOrRole: 'Mayor' } },
	},
});

const section = (settings: Record<string, unknown>) =>
	({
		_type: 'component_testimonialBlockWithLink',
		_key: 'test',
		summaryInfo: { field_title: 'Independents in [State]' },
		quotesContentCollection: {
			field_quotesContentOptions: 'Collection',
			quotes: [
				quoteRow('Tex One', 'Texas'),
				quoteRow('Mary Land', 'Maryland'),
				quoteRow('Nat Ional'),
				quoteRow('Jersey Girl', 'New Jersey'),
				quoteRow('Tex Two', 'Texas'),
				quoteRow('Del Aware', 'Delaware'),
			],
		},
		testimonialBlockWithLinkDesignSettings: { field_blockColorCreamMidnight: 'Cream', ...settings },
	}) as unknown as Parameters<typeof TestimonialBlockWithLinkSection>[0];

const namesIn = (html: string) =>
	['Tex One', 'Mary Land', 'Nat Ional', 'Jersey Girl', 'Tex Two', 'Del Aware']
		.map(name => [name, html.indexOf(`${name} says hello.`)] as const)
		.filter(([, index]) => index >= 0)
		.sort((a, b) => a[1] - b[1])
		.map(([name]) => name);

describe('TestimonialBlockWithLinkSection', () => {
	test('with the toggle off, the page state changes nothing', () => {
		const html = renderToStaticMarkup(<TestimonialBlockWithLinkSection {...section({})} pageState={{ stateName: 'Delaware' }} />);
		expect(namesIn(html)).toEqual(['Tex One', 'Mary Land', 'Nat Ional', 'Jersey Girl', 'Tex Two', 'Del Aware']);
	});

	test("with the toggle on, the page's state leads and the nearest states fill to three cards", () => {
		const html = renderToStaticMarkup(
			<TestimonialBlockWithLinkSection {...section({ field_filterQuotesByPageState: true })} pageState={{ stateName: 'Delaware' }} />,
		);
		expect(namesIn(html)).toEqual(['Del Aware', 'Mary Land', 'Jersey Girl']);
	});

	test('"Max Number to Display" sets how many cards the state fill produces', () => {
		const html = renderToStaticMarkup(
			<TestimonialBlockWithLinkSection
				{...section({ field_filterQuotesByPageState: true, field_maxNumberToDisplay: 5 })}
				pageState={{ stateName: 'Texas' }}
			/>,
		);
		const names = namesIn(html);
		expect(names.slice(0, 2)).toEqual(['Tex One', 'Tex Two']);
		expect(names.slice(2).sort()).toEqual(['Del Aware', 'Jersey Girl', 'Mary Land']);
		expect(names).not.toContain('Nat Ional');
	});

	test('a page with no state shows the collection as is', () => {
		const html = renderToStaticMarkup(<TestimonialBlockWithLinkSection {...section({ field_filterQuotesByPageState: true })} />);
		expect(namesIn(html)).toEqual(['Tex One', 'Mary Land', 'Nat Ional', 'Jersey Girl', 'Tex Two', 'Del Aware']);
	});

	test('the [State] token still resolves in the heading', () => {
		const html = renderToStaticMarkup(
			<TestimonialBlockWithLinkSection {...section({})} tokens={{ '[State]': 'Texas' }} pageState={{ stateName: 'Texas' }} />,
		);
		expect(html).toContain('Independents in Texas');
	});
});
