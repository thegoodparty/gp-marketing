import { describe, expect, test } from 'bun:test';
import { resolveFAQItemsAsText } from './resolveFAQItemsAsText';

function block(text: string) {
	return {
		_type: 'block',
		style: 'normal',
		children: [{ _type: 'span', text, marks: [] }],
	};
}

describe('resolveFAQItemsAsText', () => {
	test('returns empty array for nullish input', () => {
		expect(resolveFAQItemsAsText(null)).toEqual([]);
		expect(resolveFAQItemsAsText(undefined)).toEqual([]);
		expect(resolveFAQItemsAsText([])).toEqual([]);
	});

	test('extracts plain-text Q/A and skips button blocks in the answer', () => {
		const items = resolveFAQItemsAsText([
			{
				faqOverview: {
					field_question: 'How do I run for office?',
					block_answer: [
						block('You can start by checking eligibility'),
						{ _type: 'button', label: 'Get started' },
						block('and filing the required paperwork.'),
					],
				},
			},
		]);
		expect(items.length).toBe(1);
		expect(items[0]?.title).toBe('How do I run for office?');
		expect(items[0]?.copy).toBe('You can start by checking eligibility and filing the required paperwork.');
	});

	test('skips entries missing either question or answer', () => {
		const items = resolveFAQItemsAsText([
			{ faqOverview: { field_question: 'Q1', block_answer: [block('A1')] } },
			{ faqOverview: { field_question: '', block_answer: [block('orphan')] } },
			{ faqOverview: { field_question: 'Q3', block_answer: [] } },
			{ faqOverview: { field_question: 'Q4', block_answer: [block('   ')] } },
		]);
		expect(items.map(i => i.title)).toEqual(['Q1']);
	});
});
