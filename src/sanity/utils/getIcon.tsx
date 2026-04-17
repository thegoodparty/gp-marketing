import _ from 'lodash';

export function getIcon(code: string) {
	const Icon = () => (
		<svg width='14' height='14' viewBox={'0 0 24 24'} fill={'currentColor'}>
			<use
				href={`/icons/carbon/${_.kebabCase(code).includes('watson-health') ? 'watson-health/' : ''}${_.kebabCase(code).replace('watson-health-', '')}.svg#icon`}
			/>
		</svg>
	);
	Icon.displayName = `CarbonIcon(${code})`;
	return Icon;
}
