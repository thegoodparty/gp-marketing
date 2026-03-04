import { cn, tv } from './_lib/utils.ts';
import type { backgroundTypeValues } from './_lib/designTypesStore.ts';

import { Container } from './Container.tsx';
import { HeaderBlock, type HeaderBlockProps } from './HeaderBlock.tsx';
import { Text } from './Text.tsx';
import { Anchor } from './Anchor.tsx';
import type { AshbyJob } from '~/lib/ashby';

const styles = tv({
	slots: {
		base: 'py-(--container-padding)',
		container: 'flex flex-col gap-12 md:gap-20',
		grid: 'flex flex-col gap-4',
		card: 'flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-lg border border-neutral-200 hover:border-neutral-400 transition-colors',
		cardContent: 'flex flex-col gap-1',
		tags: 'flex flex-wrap gap-2',
		tag: 'px-3 py-1 rounded-full text-sm bg-neutral-100',
	},
	variants: {
		backgroundColor: {
			cream: {
				base: 'bg-goodparty-cream',
			},
			midnight: {
				base: 'bg-midnight-900 text-white',
				card: 'border-neutral-700 hover:border-neutral-500',
				tag: 'bg-neutral-800',
			},
		},
	},
});

export type JobListingBlockProps = {
	backgroundColor?: (typeof backgroundTypeValues)[number];
	header?: HeaderBlockProps;
	jobs: AshbyJob[];
	className?: string;
};

function groupByDepartment(jobs: AshbyJob[]): Record<string, AshbyJob[]> {
	return jobs.reduce<Record<string, AshbyJob[]>>((acc, job) => {
		const dept = job.department || 'General';
		(acc[dept] ??= []).push(job);
		return acc;
	}, {});
}

function formatEmploymentType(type: string): string {
	const map: Record<string, string> = {
		FullTime: 'Full-Time',
		PartTime: 'Part-Time',
		Intern: 'Internship',
		Contract: 'Contract',
		Temporary: 'Temporary',
	};
	return map[type] ?? type;
}

export function JobListingBlock(props: JobListingBlockProps) {
	const backgroundColor = props.backgroundColor ?? 'cream';
	const { base, container, grid, card, cardContent, tags, tag } = styles({ backgroundColor });

	const grouped = groupByDepartment(props.jobs);

	return (
		<article className={cn(base(), props.className)} data-component='JobListingBlock'>
			<Container className={container()} size='xl'>
				{props.header && <HeaderBlock {...props.header} backgroundColor={backgroundColor} layout='left' />}
				{props.jobs.length > 0 ? (
					<div className='flex flex-col gap-12'>
						{Object.entries(grouped).map(([department, jobs]) => (
							<div key={department} className='flex flex-col gap-4'>
								<Text as='h3' styleType='heading-sm'>
									{department}
								</Text>
								<div className={grid()}>
									{jobs.map((job) => (
										<Anchor
											key={job.jobUrl}
											href={job.applyUrl}
											target='_blank'
											rel='noopener noreferrer'
											className={card()}
										>
											<div className={cardContent()}>
												<Text as='span' styleType='heading-xs'>
													{job.title}
												</Text>
												<Text as='span' styleType='body-sm'>
													{job.location}
													{job.isRemote ? ' (Remote)' : ''}
												</Text>
											</div>
											<div className={tags()}>
												<span className={tag()}>{formatEmploymentType(job.employmentType)}</span>
												{job.compensation?.compensationTierSummary && (
													<span className={tag()}>{job.compensation.compensationTierSummary}</span>
												)}
											</div>
										</Anchor>
									))}
								</div>
							</div>
						))}
					</div>
				) : (
					<Text styleType='body-md'>No open positions at this time. Check back soon.</Text>
				)}
			</Container>
		</article>
	);
}
