import type { FaqLike } from '~/lib/faqSlugs';
import { getFaqHref } from '~/lib/faqSlugs';
import type { FAQBlockItemProps } from '../FAQBlock';
import { RichData } from '../RichData';

type ResolveFAQItemsOptions = {
	slugMap?: ReadonlyMap<string, string>;
	linksOnly?: boolean;
};

export function resolveFAQItems(items?: any, options?: ResolveFAQItemsOptions) {
	if (!items) return [];

	const faqItems: FAQBlockItemProps[] = [];
	items?.forEach((item: any) => {
		const hasOwnPage = item.faqOverview?.field_articleOnly !== true;
		const href =
			options?.linksOnly && hasOwnPage && options.slugMap && item._id
				? getFaqHref(item as FaqLike, options.slugMap)
				: undefined;

		faqItems.push({
			id: item._id,
			title: item.faqOverview?.field_question,
			copy: options?.linksOnly && hasOwnPage ? undefined : <RichData value={item.faqOverview?.block_answer} />,
			href,
		});
	});

	return faqItems;
}
