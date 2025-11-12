import { cn, tv } from './_lib/utils.ts';

import { Anchor } from './Anchor.tsx';
import { Text } from './Text.tsx';
import { IconResolver } from './IconResolver.tsx';

const styles = tv({
	slots: {
		base: 'relative after:content[""] after:absolute after:inset-0 after:rounded-2xl after:transition-transform after:duration-normal after:ease-smooth after:z-0 after:pointer-events-none hover:after:scale-[1.025] cursor-pointer',
	},
	variants: {
		color: {
			red: {
				base: 'after:bg-goodparty-red-light',
			},
			waxflower: {
				base: 'after:bg-waxflower-200',
			},
			'bright-yellow': {
				base: 'after:bg-bright-yellow-200',
			},
			'halo-green': {
				base: 'after:bg-halo-green-200',
			},
			blue: {
				base: 'after:bg-blue-200',
			},
			lavender: {
				base: 'after:bg-lavender-200',
			},
			midnight: {
				base: 'after:bg-midnight-900 text-white',
			},
			cream: {
				base: 'after:bg-goodparty-cream',
			},
		},
	},
});

export type CTACardProps = {
	className?: string;
	color?: any;
	href?: string;
	label?: string;
	title?: string;
};

export function CTACard(props: CTACardProps) {
	const color = props.color ?? 'red';
	const { base } = styles({ color });

	return (
		<article className={cn(base(), props.className)} data-component='CTACard'>
			<div className='p-6 md:p-10 relative flex flex-col gap-16 z-1 md:gap-40'>
				{props.label && (
					<Text as='span' styleType='subtitle-2'>
						{props.label}
					</Text>
				)}

				<Anchor
					className={`flex justify-between items-end gap-8 before:content[""] before:absolute before:inset-0 group/button`}
					href={props.href}
				>
					<Text as='h2' styleType='heading-lg'>
						{props.title}
					</Text>
					<IconResolver icon='arrow-up-right' size='lg' />
				</Anchor>
			</div>
		</article>
	);
}
