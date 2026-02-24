import type { Meta, StoryObj } from '@storybook/react';
import { BreadcrumbBlock } from './BreadcrumbBlock';

const meta: Meta<typeof BreadcrumbBlock> = {
	title: 'New Components/Page Sections/Breadcrumb Block',
	component: BreadcrumbBlock,
	render: args => <BreadcrumbBlock {...args} />,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		backgroundColor: 'midnight',
		breadcrumbs: [
			{ href: '/elections', label: 'Elections' },
			{ href: '/elections/illinois', label: 'Illinois' },
			{ href: '/elections/illinois/cook-county', label: 'Cook County' },
			{ href: '/elections/illinois/cook-county/chicago', label: 'Chicago' },
			{ href: '/elections/illinois/cook-county/chicago/mayor', label: 'Mayor' },
		],
	},
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/dmMrTWyBirANhArKs5mTmr/GoodParty-Design-System----shadcn-ui?node-id=24089-25143&t=e6w52MjiSjms8Cyt-0',
		},
	},
};

export const LightBackground: Story = {
	args: {
		backgroundColor: 'cream',
		breadcrumbs: [
			{ href: '/elections', label: 'Elections' },
			{ href: '/elections/california', label: 'California' },
			{ href: '/elections/california/los-angeles-county', label: 'Los Angeles County' },
			{ href: '/elections/california/los-angeles-county/los-angeles', label: 'Los Angeles' },
			{ href: '/elections/california/los-angeles-county/los-angeles/city-council', label: 'City Council' },
		],
	},
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/dmMrTWyBirANhArKs5mTmr/GoodParty-Design-System----shadcn-ui?node-id=24089-25143&t=e6w52MjiSjms8Cyt-0',
		},
	},
};

export const ShortBreadcrumb: Story = {
	args: {
		backgroundColor: 'midnight',
		breadcrumbs: [
			{ href: '/elections', label: 'Elections' },
			{ href: '/elections/texas', label: 'Texas' },
			{ href: '/elections/texas/governor', label: 'Governor' },
		],
	},
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/dmMrTWyBirANhArKs5mTmr/GoodParty-Design-System----shadcn-ui?node-id=24089-25143&t=e6w52MjiSjms8Cyt-0',
		},
	},
};

export const LongBreadcrumb: Story = {
	args: {
		backgroundColor: 'midnight',
		breadcrumbs: [
			{ href: '/elections', label: 'Elections' },
			{ href: '/elections/new-york', label: 'New York' },
			{ href: '/elections/new-york/nassau-county', label: 'Nassau County' },
			{ href: '/elections/new-york/nassau-county/hempstead', label: 'Hempstead' },
			{ href: '/elections/new-york/nassau-county/hempstead/town-board', label: 'Town Board' },
			{ href: '/elections/new-york/nassau-county/hempstead/town-board/district-1', label: 'District 1' },
			{ href: '/elections/new-york/nassau-county/hempstead/town-board/district-1/councilmember', label: 'Councilmember' },
		],
	},
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/dmMrTWyBirANhArKs5mTmr/GoodParty-Design-System----shadcn-ui?node-id=24089-25143&t=e6w52MjiSjms8Cyt-0',
		},
	},
};
