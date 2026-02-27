import type { Meta, StoryObj } from '@storybook/react';

import { EmbeddedBlock } from './EmbeddedBlock.tsx';

const meta: Meta<typeof EmbeddedBlock> = {
	title: 'New Components/Page Sections/Embedded Block',
	component: EmbeddedBlock,
	render: args => <EmbeddedBlock {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const NavatticEmbed: Story = {
	args: {
		html: '<iframe src="https://capture.navattic.com/clnkk83pm00m208l76gq2arcm" style="position:fixed;border:none;top:0;left:0;bottom:0;right:0;width:100%;height:100%;margin:0;padding:0;z-index:999999;" data-navattic-demo-id="clnkk83pm00m208l76gq2arcm" allow="fullscreen"></iframe>',
	},
};

export const HubSpotCalendar: Story = {
	args: {
		html: '<!-- Start of Meetings Embed Script --><div class="meetings-iframe-container" data-src="https://meetings.hubspot.com/jack-nagel/goodpartyorg-demo?embed=true"></div><script type="text/javascript" src="https://static.hsappstatic.net/MeetingsEmbed/ex/MeetingsEmbedCode.js"></script><!-- End of Meetings Embed Script -->',
	},
};

export const HubSpotMeeting: Story = {
	args: {
		html: '<div class="meetings-iframe-container" data-src="https://meetings.hubspot.com/example"></div>',
	},
};

export const RawHtml: Story = {
	args: {
		html: '<div style="padding:2rem;background:#f5f5f5;border-radius:8px;text-align:center;"><h2 style="margin:0 0 1rem;">Custom HTML Block</h2><p style="margin:0;">This demonstrates rendering sanitized HTML content within the Embedded Block component.</p></div>',
	},
};

export const YouTubeEmbed: Story = {
	args: {
		html: '<iframe width="560" height="315" src="https://www.youtube.com/embed/3riK4DWWhbw?si=aePwoSQRC5AXsqa4" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>',
	},
};

export const VimeoEmbed: Story = {
	args: {
		html: '<iframe src="https://player.vimeo.com/video/76979871" title="Vimeo video" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>',
	},
};
