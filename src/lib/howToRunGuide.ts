import type { RaceDetail } from '~/types/elections';

/**
 * Marketing's blog article matrix for the position pages' "How to Run for
 * [office]" card (design brief, "Campaign guides and resources"). Each office
 * type maps to one article; anything the matrix does not name gets the general
 * campaign guide.
 */
export const HOW_TO_RUN_GUIDES = {
	cityCouncil: '/blog/article/how-to-run-for-city-council',
	mayor: '/blog/article/how-to-run-for-mayor',
	schoolBoard: '/blog/article/how-to-run-for-school-board',
	cityTreasurer: '/blog/article/how-to-run-for-city-treasurer',
	countyCommissioner: '/blog/article/how-to-run-for-county-commissioner',
	countyAssessor: '/blog/article/how-to-run-for-county-assessor',
	judge: '/blog/article/how-to-run-for-judge',
	districtAttorney: '/blog/article/how-to-run-for-district-attorney',
	congress: '/blog/article/how-to-run-for-congress',
	stateLegislature: '/blog/article/how-to-run-for-state-legislature',
	township: '/blog/article/township-office',
	specialDistrict: '/blog/article/special-district-board',
	general: '/blog/article/how-to-run-a-political-campaign',
} as const;

export type HowToRunGuideKey = keyof typeof HOW_TO_RUN_GUIDES;

export type HowToRunGuideInput = {
	officeName?: string | null;
	race?: Pick<RaceDetail, 'name' | 'normalizedPositionName' | 'positionNames' | 'positionLevel'> | null;
};

const SPECIAL_DISTRICT_SUBJECTS =
	/\b(water|fire|library|hospital|health|parks?|recreation|sanitation|sanitary|sewer|irrigation|utilit(y|ies)|cemetery|conservation|soil|drainage|flood|levee|reclamation|transit|port|airport|community college|mosquito|improvement|metropolitan|service area)\b/;
const SPECIAL_DISTRICT_BODIES = /\b(district|board|trustee|director|commission|commissioner|authority)\b/;
const COUNTY_BODIES = /\b(commission|commissioner|board|supervisor|trustee|freeholder|council|legislat\w*|executive|chair)\b/;
const MUNICIPAL = /\b(city|town|village|borough|municipal)\b/;

function normalize(text: string): string {
	return text
		.toLowerCase()
		.replace(/['’]/g, '')
		.replace(/[^a-z0-9]+/g, ' ')
		.trim();
}

export function classifyHowToRunGuide(input: HowToRunGuideInput): HowToRunGuideKey {
	const race = input.race ?? undefined;
	const text = normalize(
		[race?.normalizedPositionName, race?.name, ...(race?.positionNames ?? []), input.officeName].filter(Boolean).join(' '),
	);
	const level = (race?.positionLevel ?? '').toUpperCase();

	if (!text) return 'general';

	if (/\btownship\b/.test(text)) return 'township';

	if (level === 'FEDERAL' || /\bcongress\w*\b/.test(text) || /\b(u ?s|united states) (house|senate|senator|representative)/.test(text)) {
		return 'congress';
	}

	if (
		(level === 'STATE' && /\b(senate|senator|house|assembly|representative|delegate|legislat\w*)\b/.test(text)) ||
		/\bstate (senate|senator|house|assembly|representative|legislat\w*)/.test(text) ||
		/\b(general assembly|house of delegates|house of representatives|legislative assembly|state legislature)\b/.test(text)
	) {
		return 'stateLegislature';
	}

	if (
		(/\bschools?\b/.test(text) && /\b(board|trustee|director|committee|education|member)\b/.test(text)) ||
		/\b(board of education|education board|school committee)\b/.test(text)
	) {
		return 'schoolBoard';
	}

	if (/\bspecial district\b/.test(text) || (SPECIAL_DISTRICT_SUBJECTS.test(text) && SPECIAL_DISTRICT_BODIES.test(text))) {
		return 'specialDistrict';
	}

	if (
		/\b(judge|justice|magistrate|judicial|jurist)\b/.test(text) ||
		(/\bcourt\b/.test(text) && !/\b(clerk|reporter|administrator|constable|bailiff)\b/.test(text))
	) {
		return 'judge';
	}

	if (/\b(district|states?|county|commonwealths?|city) attorney\b/.test(text) || /\b(prosecut(or|ing)|solicitor)\b/.test(text)) {
		return 'districtAttorney';
	}

	if (/\bmayor\b/.test(text)) return 'mayor';

	if (/\btreasurer\b/.test(text) && !/\b(county|parish|state)\b/.test(text)) return 'cityTreasurer';

	if (/\bassessor\b/.test(text) && !MUNICIPAL.test(text) && !/\bstate\b/.test(text) && level !== 'STATE') return 'countyAssessor';

	if (
		(/\b(county|parish)\b/.test(text) && COUNTY_BODIES.test(text)) ||
		/\bboard of supervisors\b/.test(text) ||
		(level === 'COUNTY' && /\b(commission|commissioner|supervisor|freeholder|council)\b/.test(text))
	) {
		return 'countyCommissioner';
	}

	if (
		/\bcouncil\b/.test(text) ||
		/\balder(man|men|woman|women|person|persons)?\b/.test(text) ||
		/\bselect ?(board|man|men|woman|women|person|persons)\b/.test(text) ||
		(MUNICIPAL.test(text) && /\b(commission|commissioner|board|trustee|assembly)\b/.test(text))
	) {
		return 'cityCouncil';
	}

	return 'general';
}

export function resolveHowToRunGuide(input: HowToRunGuideInput): { key: HowToRunGuideKey; href: string } {
	const key = classifyHowToRunGuide(input);
	return { key, href: HOW_TO_RUN_GUIDES[key] };
}
