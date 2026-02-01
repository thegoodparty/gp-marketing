import { cn, tv } from './_lib/utils.ts';
import { Text } from './Text.tsx';
import { ComponentButton, type ComponentButtonProps } from './Inputs/Button.tsx';

const styles = tv({
	slots: {
		base: 'flex flex-col gap-6 p-6 bg-white rounded-xl',
		section: 'flex flex-col gap-4',
		label: '',
		value: '',
	},
});

export type ElectionsSidebarProps = {
	className?: string;
	officeName?: string;
	filingPeriodStart?: string;
	filingPeriodEnd?: string;
	cta?: ComponentButtonProps;
};

export function ElectionsSidebar(props: ElectionsSidebarProps) {
	const { base, section, label, value } = styles();

	return (
		<aside className={cn(base(), props.className)} data-component='ElectionsSidebar'>
			{props.officeName && (
				<div className={section()}>
					<Text as='h3' styleType='heading-sm'>
						{props.officeName}
					</Text>
				</div>
			)}
			{(props.filingPeriodStart || props.filingPeriodEnd) && (
				<dl className={section()}>
					<Text as='dt' styleType='subtitle-2' className={label()}>
						Filing Period
					</Text>
					<Text as='dd' styleType='body-2' className={value()}>
						{props.filingPeriodStart && props.filingPeriodEnd
							? `${props.filingPeriodStart} - ${props.filingPeriodEnd}`
							: props.filingPeriodStart || props.filingPeriodEnd}
					</Text>
				</dl>
			)}
			{props.cta && (
				<div className={section()}>
					<ComponentButton {...props.cta} className='w-full' />
				</div>
			)}
		</aside>
	);
}
