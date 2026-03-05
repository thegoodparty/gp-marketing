import { unstable_cache } from 'next/cache';
import { ashbyJobBoardName } from '~/lib/env';
import type { JobOpeningsCardProps } from '~/ui/JobOpeningsCard';

export interface AshbyJob {
	title: string;
	location: string;
	department: string;
	team: string;
	isRemote: boolean;
	workplaceType: 'OnSite' | 'Remote' | 'Hybrid';
	employmentType: 'FullTime' | 'PartTime' | 'Intern' | 'Contract' | 'Temporary';
	descriptionHtml: string;
	descriptionPlain: string;
	publishedAt: string;
	jobUrl: string;
	applyUrl: string;
	isListed: boolean;
	compensation?: {
		compensationTierSummary: string;
		scrapeableCompensationSalarySummary: string;
		compensationTiers?: Array<{
			id: string;
			tierSummary: string;
			title: string;
			components: Array<{
				id: string;
				summary: string;
				compensationType: string;
				interval: string;
				currencyCode: string | null;
				minValue: number | null;
				maxValue: number | null;
			}>;
		}>;
		summaryComponents?: Array<{
			compensationType: string;
			interval: string;
			currencyCode: string | null;
			minValue: number | null;
			maxValue: number | null;
		}>;
	};
	secondaryLocations?: Array<{
		location: string;
		address?: {
			addressLocality?: string;
			addressRegion?: string;
			addressCountry?: string;
		};
	}>;
	address?: {
		postalAddress?: {
			addressLocality?: string;
			addressRegion?: string;
			addressCountry?: string;
		};
	};
}

interface AshbyResponse {
	apiVersion: string;
	jobs: AshbyJob[];
}

async function fetchAshbyJobs(): Promise<AshbyJob[]> {
	const boardName = ashbyJobBoardName;
	if (!boardName) {
		throw new Error('ASHBY_JOB_BOARD_NAME is not set');
	}

	const res = await fetch(
		`https://api.ashbyhq.com/posting-api/job-board/${boardName}?includeCompensation=true`,
		{ next: { revalidate: 3600 } },
	);

	if (!res.ok) {
		throw new Error(`Ashby API error: ${res.status} ${res.statusText}`);
	}

	const data: AshbyResponse = await res.json();
	return (data.jobs ?? []).filter((job) => job.isListed);
}

export const getAshbyJobs = unstable_cache(
	fetchAshbyJobs,
	['ashby-jobs'],
	{ revalidate: 3600 },
);

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

export function ashbyJobToCard(job: AshbyJob): JobOpeningsCardProps {
	return {
		title: job.title,
		tag: job.department || 'General',
		location: job.isRemote ? 'Remote (United States)' : job.location,
		jobType: formatEmploymentType(job.employmentType),
		href: job.applyUrl,
	};
}
