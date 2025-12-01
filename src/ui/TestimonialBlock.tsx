import { tv } from './_lib/utils.ts';

import { colorTypeValues, type backgroundTypeValues } from './_lib/designTypesStore.ts';

import { Container } from './Container.tsx';
import { Testimonial, type TestimonialProps } from './Testimonial.tsx';
import { HeaderBlock, type HeaderBlockProps } from './HeaderBlock.tsx';
import { shuffleArray } from '~/ui/_lib/shuffleArray.ts';

const styles = tv({
	slots: {
		base: 'py-[calc(var(--container-padding))]',
		wrapper: 'flex flex-col gap-12 md:gap-20',
	},
	variants: {
		backgroundColor: {
			midnight: 'bg-midnight-900',
			cream: 'bg-goodparty-cream',
		},
	},
});

export type TestimonialBlockProps = {
	backgroundColor?: (typeof backgroundTypeValues)[number];
	items: TestimonialProps[];
	header?: HeaderBlockProps;
};

export function TestimonialBlock(props: TestimonialBlockProps) {
	const backgroundColor = props.backgroundColor ?? 'cream';
	const { base, wrapper } = styles({ backgroundColor });

	const colors = shuffleArray(colorTypeValues.filter(color => color !== 'inverse'));

	while (colors.length < (props.items?.length ?? 0)) {
		colors.push(...colors);
	}

	return (
		<article className={base()} data-component='TestimonialBlock'>
			<Container size='xl'>
				<div className={wrapper()}>
					<HeaderBlock {...props.header} backgroundColor={backgroundColor} />
					{props.items && props.items.length > 0 && (
						<div className='flex flex-wrap justify-center gap-6 lg:gap-8'>
							{props.items?.map((item, index) => {
								const isTwoItems = props.items.length === 2;

								return (
									<Testimonial
										{...item}
										key={index}
										color={colors[index]}
										className={`
											grow-0 shrink-0 basis-full /* 1 col by default */
											sm:basis-[calc((100%-1.5rem)/2)] /* 2 cols, gap-6 = 1.5rem, so (100% - 1*gap)/2 */
											${isTwoItems ? 'md:basis-[calc((100%-3rem)/2)]' : 'md:basis-[calc((100%-3rem)/3)]'}  /* 2 or 3 cols, two gaps of 1.5rem -> 3rem total */
											lg:basis-[calc((100%-4rem)/3)] /* 3 cols, two gaps of 2rem -> 4rem total */
										`}
									/>
								);
							})}
						</div>
					)}
				</div>
			</Container>
		</article>
	);
}
