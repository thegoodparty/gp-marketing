import { describe, expect, test } from 'bun:test';
import { formatPersonName } from './personName';

describe('formatPersonName', () => {
	test('cases the unformatted rows that produced "chris lewis — Candidate"', () => {
		expect(formatPersonName('chris lewis')).toBe('Chris Lewis');
		expect(formatPersonName('george leo moniz')).toBe('George Leo Moniz');
	});

	// The guard that makes this transform safe to apply corpus-wide: anything
	// already carrying an uppercase letter is evidence of a formatted source.
	describe('passes already-formatted names through untouched', () => {
		for (const name of [
			'McDonald',
			'Ian McDonald',
			"O'Brien",
			"Siobhan O'Brien",
			'DeAngelo',
			'Chris DeAngelo',
			'van der Berg',
			'Pieter van der Berg',
			'Blaine K. Bowman',
			'Smith-Jones',
			'Mary Smith-Jones',
			'Martin Luther King Jr.',
			'Henry Ford III',
			'LaToya Cantrell',
			'MacArthur',
			'Rebecca Reid',
			'Allen Earl Slagle',
		]) {
			test(name, () => {
				expect(formatPersonName(name)).toBe(name);
			});
		}
	});

	describe('applies name conventions when the source is entirely lowercase', () => {
		const cases: [string, string][] = [
			['ian mcdonald', 'Ian McDonald'],
			['mcgee', 'McGee'],
			['mccoy', 'McCoy'],
			["siobhan o'brien", "Siobhan O'Brien"],
			["chris d'angelo", "Chris D'Angelo"],
			// The curly apostrophe (U+2019) that CMS round-trips and spreadsheet
			// exports substitute for the ASCII one has to case identically, and the
			// variant that arrived has to survive: rewriting it to ASCII would edit a
			// name we were only asked to re-case.
			['siobhan o\u2019brien', 'Siobhan O\u2019Brien'],
			['chris d\u2019angelo', 'Chris D\u2019Angelo'],
			['mary smith-jones', 'Mary Smith-Jones'],
			['anne-marie o\'neill-burke', "Anne-Marie O'Neill-Burke"],
			['henry ford iii', 'Henry Ford III'],
			['walter carter iv', 'Walter Carter IV'],
			['blaine k. bowman', 'Blaine K. Bowman'],
		];
		for (const [input, expected] of cases) {
			test(`${input} → ${expected}`, () => {
				expect(formatPersonName(input)).toBe(expected);
			});
		}
	});

	// The Roman-numeral rule fires on the final token only: several of those
	// words are ordinary names elsewhere in a full name.
	describe('does not uppercase a numeral-word outside suffix position', () => {
		const cases: [string, string][] = [
			['vi nguyen', 'Vi Nguyen'],
			['ix santos', 'Ix Santos'],
			['x jones', 'X Jones'],
			['henry vi ford', 'Henry Vi Ford'],
		];
		for (const [input, expected] of cases) {
			test(`${input} → ${expected}`, () => {
				expect(formatPersonName(input)).toBe(expected);
			});
		}

		test('a real generational suffix is still uppercased', () => {
			expect(formatPersonName('henry ford iii')).toBe('Henry Ford III');
			expect(formatPersonName('walter carter iv.')).toBe('Walter Carter IV.');
		});
	});

	// Documented losses. An all-lowercase source has already destroyed the
	// distinction, so these assert the deliberate choice rather than a fix.
	describe('does not guess where lowercase input is genuinely ambiguous', () => {
		test('Mac is left as an ordinary word start, because Mackenzie is not MacKenzie', () => {
			expect(formatPersonName('macdonald')).toBe('Macdonald');
			expect(formatPersonName('sarah mackenzie')).toBe('Sarah Mackenzie');
		});

		test('DeAngelo is not reconstructed, because Deangelo is also a real name', () => {
			expect(formatPersonName('chris deangelo')).toBe('Chris Deangelo');
		});

		test('a trailing numeral-word is read as a suffix, which is the commoner case', () => {
			expect(formatPersonName('nguyen vi')).toBe('Nguyen VI');
		});

		test('particles are capitalized, matching US civic records over Dutch convention', () => {
			expect(formatPersonName('pieter van der berg')).toBe('Pieter Van Der Berg');
			expect(formatPersonName('juan de la cruz')).toBe('Juan De La Cruz');
		});
	});

	describe('edge cases', () => {
		test('normalizes the stray whitespace these rows also carry', () => {
			expect(formatPersonName('  chris   lewis  ')).toBe('Chris Lewis');
		});

		test('trims but does not re-case a formatted name', () => {
			expect(formatPersonName('  Blaine K. Bowman ')).toBe('Blaine K. Bowman');
		});

		test('null-ish and blank input yield null, so callers keep their fallback', () => {
			expect(formatPersonName(null)).toBeNull();
			expect(formatPersonName(undefined)).toBeNull();
			expect(formatPersonName('')).toBeNull();
			expect(formatPersonName('   ')).toBeNull();
		});

		test('a name with no cased letters at all is left alone', () => {
			expect(formatPersonName('小明')).toBe('小明');
		});

		test('is idempotent', () => {
			for (const input of ['chris lewis', 'ian mcdonald', "siobhan o'brien", 'henry ford iii']) {
				const once = formatPersonName(input);
				expect(formatPersonName(once)).toBe(once);
			}
		});
	});
});
