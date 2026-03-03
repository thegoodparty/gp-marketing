import { createClient } from '@sanity/client';
import { apiVersion, dataset, projectId } from './env';

export const client = createClient({
	apiVersion: apiVersion || '2023-12-04',
	dataset,
	projectId, // If the GROQ revalidate hook is setup we use the Vercel Data Cache to handle on-demand revalidation, and the Sanity API CDN if not
	useCdn: true, // revalidateSecret ? false : true,
	perspective: 'published',
	// token: process.env.SANITY_API_READ_TOKEN,
});
