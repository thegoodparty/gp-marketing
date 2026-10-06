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

const sampleOffices: OfficeItem[] = [
	{ id: '1', type: 'Federal', position: 'Name of office position', nextElectionDate: '2026-11-04', href: '/elections/tx/position/1' },
	{ id: '2', type: 'State', position: 'Name of office position', nextElectionDate: '2026-11-04', href: '/elections/tx/position/2' },
	{ id: '3', type: 'County', position: 'Name of office position', nextElectionDate: '2026-11-04', href: '/elections/tx/position/3' },
	{ id: '4', type: 'Local', position: 'Name of office position', nextElectionDate: '2026-11-04', href: '/elections/tx/position/4' },
];

export const Default: Story = {
	args: {
		heading: 'Nearby offices',
		offices: sampleOffices,
	},
};

export const Midnight: Story = {
	args: {
		backgroundColor: 'midnight',
		heading: 'Nearby offices',
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
