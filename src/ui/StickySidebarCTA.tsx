import { cn, tv } from './_lib/utils.ts';
import { isValidRichText } from './_lib/isValidRichText.ts';
import { secondaryButtonStyleType, type componentColorValues } from './_lib/designTypesStore.ts';
import type { ComponentButtonProps } from './Inputs/Button.tsx';
import { ComponentButton } from './Inputs/Button.tsx';
import { RichData } from './RichData.tsx';
import { Text } from './Text.tsx';

const styles = tv({
	base: 'group relative flex flex-col gap-6 p-8 rounded-[0.5rem] w-full',
	variants: {
		color: {
			red: 'bg-red-100',
			waxflower: 'bg-waxflower-100',
			'bright-yellow': 'bg-bright-yellow-100',
			'halo-green': 'bg-halo-green-100',
			blue: 'bg-blue-100',
			lavender: 'bg-lavender-100',
			midnight: 'bg-midnight-900 text-white',
			cream: 'bg-goodparty-cream',
		},
	},
	defaultVariants: {
		color: 'lavender',
	},
});

export type StickySidebarCTAProps = {
	title?: string;
	label?: string;
	copy?: Parameters<typeof RichData>[0]['value'];
	buttons?: ComponentButtonProps[];
	color?: Exclude<(typeof componentColorValues)[number], 'inverse'>;
};

export function StickySidebarCTA(props: StickySidebarCTAProps) {
	const color = props.color ?? 'lavender';

	return (
		<div data-component='StickySidebarCTA' className={cn(styles({ color }))}>
			<div className='flex flex-col gap-2'>
				{props.label && (
					<Text as='span' styleType='overline' className={color === 'midnight' ? 'text-white/70' : 'text-neutral-500'}>
						{props.label}
					</Text>
				)}
				{props.title && (
					<Text as='h2' className='font-semibold' styleType='text-xl'>
						{props.title}
					</Text>
				)}
				{isValidRichText(props.copy) && (
					<Text styleType='body-1'>
						<RichData value={props.copy} />
					</Text>
				)}
			</div>
			{props.buttons && props.buttons.length > 0 && (
				<div className='flex flex-wrap gap-4 w-full'>
					{props.buttons.map((item, index) => (
						<ComponentButton
							key={item._key ?? index}
							className={cn('w-full', index === 0 && 'before:content-[""] before:absolute before:inset-0')}
							{...item}
							buttonProps={{
								...item.buttonProps,
								styleType: secondaryButtonStyleType,
							}}
						/>
					))}
				</div>
			)}
		</div>
	);
}
