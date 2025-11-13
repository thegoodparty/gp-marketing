import { Logo } from './src/sanity/utils/Logo.tsx';

export const sites = {
	goodpartyOrg: {
		title: 'Goodparty.org',
		icon: Logo,
		url: process.env.NODE_ENV === 'development'
			? 'http://localhost:3009'
			: process.env['VERCEL_ENV'] === 'production'
				? process.env['VERCEL_PROJECT_PRODUCTION_URL']
				: process.env['VERCEL_URL'],
	},
};
