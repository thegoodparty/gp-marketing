import type { ProfileContentCardProps } from '../ProfileContentCard.tsx';

/**
 * Chunks a flat card list into the separated layout's white cards: consecutive
 * non-raw cards sharing a `group` go in one card; every `raw` card stands alone
 * (self-styled).
 *
 * A card's index within its chunk also decides its heading level — the Figma
 * people-profile frames give a card's first section a 32/44 heading and anything
 * stacked under it a 24/32 one — so this lives apart from the component to keep
 * it testable without a DOM.
 */
export function chunkCardGroups(cards: ProfileContentCardProps[]): ProfileContentCardProps[][] {
	const groups: ProfileContentCardProps[][] = [];
	for (const card of cards) {
		const last = groups.at(-1);
		const head = last?.[0];
		const mergeable =
			head != null && !card.raw && !head.raw && card.group != null && head.group === card.group;
		if (mergeable && last) last.push(card);
		else groups.push([card]);
	}
	return groups;
}
