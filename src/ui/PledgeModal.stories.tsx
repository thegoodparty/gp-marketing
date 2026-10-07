import type { Meta, StoryObj } from '@storybook/react';

import { PledgeModal } from './PledgeModal.tsx';
import { Button } from './Inputs/Button.tsx';

const meta: Meta<typeof PledgeModal> = {
	title: 'New Components/Pledge Modal',
	component: PledgeModal,
	render: args => (
		<div className='flex min-h-screen items-center justify-center bg-goodparty-cream p-6'>
			<PledgeModal {...args}>
				<Button parent='PledgeModalStory' styleType='secondary' styleSize='md'>
					Read the full pledge
				</Button>
			</PledgeModal>
		</div>
	),
	parameters: {
		layout: 'fullscreen',
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {},
};
