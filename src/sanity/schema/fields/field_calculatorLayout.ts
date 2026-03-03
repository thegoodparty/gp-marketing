
export const field_calculatorLayout = {
	name: 'field_calculatorLayout',
	title: 'Calculator Position',
	description: 'Side on which the calculator appears.',
	options: {
		collapsible: false,
		list: [
			{ _key: 'calc-left', _type: 'item', title: 'Calculator Left', value: 'CalculatorLeft' },
			{ _key: 'calc-right', _type: 'item', title: 'Calculator Right', value: 'CalculatorRight' },
		],
	},
	initialValue: 'CalculatorLeft',
	type: 'string',
};
