import { transformButtons } from '~/lib/buttonTransformer';
import { goodpartyOrg_404PageQuery } from '~/sanity/groq';
import { sanityFetch } from '~/sanity/sanityClient';
import { HeroBlock } from '~/ui/HeroBlock';

// Render the default Next.js 404 page when a route
// is requested that doesn't match the middleware and
// therefore doesn't have a locale associated with it.

export default async function NotFound() {
	const page = await sanityFetch({ query: goodpartyOrg_404PageQuery });
	return (
		<div className='h-full bg-midnight-900'>
			<HeroBlock
				label={page?.ErrorMessage?.field_label ?? '404 Error'}
				title={page?.ErrorMessage?.field_title ?? 'Oh dear. Something went wrong.'}
				copy={
					page?.ErrorMessage?.field_summaryDescription ??
					'You can try to reload the page you were visiting or head back to the homepage.'
				}
				buttons={
					page?.ErrorMessage?.list_buttons
						? transformButtons(page?.ErrorMessage?.list_buttons)
						: [
								{
									label: 'Visit Homepage',
									buttonType: 'internal',
									href: '/',
								},
							]
				}
				backgroundColor='midnight'
			/>
		</div>
	);
}
