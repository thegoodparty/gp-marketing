import { cn, tv } from './_lib/utils.ts';

const styles = tv({
	slots: {
		item: 'transition-all duration-fast ease-smooth before:bottom-0 before:left-0 before:right-0 before:top-0 before:absolute before:content[""]',
	},
	variants: {
		active: {
			true: {
				item: 'opacity-100 w-[4.5rem]',
			},
			false: {
				item: 'opacity-20 w-8 group-hover:cursor-pointer group-hover:opacity-100',
			},
		},
		color: {
			midnight: {
				item: 'bg-white',
			},
			cream: {
				item: 'bg-midnight-900',
			},
		},
	},
});

export type CarouselIndicatorProps = {
	active?: boolean;
	className?: string;
	onClick: () => void;
	color?: 'midnight' | 'cream';
};

export function CarouselIndicator(props: CarouselIndicatorProps) {
	const color = props.color ?? 'cream';
	const { item } = styles({ active: props.active, color });

	return (
		<div className={cn('group relative px-1 py-4', props.className)} onClick={props.onClick} data-component='CarouselIndicator'>
			<div className={`h-2 rounded-full ${item()}`} />
		</div>
	);
}
