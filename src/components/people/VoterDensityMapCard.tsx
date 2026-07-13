'use client';

import dynamic from 'next/dynamic';
import type { VoterDensityCell } from '~/types/people';
import type { VoterDensityMapProps } from './VoterDensityMap';

// deck.gl + maplibre-gl are browser-only and heavy; load the map only on the
// client (ssr: false) so it never runs during SSR and never blocks the
// server-rendered profile content (SEO-critical). A lightweight skeleton holds
// the layout while the chunk loads.
const VoterDensityMap = dynamic<VoterDensityMapProps>(
	async () => (await import('./VoterDensityMap')).default,
	{
		ssr: false,
		loading: () => (
			<div className='h-64 w-full animate-pulse rounded-xl bg-gray-100 sm:h-72' />
		),
	},
);

export interface VoterDensityMapCardProps {
	cells: VoterDensityCell[];
	styleUrl: string;
	attribution: string;
}

function Legend() {
	return (
		<div className='mt-3 flex items-center gap-2 text-xs text-gray-500'>
			<span>Fewer</span>
			<span
				aria-hidden
				className='h-2 flex-1 rounded-full'
				style={{
					background:
						'linear-gradient(to right, rgb(255,255,178), rgb(254,178,76), rgb(253,141,60), rgb(240,59,32), rgb(189,0,38))',
				}}
			/>
			<span>More</span>
		</div>
	);
}

/**
 * Sidebar card wrapping the voter-density heat map. Progressive enhancement:
 * this only renders when the server already decided there is enough coverage
 * (see PersonProfile), so there is no in-card empty/error state — just the map,
 * a one-line explainer, and a density legend.
 */
export function VoterDensityMapCard({
	cells,
	styleUrl,
	attribution,
}: VoterDensityMapCardProps) {
	return (
		<section className='rounded-2xl border border-black/5 bg-white p-6 shadow-sm sm:p-8'>
			<h2 className='mb-1 text-xl font-semibold text-gray-900'>
				Where constituents live
			</h2>
			<p className='mb-4 text-sm text-gray-500'>
				Approximate residential density across the district. Aggregated and
				anonymized — no individual locations.
			</p>
			<VoterDensityMap cells={cells} styleUrl={styleUrl} attribution={attribution} />
			<Legend />
		</section>
	);
}
