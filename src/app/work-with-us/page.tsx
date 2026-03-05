import type { Metadata } from 'next';
import { getAshbyJobs, ashbyJobToCard } from '~/lib/ashby';
import { JobOpeningsBlock } from '~/ui/JobOpeningsBlock';

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
		<JobOpeningsBlock
			header={{
				label: 'Careers',
				title: 'Work With Us',
				copy: 'Join our team and help make democracy more accessible.',
			}}
			cards={jobs.map(ashbyJobToCard)}
		/>
	);
}
