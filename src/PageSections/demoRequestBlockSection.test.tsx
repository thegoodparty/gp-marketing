import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { DemoRequestBlockSection } from './DemoRequestBlockSection.tsx';

/**
 * Pins the schema-vs-GROQ field mapping. The `...` spread in the GROQ fragment
 * projects flat fields under their schema names, so a rename on either side would
 * otherwise render an empty block with no type error (see docs/adding-a-component.md).
 */
const section = {
	_type: 'component_demoRequestBlock',
	_key: 'test',
	field_heading: 'Running for local office? Request a demo of GoodParty.org',
	field_body: 'Tell us a little about your race.',
	field_talkingPoints: [
		{ _key: 'a', _type: 'talkingPoint', field_title: 'Your race', field_copy: 'Who is voting and what it takes to win.' },
	],
	field_apiEndpoint: 'https://demo-qualifier-production.up.railway.app/qualify',
	field_backgroundVariant: 'cream',
	componentSettings: null,
} as unknown as Parameters<typeof DemoRequestBlockSection>[0];

describe('DemoRequestBlockSection', () => {
	test('renders the heading, body, talking points, and the first step of the form', () => {
		const html = renderToStaticMarkup(<DemoRequestBlockSection {...section} />);

		expect(html).toContain('Running for local office? Request a demo of GoodParty.org');
		expect(html).toContain('Tell us a little about your race.');
		expect(html).toContain('Your race');
		expect(html).toContain('Where are you running?');
		expect(html).toContain('City or town');
		expect(html).toContain('What office are you running for?');
	});

	test('does not expose a calendar link before the qualifier has answered', () => {
		const html = renderToStaticMarkup(<DemoRequestBlockSection {...section} />);

		expect(html).not.toContain('meetings.hubspot.com');
	});
});
