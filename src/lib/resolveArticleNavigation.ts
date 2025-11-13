import type { ArticleSections } from '~/RichTextContentSections';
import { getAnchorId } from '~/ui/RichData';

export function resolveArticleNavigation(items?: ArticleSections[] | null) {
	if (!items) return undefined;

	const navigation: { title?: string; href?: string; items: { title: string; href: string }[] }[] = [];

	for (const item of items) {
		if (item._type == 'block' && item.children && item.children.length > 0 && item.style === 'h1') {
			const children = item.children
				.map(child => child.text)
				.filter(Boolean)
				.join(' ');
			navigation.push({ title: children, href: `#${getAnchorId(children)}`, items: [] });
		}
		if (item._type == 'block' && item.children && item.children.length > 0 && item.style === 'h2') {
			const children = item.children
				.map(child => child.text)
				.filter(Boolean)
				.join(' ');
			if (navigation.length > 0 && navigation[navigation.length - 1]) {
				navigation[navigation.length - 1]?.items.push({ title: children, href: `#${getAnchorId(children)}` });
			} else {
				navigation.push({ title: undefined, href: undefined, items: [{ title: children, href: `#${getAnchorId(children)}` }] });
			}
		}
	}

	return navigation;
}
