import type { Meta, StoryObj } from '@storybook/react';
import { ProfileContentCard } from './ProfileContentCard.tsx';

const meta: Meta<typeof ProfileContentCard> = {
	title: 'Components/Profile Content Card',
	component: ProfileContentCard,
	render: args => <ProfileContentCard {...args} />,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const AboutMe: Story = {
	args: {
		cardType: 'about-me',
		heading: 'About Me',
		content: 'I am a dedicated public servant with over 10 years of experience in local government. My commitment to transparency and community engagement has driven my work throughout my career.',
	},
};

export const WhyRunning: Story = {
	args: {
		cardType: 'why-running',
		heading: 'Why I am Running',
		content: 'I am running because I believe our community deserves leadership that listens, acts with integrity, and puts the needs of residents first. Together, we can build a brighter future for our city.',
	},
};

export const TopIssues: Story = {
	args: {
		cardType: 'top-issues',
		heading: 'Top Issues',
		content: 'My top priorities include improving public transportation, expanding affordable housing options, and strengthening our local economy through small business support and job creation.',
	},
};
