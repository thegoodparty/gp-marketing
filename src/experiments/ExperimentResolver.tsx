import type { Sections } from '~/PageSections';
import { PageSections, type SectionOverrides } from '~/PageSections';
import { ExperimentExposureTracker } from '~/experiments/ExperimentExposureTracker';
import { resolvePageExperiments } from '~/experiments/resolvePageExperiments';

export async function ExperimentResolver(props: {
	pageId: string;
	controlSections?: Sections[] | null;
	sectionOverrides?: SectionOverrides;
}) {
	const result = await resolvePageExperiments({
		pageId: props.pageId,
		controlSections: props.controlSections,
	});

	return (
		<>
			{result.exposures.map((exp) => (
				<ExperimentExposureTracker key={exp.flagKey} flagKey={exp.flagKey} variant={exp.variant} />
			))}
			<PageSections pageSections={result.pageSections} sectionOverrides={props.sectionOverrides} />
		</>
	);
}
