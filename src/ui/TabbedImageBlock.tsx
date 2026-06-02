'use client';
import { tv } from '~/ui/_lib/utils';
import { Container } from '~/ui/Container';
import { HeaderBlock, type HeaderBlockProps } from '~/ui/HeaderBlock';
import { ComponentButton, type ComponentButtonProps } from '~/ui/Inputs/Button';
import type { SanityImage } from '~/ui/types';
import { Text } from '~/ui/Text';
import { PlainText } from '~/ui/PlainText';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'motion/react';
import { Media } from '~/ui/Media';
import { resolveButtonStyleType } from '~/ui/_lib/resolveButtonStyleType';

const styles = tv({
	slots: {
		base: '',
		text: 'text-black',
	},
	variants: {
		backgroundColor: {
			midnight: { base: 'bg-midnight-900 text-white', text: 'text-white fill-white border-white/50' },
			cream: { base: 'bg-goodparty-cream text-midnight-900', text: 'text-midnight-900 fill-midnight-900 border-midnight-900/50' },
		},
	},
});

type TabbedImageBlockProps = {
	header?: HeaderBlockProps;
	backgroundColor?: 'cream' | 'midnight';
	items: {
		_key?: string;
		title: string;
		copy?: string;
		button?: ComponentButtonProps;
		image?: SanityImage;
		showFullImage?: boolean;
	}[];
};

export function TabbedImageBlock(props: TabbedImageBlockProps) {
	const ref = useRef(null);
	const inView = useInView(ref);
	const backgroundColor = props.backgroundColor ?? 'cream';
	const { base } = styles({ backgroundColor });
	const [activeItem, setActiveItem] = useState<number>(0);

	function handleActiveItem(index?: number) {
		let currentIndex = index;
		if (!inView) return;

		if (currentIndex === undefined) {
			currentIndex = activeItem;
		}
		if (currentIndex + 1 >= props.items?.length) {
			setActiveItem(0);
		} else {
			setActiveItem(currentIndex + 1);
		}
	}

	useEffect(() => {
		if (!inView) return;

		handleActiveItem();
	}, [inView]);

	return (
		<div className={base()}>
			<Container ref={ref} className='flex flex-col gap-[3rem] md:gap-[5rem] py-[calc(var(--container-padding))]' size='xl'>
				{props.header && <HeaderBlock {...props.header} backgroundColor={backgroundColor} />}
				<div className='grid md:grid-cols-2 gap-[2.5rem]'>
					<div className='flex flex-col gap-4'>
						{props.items?.map((item, index) => {
							const resolvedStyle = resolveButtonStyleType('min-ghost', backgroundColor);
							return (
								<div key={item._key} className='relative grid grid-cols-[1px_auto] gap-6'>
									<ProgressBar
										active={activeItem === index}
										setNextActiveItem={() => handleActiveItem(index)}
										backgroundColor={backgroundColor}
									/>
									<div className='flex flex-col gap-[0.5rem] py-4 px-6'>
										<Text as='div' styleType='subtitle-2'>
											{item.title}
										</Text>
										{item.copy && <PlainText as='div' text={item.copy} styleType='body-2' className='font-normal' />}
										{item.button && (
											<ComponentButton
												{...item.button}
												buttonProps={{ ...(item.button?.buttonProps ?? {}), styleType: resolvedStyle }}
												className={`max-sm:w-full w-fit before:content[""] before:absolute before:inset-0 hover:opacity-100 ${activeItem === index ? 'opacity-100' : 'opacity-0'} transition-opacity duration-normal ease-smooth`}
											/>
										)}
									</div>
								</div>
							);
						})}
					</div>
					<AnimatePresence initial={false} mode='popLayout'>
						<motion.div
							key={activeItem}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.4, ease: 'easeInOut' }}
						>
							<Media
								image={props.items[activeItem]?.image}
								aspectRatio='4:3'
								className='overflow-hidden'
								objectFit={props.items[activeItem]?.showFullImage ? 'contain' : 'cover'}
							/>
						</motion.div>
					</AnimatePresence>
				</div>
			</Container>
		</div>
	);
}

type ProgressBarProps = {
	active: boolean;
	setNextActiveItem(): void;
	backgroundColor: 'cream' | 'midnight';
};

export function ProgressBar(props: ProgressBarProps) {
	const { active, backgroundColor } = props;
	return (
		<div className={`h-full w-1 rounded ${backgroundColor === 'cream' ? 'bg-black/10' : 'bg-white/10'} overflow-hidden`}>
			<motion.div
				className={`h-full ${backgroundColor === 'cream' ? 'bg-black' : 'bg-white'} origin-top`}
				initial={{ scaleY: 0, opacity: 1 }}
				animate={{ scaleY: active ? 1 : 0, opacity: active ? 1 : 0 }}
				transition={{
					scaleY: { duration: active ? 3 : 0, delay: active ? 0 : 0.4 },
					opacity: { duration: active ? 0 : 0.4 },
				}}
				onAnimationComplete={e => {
					if (e?.['scaleY'] === 1) {
						props.setNextActiveItem();
					}
				}}
				style={{ transformOrigin: 'top' }}
			/>
		</div>
	);
}
