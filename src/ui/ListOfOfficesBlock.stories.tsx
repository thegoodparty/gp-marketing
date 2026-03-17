import type { Meta, StoryObj } from '@storybook/react';
import { ListOfOfficesBlock, type OfficeItem } from './ListOfOfficesBlock.tsx';

const meta: Meta<typeof ListOfOfficesBlock> = {
	title: 'New Components/Page Sections/List of Offices Block',
	component: ListOfOfficesBlock,
	render: args => <ListOfOfficesBlock {...args} />,
	parameters: {
		layout: 'fullscreen',
	},
	argTypes: {
		pageSize: {
			control: { type: 'number' },
			description: 'Number of offices to show initially; Show More reveals this many at a time',
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample office data matching the design
const sampleOffices: OfficeItem[] = [
	{
		id: '1',
		type: 'STATE',
		position: 'Name of office position',
		nextElectionDate: 'November 5, 2028',
		href: '/offices/1',
	},
	{
		id: '2',
		type: 'STATE',
		position: 'Name of office position',
		nextElectionDate: 'November 5, 2028',
		href: '/offices/2',
	},
	{
		id: '3',
		type: 'STATE',
		position: 'Name of office position',
		nextElectionDate: 'November 5, 2028',
		href: '/offices/3',
	},
	{
		id: '4',
		type: 'STATE',
		position: 'Name of office position',
		nextElectionDate: 'November 5, 2028',
		href: '/offices/4',
	},
	{
		id: '5',
		type: 'STATE',
		position: 'Name of office position',
		nextElectionDate: 'November 5, 2028',
		href: '/offices/5',
	},
	{
		id: '6',
		type: 'STATE',
		position: 'Name of office position',
		nextElectionDate: 'November 5, 2028',
		href: '/offices/6',
	},
	{
		id: '7',
		type: 'STATE',
		position: 'Name of office position',
		nextElectionDate: 'November 5, 2028',
		href: '/offices/7',
	},
	{
		id: '8',
		type: 'STATE',
		position: 'Name of office position',
		nextElectionDate: 'November 5, 2028',
		href: '/offices/8',
	},
];

// Mixed office types
const mixedOffices: OfficeItem[] = [
	{
		id: '1',
		type: 'STATE',
		position: 'Governor',
		nextElectionDate: 'November 5, 2028',
		href: '/offices/governor',
	},
	{
		id: '2',
		type: 'STATE',
		position: 'Lieutenant Governor',
		nextElectionDate: 'November 5, 2028',
		href: '/offices/lieutenant-governor',
	},
	{
		id: '3',
		type: 'COUNTY',
		position: 'County Clerk',
		nextElectionDate: 'March 19, 2028',
		href: '/offices/county-clerk',
	},
	{
		id: '4',
		type: 'COUNTY',
		position: 'County Treasurer',
		nextElectionDate: 'March 19, 2028',
		href: '/offices/county-treasurer',
	},
	{
		id: '5',
		type: 'CITY',
		position: 'Mayor',
		nextElectionDate: 'April 2, 2028',
		href: '/offices/mayor',
	},
	{
		id: '6',
		type: 'CITY',
		position: 'City Council Member - District 1',
		nextElectionDate: 'April 2, 2028',
		href: '/offices/city-council-1',
	},
	{
		id: '7',
		type: 'CITY',
		position: 'City Council Member - District 2',
		nextElectionDate: 'April 2, 2028',
		href: '/offices/city-council-2',
	},
	{
		id: '8',
		type: 'STATE',
		position: 'Attorney General',
		nextElectionDate: 'November 5, 2028',
		href: '/offices/attorney-general',
	},
];

// Offices with different years
const offices2024: OfficeItem[] = [
	{
		id: '1',
		type: 'STATE',
		position: 'U.S. Senator',
		nextElectionDate: 'November 5, 2024',
		href: '/offices/senator-2024',
	},
	{
		id: '2',
		type: 'STATE',
		position: 'U.S. Representative - District 1',
		nextElectionDate: 'November 5, 2024',
		href: '/offices/representative-1',
	},
	{
		id: '3',
		type: 'STATE',
		position: 'U.S. Representative - District 2',
		nextElectionDate: 'November 5, 2024',
		href: '/offices/representative-2',
	},
];

export const Default: Story = {
	args: {
		heading: 'List of Offices',
		headline: 'Headline',
		defaultYear: 2028,
		availableYears: [2024, 2025, 2026, 2027, 2028],
		offices: sampleOffices,
		backgroundColor: 'cream',
	},
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/dmMrTWyBirANhArKs5mTmr/GoodParty-Design-System----shadcn-ui',
		},
	},
};

export const MidnightBackground: Story = {
	args: {
		heading: 'List of Offices',
		headline: 'Headline',
		defaultYear: 2028,
		availableYears: [2024, 2025, 2026, 2027, 2028],
		offices: sampleOffices,
		backgroundColor: 'midnight',
	},
};

export const MixedOfficeTypes: Story = {
	args: {
		heading: 'List of Offices',
		headline: 'Headline',
		defaultYear: 2028,
		availableYears: [2024, 2025, 2026, 2027, 2028],
		offices: mixedOffices,
		backgroundColor: 'cream',
	},
};

export const YearFiltering: Story = {
	args: {
		heading: 'List of Offices',
		headline: 'Headline',
		defaultYear: 2024,
		availableYears: [2024, 2025, 2026, 2027, 2028],
		offices: [...offices2024, ...sampleOffices],
		backgroundColor: 'cream',
	},
};

export const WithoutHeading: Story = {
	args: {
		headline: 'Headline',
		defaultYear: 2028,
		availableYears: [2024, 2025, 2026, 2027, 2028],
		offices: sampleOffices,
		backgroundColor: 'cream',
	},
};

export const WithoutHeadline: Story = {
	args: {
		heading: 'List of Offices',
		defaultYear: 2028,
		availableYears: [2024, 2025, 2026, 2027, 2028],
		offices: sampleOffices,
		backgroundColor: 'cream',
	},
};

export const EmptyState: Story = {
	args: {
		heading: 'List of Offices',
		headline: 'Headline',
		defaultYear: 2028,
		availableYears: [2024, 2025, 2026, 2027, 2028],
		offices: [],
		backgroundColor: 'cream',
	},
};

export const SingleOffice: Story = {
	args: {
		heading: 'List of Offices',
		headline: 'Headline',
		defaultYear: 2028,
		availableYears: [2024, 2025, 2026, 2027, 2028],
		offices: sampleOffices.slice(0, 1),
		backgroundColor: 'cream',
	},
};

const manyOfficesData = Array.from({ length: 25 }, (_, i) => ({
	id: `office-${i + 1}`,
	type: i % 3 === 0 ? 'STATE' : i % 3 === 1 ? 'COUNTY' : 'CITY',
	position: `Office Position ${i + 1}`,
	nextElectionDate: 'November 5, 2028',
	href: `/offices/${i + 1}`,
}));

export const ManyOffices: Story = {
	args: {
		heading: 'List of Offices',
		headline: 'Headline',
		defaultYear: 2028,
		availableYears: [2024, 2025, 2026, 2027, 2028],
		offices: manyOfficesData,
		backgroundColor: 'cream',
	},
};

export const CustomPageSize: Story = {
	args: {
		heading: 'List of Offices',
		headline: 'Headline',
		defaultYear: 2028,
		availableYears: [2024, 2025, 2026, 2027, 2028],
		pageSize: 5,
		offices: Array.from({ length: 18 }, (_, i) => ({
			id: `office-${i + 1}`,
			type: i % 3 === 0 ? 'STATE' : i % 3 === 1 ? 'COUNTY' : 'CITY',
			position: `Office Position ${i + 1}`,
			nextElectionDate: 'November 5, 2028',
			href: `/offices/${i + 1}`,
		})),
		backgroundColor: 'cream',
	},
};

export const ExactPageSize: Story = {
	args: {
		heading: 'List of Offices',
		headline: 'Headline',
		defaultYear: 2028,
		availableYears: [2024, 2025, 2026, 2027, 2028],
		pageSize: 10,
		offices: Array.from({ length: 10 }, (_, i) => ({
			id: `office-${i + 1}`,
			type: i % 3 === 0 ? 'STATE' : i % 3 === 1 ? 'COUNTY' : 'CITY',
			position: `Office Position ${i + 1}`,
			nextElectionDate: 'November 5, 2028',
			href: `/offices/${i + 1}`,
		})),
		backgroundColor: 'cream',
	},
};

export const WithoutLinks: Story = {
	args: {
		heading: 'List of Offices',
		headline: 'Headline',
		defaultYear: 2028,
		availableYears: [2024, 2025, 2026, 2027, 2028],
		offices: sampleOffices.map(office => ({ ...office, href: undefined })),
		backgroundColor: 'cream',
	},
};
