import type { Field_calculatorLayout } from 'sanity.types';

export function resolveCalculatorLayout(
	layout: Field_calculatorLayout | null | undefined,
): 'calculator-left' | 'calculator-right' {
	return layout === 'CalculatorRight' ? 'calculator-right' : 'calculator-left';
}
