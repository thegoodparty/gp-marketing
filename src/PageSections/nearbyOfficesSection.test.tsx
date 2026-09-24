import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { NearbyOfficesSection } from './NearbyOfficesSection.tsx';

/**
 * Asserts the field mapping, the half of a block that fails silently: the
 * schema names and the GROQ-projected names have to agree, and a wrong one
 * reads as `undefined` rather than as a type error.
 */
const section = {
	_type: 'component_nearbyOffices',
	_key: 'test',
	field_heading: 'Other offices in [County or City]',
	nearbyOfficesDesignSettings: { field_blockColorCreamMidnight: 'cream' },
	componentSettings: { field_anchorId: 'nearby' },
} as unknown as Parameters<typeof NearbyOfficesSection>[0];

const offices = [
	{
		id: 'tx/houston/controller',
		type: 'Local',
		position: 'City Controller',
		nextElectionDate: '2026-11-03',
		href: '/elections/tx/harris-county/houston/position/controller',
	},
];

describe('NearbyOfficesSection', () => {
	test('renders the page-fed rows under the CMS heading with tokens resolved', () => {
		const html = renderToStaticMarkup(
			<NearbyOfficesSection {...section} tokens={{ '[County or City]': 'Houston' }} nearbyOverride={{ offices }} />,
		);

		expect(html).toContain('id="nearby"');
		expect(html).toContain('Other offices in Houston');
		expect(html).toContain('City Controller');
		expect(html).toContain('href="/elections/tx/harris-county/houston/position/controller"');
	});

	test('renders nothing visible when the page supplies no offices', () => {
		const html = renderToStaticMarkup(<NearbyOfficesSection {...section} tokens={{ '[County or City]': 'Houston' }} />);

		expect(html).not.toContain('Other offices in Houston');
		expect(html).not.toContain('data-component="NearbyOffices"');
	});

	test('reads the background colour from the design settings', () => {
		const html = renderToStaticMarkup(
			<NearbyOfficesSection {...section} nearbyOfficesDesignSettings={{ field_blockColorCreamMidnight: 'midnight' }} nearbyOverride={{ offices }} />,
		);

		expect(html).toContain('bg-midnight-900');
	});
});
