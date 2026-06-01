import type { Meta, StoryObj } from '@storybook/react';
import { ProfileContentBlock } from './ProfileContentBlock.tsx';

const meta: Meta<typeof ProfileContentBlock> = {
	title: 'New Components/Page Sections/Profile Content Block',
	component: ProfileContentBlock,
	render: args => <ProfileContentBlock {...args} />,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/dmMrTWyBirANhArKs5mTmr/GoodParty-Design-System----shadcn-ui?node-id=23711-25268&t=6DQyxTAl7Ola6AF3-0',
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

const defaultSidebar = {
	links: [
		{ label: 'Website', icon: 'globe', href: 'https://www.website.com' },
		{ label: 'Facebook', icon: 'facebook', href: 'https://www.facebook.com/' },
		{ label: 'Email', icon: 'mail', href: 'mailto:hello@example.com' },
	],
	aboutOffice: 'Body text here',
	termLength: 'Body text here',
	electionDate: 'Body text here',
	cta: {
		buttonType: 'internal' as const,
		href: '/run',
		label: 'Run for Office',
		buttonProps: {
			styleType: 'secondary' as const,
		},
	},
};

export const Default: Story = {
	args: {
		backgroundColor: 'cream',
		sidebar: defaultSidebar,
		title: 'Candidate Name',
		contentCards: [
			{
				cardType: 'about-me',
				heading: 'About Me',
				content: 'I am a dedicated public servant with over 10 years of experience in local government. My commitment to transparency and community engagement has driven my work throughout my career.',
			},
			{
				cardType: 'why-running',
				heading: 'Why I am Running',
				content: 'I am running because I believe our community deserves leadership that listens, acts with integrity, and puts the needs of residents first. Together, we can build a brighter future for our city.',
			},
			{
				cardType: 'top-issues',
				heading: 'Top Issues',
				content: 'My top priorities include improving public transportation, expanding affordable housing options, and strengthening our local economy through small business support and job creation.',
			},
		],
	},
};

export const WithoutSidebar: Story = {
	args: {
		backgroundColor: 'cream',
		contentCards: [
			{
				cardType: 'about-me',
				heading: 'About Me',
				content: 'I am a dedicated public servant with over 10 years of experience in local government.',
			},
			{
				cardType: 'why-running',
				heading: 'Why I am Running',
				content: 'I am running because I believe our community deserves leadership that listens and acts with integrity.',
			},
		],
	},
};

export const MidnightBackground: Story = {
	args: {
		backgroundColor: 'midnight',
		sidebar: {
			links: [
				{ label: 'Website', icon: 'globe', href: 'https://www.website.com' },
				{ label: 'Facebook', icon: 'facebook', href: 'https://www.facebook.com/' },
				{ label: 'Email', icon: 'mail', href: 'mailto:hello@example.com' },
			],
			aboutOffice: 'Body text here',
			termLength: 'Body text here',
			electionDate: 'Body text here',
			cta: {
				buttonType: 'internal',
				href: '/run',
				label: 'Run for Office',
				buttonProps: {
					styleType: 'primary',
				},
			},
		},
		contentCards: [
			{
				cardType: 'about-me',
				heading: 'About Me',
				content: 'I am a dedicated public servant with over 10 years of experience in local government.',
			},
		],
	},
};

export const MultipleCards: Story = {
	args: {
		backgroundColor: 'cream',
		sidebar: {
			links: [
				{ label: 'Website', icon: 'globe', href: 'https://www.website.com' },
				{ label: 'Email', icon: 'mail', href: 'mailto:hello@example.com' },
			],
			aboutOffice: 'Body text here',
			termLength: 'Body text here',
			electionDate: 'Body text here',
		},
		contentCards: [
			{
				cardType: 'about-me',
				heading: 'About Me',
				content: 'First card content.',
			},
			{
				cardType: 'why-running',
				heading: 'Why I am Running',
				content: 'Second card content.',
			},
			{
				cardType: 'top-issues',
				heading: 'Top Issues',
				content: 'Third card content.',
			},
			{
				cardType: 'about-me',
				heading: 'Additional Section',
				content: 'Fourth card content.',
			},
		],
	},
};

export const SidebarOnly: Story = {
	args: {
		backgroundColor: 'cream',
		sidebar: defaultSidebar,
		contentCards: [],
	},
	parameters: {
		viewport: { defaultViewport: 'hd' },
	},
};

export const LongUrls: Story = {
	args: {
		backgroundColor: 'cream',
		sidebar: {
			links: [
				{
					label: 'LinkedIn',
					icon: 'linkedin',
					href: 'https://www.linkedin.com/in/dylan-hays-5263b0218',
				},
				{
					label: 'Website',
					icon: 'globe',
					href: 'https://www.ci.northville.mi.us/government/city-council',
				},
				{
					label: 'Campaign',
					icon: 'globe',
					href: 'https://www.krenzfornorthville.com/about-the-candidate',
				},
			],
			aboutOffice:
				'The City Legislature is the legislative branch of City Government. The Legislature is composed of a seven-member Council, elected from six Council districts and one at-large Council member.',
			termLength: '4 Years',
			electionDate: 'November 3, 2025',
			cta: defaultSidebar.cta,
		},
		contentCards: [
			{
				cardType: 'about-me',
				heading: 'About Me',
				content:
					'I am dedicated to building bike paths connecting neighborhoods to the future River Walk and serving on the Planning Commission.',
			},
		],
	},
};

export const TabletStacked: Story = {
	args: LongUrls.args,
	parameters: {
		viewport: {
			defaultViewport: 'surfacePro7',
			viewports: {
				surfacePro7: {
					name: 'Surface Pro 7',
					styles: {
						width: '912px',
						height: '1368px',
					},
				},
			},
		},
	},
};
