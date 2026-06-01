import { toPlainText } from '@portabletext/toolkit';
import { stegaClean } from 'next-sanity';
import type { FAQItemLike } from './schema';

type SanityFAQLike = {
	faqOverview?: {
		field_question?: unknown;
		block_answer?: unknown;
	} | null;
} | null | undefined;

function readString(value: unknown): string {
	if (typeof value !== 'string') return '';
	const cleaned = stegaClean(value);
	return typeof cleaned === 'string' ? cleaned.trim() : '';
}

function readAnswerPlainText(blocks: unknown): string {
	if (!Array.isArray(blocks) || blocks.length === 0) return '';
	const textBlocks = blocks.filter(
		(b): b is { _type?: unknown } => Boolean(b) && typeof b === 'object' && (b as { _type?: unknown })._type !== 'button',
	);
	try {
		const text = toPlainText(textBlocks as Parameters<typeof toPlainText>[0]);
		return typeof text === 'string' ? text.replace(/\s+/g, ' ').trim() : '';
	} catch {
		return '';
	}
}

/**
 * Converts a list of Sanity FAQ documents (as returned by `faQGroq`) into the
 * plain-text question/answer pairs required by `buildFAQSchema`. Skips entries
 * missing either a question or an answer so the resulting `FAQPage` schema
 * mirrors only visible, complete on-page content.
 */
export function resolveFAQItemsAsText(items: ReadonlyArray<SanityFAQLike> | null | undefined): FAQItemLike[] {
	if (!items) return [];
	const out: FAQItemLike[] = [];
	for (const item of items) {
		const question = readString(item?.faqOverview?.field_question);
		const answer = readAnswerPlainText(item?.faqOverview?.block_answer);
		if (!question || !answer) continue;
		out.push({ title: question, copy: answer });
	}
	return out;
}
