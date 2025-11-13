import type { FAQBlockItemProps } from '../FAQBlock';
import { RichData } from '../RichData';

export function resolveFAQItems(items?: any) {
	if (!items) return [];

	const faqItems: FAQBlockItemProps[] = [];
	items?.map((item: any) => {
		faqItems.push({
			id: item._id,
			title: item.faqOverview?.field_question,
			copy: <RichData value={item.faqOverview?.block_answer} />,
		});
	});

	return faqItems;
}
