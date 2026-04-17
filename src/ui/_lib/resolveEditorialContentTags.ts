import type { TagProps } from '../Tag';

export function resolveEditorialContentTags(items?: any) {
	const tags: TagProps[] = [];

	if (items?.category) {
		tags.push({
			id: items.category._id,
			name: items.category.tagOverview.field_name,
			href: items.category.href,
		});
	}

	if (items?.topics) {
		for (const topic of items.topics) {
			tags.push({
				id: topic._id,
				name: topic.tagOverview.field_name,
				href: topic.href,
			});
		}
	}

	return tags;
}
