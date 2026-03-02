import type { Meta, StoryObj } from '@storybook/react';
import { buttons } from './_data/content.tsx';
import { imageJpg } from './_data/media.tsx';
import { HeroBlock } from './HeroBlock.tsx';

const meta: Meta<typeof HeroBlock> = {
	title: 'Page Sections/Hero Block',
	component: HeroBlock,
	render: args => <HeroBlock {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

const Default = {
	args: {
		label: 'Overline',
		title: 'Headline',
		copy: 'Body copy',
		buttons: buttons(),
		image: imageJpg(),
	},
	parameters: {
		design: {
			type: 'figma',
			url: '',
		},
	},
};

const sampleEmbedCode = `<div style="border: 2px dashed #6c63ff; border-radius: 12px; padding: 40px 24px; text-align: center; background: #f8f7ff; min-height: 280px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px;">
	<div style="font-size: 32px; color: #6c63ff; font-weight: 700;">Embedded Widget</div>
	<div style="font-size: 14px; color: #666; max-width: 300px;">This placeholder represents embedded HTML content such as a HubSpot meeting scheduler.</div>
</div>`;

const hubspotEmbedCode = `<div class="meetings-iframe-container" data-src="https://meetings.hubspot.com/example-meeting"></div>
<script charset="utf-8" type="text/javascript" src="https://static.hsappstatic.net/MeetingsEmbed/ex/MeetingsEmbedCode.js"></script>`;

export const NoMedia: Story = {
	args: {
		...Default.args,
		layout: 'no-media',
	},
	parameters: {
		...Default.parameters,
	},
};

export const MediaLeft: Story = {
	args: {
		...Default.args,
		layout: 'media-left',
	},
	parameters: {
		...Default.parameters,
	},
};

export const MediaRight: Story = {
	args: {
		...Default.args,
		layout: 'media-right',
	},
	parameters: {
		...Default.parameters,
	},
};

export const MediaCenter: Story = {
	args: {
		...Default.args,
		layout: 'media-center',
	},
	parameters: {
		...Default.parameters,
	},
};

export const MediaLeftFull: Story = {
	args: {
		...Default.args,
		layout: 'media-left-full',
	},
	parameters: {
		...Default.parameters,
	},
};

export const MediaRightFull: Story = {
	args: {
		...Default.args,
		layout: 'media-right-full',
	},
	parameters: {
		...Default.parameters,
	},
};

export const MediaCenterFull: Story = {
	args: {
		...Default.args,
		layout: 'media-center-full',
	},
	parameters: {
		...Default.parameters,
	},
};

export const NoMediaMidnight: Story = {
	args: {
		...Default.args,
		layout: 'no-media',
		backgroundColor: 'midnight',
	},
	parameters: {
		...Default.parameters,
	},
};

export const MediaLeftMidnight: Story = {
	args: {
		...Default.args,
		layout: 'media-left',
		backgroundColor: 'midnight',
	},
	parameters: {
		...Default.parameters,
	},
};

export const MediaRightMidnight: Story = {
	args: {
		...Default.args,
		layout: 'media-right',
		backgroundColor: 'midnight',
	},
	parameters: {
		...Default.parameters,
	},
};

export const MediaCenterMidnight: Story = {
	args: {
		...Default.args,
		layout: 'media-center',
		backgroundColor: 'midnight',
	},
	parameters: {
		...Default.parameters,
	},
};

export const MediaLeftFullMidnight: Story = {
	args: {
		...Default.args,
		layout: 'media-left-full',
		backgroundColor: 'midnight',
	},
	parameters: {
		...Default.parameters,
	},
};

export const MediaRightFullMidnight: Story = {
	args: {
		...Default.args,
		layout: 'media-right-full',
		backgroundColor: 'midnight',
	},
	parameters: {
		...Default.parameters,
	},
};

export const MediaCenterFullMidnight: Story = {
	args: {
		...Default.args,
		layout: 'media-center-full',
		backgroundColor: 'midnight',
	},
	parameters: {
		...Default.parameters,
	},
};

export const NoMediaSubscribe: Story = {
	args: {
		...Default.args,
		layout: 'no-media',
		subscribe: true,
	},
	parameters: {
		...Default.parameters,
	},
};

export const MediaLeftSubscribe: Story = {
	args: {
		...Default.args,
		layout: 'media-left',
		subscribe: true,
	},
	parameters: {
		...Default.parameters,
	},
};

export const MediaRightSubscribe: Story = {
	args: {
		...Default.args,
		layout: 'media-right',
		subscribe: true,
	},
	parameters: {
		...Default.parameters,
	},
};

export const MediaCenterSubscribe: Story = {
	args: {
		...Default.args,
		layout: 'media-center',
		subscribe: true,
	},
	parameters: {
		...Default.parameters,
	},
};

export const MediaLeftFullSubscribe: Story = {
	args: {
		...Default.args,
		layout: 'media-left-full',
		subscribe: true,
	},
	parameters: {
		...Default.parameters,
	},
};

export const MediaRightFullSubscribe: Story = {
	args: {
		...Default.args,
		layout: 'media-right-full',
		subscribe: true,
	},
	parameters: {
		...Default.parameters,
	},
};

export const MediaCenterFullSubscribe: Story = {
	args: {
		...Default.args,
		layout: 'media-center-full',
		subscribe: true,
	},
	parameters: {
		...Default.parameters,
	},
};

export const EmbedRight: Story = {
	args: {
		...Default.args,
		image: undefined,
		layout: 'embed-right',
		embedCode: sampleEmbedCode,
	},
	parameters: {
		...Default.parameters,
	},
};

export const EmbedLeft: Story = {
	args: {
		...Default.args,
		image: undefined,
		layout: 'embed-left',
		embedCode: sampleEmbedCode,
	},
	parameters: {
		...Default.parameters,
	},
};

export const EmbedCenter: Story = {
	args: {
		...Default.args,
		image: undefined,
		layout: 'embed-center',
		embedCode: sampleEmbedCode,
	},
	parameters: {
		...Default.parameters,
	},
};

export const EmbedCenterMidnight: Story = {
	args: {
		...Default.args,
		image: undefined,
		layout: 'embed-center',
		backgroundColor: 'midnight',
		embedCode: sampleEmbedCode,
	},
	parameters: {
		...Default.parameters,
	},
};

export const EmbedRightMidnight: Story = {
	args: {
		...Default.args,
		image: undefined,
		layout: 'embed-right',
		backgroundColor: 'midnight',
		embedCode: sampleEmbedCode,
	},
	parameters: {
		...Default.parameters,
	},
};

export const EmbedHubSpotMeeting: Story = {
	args: {
		...Default.args,
		image: undefined,
		layout: 'embed-right',
		embedCode: hubspotEmbedCode,
	},
	parameters: {
		...Default.parameters,
	},
};
