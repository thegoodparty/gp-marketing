import type { Metadata } from 'next';
import { getAshbyJobs } from '~/lib/ashby';
import { JobListingBlock } from '~/ui/JobListingBlock';

export const metadata: Metadata = {
	title: 'Work With Us | GoodParty.org',
	description: 'Join the GoodParty.org team. View our open positions and help make democracy more accessible.',
};

export default async function WorkWithUsPage() {
	let jobs: Awaited<ReturnType<typeof getAshbyJobs>> = [];
	try {
		jobs = await getAshbyJobs();
	} catch (err) {
		console.error('Failed to fetch Ashby jobs:', err);
	}

	return (
		<JobListingBlock
			backgroundColor='cream'
			header={{
				label: 'Careers',
				title: 'Work With Us',
				copy: 'Join our team and help make democracy more accessible.',
			}}
			jobs={jobs}
		/>
	);
}
