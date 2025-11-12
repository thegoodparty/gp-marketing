import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
// import { fetchPath } from '~/lib/loadPageQueryNew';

export async function GET(req: Request) {
	// const url = new URL(req.url);
	// const id = url.searchParams.get('id')?.replace(/^drafts\./, '');
	// const type = url.searchParams.get('type');
	// const redirectUrl = await fetchPath(type, id, true);
	// if (!redirectUrl) {
	// 	return new Response(`Invalid redirect ${req.url}`, { status: 401 });
	// }
	// (await draftMode()).enable();
	// redirect(redirectUrl);
}
