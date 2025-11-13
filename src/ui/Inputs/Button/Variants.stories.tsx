import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '../Button.tsx';
import { IconResolver } from '~/ui/IconResolver.tsx';

const meta: Meta<typeof Button> = {
	title: 'Atoms/Button/Variants',
	component: Button,
	render: args => <Button {...args} />,
};

export default meta;

type Story = StoryObj<typeof Button>;

const Default = {
	args: {
		children: 'Button text',
	},
	parameters: {
		design: {
			type: 'figma',
			url: '',
		},
	},
};

export const Size: Story = {
	render: args => (
		<div style={{ display: 'flex', gap: '1rem' }}>
			<Button {...args} styleSize='lg'>
				Large
			</Button>
			<Button {...args} styleSize='md'>
				Medium
			</Button>
			<Button {...args} styleSize='sm'>
				Small
			</Button>
		</div>
	),
	parameters: {
		...Default.parameters,
	},
};

export const Icon: Story = {
	render: args => (
		<div className='flex flex-col gap-10 items-center'>
			<Button {...args} iconRight={<IconResolver icon='arrow-up-right' />}>
				Internal
			</Button>
			<Button {...args} iconRight={<IconResolver icon='external-link' />}>
				External
			</Button>
			<Button {...args} iconRight={<IconResolver icon='download' />}>
				Download
			</Button>
			<Button {...args} iconLeft={<IconResolver icon='user-round' />}>
				Contact
			</Button>
			<Button {...args} iconOnly={true} iconLeft={<IconResolver icon='circle-round' />} />
		</div>
	),
	parameters: {
		...Default.parameters,
	},
};

export const Loading: Story = {
	render: args => (
		<div style={{ display: 'flex', gap: '1rem' }}>
			<Button {...args} isLoading={true}>
				Primary Loading
			</Button>
			<Button {...args} styleType='secondary' isLoading={true}>
				Secondary Loading
			</Button>
			<Button {...args} styleType='ghost' isLoading={true}>
				Ghost Loading
			</Button>
		</div>
	),
	parameters: {
		...Default.parameters,
	},
};
