import type { ReactNode } from 'react';
import { cn, tv } from './_lib/utils.ts';
import type { componentColorValues } from './_lib/designTypesStore.ts';
import { Author, type AuthorProps } from './Author.tsx';
import { ResponsiveImage } from './ResponsiveImage.tsx';
import { PlainText } from '~/ui/PlainText.tsx';

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
					<svg
						className='absolute bottom-0 right-0 w-20 h-[3.75rem] md:w-[6.25rem] md:h-[4.6875rem]'
						width='100'
						height='75'
						viewBox='0 0 100 75'
						fill='none'
						xmlns='http://www.w3.org/2000/svg'
					>
						<path
							d='M50.006 66.581c16.347-7.946 27.199-16.863 32.74-26.011 4.664-7.762 5.265-15.293 2.31-21.53-2.68-5.637-8.082-9.656-14.362-10.719-6.696-1.109-13.484 1.248-18.84 7.115L49.96 17.47l-1.893-2.033c-5.403-5.867-12.191-8.224-18.84-7.115-6.235 1.017-11.684 5.082-14.362 10.719-2.955 6.19-2.355 13.768 2.309 21.53 5.541 9.148 16.393 18.065 32.74 26.011h.092Z'
							fill='#fff'
						/>
						<path
							fillRule='evenodd'
							clipRule='evenodd'
							d='M50.007 12.941C44.05 6.704 36.384 4.024 28.765 5.318c-7.25 1.201-13.53 5.867-16.67 12.428-3.464 7.346-2.632 16.032 2.493 24.44 5.957 9.888 17.456 19.128 34.08 27.167l1.339.647 1.339-.647c16.624-8.085 28.076-17.325 34.079-27.166 5.08-8.41 5.957-17.095 2.494-24.441-3.14-6.607-9.42-11.227-16.67-12.428-7.62-1.248-15.285 1.386-21.242 7.623Zm-4.203 4.666c-4.756-5.174-10.528-7.068-16.07-6.144-5.264.877-9.835 4.296-12.052 8.963-2.401 5.082-2.078 11.504 2.17 18.573 4.942 8.177 14.777 16.494 30.109 24.117 15.33-7.623 25.12-15.94 30.108-24.117 4.294-7.07 4.571-13.491 2.17-18.573-2.217-4.713-6.788-8.086-12.053-8.963-5.54-.924-11.313.97-16.07 6.144l-4.155 4.528-4.157-4.528Z'
							fill='#DC1438'
						/>
						<path
							d='m48.344 44.266-4.433 2.31a.95.95 0 0 1-1.247-.37.88.88 0 0 1-.092-.6l.831-4.852c.185-1.155-.185-2.31-1.016-3.095l-3.602-3.465a.893.893 0 0 1 0-1.294c.139-.139.324-.23.555-.277l4.987-.693c1.154-.185 2.17-.878 2.678-1.94l2.216-4.436a.925.925 0 0 1 1.247-.416.906.906 0 0 1 .416.416L53.1 29.99c.508 1.017 1.524 1.756 2.679 1.94l4.987.694c.508.092.877.554.785 1.016 0 .185-.139.37-.277.509l-3.602 3.465c-.831.785-1.247 1.986-1.016 3.095l.831 4.851a.902.902 0 0 1-.739 1.063c-.184 0-.415 0-.6-.092l-4.433-2.31c-1.062-.555-2.309-.555-3.325 0l-.046.046Z'
							fill='#0048C2'
						/>
					</svg>
				</div>
				{props.copy && <PlainText as='blockquote' styleType='subtitle-2' text={props.copy} className='text-center font-normal ' />}
			</div>
			{props.author && <Author alignment='left' name={props.author.name} meta={props.author.meta} />}
		</div>
	);
}
