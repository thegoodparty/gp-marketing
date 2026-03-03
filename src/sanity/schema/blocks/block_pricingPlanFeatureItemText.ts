import * as React from 'react';

import { getIcon } from '../../utils/getIcon';

import '../../styles/studio.css';

export const block_pricingPlanFeatureItemText = {
	name: 'block_pricingPlanFeatureItemText',
	title: 'Pricing Plan Feature Item Text',
	description: 'The text that appears for a single feature on a pricing card.',
	options: {
		collapsible: false,
	},
	type: 'array',
	of: [
		{
			type: 'block',
			styles: [
				{ title: 'Normal', value: 'normal' },
				{ title: 'H1', value: 'h1' },
				{ title: 'H2', value: 'h2' },
				{ title: 'H3', value: 'h3' },
				{ title: 'H4', value: 'h4' },
				{ title: 'H5', value: 'h5' },
				{ title: 'H6', value: 'h6' },
				{ title: 'Quote', value: 'blockquote' },
			],
			lists: [
				{ title: 'Bullet', value: 'bullet' },
				{ title: 'Numbered', value: 'number' },
				{
					title: 'Checked',
					value: 'checked',
					icon: getIcon('ListChecked'),
					component: function CheckedDecorator(props) {
						return React.createElement(
							'span',
							{
								className: 'custom-list-checked',
							},
							props.children,
						);
					},
				},
			],
			of: [],
			marks: {
				decorators: [
					{ title: 'Strong', value: 'strong' },
					{ title: 'Emphasis', value: 'em' },
					{ title: 'Underline', value: 'underline' },
					{ title: 'Strike', value: 'strike-through' },
					{
						title: 'Highlight',
						value: 'highlight',
						icon: getIcon('PaintBrushAlt'),
						component: function HighlightDecorator(props) {
							return React.createElement(
								'span',
								{
									style: {
										backgroundColor: '#fff3a0',
									},
								},
								props.children,
							);
						},
					},
				],
				annotations: [
					{
						type: 'inlineFeaturesItem',
						name: 'inlineFeaturesItem',
					},
				],
			},
		},
	],
};
