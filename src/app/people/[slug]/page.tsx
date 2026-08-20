import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import {
	buildBreadcrumbSchema,
	buildPersonSchema,
	buildSchemaGraph,
	buildWebPageSchema,
} from '~/lib/schema';
import {
	extractPersonId,
	isIndexableProfile,
	loadPersonProfile,
	type PersonProfileView,
} from '~/lib/peopleProfile';
import {
	buildPersonProfileTokens,
	buildPersonSectionOverrides,
} from '~/components/people/personSectionOverrides';
import { renderElectionTemplatePage } from '~/lib/renderElectionTemplatePage';
import { getPersonBySlug } from '~/lib/electionsApi';
import { getDevPersonProfileView, isDevPeopleFixturesEnabled } from '~/lib/devPeopleProfileFixtures';
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
	// Dev-only Figma-parity aid: when PEOPLE_DEV_FIXTURES=true, serve the enriched
	// (mock-volume) harness fixtures through the real render pipeline. No-op in
	// prod (flag unset → reads the live election-api/gp-api data below).
	if (isDevPeopleFixturesEnabled()) {
		const devView = getDevPersonProfileView(slug);
		if (devView) return devView;
	}

	// Legacy /people/<name>-<full-uuid> URLs (an earlier scheme) still resolve by
	// their trailing full personId; the canonical redirect below sends them to the
	// current /people/<base>-<id8>.
	const legacyPersonId = extractPersonId(slug);
	if (legacyPersonId) return loadPersonProfile(legacyPersonId);

	// Current /people/<base>-<id8>: election-api parses the 8-hex suffix and
	// resolves the person via an indexed id-range scan; then load the full
	// profile by id (so per-person `person:<uuid>` cache-busting still applies).
	const person = await getPersonBySlug(slug);
	if (!person) return null;
	return loadPersonProfile(person.id);
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

	const personSchema = buildPersonSchema({
		url,
		name: view.displayName,
		jobTitle: view.roleTitle,
		image: view.avatarUrl,
		description,
		sameAs: view.links.filter((l) => l.href.startsWith('http')).map((l) => l.href),
		addressRegion: view.stateLabel,
		affiliation: view.party,
	});

	const schema = buildSchemaGraph([
		buildWebPageSchema({ url, name: view.displayName, description }),
		buildBreadcrumbSchema(view.breadcrumb),
		personSchema,
	]);

	// Option A: /people is template-driven, mirroring /candidate. Resolve the
	// `personProfile` Sanity template (custom per-state → global → code default)
	// and render it with this person's data injected via SectionOverrides. Editors
	// can pin per-state (A–L) Custom Templates via field_profileState.
	return renderElectionTemplatePage({
		context: {
			templateType: 'personProfile',
			personSlug: view.canonicalSlug,
			profileState: view.state,
		},
		sectionOverrides: buildPersonSectionOverrides(view),
		tokens: buildPersonProfileTokens(view),
		schemas: [schema],
	});
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

	// Two different reasons to stay out of the index, one directive. A person who
	// requested removal keeps a crawlable, stripped URL (K/L) but should not be
	// actively surfaced; a profile with no differentiating content yet is a
	// near-duplicate of every other one, which is what Google clustered under
	// "Duplicate, Google chose different canonical than user". Both keep
	// `follow: true` so the civics interlinks on the page still carry crawl
	// signal to the election and profile pages they point at.
	const indexable = isIndexableProfile(view);

	return {
		title,
		description,
		alternates: { canonical },
		...(indexable ? {} : { robots: { index: false, follow: true } }),
		openGraph: {
			type: 'profile',
			siteName: SITE_NAME,
			url: toAbsoluteUrl(canonical),
			images: view.avatarUrl ? [{ url: view.avatarUrl }] : undefined,
		},
	};
}
