import type { SanityImage } from './types';

import { Author, type AuthorProps } from './Author';
import { Container } from './Container';
import { Media } from './Media';
import { Tagline } from './Tagline';
import { Text } from './Text';
import { Breadcrumbs } from './Breadcrumbs';

interface BlogArticleHeroProps {
	title?: string;
	author?: AuthorProps;
	tagline?: string;
	image?: SanityImage;
	breadcrumbs?: { href: string; label: string }[];
}

export const BlogArticleHero = (props: BlogArticleHeroProps) => {
	return (
		<div className='bg-midnight-900 text-white'>
			<Container size='xl' className='py-(--container-padding) flex flex-col gap-12'>
				<Breadcrumbs items={props.breadcrumbs} />
				<div className='grid lg:grid-cols-2 items-center max-lg:gap-8'>
					<div className='flex flex-col gap-6'>
						{props.tagline && <Tagline copy={props.tagline} />}
						{props.title && (
							<Text styleType='heading-lg' as='h1'>
								{props.title}
							</Text>
						)}
						<Author {...props.author} size='sm' className='md:hidden' />
						<Author {...props.author} size='lg' className='max-md:hidden' />
					</div>
					<Media className='[&_img]:rounded-sm' image={props.image} />
				</div>
			</Container>
		</div>
	);
};
