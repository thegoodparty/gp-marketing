import type { Group_featuresBlockContent } from 'sanity.types';

import type { FeaturesBlockItemProps } from '../FeaturesBlock';
import { transformButtons, type ButtonType } from '~/lib/buttonTransformer';

export function resolveFeaturesBlockItems(items?: Group_featuresBlockContent) {
	if (!items) return [];

	const featuredBlockItems: FeaturesBlockItemProps[] = [];

	if (items.list_featureBlockFeatures) {
		items.list_featureBlockFeatures?.forEach((item: any) => {
			featuredBlockItems.push({
				title: item.field_featureName,
				icon: item.field_icon,
				description: item.field_featureDescription,
				button: transformButtons([item.ctaActionWithShared as unknown as ButtonType])?.[0],
			});
		});
	}

	if (items.list_featureBlockHighlightedFeature) {
		items.list_featureBlockHighlightedFeature?.forEach((item: any) => {
			featuredBlockItems.push({
				title: item.field_featureName,
				icon: item.field_icon,
				description: item.field_featureDescription,
				isHighlighted: true,
				image: item.img_featureImage,
				showFullImage: item.showFullImage,
				button: transformButtons([item.ctaActionWithShared as unknown as ButtonType])?.[0],
			});
		});
	}

	return featuredBlockItems;
}
