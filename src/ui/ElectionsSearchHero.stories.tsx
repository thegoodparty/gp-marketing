import type { Meta, StoryObj } from '@storybook/react';
import { imageJpg, logoSVG } from './_data/media.tsx';
import { ElectionsSearchHero } from './ElectionsSearchHero.tsx';

const US_STATES = [
	{ value: 'AL', label: 'Alabama' },
	{ value: 'AK', label: 'Alaska' },
	{ value: 'AZ', label: 'Arizona' },
	{ value: 'AR', label: 'Arkansas' },
	{ value: 'CA', label: 'California' },
	{ value: 'CO', label: 'Colorado' },
	{ value: 'CT', label: 'Connecticut' },
	{ value: 'DE', label: 'Delaware' },
	{ value: 'FL', label: 'Florida' },
	{ value: 'GA', label: 'Georgia' },
	{ value: 'HI', label: 'Hawaii' },
	{ value: 'ID', label: 'Idaho' },
	{ value: 'IL', label: 'Illinois' },
	{ value: 'IN', label: 'Indiana' },
	{ value: 'IA', label: 'Iowa' },
	{ value: 'KS', label: 'Kansas' },
	{ value: 'KY', label: 'Kentucky' },
	{ value: 'LA', label: 'Louisiana' },
	{ value: 'ME', label: 'Maine' },
	{ value: 'MD', label: 'Maryland' },
	{ value: 'MA', label: 'Massachusetts' },
	{ value: 'MI', label: 'Michigan' },
	{ value: 'MN', label: 'Minnesota' },
	{ value: 'MS', label: 'Mississippi' },
	{ value: 'MO', label: 'Missouri' },
	{ value: 'MT', label: 'Montana' },
	{ value: 'NE', label: 'Nebraska' },
	{ value: 'NV', label: 'Nevada' },
	{ value: 'NH', label: 'New Hampshire' },
	{ value: 'NJ', label: 'New Jersey' },
	{ value: 'NM', label: 'New Mexico' },
	{ value: 'NY', label: 'New York' },
	{ value: 'NC', label: 'North Carolina' },
	{ value: 'ND', label: 'North Dakota' },
	{ value: 'OH', label: 'Ohio' },
	{ value: 'OK', label: 'Oklahoma' },
	{ value: 'OR', label: 'Oregon' },
	{ value: 'PA', label: 'Pennsylvania' },
	{ value: 'RI', label: 'Rhode Island' },
	{ value: 'SC', label: 'South Carolina' },
	{ value: 'SD', label: 'South Dakota' },
	{ value: 'TN', label: 'Tennessee' },
	{ value: 'TX', label: 'Texas' },
	{ value: 'UT', label: 'Utah' },
	{ value: 'VT', label: 'Vermont' },
	{ value: 'VA', label: 'Virginia' },
	{ value: 'WA', label: 'Washington' },
	{ value: 'WV', label: 'West Virginia' },
	{ value: 'WI', label: 'Wisconsin' },
	{ value: 'WY', label: 'Wyoming' },
];

const meta: Meta<typeof ElectionsSearchHero> = {
	title: 'New Components/Page Sections/Elections Search Hero',
	component: ElectionsSearchHero,
	render: args => <ElectionsSearchHero {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

const baseArgs = {
	showLogo: true,
	headerText: 'Find Elections Near You',
	bodyCopy: 'Search for elections in your area and discover local candidates running for office.',
	states: US_STATES,
	cta: {
		buttonType: 'button' as const,
		label: 'Search',
		buttonProps: {
			styleType: 'primary' as const,
		},
	},
};

export const Default: Story = {
	args: {
		...baseArgs,
		backgroundColor: 'midnight',
	},
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/dmMrTWyBirANhArKs5mTmr/GoodParty-Design-System----shadcn-ui?node-id=22892-255964',
		},
	},
};

export const WithBackgroundImage: Story = {
	args: {
		...baseArgs,
		backgroundColor: 'midnight',
		backgroundImage: imageJpg(),
	},
};

export const WithoutLogo: Story = {
	args: {
		...baseArgs,
		showLogo: false,
		backgroundColor: 'midnight',
	},
};

export const WithCustomLogo: Story = {
	args: {
		...baseArgs,
		logoImage: logoSVG(),
		backgroundColor: 'midnight',
	},
};

export const WithDefaultState: Story = {
	args: {
		...baseArgs,
		backgroundColor: 'midnight',
		defaultStateValue: 'CA',
	},
};

export const WithCustomCTA: Story = {
	args: {
		...baseArgs,
		backgroundColor: 'midnight',
		cta: {
			buttonType: 'button' as const,
			label: 'Find My Elections',
			buttonProps: {
				styleType: 'secondary' as const,
			},
		},
	},
};

export const Minimal: Story = {
	args: {
		showLogo: false,
		headerText: 'Find Elections',
		states: US_STATES,
		backgroundColor: 'midnight',
		cta: {
			buttonType: 'button' as const,
			label: 'Search',
			buttonProps: {
				styleType: 'primary' as const,
			},
		},
	},
};

export const LongBodyCopy: Story = {
	args: {
		...baseArgs,
		backgroundColor: 'midnight',
		bodyCopy: 'Search for elections in your area and discover local candidates running for office. Learn about their platforms, voting records, and policy positions. Make informed decisions about who represents you at every level of government.',
	},
};
