import type { Meta, StoryObj } from '@storybook/react';
import { secondaryButtonStyleType } from './_lib/designTypesStore.ts';
import { ElectionsPositionContentBlock } from './ElectionsPositionContentBlock.tsx';

const meta: Meta<typeof ElectionsPositionContentBlock> = {
	title: 'New Components/Page Sections/Elections Position Content Block',
	component: ElectionsPositionContentBlock,
	render: args => <ElectionsPositionContentBlock {...args} />,
	parameters: {
		layout: 'fullscreen',
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/dmMrTWyBirANhArKs5mTmr/GoodParty-Design-System----shadcn-ui?node-id=22621-2&p=f&t=e9DZpFivIUul02My-0',
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		backgroundColor: 'cream',
		card: {
			headline: 'Headline',
			subhead: 'Subhead',
			bodyCopy: ['Body copy', 'Body copy'],
			primaryCTA: {
				buttonType: 'internal',
				href: '/action',
				label: 'Primary CTA',
				buttonProps: {
					styleType: secondaryButtonStyleType,
				},
			},
		},
		topHeadline: 'Headline',
		gridItems: [
			{
				subhead: 'Subhead',
				bodyCopy: 'Body copy',
			},
			{
				subhead: 'Subhead',
				bodyCopy: 'Body copy',
			},
			{
				subhead: 'Subhead',
				bodyCopy: 'Body copy',
			},
			{
				subhead: 'Subhead',
				bodyCopy: 'Body copy',
			},
			{
				subhead: 'Subhead',
				bodyCopy: 'Body copy',
			},
			{
				subhead: 'Subhead',
				bodyCopy: 'Body copy',
			},
		],
		bottomItems: [
			{
				headline: 'Headline',
				bodyCopy: 'Body copy',
			},
			{
				headline: 'Headline',
				bodyCopy: 'Body copy',
			},
		],
		rightColumnCTA: {
			buttonType: 'internal',
			href: '/elections/WY/position/state-representative/candidates',
			label: 'View candidates',
			buttonProps: {
				styleType: secondaryButtonStyleType,
			},
		},
	},
};

export const MidnightBackground: Story = {
	args: {
		backgroundColor: 'midnight',
		card: {
			headline: 'Headline',
			subhead: 'Subhead',
			bodyCopy: ['Body copy', 'Body copy'],
			primaryCTA: {
				buttonType: 'internal',
				href: '/action',
				label: 'Primary CTA',
				buttonProps: {
					styleType: secondaryButtonStyleType,
				},
			},
		},
		topHeadline: 'Headline',
		gridItems: [
			{
				subhead: 'Subhead',
				bodyCopy: 'Body copy',
			},
			{
				subhead: 'Subhead',
				bodyCopy: 'Body copy',
			},
			{
				subhead: 'Subhead',
				bodyCopy: 'Body copy',
			},
		],
		bottomItems: [
			{
				headline: 'Headline',
				bodyCopy: 'Body copy',
			},
			{
				headline: 'Headline',
				bodyCopy: 'Body copy',
			},
		],
		rightColumnCTA: {
			buttonType: 'internal',
			href: '/elections/WY/position/state-representative/candidates',
			label: 'View candidates',
			buttonProps: {
				styleType: secondaryButtonStyleType,
			},
		},
	},
};

export const WithoutCard: Story = {
	args: {
		backgroundColor: 'cream',
		topHeadline: 'Headline',
		gridItems: [
			{
				subhead: 'Subhead',
				bodyCopy: 'Body copy',
			},
			{
				subhead: 'Subhead',
				bodyCopy: 'Body copy',
			},
			{
				subhead: 'Subhead',
				bodyCopy: 'Body copy',
			},
		],
		bottomItems: [
			{
				headline: 'Headline',
				bodyCopy: 'Body copy',
			},
		],
	},
};

export const WithoutGridItems: Story = {
	args: {
		backgroundColor: 'cream',
		card: {
			headline: 'Headline',
			subhead: 'Subhead',
			bodyCopy: 'Body copy',
			primaryCTA: {
				buttonType: 'internal',
				href: '/action',
				label: 'Primary CTA',
				buttonProps: {
					styleType: secondaryButtonStyleType,
				},
			},
		},
		topHeadline: 'Headline',
		bottomItems: [
			{
				headline: 'Headline',
				bodyCopy: 'Body copy',
			},
			{
				headline: 'Headline',
				bodyCopy: 'Body copy',
			},
		],
	},
};

export const WithoutBottomItems: Story = {
	args: {
		backgroundColor: 'cream',
		card: {
			headline: 'Headline',
			subhead: 'Subhead',
			bodyCopy: ['Body copy', 'Body copy'],
			primaryCTA: {
				buttonType: 'internal',
				href: '/action',
				label: 'Primary CTA',
				buttonProps: {
					styleType: secondaryButtonStyleType,
				},
			},
		},
		topHeadline: 'Headline',
		gridItems: [
			{
				subhead: 'Subhead',
				bodyCopy: 'Body copy',
			},
			{
				subhead: 'Subhead',
				bodyCopy: 'Body copy',
			},
			{
				subhead: 'Subhead',
				bodyCopy: 'Body copy',
			},
		],
	},
};

export const MinimalContent: Story = {
	args: {
		backgroundColor: 'cream',
		card: {
			headline: 'Headline',
			bodyCopy: 'Body copy',
		},
		topHeadline: 'Headline',
		gridItems: [
			{
				subhead: 'Subhead',
				bodyCopy: 'Body copy',
			},
		],
	},
};

export const SingleBodyCopy: Story = {
	args: {
		backgroundColor: 'cream',
		card: {
			headline: 'Headline',
			subhead: 'Subhead',
			bodyCopy: 'Single body copy text',
			primaryCTA: {
				buttonType: 'internal',
				href: '/action',
				label: 'Primary CTA',
				buttonProps: {
					styleType: secondaryButtonStyleType,
				},
			},
		},
		topHeadline: 'Headline',
		gridItems: [
			{
				subhead: 'Subhead',
				bodyCopy: 'Body copy',
			},
			{
				subhead: 'Subhead',
				bodyCopy: 'Body copy',
			},
			{
				subhead: 'Subhead',
				bodyCopy: 'Body copy',
			},
		],
		bottomItems: [
			{
				headline: 'Headline',
				bodyCopy: 'Body copy',
			},
		],
	},
};

export const ExternalButton: Story = {
	args: {
		backgroundColor: 'cream',
		card: {
			headline: 'Headline',
			subhead: 'Subhead',
			bodyCopy: ['Body copy', 'Body copy'],
			primaryCTA: {
				buttonType: 'external',
				href: 'https://example.com',
				label: 'Visit External Site',
				buttonProps: {
					styleType: secondaryButtonStyleType,
				},
			},
		},
		topHeadline: 'Headline',
		gridItems: [
			{
				subhead: 'Subhead',
				bodyCopy: 'Body copy',
			},
			{
				subhead: 'Subhead',
				bodyCopy: 'Body copy',
			},
			{
				subhead: 'Subhead',
				bodyCopy: 'Body copy',
			},
		],
		bottomItems: [
			{
				headline: 'Headline',
				bodyCopy: 'Body copy',
			},
		],
	},
};
