import type { Meta, StoryObj } from '@storybook/react';
import { ProfileHero } from './ProfileHero.tsx';
import { customProfileImage } from './_data/media.tsx';

const meta: Meta<typeof ProfileHero> = {
	title: 'New Components/Page Sections/Profile Hero',
	component: ProfileHero,
	render: args => <ProfileHero {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

const Default = {
	args: {
		backgroundColor: 'midnight' as const,
		candidateName: 'Jhon Doe',
		office: 'Mayor of Chicago',
		profileImage: customProfileImage(),
		isEmpowered: true,
	},
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/dmMrTWyBirANhArKs5mTmr/GoodParty-Design-System----shadcn-ui?node-id=24614-15150&t=6DQyxTAl7Ola6AF3-0',
		},
	},
};

export const DefaultStory: Story = {
	args: {
		...Default.args,
	},
	parameters: {
		...Default.parameters,
	},
};

export const CreamBackground: Story = {
	args: {
		...Default.args,
		backgroundColor: 'cream',
	},
	parameters: {
		...Default.parameters,
	},
};

export const LongName: Story = {
	args: {
		...Default.args,
		candidateName: 'Maria Hernandez-Rodriguez Williams',
		office: 'State Representative for District 42, Cook County',
	},
	parameters: {
		...Default.parameters,
	},
};

export const Mobile: Story = {
	args: {
		...Default.args,
	},
	parameters: {
		...Default.parameters,
	},
	globals: {
		viewport: { value: 'iphone', isRotated: false },
	},
};

export const MobileCreamBackground: Story = {
	args: {
		...Default.args,
		backgroundColor: 'cream',
	},
	parameters: {
		...Default.parameters,
	},
	globals: {
		viewport: { value: 'iphone', isRotated: false },
	},
};
