import { createHmac, timingSafeEqual } from 'node:crypto';
import { revalidatePath, revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';
import { parseBody } from 'next-sanity/webhook';
import { revalidateSecret } from '~/lib/env';
import { sanityClient } from '~/sanity/sanityClient';

const CUSTOM_SECRET_HEADER = 'x-sanity-webhook-secret';
const HMAC_KEY = 'safeCompare';

function safeCompare(a: string, b: string): boolean {
	const da = createHmac('sha256', HMAC_KEY).update(a).digest();
	const db = createHmac('sha256', HMAC_KEY).update(b).digest();
	return timingSafeEqual(da, db);
}

function isSlugObject(value: unknown): value is { current: string } {
	return (
		value != null &&
		typeof value === 'object' &&
		'current' in value &&
		typeof (value as { current: unknown }).current === 'string'
	);
}

function getSlugFromPayload(payload: Record<string, unknown>, path: string): string | undefined {
	const parts = path.split('.');
	let value: unknown = payload;
	for (const part of parts) {
		if (value == null || typeof value !== 'object') return undefined;
		value = (value as Record<string, unknown>)[part];
	}
	if (typeof value === 'string') return value;
	if (isSlugObject(value)) return value.current;
	return undefined;
}

function getPathsToRevalidate(_type: string, payload: Record<string, unknown>): string[] {
	const slugPaths: Record<string, string> = {
		article: 'editorialOverview.field_slug',
		categories: 'tagOverview.field_slug',
		topics: 'tagOverview.field_slug',
		glossary: 'glossaryTermOverview.field_slug',
		goodpartyOrg_landingPages: 'detailPageOverviewNoHero.field_slug',
		policy: 'policyOverview.field_slug',
	};

	const slug = slugPaths[_type] ? getSlugFromPayload(payload, slugPaths[_type]) : undefined;

	const pathMap: Record<string, string | string[]> = {
		article: slug ? [`/blog/article/${slug}`, '/blog'] : ['/blog'],
		categories: slug ? [`/blog/section/${slug}`, '/blog'] : ['/blog'],
		topics: slug ? [`/blog/tag/${slug}`, '/blog'] : ['/blog'],
		glossary: slug ? [`/political-terms/${slug}`, '/political-terms'] : ['/political-terms'],
		goodpartyOrg_landingPages: slug ? [`/${slug}`] : ['/'],
		goodpartyOrg_home: ['/'],
		policy: slug ? [`/${slug}`] : ['/'],
		goodpartyOrg_contact: ['/contact'],
		goodpartyOrg_navigation: ['/'],
		goodpartyOrg_footer: ['/'],
		goodpartyOrg_allArticles: ['/blog'],
		goodpartyOrg_glossary: ['/political-terms'],
		goodpartyOrg_404Page: ['/'],
		goodpartyOrg_allComponents: ['/all'],
		quoteCollections: ['/elections'],
		experiment_variant: ['/'],
	};

	const paths = pathMap[_type];
	if (paths) {
		return Array.isArray(paths) ? paths : [paths];
	}

	return ['/'];
}

/**
 * Map a referenced "target page" document to the public route that renders it.
 * Mirrors the routes in `src/app/**` that mount each singleton/landing-page type.
 */
function targetPageToRoute(target: {
	_type?: string;
	slug?: string | null;
}): string | null {
	switch (target._type) {
		case 'goodpartyOrg_home':
			return '/';
		case 'goodpartyOrg_landingPages':
			return target.slug ? `/${target.slug}` : null;
		case 'goodpartyOrg_contact':
			return '/contact';
		case 'goodpartyOrg_glossary':
			return '/political-terms';
		case 'goodpartyOrg_allArticles':
			return '/blog';
		default:
			return null;
	}
}

/**
 * Resolve the public routes affected by an experiment_variant change.
 *
 * The webhook payload only carries unresolved `_ref`s, so we round-trip to
 * Sanity to dereference `field_targetPages[]` into a `{_type, slug}` shape we
 * can map onto our App Router routes. Without this, publishing a variant only
 * busts `/` regardless of which landing page it actually targets, leaving
 * targeted pages stuck on stale cached HTML.
 */
async function resolveExperimentVariantPaths(
	payload: Record<string, unknown>,
): Promise<string[]> {
	const id = typeof payload['_id'] === 'string' ? (payload['_id'] as string) : null;
	if (!id) return ['/'];

	type TargetRow = { _type?: string; slug?: string | null };
	const publishedId = id.startsWith('drafts.') ? id.slice('drafts.'.length) : id;

	try {
		const targets = await sanityClient.fetch<TargetRow[]>(
			`*[_id == $id || _id == $publishedId][0].field_targetPages[]->{
				_type,
				"slug": detailPageOverviewNoHero.field_slug
			}`,
			{ id, publishedId },
		);

		const routes = (targets ?? [])
			.map(targetPageToRoute)
			.filter((route): route is string => Boolean(route));

		return routes.length > 0 ? Array.from(new Set(routes)) : ['/'];
	} catch (err) {
		console.error('Failed to resolve experiment_variant target paths:', err);
		return ['/'];
	}
}

export async function POST(req: NextRequest) {
	if (!revalidateSecret) {
		return NextResponse.json(
			{ error: 'Revalidation not configured: SANITY_REVALIDATE_SECRET is not set' },
			{ status: 503 },
		);
	}

	const customSecret = req.headers.get(CUSTOM_SECRET_HEADER);
	let payload: Record<string, unknown>;

	try {
		if (customSecret) {
			if (!safeCompare(customSecret, revalidateSecret)) {
				return NextResponse.json({ error: 'Invalid x-sanity-webhook-secret header' }, { status: 401 });
			}
			try {
				payload = (await req.json()) as Record<string, unknown>;
			} catch {
				return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
			}
		} else {
			const { isValidSignature, body } = await parseBody<Record<string, unknown>>(
				req,
				revalidateSecret,
			);
			if (!isValidSignature) {
				return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
			}
			payload = body ?? {};
		}
	} catch {
		return NextResponse.json({ error: 'Authorization failed' }, { status: 401 });
	}

	const _type = payload['_type'] as string | undefined;
	if (!_type) {
		return NextResponse.json({ error: 'Invalid payload: missing _type' }, { status: 400 });
	}

	try {
		revalidateTag(_type);

		const paths =
			_type === 'experiment_variant'
				? await resolveExperimentVariantPaths(payload)
				: getPathsToRevalidate(_type, payload);
		for (const path of paths) {
			revalidatePath(path);
		}

		return NextResponse.json({
			revalidated: true,
			tag: _type,
			paths,
		});
	} catch (err) {
		console.error('Revalidation failed:', err);
		return NextResponse.json(
			{ error: 'Revalidation failed', details: err instanceof Error ? err.message : String(err) },
			{ status: 500 },
		);
	}
}
