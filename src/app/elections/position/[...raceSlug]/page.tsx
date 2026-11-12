import { notFound, permanentRedirect } from 'next/navigation';
import { isValidStateCode } from '~/constants/usStateCodes';
import { getRaceBySlug, resolveRaceElectionHrefs } from '~/lib/electionsApi';
import { resolveLegacyPositionRaceSlug } from '~/lib/legacyPositionRedirect';

export const revalidate = 3600;

export async function generateStaticParams() {
	return [];
}

/**
 * The pre-March-2026 office URLs, `/elections/position/<race slug>`, from the old
 * app. Nothing answered them after the migration, so about 54,000 addresses with
 * 16 months of Search Console history returned 404 (SEO tickets 1 and 9,
 * 2026-11-12). The path after `/position/` is the race slug itself, so the race
 * lookup decides where it goes, the same way every office link on the site is
 * built. A slug with no race stays a 404 rather than a guess.
 */
export default async function Page({ params }: { params: Promise<{ raceSlug: string[] }> }) {
	const { raceSlug: segments } = await params;
	const raceSlug = resolveLegacyPositionRaceSlug(segments);
	if (!raceSlug || !isValidStateCode(raceSlug.split('/')[0]!.toUpperCase())) notFound();

	const race = await getRaceBySlug(raceSlug, false);
	if (!race) notFound();

	const { positionHref } = await resolveRaceElectionHrefs(raceSlug, race.positionLevel);
	if (!positionHref) notFound();
	permanentRedirect(positionHref);
}
