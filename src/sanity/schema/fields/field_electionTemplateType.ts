export const ELECTION_TEMPLATE_TYPES = [
	{ title: 'Location - State', value: 'locationState' },
	{ title: 'Location - County', value: 'locationCounty' },
	{ title: 'Location - City', value: 'locationCity' },
	{ title: 'Location - District', value: 'locationDistrict' },
	{ title: 'Position page', value: 'position' },
	{ title: 'Position candidates list', value: 'positionCandidates' },
	{ title: 'Candidate profile', value: 'candidateProfile' },
] as const;

export type ElectionTemplateTypeValue = (typeof ELECTION_TEMPLATE_TYPES)[number]['value'];

export const field_electionTemplateType = {
	name: 'field_electionTemplateType',
	title: 'Template Type',
	type: 'string',
	description:
		'Which election page family this template applies to. Custom templates override the global default for matching places, positions, or candidates.',
	options: {
		list: [...ELECTION_TEMPLATE_TYPES],
	},
	validation: (rule: { required(): unknown }) => rule.required(),
};

export const field_electionTargetType = {
	name: 'field_electionTargetType',
	title: 'Target Type',
	type: 'string',
	options: {
		list: [
			{ title: 'Place (state, county, city, district slug)', value: 'place' },
			{ title: 'Position (race slug)', value: 'position' },
			{ title: 'Candidate (candidate slug)', value: 'candidate' },
		],
	},
	validation: (rule: { required(): unknown }) => rule.required(),
};

export const field_electionTargetSlug = {
	name: 'field_electionTargetSlug',
	title: 'Target Slug',
	type: 'string',
	description:
		'API slug used for matching. Examples: place `ny`, `ny/kings`, `ny/kings/brooklyn`; position race slug; candidate profile slug.',
	validation: (rule: { required(): unknown }) => rule.required(),
};
