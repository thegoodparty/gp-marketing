import { createHmac, timingSafeEqual } from 'node:crypto';
import { revalidatePath, revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';
import { parseBody } from 'next-sanity/webhook';
import { revalidateSecret } from '~/lib/env';
import { getPathsToRevalidate, shouldRevalidateAllLayouts } from '~/lib/revalidatePaths';
import { sanityClient } from '~/sanity/sanityClient';
import { buildCustomTemplateRevalidatePaths } from '~/lib/electionTemplatePreview';

const CUSTOM_SECRET_HEADER = 'x-sanity-webhook-secret';
const HMAC_KEY = 'safeCompare';

function safeCompare(a: string, b: string): boolean {
	const da = createHmac('sha256', HMAC_KEY).update(a).digest();
	const db = createHmac('sha256', HMAC_KEY).update(b).digest();
	return timingSafeEqual(da, db);
}

/**
 * Map a referenced "target page" document to the public route that renders it.
 * Mirrors the routes in `src/app/**` that mount each singleton/landing-page type.
 */
function targetPageToRoute(target: { _type?: string; slug?: string | null }): string | null {
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
		case undefined:
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
async function resolveExperimentVariantPaths(payload: Record<string, unknown>): Promise<string[]> {
	const rawId = typeof payload['_id'] === 'string' ? payload['_id'] : null;
	if (!rawId) return ['/'];

	// Cached HTML is rendered from published content only (sanityClient pins
	// `perspective: 'published'`), so the published doc is the only meaningful
	// source for revalidation. Strip the `drafts.` prefix if present; if the
	// document has only ever existed as a draft, no public HTML was built from
	// it and the fallback below correctly degrades to `/`.
	const publishedId = rawId.startsWith('drafts.') ? rawId.slice('drafts.'.length) : rawId;

	type TargetRow = { _type?: string; slug?: string | null };

	try {
		// Bypass the CDN: it can lag up to ~60s after publish, and the webhook
		// fires immediately on publish, so a CDN read here would reliably return
		// pre-publish data and revalidate the wrong (or no) targets.
		const targets = await sanityClient.withConfig({ useCdn: false }).fetch<TargetRow[]>(
			`*[_id == $publishedId][0].field_targetPages[]->{
				_type,
				"slug": detailPageOverviewNoHero.field_slug
			}`,
			{ publishedId },
		);

		const routes = (targets ?? []).map(targetPageToRoute).filter((route): route is string => Boolean(route));

		return routes.length > 0 ? Array.from(new Set(routes)) : ['/'];
	} catch (err) {
		console.error('Failed to resolve experiment_variant target paths:', err);
		return ['/'];
	}
}

async function resolveCustomTemplatePaths(payload: Record<string, unknown>): Promise<string[]> {
	const rawId = typeof payload['_id'] === 'string' ? payload['_id'] : null;
	if (!rawId) return ['/elections', '/candidate'];

	const publishedId = rawId.startsWith('drafts.') ? rawId.slice('drafts.'.length) : rawId;

	type TargetRow = { field_electionTargetType?: string; field_electionTargetSlug?: string };

	try {
		const targets = await sanityClient.withConfig({ useCdn: false }).fetch<TargetRow[]>(
			`*[_id == $publishedId][0].list_targets[]{
				field_electionTargetType,
				field_electionTargetSlug
			}`,
			{ publishedId },
		);

		const paths = buildCustomTemplateRevalidatePaths(targets ?? []);
		return paths.length > 0 ? paths : ['/elections', '/candidate'];
	} catch (err) {
		console.error('Failed to resolve custom template target paths:', err);
		return ['/elections', '/candidate'];
	}
}

export async function POST(req: NextRequest) {
	if (!revalidateSecret) {
		return NextResponse.json({ error: 'Revalidation not configured: SANITY_REVALIDATE_SECRET is not set' }, { status: 503 });
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
			const { isValidSignature, body } = await parseBody<Record<string, unknown>>(req, revalidateSecret);
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
		if (_type === 'goodpartyOrg_globalTemplate' && typeof payload['field_electionTemplateType'] === 'string') {
			revalidateTag(`goodpartyOrg_globalTemplate_${payload['field_electionTemplateType']}`);
		}
		if (_type === 'goodpartyOrg_customTemplate' && typeof payload['field_electionTemplateType'] === 'string') {
			revalidateTag(`goodpartyOrg_customTemplate_${payload['field_electionTemplateType']}`);
		}

		const paths =
			_type === 'experiment_variant'
				? await resolveExperimentVariantPaths(payload)
				: _type === 'goodpartyOrg_customTemplate'
					? await resolveCustomTemplatePaths(payload)
					: getPathsToRevalidate(_type, payload);
		for (const path of paths) {
			revalidatePath(path);
		}
		if (shouldRevalidateAllLayouts(_type)) {
			revalidatePath('/', 'layout');
		}

		return NextResponse.json({
			revalidated: true,
			tag: _type,
			paths,
			layout: shouldRevalidateAllLayouts(_type) ? '/' : undefined,
		});
	} catch (err) {
		console.error('Revalidation failed:', err);
		return NextResponse.json({ error: 'Revalidation failed', details: err instanceof Error ? err.message : String(err) }, { status: 500 });
	}
}
