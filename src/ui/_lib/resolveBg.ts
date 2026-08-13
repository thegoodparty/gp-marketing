import { stegaClean } from 'next-sanity';

export function resolveBg(background?: string): 'cream' | 'midnight' {
	const value = stegaClean(background);
	return value === 'midnight' || value === 'MidnightDark' ? 'midnight' : 'cream';
}
