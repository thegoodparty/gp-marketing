import type { Meta, StoryObj } from '@storybook/react';
import { ElectionsPositionHero } from './ElectionsPositionHero.tsx';

const meta: Meta<typeof ElectionsPositionHero> = {
	title: 'Page Sections/Elections Position Hero',
	component: ElectionsPositionHero,
	render: args => <ElectionsPositionHero {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

const defaultArgs = {
	officeName: 'Mayor',
	stateName: 'Illinois',
	countyName: 'Cook County',
	cityName: 'Chicago',
	electionDate: 'November 5, 2024',
	filingDate: 'January 1, 2024 - March 15, 2024',
	cta: {
		buttonType: 'internal' as const,
		href: '/run',
		label: 'Primary CTA',
		buttonProps: {
			styleType: 'primary' as const,
		},
	},
};

export const Default: Story = {
	args: {
		...defaultArgs,
		backgroundColor: 'midnight',
	},
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/dmMrTWyBirANhArKs5mTmr/GoodParty-Design-System----shadcn-ui?node-id=23655-16933&t=6DQyxTAl7Ola6AF3-0',
		},
	},
};

export const CreamBackground: Story = {
	args: {
		...defaultArgs,
		backgroundColor: 'cream',
	},
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/dmMrTWyBirANhArKs5mTmr/GoodParty-Design-System----shadcn-ui?node-id=23655-16933&t=6DQyxTAl7Ola6AF3-0',
		},
	},
};

export const StateOnly: Story = {
	args: {
		officeName: 'Governor',
		stateName: 'California',
		electionDate: 'November 5, 2024',
		filingDate: 'March 1, 2024 - June 30, 2024',
		cta: defaultArgs.cta,
		backgroundColor: 'midnight',
	},
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/dmMrTWyBirANhArKs5mTmr/GoodParty-Design-System----shadcn-ui?node-id=23655-16933&t=6DQyxTAl7Ola6AF3-0',
		},
	},
};

export const StateAndCounty: Story = {
	args: {
		officeName: 'County Clerk',
		stateName: 'Texas',
		countyName: 'Harris County',
		electionDate: 'November 5, 2024',
		filingDate: 'December 15, 2023 - February 15, 2024',
		cta: defaultArgs.cta,
		backgroundColor: 'midnight',
	},
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/dmMrTWyBirANhArKs5mTmr/GoodParty-Design-System----shadcn-ui?node-id=23655-16933&t=6DQyxTAl7Ola6AF3-0',
		},
	},
};

export const AllLocations: Story = {
	args: {
		officeName: 'City Council Member',
		stateName: 'New York',
		countyName: 'Kings County',
		cityName: 'Brooklyn',
		electionDate: 'November 7, 2025',
		filingDate: 'April 1, 2025 - July 15, 2025',
		cta: defaultArgs.cta,
		backgroundColor: 'midnight',
	},
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/dmMrTWyBirANhArKs5mTmr/GoodParty-Design-System----shadcn-ui?node-id=23655-16933&t=6DQyxTAl7Ola6AF3-0',
		},
	},
};
