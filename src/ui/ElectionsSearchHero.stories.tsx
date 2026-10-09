import type { Meta, StoryObj } from '@storybook/react';
import { avatarJpg, imageJpg, imageJpgAlt, imagePng } from './_data/media.tsx';
import { ElectionsSearchHero, type ElectionsSearchHeroSlide } from './ElectionsSearchHero.tsx';

const meta: Meta<typeof ElectionsSearchHero> = {
	title: 'New Components/Page Sections/Elections Search Hero',
	component: ElectionsSearchHero,
	render: args => <ElectionsSearchHero {...args} />,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/uiXjaG81QXkT0Swu0OiM5V/Elections---Voter-Guide?node-id=2143-27957',
		},
	},
};

export default meta;

type Story = StoryObj<typeof meta>;

const slides: ElectionsSearchHeroSlide[] = [
	{
		_key: 'one',
		image: imageJpg(),
		quote: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.',
		author: { name: 'Angel Johnston', meta: ['Three Rivers City Mayor'], image: avatarJpg() },
	},
	{
		_key: 'two',
		image: imageJpgAlt(),
		quote: 'Running as an independent meant I answered to my neighbors, not a party.',
		author: { name: 'Jordan Reyes', meta: ['School Board Trustee'], image: avatarJpg() },
	},
	{
		_key: 'three',
		image: imagePng(),
		quote: 'GoodParty.org helped me reach voters I never could have on my own.',
		author: { name: 'Sam Okafor', meta: ['County Commissioner'], image: avatarJpg() },
	},
];

const baseArgs = {
	headerText: 'Find independent candidates near you',
	bodyCopy: 'Explore upcoming elections near you. Browse candidates, elected officials, and local requirements to run for office.',
	buttonLabel: 'Search',
	slides,
};

export const Default: Story = {
	args: {
		...baseArgs,
		backgroundColor: 'cream',
	},
};

export const Midnight: Story = {
	args: {
		...baseArgs,
		backgroundColor: 'midnight',
	},
};

export const SingleSlide: Story = {
	args: {
		...baseArgs,
		backgroundColor: 'cream',
		slides: slides.slice(0, 1),
	},
};

export const PhotoOnly: Story = {
	args: {
		...baseArgs,
		backgroundColor: 'cream',
		slides: slides.map(slide => ({ _key: slide._key, image: slide.image })),
	},
};

export const NoSlides: Story = {
	args: {
		...baseArgs,
		backgroundColor: 'cream',
		slides: [],
	},
};
