import { revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';
import { parseBody } from 'next-sanity/webhook';

type WebhookPayload = {
	_type: string;
};

export async function POST(req: NextRequest) {
	try {
		const secret = process.env.SANITY_REVALIDATE_SECRET;
		if (!secret) {
			return new Response('Missing environment variable SANITY_REVALIDATE_SECRET', { status: 500 });
		}

		const { isValidSignature, body } = await parseBody<WebhookPayload>(req, secret);

		if (!isValidSignature) {
			return new Response(JSON.stringify({ message: 'Invalid signature' }), { status: 401 });
		}
		if (!body?._type) {
			return new Response(JSON.stringify({ message: 'Bad Request' }), { status: 400 });
		}

		revalidateTag(body._type);

		return NextResponse.json({ revalidated: true, tag: body._type });
	} catch (err) {
		console.error(err);
		return new Response((err as Error).message, { status: 500 });
	}
}
