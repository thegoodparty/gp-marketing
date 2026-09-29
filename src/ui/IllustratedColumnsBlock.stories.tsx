import type { Meta, StoryObj } from '@storybook/react';

import { imageJpg } from '~/ui/_data/media.tsx';
import { IllustratedColumnsBlock, type IllustratedColumnProps } from './IllustratedColumnsBlock.tsx';

const meta: Meta<typeof IllustratedColumnsBlock> = {
	title: 'New Components/Page Sections/Illustrated Columns Block',
	component: IllustratedColumnsBlock,
	render: args => <IllustratedColumnsBlock {...args} />,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/uiXjaG81QXkT0Swu0OiM5V/Elections---Voter-Guide?node-id=2032-21613',
		},
	},
};

export default meta;

type Story = StoryObj<typeof meta>;

const registration: IllustratedColumnProps = {
	key: 'registration',
	image: imageJpg(),
	imageAlt: 'A clipboard with a checked ballot',
	title: 'Check your voter registration',
	description: <p>Check your voter registration in under a minute.</p>,
	link: { buttonType: 'external', href: 'https://vote.gov', label: 'Check my registration' },
};

const polling: IllustratedColumnProps = {
	key: 'polling',
	image: imageJpg(),
	imageAlt: 'A ballot box',
	title: 'Find your polling location',
	description: <p>Learn where to go to vote in person.</p>,
	link: { buttonType: 'external', href: 'https://www.vote.org/polling-place-locator/', label: 'Find my polling place' },
};

const mailIn: IllustratedColumnProps = {
	key: 'mail-in',
	image: imageJpg(),
	imageAlt: 'An envelope holding a ballot',
	title: 'Request a mail-in ballot',
	description: <p>Apply for an absentee ballot to vote by mail.</p>,
	link: { buttonType: 'external', href: 'https://www.vote.org/absentee-ballot/', label: 'Request my ballot' },
};

const deadlines: IllustratedColumnProps = {
	key: 'deadlines',
	image: imageJpg(),
	imageAlt: 'A calendar',
	title: 'Know your deadlines',
	description: <p>Registration and ballot deadlines for your state.</p>,
	link: { buttonType: 'external', href: 'https://www.vote.org/election-calendar/', label: 'See the calendar' },
};

const header = {
	title: "Are you ready for Harris County's next election?",
	copy: <p>Get registered and ready to vote, whether in person or by mail.</p>,
};

export const Default: Story = {
	args: {
		backgroundColor: 'cream',
		columns: '3',
		header,
		items: [registration, polling, mailIn],
	},
};

export const TwoColumns: Story = {
	args: {
		...Default.args,
		columns: '2',
		items: [registration, polling],
	},
};

export const FourColumns: Story = {
	args: {
		...Default.args,
		columns: '4',
		items: [registration, polling, mailIn, deadlines],
	},
};

export const WrappedRow: Story = {
	args: {
		...Default.args,
		columns: '3',
		items: [registration, polling, mailIn, deadlines, registration, polling],
	},
};

export const Midnight: Story = {
	args: {
		...Default.args,
		backgroundColor: 'midnight',
	},
};

export const NoHeader: Story = {
	args: {
		...Default.args,
		header: undefined,
	},
};

export const Mobile: Story = {
	args: Default.args,
	globals: {
		viewport: { value: 'iphone', isRotated: false },
	},
};
