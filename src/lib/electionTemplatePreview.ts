import type { ElectionTemplateType } from '~/lib/electionTemplates';

type PreviewTarget = {
	field_electionTargetType?: 'place' | 'position' | 'candidate';
	field_electionTargetSlug?: string;
	field_positionSlug?: string;
};

/**
 * Build a public preview path from a template document's previewTarget + templateType.
 */
export function buildElectionTemplatePreviewPath(
	templateType: ElectionTemplateType | string | undefined,
	previewTarget: PreviewTarget | null | undefined,
): string | null {
	if (!templateType || !previewTarget?.field_electionTargetSlug) return null;

	const slug = previewTarget.field_electionTargetSlug.replace(/^\/+|\/+$/g, '');
	const positionSlug = previewTarget.field_positionSlug?.replace(/^\/+|\/+$/g, '');

	switch (templateType) {
		case 'location':
		case 'locationState':
		case 'locationCounty':
		case 'locationCity':
		case 'locationDistrict':
			return `/elections/${slug}`;
		case 'position':
			return positionSlug ? `/elections/${slug}/position/${positionSlug}` : `/elections/${slug}`;
		case 'positionCandidates':
			return positionSlug
				? `/elections/${slug}/position/${positionSlug}/candidates`
				: `/elections/${slug}`;
		case 'candidateProfile':
			return `/candidate/${slug}`;
		default:
			return null;
	}
}

/**
 * Best-effort path prefixes to revalidate when a custom template is published.
 */
export function buildCustomTemplateRevalidatePaths(targets: Array<{ field_electionTargetType?: string; field_electionTargetSlug?: string }>): string[] {
	const paths = new Set<string>(['/elections', '/candidate']);

	for (const target of targets) {
		const slug = target.field_electionTargetSlug?.replace(/^\/+|\/+$/g, '');
		if (!slug) continue;

		switch (target.field_electionTargetType) {
			case 'place':
				paths.add(`/elections/${slug}`);
				break;
			case 'position':
				paths.add(`/elections/${slug.split('/')[0] ?? slug}`);
				break;
			case 'candidate':
				paths.add(`/candidate/${slug}`);
				break;
			default:
				break;
		}
	}

	return [...paths];
}
