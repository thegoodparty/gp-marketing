import type { ReactNode } from 'react';
import { cn, tv } from './_lib/utils.ts';
import type { componentColorValues } from './_lib/designTypesStore.ts';
import { Author, type AuthorProps } from './Author.tsx';
import { ResponsiveImage } from './ResponsiveImage.tsx';
import { PlainText } from '~/ui/PlainText.tsx';
import { Logo } from '~/sanity/utils/Logo.tsx';

const styles = tv({
	slots: {
		base: 'rounded-[2rem] flex flex-col gap-[2rem] p-[1.5rem] md:p-[3rem] h-full justify-between',
		media: 'rounded-full overflow-hidden w-[14rem] h-[14rem] md:w-64 md:h-64',
	},
	variants: {
		color: {
			red: {
				base: 'bg-red-100',
				media: 'bg-red-50',
			},
			waxflower: {
				base: 'bg-waxflower-100',
				media: 'bg-waxflower-50',
			},
			'bright-yellow': {
				base: 'bg-bright-yellow-100',
				media: 'bg-bright-yellow-50',
			},
			'halo-green': {
				base: 'bg-halo-green-100',
				media: 'bg-halo-green-50',
			},
			blue: {
				base: 'bg-blue-100',
				media: 'bg-blue-50',
			},
			lavender: {
				base: 'bg-lavender-100',
				media: 'bg-lavender-50',
			},
		},
	},
});

export type TestimonialImageCardProps = {
	author?: AuthorProps;
	className?: string;
	color?: Exclude<(typeof componentColorValues)[number], 'inverse' | 'midnight' | 'cream'>;
	copy?: ReactNode;
};

export function TestimonialImageCard(props: TestimonialImageCardProps) {
	const color = props.color ?? 'red';
	const { base, media } = styles({ color });

	return (
		<div className={cn(base(), props.className)} data-component='TestimonialImageCard'>
			<div className='flex flex-col gap-6 lg:gap-8'>
				<div className='relative self-center'>
					<div className={media()}>{props.author?.image && <ResponsiveImage image={props.author?.image} />}</div>
					<Logo
						width={100}
						height={75}
						className='absolute bottom-0 right-0 w-20 h-[3.75rem] md:w-[6.25rem] md:h-[4.6875rem]'
					/>
				</div>
				{props.copy && <PlainText as='blockquote' styleType='subtitle-2' text={props.copy} className='text-center font-normal ' />}
			</div>
			{props.author && <Author alignment='left' name={props.author.name} meta={props.author.meta} />}
		</div>
	);
}
