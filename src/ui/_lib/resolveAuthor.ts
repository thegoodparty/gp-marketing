import type { Sections } from '~/PageSections';
import type { AuthorProps } from '~/ui/Author';
import type { SanityImage } from '~/ui/types';

export function resolveAuthor(
	quote?: NonNullable<
		NonNullable<
			NonNullable<Extract<Sections, { _type: 'component_carouselBlock' }>['quotesContentCollection']>['quotes']
		>[number]['quote']
	>['ref_quoteBy'],
): AuthorProps | undefined {
	if (!quote) return undefined;
	if (quote._type === 'person' && quote.personOverview?.field_personName) {
		return {
			name: quote.personOverview?.field_personName,
			meta: quote.personOverview?.field_jobTitleOrRole ? [quote.personOverview?.field_jobTitleOrRole] : undefined,
			image: quote.personOverview?.img_profilePicture as unknown as SanityImage,
		};
	}
	if (quote._type === 'organisation' && quote.organisationOverview?.field_organisationName) {
		return {
			name: quote.organisationOverview?.field_organisationName,
			image: quote.organisationOverview?.img_logo as unknown as SanityImage,
		};
	}
	return undefined;
}
