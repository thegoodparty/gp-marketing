import type { Meta, StoryObj } from '@storybook/react';
import { JobListingBlock } from './JobListingBlock.tsx';
import type { AshbyJob } from '~/lib/ashby';

const meta: Meta<typeof JobListingBlock> = {
	title: 'Page Sections/Job Listing Block',
	component: JobListingBlock,
	render: args => <JobListingBlock {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

const mockJob = (overrides: Partial<AshbyJob> = {}): AshbyJob =>
	({
		title: 'Product Manager',
		location: 'Houston, TX',
		department: 'Product',
		team: 'Growth',
		isRemote: true,
		workplaceType: 'Remote',
		employmentType: 'FullTime',
		descriptionHtml: '<p>Join our team</p>',
		descriptionPlain: 'Join our team',
		publishedAt: '2024-01-15T16:21:55.393+00:00',
		jobUrl: 'https://jobs.ashbyhq.com/example/product-manager',
		applyUrl: 'https://jobs.ashbyhq.com/example/apply',
		isListed: true,
		compensation: {
			compensationTierSummary: '$81K – $87K • 0.5% – 1.75% • Offers Bonus',
			scrapeableCompensationSalarySummary: '$81K - $87K',
		},
		...overrides,
	}) satisfies AshbyJob;

const mockJobs: AshbyJob[] = [
	mockJob({ title: 'Product Manager', department: 'Product', location: 'Houston, TX', isRemote: true }),
	mockJob({
		title: 'Senior Engineer',
		department: 'Engineering',
		location: 'San Francisco, CA',
		isRemote: false,
		compensation: { compensationTierSummary: '$120K – $150K', scrapeableCompensationSalarySummary: '$120K - $150K' },
	}),
	mockJob({
		title: 'Frontend Developer',
		department: 'Engineering',
		location: 'Remote',
		isRemote: true,
		employmentType: 'FullTime',
		compensation: { compensationTierSummary: '$95K – $115K', scrapeableCompensationSalarySummary: '$95K - $115K' },
	}),
	mockJob({
		title: 'Design Lead',
		department: 'Design',
		location: 'New York, NY',
		isRemote: false,
		compensation: undefined,
	}),
];

export const Default: Story = {
	args: {
		header: {
			label: 'Careers',
			title: 'Work With Us',
			copy: 'Join our team and help make democracy more accessible.',
		},
		jobs: mockJobs,
	},
};

export const BgMidnight: Story = {
	args: {
		...Default.args,
		backgroundColor: 'midnight',
	},
};

export const Empty: Story = {
	args: {
		...Default.args,
		jobs: [],
	},
};

export const SingleDepartment: Story = {
	args: {
		...Default.args,
		jobs: mockJobs.filter(j => j.department === 'Engineering'),
	},
};
