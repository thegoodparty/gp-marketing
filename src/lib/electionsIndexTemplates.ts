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

	return tokens;
}
