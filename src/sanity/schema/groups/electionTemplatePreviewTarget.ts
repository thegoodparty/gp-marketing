import { field_electionTargetSlug, field_electionTargetType } from '../fields/field_electionTemplateType.ts';

type PreviewDoc = {
	field_electionTemplateType?: string;
};

export const electionTemplatePreviewTarget = {
	name: 'electionTemplatePreviewTarget',
	title: 'Preview Target',
	type: 'object',
	description:
		'Opens a real election or candidate page in the Studio preview. For Candidate Profile templates, choose Candidate and paste a candidate slug (e.g. janet-mills/us-senate-maine). For location templates, choose Place. Position Slug is only needed for Position and Position Candidates templates.',
	fields: [
		{
			...field_electionTargetType,
			name: 'field_electionTargetType',
			title: 'Preview Target Type',
			description:
				'Candidate Profile → Candidate. Location pages → Place. Position / candidates list → Place (plus Position Slug below) or leave Place with a state/county/city slug.',
			options: {
				list: [
					{ title: 'Place (state, county, city, district slug)', value: 'place' },
					{ title: 'Position (race slug)', value: 'position' },
					{ title: 'Candidate (candidate slug)', value: 'candidate' },
				],
				layout: 'radio',
			},
		},
		{
			...field_electionTargetSlug,
			name: 'field_electionTargetSlug',
			title: 'Preview Slug',
			description:
				'Examples: place `ny`, `wi/adams-county`, `wi/adams-county/adams`, `mn/minneapolis-public-school-district`; candidate `janet-mills/us-senate-maine`.',
		},
		{
			name: 'field_positionSlug',
			title: 'Position Slug (optional)',
			type: 'string',
			description: 'URL position segment for Position or Position Candidates preview, e.g. `governor`.',
			hidden: ({ document }: { document?: PreviewDoc }) => {
				const templateType = document?.field_electionTemplateType;
				return templateType !== 'position' && templateType !== 'positionCandidates';
			},
		},
	],
};
