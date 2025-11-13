import type { SanityImage } from '~/ui/types';
import { Text } from '~/ui/Text';
import { Media } from '~/ui/Media';
import type { ReactNode } from 'react';
import { isValidRichText } from '~/ui/_lib/isValidRichText';

export type ImageContentCardProps = {
	image?: SanityImage;
	subtitle?: string;
	title?: string;
	copy?: ReactNode;
};

export function ImageContentCard(props: ImageContentCardProps) {
	return (
		<div className='flex flex-col gap-[1.5rem] p-[0.5rem]'>
			<Media image={props.image} aspectRatio='1:1' className='rounded-[1rem] overflow-hidden' />
			<div className='flex flex-col gap-[0.5rem] text-center'>
				<Text as='h3' styleType='heading-sm'>
					{props.title}
				</Text>

				<Text as='div' styleType='subtitle-2' className='font-normal'>
					{props.subtitle}
				</Text>
				{isValidRichText(props.copy) && (
					<Text styleType='body-2' className='font-normal'>
						{props.copy}
					</Text>
				)}
			</div>
		</div>
	);
}
