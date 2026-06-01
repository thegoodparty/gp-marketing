import type { Metadata } from 'next';
import Script from 'next/script';
import { draftMode } from 'next/headers';
import { VisualEditing } from 'next-sanity/visual-editing';
import type { ReactNode } from 'react';
import type { Params } from '~/lib/types';
// @ts-expect-error Vite/Next has no typings for side-effect CSS import
import '~/ui/_styles/globals.css';
import { Amplitude } from '~/ui/Amplitude';
import { ScrollDepthTracker } from '~/ui/ScrollDepthTracker';
import { PageSchema } from '~/ui/PageSchema';
import { getBaseUrl } from '~/lib/url';
import { buildOrganizationSchema, buildSchemaGraph, buildWebSiteSchema, resolveSameAs } from '~/lib/schema';
import { sanityFetch } from '~/sanity/sanityClient';
import { goodpartyOrg_socialChannelsQuery } from '~/sanity/groq';
import { FacebookPixel } from '~/ui/FacebookPixel';
import { GTM } from '~/ui/GTM';
import { Segment } from '~/ui/Segment';
import { VWOScript } from 'vwo-smartcode-nextjs';
import { ComponentErrorBoundary } from '~/ui/ComponentErrorBoundary';
import { PageHeader } from '~/components/PageHeader';
import { PageFooter } from '~/components/PageFooter';
import { Outfit, Open_Sans } from 'next/font/google';

const primaryFont = Outfit({
	display: 'swap',
	preload: true,
	subsets: ['latin'],
	variable: '--font-primary',
	weight: ['400', '600'],
});

const secondaryFont = Open_Sans({
	display: 'swap',
	preload: true,
	subsets: ['latin'],
	variable: '--font-secondary',
	weight: ['400', '600'],
});
type Props = Params & {
	children: ReactNode;
};

export const metadata: Metadata = {
	metadataBase: new URL(getBaseUrl()),
	title: 'GoodParty.org | Empowering independents to run, win and serve.',
	description:
		'GoodParty.org empowers independent candidates to run, win and serve. Access campaign tools, voter data, and support to level the playing field without deep pockets.',
	openGraph: {
		type: 'website',
		siteName: 'GoodParty.org',
	},
	twitter: {
		card: 'summary_large_image',
	},
};

type SocialChannelRecord = { field_socialChannelUrl?: string | null; field_socialChannel?: string | null };

async function getSiteSocialChannels(): Promise<Array<{ url?: string | null; name?: string | null }>> {
	try {
		const result = (await sanityFetch({
			query: goodpartyOrg_socialChannelsQuery,
			tags: ['goodpartyOrg_socialChannels'],
		})) as { socialChannels?: { list_socialChannels?: SocialChannelRecord[] | null } | null } | null;
		const list = result?.socialChannels?.list_socialChannels ?? [];
		return list.map((entry) => ({
			url: entry?.field_socialChannelUrl ?? undefined,
			name: entry?.field_socialChannel ?? undefined,
		}));
	} catch {
		// Best-effort: schema must still render even if the singleton has no document yet.
		return [];
	}
}

export default async function RootLayout({ children }: Props) {
	const baseUrl = getBaseUrl();
	const socialChannels = await getSiteSocialChannels();
	const sameAs = resolveSameAs(socialChannels);
	const siteSchema = buildSchemaGraph([
		buildOrganizationSchema({ baseUrl, sameAs }),
		buildWebSiteSchema({ baseUrl }),
	]);
	return (
		<html
			lang='en-US'
			className={`bg-background-primary ${primaryFont.variable} ${primaryFont.className} ${secondaryFont.variable} ${secondaryFont.className}`}
		>
			<head>
				<VWOScript accountId='757033' />
			</head>
			<body className='flex min-h-screen flex-col'>
				<PageSchema schema={siteSchema ?? undefined} />
				<GTM />
				<FacebookPixel />
				<Segment />
				<Amplitude />
				<ScrollDepthTracker />
				{(await draftMode()).isEnabled && <VisualEditing />}
				<ComponentErrorBoundary componentName='Header'>
					<PageHeader className='shrink-0' isDraftMode={(await draftMode()).isEnabled} />
				</ComponentErrorBoundary>
				<main
					role='main'
					className={`bg-goodparty-cream flex-1 basis-0 ${(await draftMode()).isEnabled ? 'pt-[calc(var(--header-height)+var(--preview-header-height))]' : 'pt-(--header-height)'}`}
				>
					{children}
				</main>
				<ComponentErrorBoundary componentName='Footer'>
					<PageFooter className='shrink-0' />
				</ComponentErrorBoundary>
				<Script id='hubspot-forms' src='//js.hsforms.net/forms/embed/v2.js' strategy='beforeInteractive' />
				<Script
					id='hs-script-loader'
					src='//js.hs-scripts.com/21589597.js'
					strategy='afterInteractive'
				/>
			</body>
		</html>
	);
}
