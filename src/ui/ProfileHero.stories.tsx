import type { Meta, StoryObj } from '@storybook/react';
import { ProfileHero } from './ProfileHero.tsx';
import { customProfileImage } from './_data/media.tsx';
import { PROFILE_HERO_INTRO_DEFAULTS } from '~/lib/profileHeroDefaults';

const FIGMA_DESKTOP = 'https://www.figma.com/design/uiXjaG81QXkT0Swu0OiM5V/Elections---Voter-Guide?node-id=2139-26365';
const FIGMA_MOBILE = 'https://www.figma.com/design/uiXjaG81QXkT0Swu0OiM5V/Elections---Voter-Guide?node-id=2139-26635';

const meta: Meta<typeof ProfileHero> = {
	title: 'New Components/Page Sections/Profile Hero',
	component: ProfileHero,
	render: args => <ProfileHero {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

const intro = (name: string, subject: 'candidate' | 'officeholder' = 'candidate') =>
	PROFILE_HERO_INTRO_DEFAULTS[subject].replace('[candidate name]', name);

/** Figma 2139:26364: a claimed candidate who took the pledge. */
const Default = {
	args: {
		backgroundColor: 'midnight' as const,
		candidateName: 'DeVelle Jackson',
		office: "Candidate U.S. Congress - Minnesota's 5th Congressional District",
		tags: ['Candidate'],
		intro: intro('DeVelle Jackson'),
		profileImage: customProfileImage(),
		attribution: 'pledged' as const,
		showBrandMark: true,
	},
	parameters: {
		design: {
			type: 'figma',
			url: FIGMA_DESKTOP,
		},
	},
};

export const DefaultStory: Story = {
	args: {
		...Default.args,
	},
	parameters: {
		...Default.parameters,
	},
};

/** Figma 2156:34361: unclaimed, has not taken the pledge. No portrait mark, no mark in the callout. */
export const NotPledged: Story = {
	args: {
		...Default.args,
		candidateName: 'Jordan Avery',
		intro: intro('Jordan Avery'),
		profileImage: undefined,
		attribution: 'notPledged',
		showBrandMark: false,
	},
	parameters: {
		...Default.parameters,
	},
};

/** A major-party candidate: ineligible, so the callout says why. No frame; the wording is marketing's (Emily, 2026-10-06). */
export const Ineligible: Story = {
	args: {
		...Default.args,
		candidateName: 'Jordan Avery',
		intro: intro('Jordan Avery'),
		profileImage: undefined,
		attribution: 'pledgeIneligible',
		showBrandMark: false,
	},
	parameters: {
		...Default.parameters,
	},
};

/** Someone who holds office: "elected official" in the callout and "public service" in the intro. */
export const ElectedOfficial: Story = {
	args: {
		...Default.args,
		candidateName: 'Tracy Good',
		office: 'Springfield City Council',
		tags: ['Incumbent'],
		intro: intro('Tracy Good', 'officeholder'),
		attribution: 'notPledged',
		pledgeSubject: 'elected official',
		showBrandMark: true,
	},
	parameters: {
		...Default.parameters,
	},
};

/** Serving and running at once (Figma state C): two office lines, candidate wording. */
export const ServingAndRunning: Story = {
	args: {
		...Default.args,
		candidateName: 'Susan Overman',
		office: 'Springfield City Council',
		secondaryOffice: 'Candidate for Mayor of Springfield',
		tags: ['Incumbent', 'Candidate'],
		intro: intro('Susan Overman'),
	},
	parameters: {
		...Default.parameters,
	},
};

export const CreamBackground: Story = {
	args: {
		...Default.args,
		backgroundColor: 'cream',
	},
	parameters: {
		...Default.parameters,
	},
};

export const LongName: Story = {
	args: {
		...Default.args,
		candidateName: 'Maria Hernandez-Rodriguez Williams',
		office: 'State Representative for District 42, Cook County',
		intro: intro('Maria Hernandez-Rodriguez Williams'),
	},
	parameters: {
		...Default.parameters,
	},
};

/** The legacy /candidate framing: no intro, no callout, the "Empowered by GoodParty.org" line. */
export const LegacyEmpowered: Story = {
	args: {
		backgroundColor: 'midnight',
		candidateName: 'Jhon Doe',
		office: 'Mayor of Chicago',
		profileImage: customProfileImage(),
		isEmpowered: true,
	},
	parameters: {
		...Default.parameters,
	},
};

export const Mobile: Story = {
	args: {
		...Default.args,
	},
	parameters: {
		design: {
			type: 'figma',
			url: FIGMA_MOBILE,
		},
	},
	globals: {
		viewport: { value: 'iphone', isRotated: false },
	},
};

export const MobileNotPledged: Story = {
	args: {
		...NotPledged.args,
	},
	parameters: {
		...Mobile.parameters,
	},
	globals: {
		viewport: { value: 'iphone', isRotated: false },
	},
};
