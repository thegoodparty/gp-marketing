import { describe, expect, test } from 'bun:test';
import type { Sections } from '~/PageSections';
import {
	type BlogNewsletterVariantRow,
	type NewsletterBlockSection,
	isVoterFacingCategory,
	pickNewsletterBlock,
	swapInlineCtasForNewsletter,
} from './blogNewsletter';

function block(title: string): NewsletterBlockSection {
	return {
		_key: `nl-${title}`,
		_type: 'component_newsletterBlock',
		newsletterBlockMessaging: { field_title: title },
	} as unknown as NewsletterBlockSection;
}

function row(variant: string, sections: Sections[]): BlogNewsletterVariantRow {
	return { field_variantName: variant, pageSections: { list_pageSections: sections } };
}

const control = row('control', [block('Become part of the movement')]);
const proof = row('proof', [{ _key: 'x', _type: 'component_bannerBlock' } as unknown as Sections, block('Independents are winning everywhere')]);

describe('isVoterFacingCategory', () => {
	test('matches the voter categories only', () => {
		expect(isVoterFacingCategory('politics')).toBe(true);
		expect(isVoterFacingCategory('independent-cause')).toBe(true);
		expect(isVoterFacingCategory('for-voters')).toBe(true);
		expect(isVoterFacingCategory('for-candidates')).toBe(false);
		expect(isVoterFacingCategory('news')).toBe(false);
		expect(isVoterFacingCategory(undefined)).toBe(false);
	});
});

describe('pickNewsletterBlock', () => {
	test('returns the assigned arm when its doc exists', () => {
		const picked = pickNewsletterBlock([control, proof], 'proof');
		expect(picked?.variant).toBe('proof');
		expect(picked?.block.newsletterBlockMessaging?.field_title).toBe('Independents are winning everywhere');
	});

	test('falls back to control when unassigned, off, or the arm has no doc', () => {
		expect(pickNewsletterBlock([control, proof], null)?.variant).toBe('control');
		expect(pickNewsletterBlock([control, proof], 'off')?.variant).toBe('control');
		expect(pickNewsletterBlock([control, proof], 'agency')?.variant).toBe('control');
	});

	test('returns null when no doc carries a newsletter block', () => {
		expect(pickNewsletterBlock([row('control', [])], 'control')).toBeNull();
		expect(pickNewsletterBlock([], 'proof')).toBeNull();
	});
});

describe('swapInlineCtasForNewsletter', () => {
	const text = { _type: 'block', _key: 'p1' };
	const cta1 = { _type: 'ctaSection', _key: 'c1' };
	const cta2 = { _type: 'imageCta', _key: 'c2' };
	const faqs = { _type: 'faqs', _key: 'f1' };

	test('replaces the first inline CTA and drops the rest', () => {
		const out = swapInlineCtasForNewsletter([text, cta1, faqs, cta2], block('x'));
		expect(out.map(s => s._type)).toEqual(['block', 'newsletterSection', 'faqs']);
		expect(out[1]?._key).toBe('newsletter-c1');
	});

	test('appends the block when the article has no inline CTA', () => {
		const out = swapInlineCtasForNewsletter([text, faqs], block('x'));
		expect(out.map(s => s._type)).toEqual(['block', 'faqs', 'newsletterSection']);
		expect(out[2]?._key).toBe('newsletter-end');
	});

	test('carries the exposure onto the section only when bucketed', () => {
		const exposure = { flagKey: 'blog-voter-newsletter-cta-202610', variant: 'proof' };
		const bucketed = swapInlineCtasForNewsletter([cta1], block('x'), exposure)[0];
		const unbucketed = swapInlineCtasForNewsletter([cta1], block('x'), null)[0];
		expect(bucketed).toMatchObject({ _type: 'newsletterSection', experiment: exposure });
		expect(unbucketed).not.toHaveProperty('experiment');
	});

	test('handles an empty body', () => {
		expect(swapInlineCtasForNewsletter(null, block('x')).map(s => s._type)).toEqual(['newsletterSection']);
	});
});
