import type { Sections } from '~/PageSections';
import { PageSections, type SectionOverrides } from '~/PageSections';
import { ExperimentExposureTracker } from '~/experiments/ExperimentExposureTracker';
import { resolvePageExperiments } from '~/experiments/resolvePageExperiments';
import { getFaqSlugMapForPage } from '~/lib/getCachedFaqSlugMap';

export async function ExperimentResolver(props: {
	pageId: string;
	controlSections?: Sections[] | null;
	sectionOverrides?: SectionOverrides;
	pageSlug?: string;
	faqSlugMap?: ReadonlyMap<string, string>;
}) {
	const result = await resolvePageExperiments({
		pageId: props.pageId,
		controlSections: props.controlSections,
	});
	const faqSlugMap = props.faqSlugMap ?? (await getFaqSlugMapForPage(props.pageSlug));

	return (
		<>
			{result.exposures.map((exp) => (
				<ExperimentExposureTracker key={exp.flagKey} flagKey={exp.flagKey} variant={exp.variant} />
			))}
			<PageSections
				pageSections={result.pageSections}
				sectionOverrides={props.sectionOverrides}
				pageSlug={props.pageSlug}
				faqSlugMap={faqSlugMap}
			/>
		</>
	);
}
