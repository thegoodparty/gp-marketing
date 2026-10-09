import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { VoterFilterBlockSection } from './VoterFilterBlockSection.tsx';

/**
 * Pins the schema-vs-GROQ field mapping. The `...` spread in the GROQ fragment
 * projects flat fields under their schema names, so a rename on either side would
 * otherwise render an empty block with no type error (see docs/adding-a-component.md).
 */
const section = {
	_type: 'component_voterFilterBlock',
	_key: 'test',
	summaryInfo: {
		_type: 'summaryInfo',
		field_title: 'Build your list with any of these filters',
		block_summaryText: null,
		list_buttons: null,
	},
	voterFilterBlockContent: {
		_type: 'object',
		list_voterFilterGroups: [
			{
				_key: 'voting',
				_type: 'voterFilterGroup',
				field_title: 'How they vote',
				field_icon: 'vote',
				list_voterFilters: [
					{ _key: 'a', _type: 'voterFilter', field_label: 'Voter likelihood', list_values: ['Super', 'Likely', 'Unknown'] },
					{ _key: 'b', _type: 'voterFilter', field_label: 'Political party', list_values: ['Democrat', 'Independent'] },
				],
			},
			{
				_key: 'empty',
				_type: 'voterFilterGroup',
				field_title: 'Empty group',
				field_icon: null,
				list_voterFilters: [],
			},
		],
	},
	voterFilterBlockDesignSettings: { _type: 'object', field_blockColorCreamMidnight: 'MidnightDark' },
	componentSettings: { _type: 'componentSettings', field_anchorId: 'filters' },
} as unknown as Parameters<typeof VoterFilterBlockSection>[0];

describe('VoterFilterBlockSection', () => {
	test('renders the heading, each filter row, and one chip per value', () => {
		const html = renderToStaticMarkup(<VoterFilterBlockSection {...section} />);

		expect(html).toContain('Build your list with any of these filters');
		expect(html).toContain('How they vote');
		expect(html).toContain('Voter likelihood');
		expect(html).toContain('Political party');
		for (const value of ['Super', 'Likely', 'Unknown', 'Democrat', 'Independent']) {
			expect(html).toContain(`>${value}</span>`);
		}
	});

	test('skips groups with no filters and honors the anchor and background', () => {
		const html = renderToStaticMarkup(<VoterFilterBlockSection {...section} />);

		expect(html).not.toContain('Empty group');
		expect(html).toContain('id="filters"');
		expect(html).toContain('bg-midnight-900');
	});
});
