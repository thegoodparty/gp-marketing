'use client';

import { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { VoterDensityCell } from '~/types/people';

export interface VoterDensityMapProps {
	cells: VoterDensityCell[];
	styleUrl: string;
	attribution: string;
}

// Sequential low→high ramp for the density surface. Mirrors CARTO's "sunset"
// feel and reads well over the light Positron basemap. The first stop is fully
// transparent so empty areas show the map, not a wash of color.
const HEATMAP_COLOR_RANGE: [number, number, number][] = [
	[255, 255, 178],
	[254, 217, 118],
	[254, 178, 76],
	[253, 141, 60],
	[240, 59, 32],
	[189, 0, 38],
];

/** Padded [[west, south], [east, north]] bounds around all cells. */
function boundsFor(
	cells: VoterDensityCell[],
): [[number, number], [number, number]] | null {
	if (cells.length === 0) return null;
	let west = Infinity;
	let south = Infinity;
	let east = -Infinity;
	let north = -Infinity;
	for (const c of cells) {
		if (c.lng < west) west = c.lng;
		if (c.lng > east) east = c.lng;
		if (c.lat < south) south = c.lat;
		if (c.lat > north) north = c.lat;
	}
	// A single-cell (or degenerate) district would give a zero-area box that
	// fitBounds can't zoom into; pad by a small delta so it always frames.
	const pad = 0.01;
	return [
		[west - pad, south - pad],
		[east + pad, north + pad],
	];
}

/**
 * MapLibre + deck.gl voter-density heat map. Loaded with `ssr: false` (see
 * VoterDensityMapCard) so neither maplibre-gl nor deck.gl ever runs during SSR.
 * Renders a deck.gl HeatmapLayer (weight = voter count) over the hosted CARTO
 * Positron basemap and frames the district. Points are precomputed H3 cell
 * centroids — never real voter locations.
 */
export default function VoterDensityMap({
	cells,
	styleUrl,
	attribution,
}: VoterDensityMapProps) {
	const containerRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const bounds = boundsFor(cells);

		const map = new maplibregl.Map({
			container,
			style: styleUrl,
			// Static, non-interactive-ish reference surface; framed to the district.
			bounds: bounds ?? undefined,
			fitBoundsOptions: { padding: 32 },
			center: bounds ? undefined : [-98.5, 39.8],
			zoom: bounds ? undefined : 3,
			attributionControl: false,
			// Keep it a clean 2D density read: no pitch/rotate gestures.
			pitchWithRotate: false,
			dragRotate: false,
		});
		map.addControl(
			new maplibregl.AttributionControl({ customAttribution: attribution }),
			'bottom-right',
		);
		map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

		const overlay = new MapboxOverlay({
			interleaved: false,
			layers: [
				new HeatmapLayer<VoterDensityCell>({
					id: 'voter-density',
					data: cells,
					getPosition: (d) => [d.lng, d.lat],
					getWeight: (d) => d.count,
					radiusPixels: 40,
					intensity: 1,
					threshold: 0.05,
					colorRange: HEATMAP_COLOR_RANGE,
				}),
			],
		});
		map.addControl(overlay);

		return () => {
			// Order matters: detach the deck overlay before destroying the map so
			// deck.gl doesn't try to render against a torn-down GL context.
			map.removeControl(overlay);
			map.remove();
		};
	}, [cells, styleUrl, attribution]);

	return (
		<div
			ref={containerRef}
			className='h-64 w-full overflow-hidden rounded-xl sm:h-72'
			// maplibre-gl needs a positioned, sized container; the classes above
			// give it height, but keep an inline min-height as a belt-and-braces
			// guard against a zero-height flash before styles hydrate.
			style={{ minHeight: 256 }}
			aria-label='Map showing where constituents in this district live, as a density heat map'
			role='img'
		/>
	);
}
