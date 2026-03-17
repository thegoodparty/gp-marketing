import { stegaClean } from 'next-sanity';
import type { Sections } from '~/PageSections';
import { getAshbyJobs, ashbyJobToCard } from '~/lib/ashby';
import { transformButtons } from '~/lib/buttonTransformer';
import { resolveTextSize } from '~/ui/_lib/resolveTextSize';
import { RichData } from '~/ui/RichData';
import { JobOpeningsBlock } from '~/ui/JobOpeningsBlock';

export async function JobOpeningsBlockSection(
	section: Extract<Sections, { _type: 'component_jobOpeningsBlock' }>,
) {
	let jobs: Awaited<ReturnType<typeof getAshbyJobs>> = [];
	try {
		jobs = await getAshbyJobs();
	} catch (err) {
		console.error('Failed to fetch Ashby jobs:', err);
	}

	return (
		<section
			id={stegaClean(section.componentSettings?.field_anchorId)}
			data-section='Job Openings Block'
		>
			<JobOpeningsBlock
				header={{
					label: section.summaryInfo?.field_label,
					title: section.summaryInfo?.field_title,
					copy: section.summaryInfo?.block_summaryText ? (
						<RichData value={section.summaryInfo.block_summaryText} />
					) : undefined,
					buttons: transformButtons(section.summaryInfo?.list_buttons),
					textSize: resolveTextSize(section.summaryInfo?.field_textSize),
				}}
				cards={jobs.map(ashbyJobToCard)}
			/>
		</section>
	);
}
