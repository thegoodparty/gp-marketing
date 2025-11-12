import type { List_stats } from 'sanity.types';

import type { StatProps } from '../Stat';

import { resolveComponentColor } from './resolveComponentColor';

export const resolveStats = (stats?: List_stats): StatProps[] | undefined => {
	return stats?.map(stat => ({
		_key: stat._key,
		description: stat.field_statDescription,
		value: stat.field_statValue,
		color: resolveComponentColor(stat.field_componentColor6ColorsCreamMidnight),
	}));
};
