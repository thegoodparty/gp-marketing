import type { Sections } from '~/PageSections';
import type { AuthorProps } from '~/ui/Author';
import type { SanityImage } from '~/ui/types';

const PERSON_TYPE = 'person';
const ORGANISATION_TYPE = 'organisation';

export function resolveAuthor(
	quote?: NonNullable<
		NonNullable<
			NonNullable<Extract<Sections, { _type: 'component_carouselBlock' }>['quotesContentCollection']>['quotes']
		>[number]['quote']
	>['ref_quoteBy'],
): AuthorProps | undefined {
	if (!quote) return undefined;

	const { _type } = quote;

	if (_type === PERSON_TYPE) {
		const { personOverview } = quote;
		const { field_personName, field_jobTitleOrRole, img_profilePicture } = personOverview ?? {};
		if (!field_personName) return undefined;

		return {
			name: field_personName,
			meta: field_jobTitleOrRole ? [field_jobTitleOrRole] : undefined,
			image: img_profilePicture as unknown as SanityImage,
		};
	}

	if (_type === ORGANISATION_TYPE) {
		const { organisationOverview } = quote;
		const { field_organisationName, img_logo } = organisationOverview ?? {};
		if (!field_organisationName) return undefined;

		return {
			name: field_organisationName,
			image: img_logo as unknown as SanityImage,
		};
	}

	return undefined;
}
