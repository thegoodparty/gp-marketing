import type { Sections } from '~/PageSections';
import { PROFILE_PAGE_SECTIONS } from '~/app/candidate/[...slug]/profilePageSections';
import {
	tmplElectionsCandidatesSections,
	tmplElectionsCityIndexSections,
	tmplElectionsCountyIndexSections,
	tmplElectionsDistrictIndexSections,
	tmplElectionsPositionSections,
	tmplElectionsStateIndexSections,
	tmplPersonProfileSections,
} from '~/lib/electionsTemplateSeedSections';
import type { ElectionTemplateType } from '~/lib/electionTemplates';

// Blocks in the in-code seed templates carry raw Sanity references (quote collections,
// image assets) or CMS-schema field names that only resolve after GROQ projection.
// The code-default fallback never runs GROQ, so these would render as an empty carousel,
// broken image, or CTA block with no copy/buttons. Drop them so the last-resort fallback
// stays content-light but never visibly broken.
const UNRESOLVABLE_SEED_BLOCK_TYPES = new Set<string>([
	'component_carouselBlock',
	'component_ctaImageBlock',
	'component_ctaBlock',
	'component_ctaBannerBlock',
]);

function stripUnresolvableSeedBlocks(sections: Sections[]): Sections[] {
	return sections.filter(section => !UNRESOLVABLE_SEED_BLOCK_TYPES.has(section._type));
}

export function getCodeDefaultElectionTemplate(templateType: ElectionTemplateType): Sections[] {
	switch (templateType) {
		case 'candidateProfile':
			return stripUnresolvableSeedBlocks(PROFILE_PAGE_SECTIONS as unknown as Sections[]);
		case 'personProfile':
			return stripUnresolvableSeedBlocks(tmplPersonProfileSections as unknown as Sections[]);
		case 'position':
			return stripUnresolvableSeedBlocks(tmplElectionsPositionSections as unknown as Sections[]);
		case 'positionCandidates':
			return stripUnresolvableSeedBlocks(tmplElectionsCandidatesSections as unknown as Sections[]);
		case 'locationState':
			return stripUnresolvableSeedBlocks(tmplElectionsStateIndexSections as unknown as Sections[]);
		case 'locationCounty':
			return stripUnresolvableSeedBlocks(tmplElectionsCountyIndexSections as unknown as Sections[]);
		case 'locationCity':
			return stripUnresolvableSeedBlocks(tmplElectionsCityIndexSections as unknown as Sections[]);
		case 'locationDistrict':
			return stripUnresolvableSeedBlocks(tmplElectionsDistrictIndexSections as unknown as Sections[]);
		default:
			return [];
	}
}
