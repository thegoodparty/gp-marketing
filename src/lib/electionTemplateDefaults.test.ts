import { describe, expect, test } from 'bun:test';
import { getCodeDefaultElectionTemplate } from '~/lib/electionTemplateDefaults';
import type { ElectionTemplateType } from '~/lib/electionTemplates';

const TEMPLATE_TYPES: ElectionTemplateType[] = ['location', 'position', 'positionCandidates', 'candidateProfile'];

describe('getCodeDefaultElectionTemplate', () => {
	for (const templateType of TEMPLATE_TYPES) {
		test(`returns non-empty, render-safe sections for ${templateType}`, () => {
			const sections = getCodeDefaultElectionTemplate(templateType);

			expect(sections.length).toBeGreaterThan(0);

			const sectionTypes = sections.map(section => section._type);
			// The code-default path never runs GROQ, so blocks that depend on dereferenced
			// Sanity references or GROQ field projection must be stripped.
			expect(sectionTypes).not.toContain('component_carouselBlock');
			expect(sectionTypes).not.toContain('component_ctaImageBlock');
			expect(sectionTypes).not.toContain('component_ctaBlock');
			expect(sectionTypes).not.toContain('component_ctaBannerBlock');

			// Every block needs a stable _key — PageSections uses it as the React key.
			expect(sections.every(section => typeof section._key === 'string' && section._key.length > 0)).toBe(true);
		});
	}
});
