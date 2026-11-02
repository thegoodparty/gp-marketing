import { type NextRequest, NextResponse } from 'next/server';
import { getCountyChildPlaces, getElectionsPagePlace, pairCensusCityTwins } from '~/lib/electionsApi';

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const state = searchParams.get('state') ?? 'NE';
	const countySlug = searchParams.get('county') ?? 'ne/gage-county';
	const match = searchParams.get('match') ?? 'beatrice';
	const children = await getCountyChildPlaces({ state, countySlug });
	const hits = children.filter(c => c.slug?.includes(match)).map(c => ({ slug: c.slug, name: c.name, mtfcc: c.mtfcc, countyName: c.countyName }));
	const pairs = pairCensusCityTwins(children).map(p => [p.twin.slug, p.city.slug]);
	const direct = await Promise.all([`${state.toLowerCase()}/${match}`, `${state.toLowerCase()}/${match}-city`].map(async slug => {
		const p = await getElectionsPagePlace({ slug });
		return p && { slug: p.slug, name: p.name, mtfcc: p.mtfcc, countyName: p.countyName, races: (p.Races ?? []).map(r => `${r.slug}|${r.positionLevel}`) };
	}));
	return NextResponse.json({ count: children.length, hits, pairs, direct });
}
