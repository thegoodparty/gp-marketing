import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: 'Boilerplate',
		short_name: 'Boilerplate',
		start_url: '/',
		display: 'standalone',
		background_color: '#000000',
		theme_color: '#000000',
	};
}
