import type { Metadata } from 'next';
import Script from 'next/script';
import { draftMode } from 'next/headers';
import { VisualEditing } from 'next-sanity/visual-editing';
import type { ReactNode } from 'react';
import type { Params } from '~/lib/types';
// @ts-ignore
import '~/ui/_styles/globals.css';
import { Amplitude } from '~/ui/Amplitude';
import { PageSchema } from '~/ui/PageSchema';
import { getBaseUrl } from '~/lib/url';
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

const organizationSchema = {
	'@context': 'https://schema.org',
	'@type': 'Organization',
	name: 'GoodParty.org',
	url: getBaseUrl(),
	logo: `${getBaseUrl()}/web-app-manifest-192x192.png`,
};

export default async function RootLayout({ children }: Props) {
	return (
		<html
			lang='en-US'
			className={`bg-background-primary ${primaryFont.variable} ${primaryFont.className} ${secondaryFont.variable} ${secondaryFont.className}`}
		>
			<head>
				<VWOScript accountId='757033' />
			</head>
			<body className='flex min-h-screen flex-col'>
				<PageSchema schema={organizationSchema} />
				<GTM />
				<FacebookPixel />
				<Segment />
				<Amplitude />
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
