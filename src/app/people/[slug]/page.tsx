import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { PageSchema } from '~/ui/PageSchema';
import { PersonProfile } from '~/components/people/PersonProfile';
import {
	buildBreadcrumbSchema,
	buildSchemaGraph,
	buildWebPageSchema,
} from '~/lib/schema';
import {
	extractPersonId,
	loadPersonProfile,
	type PersonProfileView,
} from '~/lib/peopleProfile';
import { SITE_NAME, toAbsoluteUrl } from '~/lib/url';

export const revalidate = 3600;

// Pages are generated on-demand (ISR) and then cached; nothing is prebuilt at
// build time because the person set is large and data-team driven.
export async function generateStaticParams(): Promise<{ slug: string }[]> {
	return [];
}

type PageParams = { slug: string };

function canonicalPath(view: PersonProfileView): string {
	return `/people/${view.canonicalSlug}`;
}

async function resolveView(slug: string): Promise<PersonProfileView | null> {
	const personId = extractPersonId(slug);
	if (!personId) return null;
	return loadPersonProfile(personId);
}

export default async function Page({ params }: { params: Promise<PageParams> }) {
	const { slug } = await params;
	const view = await resolveView(slug);

	if (!view) {
		notFound();
	}

	// Keep a single canonical URL: redirect stale/name-only slugs to the
	// name-based slug the profile currently resolves to.
	const canonical = canonicalPath(view);
	if (`/people/${slug}` !== canonical) {
		redirect(canonical);
	}

	const url = toAbsoluteUrl(canonical);
	const description =
		view.bio ??
		`${view.displayName}${view.roleTitle ? `, ${view.roleTitle}` : ''} on GoodParty.org.`;

	const personSchema = {
		'@context': 'https://schema.org',
		'@type': 'Person',
		name: view.displayName,
		...(view.roleTitle ? { jobTitle: view.roleTitle } : {}),
		...(view.avatarUrl ? { image: view.avatarUrl } : {}),
		...(view.links.length
			? { sameAs: view.links.filter((l) => l.href.startsWith('http')).map((l) => l.href) }
			: {}),
		url,
	};

	const schema = buildSchemaGraph([
		buildWebPageSchema({ url, name: view.displayName, description }),
		buildBreadcrumbSchema([
			{ href: '/', label: 'Home' },
			{ href: '/people', label: 'People' },
			{ label: view.displayName },
		]),
		personSchema,
	]);

	return (
		<>
			<PageSchema schema={schema ?? undefined} />
			<PersonProfile view={view} />
		</>
	);
}

export async function generateMetadata({
	params,
}: {
	params: Promise<PageParams>;
}): Promise<Metadata> {
	const { slug } = await params;
	const view = await resolveView(slug);

	if (!view) {
		return { title: `Profile Not Found | ${SITE_NAME}` };
	}

	const canonical = canonicalPath(view);
	const title = view.roleTitle
		? `${view.displayName} — ${view.roleTitle} | ${SITE_NAME}`
		: `${view.displayName} | ${SITE_NAME}`;
	const description =
		view.bio ??
		`${view.displayName}${view.roleTitle ? `, ${view.roleTitle}` : ''} on GoodParty.org.`;

	return {
		title,
		description,
		alternates: { canonical },
		openGraph: {
			type: 'profile',
			siteName: SITE_NAME,
			url: toAbsoluteUrl(canonical),
			images: view.avatarUrl ? [{ url: view.avatarUrl }] : undefined,
		},
	};
}
