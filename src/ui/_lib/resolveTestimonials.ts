import type { TestimonialCardProps } from '../TestimonialCard';

export function resolveTestimonials(item: any): TestimonialCardProps[] {
	let testimonials: TestimonialCardProps[] = [];

	item.quotes.map(quote => {
		testimonials.push({
			author: {
				name:
					quote?.quote?.ref_quoteBy?.personOverview?.field_personName ||
					quote?.quote?.ref_quoteBy?.organisationOverview?.field_organisationName,
				meta: [quote?.quote?.ref_quoteBy?.personOverview?.field_jobTitleOrRole],
				image: quote?.quote?.ref_quoteBy?.personOverview?.img_profilePicture || quote?.quote?.ref_quoteBy?.organisationOverview?.img_logo,
			},
			copy: quote.quote.field_quote,
		});
	});

	return testimonials;
}
