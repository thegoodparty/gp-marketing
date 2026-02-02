import type { Meta, StoryObj } from '@storybook/react';
import { ElectionsPositionContentBlock } from './ElectionsPositionContentBlock.tsx';

const meta: Meta<typeof ElectionsPositionContentBlock> = {
	title: 'New Components/Page Sections/Elections Position Content Block',
	component: ElectionsPositionContentBlock,
	render: args => <ElectionsPositionContentBlock {...args} />,
	parameters: {
		layout: 'fullscreen',
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
					styleType: 'primary',
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
					styleType: 'primary',
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
					styleType: 'primary',
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
					styleType: 'primary',
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
					styleType: 'primary',
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
					styleType: 'primary',
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
