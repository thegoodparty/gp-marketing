import { Fragment, type PropsWithChildren } from 'react';
import { isValidRichText } from '~/ui/_lib/isValidRichText';
import { Container } from '~/ui/Container';
import type { FeaturedBlogBlockProps } from '~/ui/FeaturedBlogBlock';
import { IconResolver } from '~/ui/IconResolver';
import { ComponentButton } from '~/ui/Inputs/Button';
import { Media } from '~/ui/Media';
import { Text } from '~/ui/Text';
import { ShareLinks } from './ShareLinks';

export type EditorialLayoutProps = PropsWithChildren<{
	navigation?: { title?: string; href?: string; items: { title: string; href: string }[] }[];
	stickyRelatedArticle?: FeaturedBlogBlockProps;
}>;

export function EditorialLayout(props: EditorialLayoutProps) {
	return (
		<Container
			data-group='EditorialLayout'
			size='xl'
			as='div'
			className='relative grid lg:grid-cols-[1.1fr_3fr] gap-16 py-(--container-padding) bg-goodparty-cream '
		>
			<div data-group='EditorialLayoutSidebar' className='flex flex-col gap-8'>
				{props.navigation && props.navigation.length > 0 && <Navigation navigation={props.navigation} />}
				<div className='sticky top-28 flex flex-col gap-8'>
					<ShareLinks />
					{props.stickyRelatedArticle && props.stickyRelatedArticle.title && <StickyRelatedArticle {...props.stickyRelatedArticle} />}
				</div>
			</div>
			<div>{props.children}</div>
		</Container>
	);
}

function Navigation(props: { navigation: { title?: string; href?: string; items: { title: string; href: string }[] }[] }) {
	return (
		<div className='bg-lavender-100 p-8 rounded-[0.5rem] w-full flex flex-col gap-4'>
			<Text as='div' styleType='text-xl' className='font-semibold'>
				In this article
			</Text>
			{props.navigation.map((title, i) => {
				return (
					<Fragment key={`navigation-item-title-${i}-${title.title}`}>
						<Text as='a' href={title.href} styleType='text-875' className='font-secondary'>
							{title.title}
						</Text>
						{title.items && title.items.length > 0 && (
							<div className='flex flex-col gap-2'>
								{title.items.map((subtitle, j) => {
									return (
										<div key={j} className='flex items-center gap-1 font-secondary'>
											<IconResolver icon='dot' className='size-4' />
											<Text as='a' key={`navigation-item-subtitle-${j}-${subtitle.title}`} href={subtitle.href} styleType='text-875'>
												{subtitle.title}
											</Text>
										</div>
									);
								})}
							</div>
						)}
					</Fragment>
				);
			})}
		</div>
	);
}

function StickyRelatedArticle(props: FeaturedBlogBlockProps) {
	return (
		<div className='group relative flex flex-col gap-6 bg-lavender-100 p-8 rounded-[0.5rem] w-full'>
			<Media aspectRatio='4:3' className={'rounded-[0.5rem] overflow-hidden '} image={props.image} />
			<div className='flex flex-col gap-2'>
				{props.title && (
					<Text as='h2' className='font-semibold' styleType='text-xl'>
						{props.title}
					</Text>
				)}
				{isValidRichText(props.copy) && <Text styleType='body-1'>{props.copy}</Text>}
			</div>
			{props.buttons && props.buttons.length > 0 && (
				<div className={`flex flex-wrap gap-4 w-full`}>
					{props.buttons.map((item, index) => {
						return (
							<ComponentButton
								key={index}
								className={`w-full ${index === 0 ? 'before:content-[""] before:absolute before:inset-0' : ''}`}
								{...item}
								buttonProps={{
									...item.buttonProps,
									styleType: 'secondary',
								}}
							/>
						);
					})}
				</div>
			)}
		</div>
	);
}
