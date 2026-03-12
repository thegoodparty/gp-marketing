import type { Group_footer } from 'sanity.types';

import { sanityFetch } from '~/sanity/sanityClient';
import { goodpartyOrg_footerQuery } from '~/sanity/groq';
import { Footer } from '~/ui/Footer';

export async function PageFooter(props: { className?: string }) {
	const footer = (await sanityFetch({ query: goodpartyOrg_footerQuery, tags: ['goodpartyOrg_footer'] })) as Group_footer;

	if (!footer) return;

	return (
		<footer className={props.className}>
			<Footer
				copyright={footer.field_copyrightMessage}
				message={footer.field_footerMessage}
				logo={footer.img_logo}
				groupedNav={footer.list_footerNavigation}
				legalNav={footer.list_footerLegalNavigation}
			/>
		</footer>
	);
}
