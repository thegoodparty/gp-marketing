import type { Sections } from '~/PageSections';
import { PROFILE_PAGE_SECTIONS } from '~/app/candidate/[...slug]/profilePageSections';
import {
	tmplCandidateProfileSections,
	tmplElectionsCandidatesSections,
	tmplElectionsPositionSections,
	tmplElectionsStateIndexSections,
} from '~/lib/electionsTemplateSeedSections';
import type { ElectionTemplateType } from '~/lib/electionTemplates';

export function getCodeDefaultElectionTemplate(
	templateType: ElectionTemplateType,
): Sections[] {
	switch (templateType) {
		case 'candidateProfile':
			return PROFILE_PAGE_SECTIONS as unknown as Sections[];
		case 'position':
			return tmplElectionsPositionSections as unknown as Sections[];
		case 'positionCandidates':
			return tmplElectionsCandidatesSections as unknown as Sections[];
		case 'location':
			return tmplElectionsStateIndexSections as unknown as Sections[];
		default:
			return [];
	}
}
