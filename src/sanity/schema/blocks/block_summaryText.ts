import * as React from 'react';

import { getIcon } from '../../../sanity/utils/getIcon';

export const block_summaryText = {
	name: 'block_summaryText',
	title: 'Summary Text (Inline Links)',
	description: 'A paragraph of text with the ability to add text links.',
	options: {
		collapsible: false,
	},
	type: 'array',
	of: [
		{
			type: 'block',
			styles: [],
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
						type: 'inlineInternalLink',
						name: 'inlineInternalLink',
					},
					{
						type: 'inlineExternalLink',
						name: 'inlineExternalLink',
					},
					{
						type: 'inlineEmailLink',
						name: 'inlineEmailLink',
					},
				],
			},
		},
	],
};
