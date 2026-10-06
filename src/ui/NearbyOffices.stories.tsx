import type { Meta, StoryObj } from '@storybook/react';

import { NearbyOffices } from './NearbyOffices.tsx';
import type { OfficeItem } from './ListOfOfficesBlock.tsx';

const meta: Meta<typeof NearbyOffices> = {
	title: 'New Components/Page Sections/Nearby Offices',
	component: NearbyOffices,
	render: args => <NearbyOffices {...args} />,
	parameters: {
		layout: 'fullscreen',
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

// The fourth row has no pledged candidate, so its count column stays empty, as the frame shows.
const sampleOffices: OfficeItem[] = [
	{ id: '1', type: 'Local', position: 'Mayor', nextElectionDate: '2026-11-03', href: '/elections/mi/bay-county/bay-city/position/1', pledgedCount: 2 },
	{ id: '2', type: 'Local', position: 'School Board', nextElectionDate: '2026-11-03', href: '/elections/mi/bay-county/bay-city/position/2', pledgedCount: 3 },
	{ id: '3', type: 'Local', position: 'Court Clerk', nextElectionDate: '2026-11-03', href: '/elections/mi/bay-county/bay-city/position/3', pledgedCount: 1 },
	{ id: '4', type: 'Local', position: 'City Clerk', nextElectionDate: '2026-11-03', href: '/elections/mi/bay-county/bay-city/position/4' },
];

export const Default: Story = {
	args: {
		heading: 'More offices in Bay City, Michigan',
		offices: sampleOffices,
	},
};

export const MixedLevels: Story = {
	args: {
		heading: 'Nearby offices',
		offices: [
			{ id: '1', type: 'Federal', position: 'Name of office position', nextElectionDate: '2026-11-04', href: '/elections/tx/position/1', pledgedCount: 1 },
			{ id: '2', type: 'State', position: 'Name of office position', nextElectionDate: '2026-11-04', href: '/elections/tx/position/2' },
			{ id: '3', type: 'County', position: 'Name of office position', nextElectionDate: '2026-11-04', href: '/elections/tx/position/3', pledgedCount: 12 },
			{ id: '4', type: 'Local', position: 'Name of office position', nextElectionDate: '2026-11-04', href: '/elections/tx/position/4' },
		],
	},
};

export const Midnight: Story = {
	args: {
		backgroundColor: 'midnight',
		heading: 'Nearby offices',
		offices: sampleOffices,
	},
};

export const CustomDescription: Story = {
	args: {
		heading: 'More offices in Bay City, Michigan',
		description: 'Other races on the same ballot, soonest first.',
		offices: sampleOffices,
	},
};

export const CappedAtEight: Story = {
	args: {
		heading: 'Nearby offices',
		offices: Array.from({ length: 12 }, (_, i) => ({
			id: String(i),
			type: 'Local',
			position: `Office position ${i + 1}`,
			nextElectionDate: '2026-11-04',
			href: `/elections/tx/position/${i}`,
		})),
	},
};

export const Empty: Story = {
	args: {
		heading: 'Nearby offices',
		offices: [],
	},
};
