import type { Meta, StoryObj } from '@storybook/react';

import { LocationEditorialBlock } from './LocationEditorialBlock.tsx';

const meta: Meta<typeof LocationEditorialBlock> = {
	title: 'New Components/Page Sections/Location Editorial Block',
	component: LocationEditorialBlock,
	render: args => <LocationEditorialBlock {...args} />,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/qIOT4lO1nRw4reuj6LjLwn/GoodParty---Marketing-Design-System?node-id=3716-72694',
		},
	},
};

export default meta;

type Story = StoryObj<typeof meta>;

const paragraphs = [
	'Tucson sits in Pima County, where city council seats are elected by ward and the mayor is elected citywide. Local turnout in off-cycle years runs well below the presidential-year figure, so a small number of votes carries unusual weight in a ward race.',
	'Alongside the city offices, Tucson voters also decide school board seats and county-wide offices such as sheriff and recorder. Filing windows for those races open at different times, so a candidate weighing a first run has more than one entry point in a given cycle.',
];

export const Default: Story = {
	args: {
		backgroundColor: 'cream',
		heading: 'More about Tucson',
		copy: paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>),
	},
};

export const SingleParagraph: Story = {
	args: {
		backgroundColor: 'cream',
		heading: 'More about Arizona',
		copy: <p>{paragraphs[0]}</p>,
	},
};

export const BackgroundMidnight: Story = {
	args: {
		...Default.args,
		backgroundColor: 'midnight',
	},
};

/** No copy from either the page or the CMS: the section renders nothing at all. */
export const NoCopy: Story = {
	args: {
		backgroundColor: 'cream',
		heading: 'More about Tucson',
	},
};
