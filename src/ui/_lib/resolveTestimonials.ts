import type { TestimonialCardProps } from '../TestimonialCard';
import { resolveAuthor } from './resolveAuthor';

export function resolveTestimonials(item: any): TestimonialCardProps[] {
	const quotes = item?.quotes;
	if (!Array.isArray(quotes) || quotes.length === 0) {
		return [];
	}

	const testimonials: TestimonialCardProps[] = [];

	for (const row of quotes as Array<{ quote?: any }>) {
		const nested = row?.quote;
		const copy = nested?.field_quote;
		if (typeof copy !== 'string' || copy.trim().length === 0) {
			continue;
		}

		const { ref_quoteBy } = nested ?? {};

		testimonials.push({
			author: resolveAuthor(ref_quoteBy),
			copy,
		});
	}

	return testimonials;
}
