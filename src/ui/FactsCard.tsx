import { cn, tv } from './_lib/utils.ts';
import { Text } from './Text.tsx';
import { IconWrapper } from './IconResolver.tsx';

const styles = tv({
	slots: {
		base: 'flex flex-col items-center gap-4 rounded-xl bg-midnight-900 p-6 text-center text-white',
		iconWrapper: 'flex h-16 w-16 items-center justify-center rounded-full bg-lavender-200',
		factIcon: 'h-8 w-8 text-midnight-900',
		content: 'flex flex-col items-center gap-2',
		factLabel: 'font-bold',
		factValue: 'text-neutral-400',
	},
});

/**
 * Icon mapping for fact types to Lucide icon names
 */
const factTypeIcons: Record<string, string> = {
	'largest-city': 'building-2',
	population: 'users',
	density: 'accessibility',
	'median-income': 'banknote',
	'unemployment-rate': 'clipboard-list',
	'average-home-value': 'home',
};

export type FactsCardProps = {
	factType: string;
	label: string;
	value: string;
	icon?: string;
	className?: string;
};

export function FactsCard(props: FactsCardProps) {
	const { base, iconWrapper, factIcon, content, factLabel, factValue } = styles();

	// Use provided icon or derive from factType
	const iconName = props.icon ?? factTypeIcons[props.factType] ?? 'info';

	return (
		<div className={cn(base(), props.className)} data-component='FactsCard'>
			<div className={iconWrapper()}>
				<IconWrapper code={iconName} className={factIcon()} />
			</div>
			<div className={content()}>
				<Text as='span' styleType='subtitle-2' className={factLabel()}>
					{props.label}
				</Text>
				<Text as='span' styleType='body-1' className={factValue()}>
					{props.value}
				</Text>
			</div>
		</div>
	);
}
