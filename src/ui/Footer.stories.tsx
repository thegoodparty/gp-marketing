import type { Meta, StoryObj } from '@storybook/react';

import { Footer } from './Footer';
import { imageJpg } from './_data/media';

const meta = {
	title: 'Components/Footer',
	component: Footer,
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		logo: imageJpg(),
		message: "Not a political party. We're building free tools to change the rules, so good independent candidates can run and win!",
		copyright: 'Copyright © 2025 GoodParty.org. All rights reserved',
		groupedNav: [
			{
				groupTitle: 'Our Org',
				list_footerNavigationGroup: [
					{
						label: 'Volunteer',
						link: { href: '/' },
					} as any,
					{
						label: 'Our Team',
						link: { href: '/' },
					} as any,
				] as any,
			},
			{
				groupTitle: 'Support',
			},
			{
				groupTitle: 'Campaigns',
			},
			{
				groupTitle: 'Follow',
			},
		],
		legalNav: [
			{
				label: 'Privacy Policy',
				link: { href: '/privacy' },
			} as any,
			{
				label: 'Terms of Service',
				link: { href: '/terms-of-service' },
			} as any,
		],
	},
};
