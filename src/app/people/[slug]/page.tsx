import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
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
import { getPersonBySlug, getPersonMergeSurvivorChain } from '~/lib/electionsApi';
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

/**
 * Loads a profile by id, following the purge forwarding chain when that id no
 * longer resolves.
 *
 * Both URL forms need this, for different reasons. The legacy full-uuid form
 * never reaches election-api's by-slug route, so nothing else would follow the
 * forwarding address for it. The current `<base>-<id8>` form does reach by-slug
 * — but that response is cached for an hour and carries no per-person tag (we
 * only learn the id from the response, so there is nothing to tag it with),
 * which means gp-api cannot bust it on a purge. Until it expires it keeps
 * naming the retired person, whose profile no longer loads.
 *
 * The survivor's own profile rules still apply, so a privacy takedown or an
 * owner-deleted profile on the survivor keeps 404-ing rather than being
 * resurfaced by a forward.
 */
async function loadProfileFollowingMerges(personId: string): Promise<PersonProfileView | null> {
	const view = await loadPersonProfile(personId);
	if (view) return view;

	// Only reached by a request already bound for a 404, so the extra lookups
	// cost nothing on any path that renders.
	for (const survivingId of await getPersonMergeSurvivorChain(personId)) {
		const survivorView = await loadPersonProfile(survivingId);
		if (survivorView) return survivorView;
	}

	return null;
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
	if (legacyPersonId) return loadProfileFollowingMerges(legacyPersonId);

	// Current /people/<base>-<id8>: election-api parses the 8-hex suffix and
	// resolves the person via an indexed id-range scan; then load the full
	// profile by id (so per-person `person:<uuid>` cache-busting still applies).
	const person = await getPersonBySlug(slug);
	if (!person) return null;
	return loadProfileFollowingMerges(person.id);
}

export default async function Page({ params }: { params: Promise<PageParams> }) {
	const { slug } = await params;
	const view = await resolveView(slug);

	if (!view) {
		notFound();
	}

	// Keep a single canonical URL: redirect stale/name-only slugs to the
	// name-based slug the profile currently resolves to.
	//
	// 308, not 307: every reason we get here is durable — a rename, the legacy
	// full-uuid scheme, or a duplicate the data team purged. A temporary
	// redirect leaves Google indexing the old URL and transfers none of its link
	// equity to the survivor, which is most of the point of forwarding at all.
	// Resolution is by id, not name, so even a browser-cached 308 from before a
	// later rename still lands somewhere that resolves.
	const canonical = canonicalPath(view);
	if (`/people/${slug}` !== canonical) {
		permanentRedirect(canonical);
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
		affiliations: view.partyNames,
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

	// `follow: true` on both suppression paths (see isIndexableProfile for what
	// they are): the page stops competing in the index, but its civics
	// interlinks keep carrying crawl signal to the election and profile pages
	// they point at.
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
