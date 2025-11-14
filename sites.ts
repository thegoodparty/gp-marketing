import { Logo } from './src/sanity/utils/Logo.tsx';

export const sites = {
	goodpartyOrg: {
		title: 'Goodparty.org',
		icon: Logo,
		url: process.env.NODE_ENV === 'development'
			? 'http://localhost:3009'
			: process.env.NEXT_PUBLIC_PREVIEW_URL || 'https://gp-marketing-git-develop-good-party.vercel.app',
	},
};
