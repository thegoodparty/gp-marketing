import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { FeaturedCandidatesRotationSection } from './FeaturedCandidatesRotationSection';
import type { FeaturedPersonCard } from '~/lib/featuredPeople';

const section = {
	_type: 'component_featuredCandidatesBlock',
	_key: 'rotation',
	field_heading: 'Pledged people across the country',
	featuredCandidatesBlockRotation: {
		list_alwaysFeature: ['https://goodparty.org/people/jane-doe-1a2b3c4d'],
		list_neverFeature: ['deadbeef', null],
	},
	componentSettings: { field_anchorId: 'independents' },
} as const;

type Props = Parameters<typeof FeaturedCandidatesRotationSection>[0];

const card = (i: number): FeaturedPersonCard => ({
	personId: `person-${i}`,
	name: `Person ${i}`,
	office: 'Mayor',
	location: 'Austin, TX',
	href: `/people/person-${i}`,
	avatarUrl: `https://img.example/${i}.jpg`,
	isPledged: true,
	isNonpartisan: true,
	role: 'candidate',
	electionDate: '2026-11-03',
});

describe('FeaturedCandidatesRotationSection', () => {
	test("hands the editor's pins and exclusions to the loader and renders the people it returns", async () => {
		let received: unknown;
		const element = await FeaturedCandidatesRotationSection({
			...section,
			loadRotation: async options => {
				received = options;
				return { candidates: [card(1), card(2)], representatives: [], candidatesComplete: false };
			},
		} as unknown as Props);
		expect(received).toEqual({ pins: ['https://goodparty.org/people/jane-doe-1a2b3c4d'], excludes: ['deadbeef'] });
		if (!element) throw new Error('expected the block to render');
		const html = renderToStaticMarkup(element);
		expect(html).toContain('Pledged people across the country');
		expect(html.match(/data-component="FeaturedCandidateCard"/g)).toHaveLength(2);
	});

	test('renders nothing when the pool is empty', async () => {
		const element = await FeaturedCandidatesRotationSection({
			...section,
			loadRotation: async () => ({ candidates: [], representatives: [], candidatesComplete: false }),
		} as unknown as Props);
		expect(element).toBeNull();
	});
});
