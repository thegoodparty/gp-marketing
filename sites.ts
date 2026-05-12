import { Logo } from './src/sanity/utils/Logo.tsx';
import { getBaseUrl } from './src/lib/siteBaseUrl';

export const sites = {
	goodpartyOrg: {
		title: 'Goodparty.org',
		icon: Logo,
		url: process.env.NODE_ENV === 'development' ? 'http://localhost:3009' : getBaseUrl(),
	},
};
