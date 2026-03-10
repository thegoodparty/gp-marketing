import { timingSafeEqual } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { revalidateSecret } from '~/lib/env';

const SIGNATURE_HEADER = 'sanity-webhook-signature';
const CUSTOM_SECRET_HEADER = 'x-sanity-webhook-secret';

function safeCompare(a: string, b: string): boolean {
	if (a.length !== b.length) return false;
	const enc = new TextEncoder();
	return timingSafeEqual(enc.encode(a), enc.encode(b));
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

async function verifySignature(
	payload: string,
	signature: string,
	secret: string,
): Promise<boolean> {
	const match = signature.trim().match(/^t=(\d+)[, ]+v1=([^, ]+)$/);
	if (!match) return false;

	const [, timestampStr, hashedPayload] = match;
	const timestamp = parseInt(timestampStr!, 10);
	if (isNaN(timestamp) || timestamp < 1609459200000) return false;

	const now = Date.now();
	if (Math.abs(now - timestamp) > 5 * 60 * 1000) return false;

	const enc = new TextEncoder();
	const key = await crypto.subtle.importKey(
		'raw',
		enc.encode(secret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign'],
	);

	const signaturePayload = `${timestamp}.${payload}`;
	const sig = await crypto.subtle.sign('HMAC', key, enc.encode(signaturePayload));
	const signatureArray = Array.from(new Uint8Array(sig));
	const expected = btoa(String.fromCharCode.apply(null, signatureArray))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');

	return expected === hashedPayload;
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
	};

	const paths = pathMap[_type];
	if (paths) {
		return Array.isArray(paths) ? paths : [paths];
	}

	return ['/'];
}

export async function POST(request: NextRequest) {
	if (!revalidateSecret) {
		return NextResponse.json(
			{ error: 'Revalidation not configured: SANITY_REVALIDATE_SECRET is not set' },
			{ status: 503 },
		);
	}

	const rawBody = await request.text();
	const customSecret = request.headers.get(CUSTOM_SECRET_HEADER);
	const signature = request.headers.get(SIGNATURE_HEADER);

	let authorized = false;
	if (customSecret && revalidateSecret && safeCompare(customSecret, revalidateSecret)) {
		authorized = true;
	} else if (signature) {
		authorized = await verifySignature(rawBody, signature, revalidateSecret);
	}

	if (!authorized) {
		return NextResponse.json(
			{ error: 'Missing or invalid authorization: provide x-sanity-webhook-secret header or valid sanity-webhook-signature' },
			{ status: 401 },
		);
	}

	let payload: Record<string, unknown>;
	try {
		payload = rawBody ? (JSON.parse(rawBody) as Record<string, unknown>) : {};
	} catch {
		return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	const _type = payload._type as string | undefined;
	if (!_type) {
		return NextResponse.json({ error: 'Invalid payload: missing _type' }, { status: 400 });
	}

	const paths = getPathsToRevalidate(_type, payload);

	try {
		for (const path of paths) {
			revalidatePath(path);
		}
		return NextResponse.json({
			revalidated: true,
			paths,
			_type,
		});
	} catch (err) {
		console.error('Revalidation failed:', err);
		return NextResponse.json(
			{ error: 'Revalidation failed', details: err instanceof Error ? err.message : String(err) },
			{ status: 500 },
		);
	}
}
