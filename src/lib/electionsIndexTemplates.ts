import type { ElectionsIndexPageContext } from '~/lib/electionsTemplateHelpers';
import type { TokenMap } from '~/lib/resolveTokens';

export function buildElectionsIndexTokens(
	ctx: Pick<ElectionsIndexPageContext, 'locationLevel' | 'stateName' | 'countyName' | 'cityName'>,
): TokenMap {
	const tokens: TokenMap = {
		'[State]': ctx.stateName,
	};

	if (ctx.locationLevel === 'county' || ctx.locationLevel === 'city') {
		if (ctx.countyName) tokens['[County]'] = ctx.countyName;
	}

	if (ctx.locationLevel === 'city' && ctx.cityName) {
		tokens['[City]'] = ctx.cityName;
	}

	if (ctx.locationLevel === 'district' && ctx.countyName) {
		tokens['[District]'] = ctx.countyName;
	}

	// The most specific place the page represents, for headings that name the
	// page's own location without the editor having to pick a level per template
	// ("More about [location]"). Without it a template typed against [location]
	// publishes the heading with the name stripped out, which is not a type error.
	tokens['[location]'] = ctx.cityName ?? ctx.countyName ?? ctx.stateName;

	return tokens;
}
