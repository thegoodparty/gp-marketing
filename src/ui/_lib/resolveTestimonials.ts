import type { TestimonialCardProps } from '../TestimonialCard';

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
		const { personOverview: person, organisationOverview: org } = ref_quoteBy ?? {};

		testimonials.push({
			author: {
				name: person?.field_personName || org?.field_organisationName,
				meta: [person?.field_jobTitleOrRole],
				image: person?.img_profilePicture || org?.img_logo,
			},
			copy,
		});
	}

	return testimonials;
}
