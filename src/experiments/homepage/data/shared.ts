import type { StatProps } from '~/ui/Stat.tsx';
import { midnightComponentColor } from '~/ui/_lib/designTypesStore.ts';

export const sharedStats: StatProps[] = [
	{ _key: '1', value: '17,000+', description: 'Good People Supported', color: midnightComponentColor },
	{ _key: '2', value: '13,000+', description: 'Winners Elected', color: midnightComponentColor },
	{ _key: '3', value: '50', description: 'States Reached', color: midnightComponentColor },
	{ _key: '4', value: '$0', description: 'From Corporate PACs', color: midnightComponentColor },
];
