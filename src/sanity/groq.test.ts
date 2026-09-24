import { describe, expect, test } from 'bun:test';
import * as groq from './groq';

// Sanity rejects POST bodies over 300 KB ("The request body is N, exceeding the limit of 300 KB"), and
// next build only surfaces that as a failed prerender. Keep a wide margin so a block can add a
// projection without anyone re-measuring by hand. See docs/adding-a-component.md, "Query size budget".
const QUERY_BUDGET = 200_000;

const exportedStrings = Object.entries(groq as Record<string, unknown>).filter((entry): entry is [string, string] => typeof entry[1] === 'string');
const isQuery = (value: string) => /^\s*\*\[/.test(value) || value.startsWith('fn ');
const queries = exportedStrings.filter(([, value]) => isQuery(value));

describe('groq query size', () => {
	test('every query stays under the request body budget', () => {
		const oversized = queries.filter(([, value]) => value.length > QUERY_BUDGET).map(([name, value]) => `${name}: ${value.length}`);
		expect(oversized).toEqual([]);
	});

	test('sectionsGroq is not re-inlining the link or button projections', () => {
		expect(groq.sectionsGroq).not.toContain(groq.internalLinkGroq);
		expect(groq.sectionsGroq).not.toContain(groq.buttonBodyGroq);
	});
});

describe('custom groq functions', () => {
	test('every query that calls a gp:: function declares them first', () => {
		const missing = queries.filter(([, value]) => value.includes('gp::') && !value.startsWith(groq.groqFunctions)).map(([name]) => name);
		expect(missing).toEqual([]);
	});

	test('every gp:: function that is called is declared', () => {
		const declared = new Set([...groq.groqFunctions.matchAll(/fn gp::(\w+)\(/g)].map(match => match[1]));
		const called = new Set(exportedStrings.flatMap(([, value]) => [...value.matchAll(/(?<!fn )gp::(\w+)\(/g)].map(match => match[1])));
		expect([...called].filter(name => !declared.has(name))).toEqual([]);
		expect(declared.size).toBeGreaterThan(0);
	});

	test('the shared fragments keep their projected field names', () => {
		expect(groq.buttonGroq).toBe('...gp::button(@)');
		expect(groq.buttonBodyGroq).toContain('"link":gp::link(field_internalLink)');
		expect(groq.internalLinkGroq).toContain('"name":');
		expect(groq.internalLinkGroq).toContain('"title":');
		expect(groq.internalLinkGroq).toContain('"label":');
		expect(groq.internalLinkGroq).toContain('"href":');
	});
});
