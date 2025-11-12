import type { ArticleSections } from '~/RichTextContentSections';

import { cn } from '~/ui/_lib/utils';
import { Caption } from '~/ui/Caption';
import { Media } from '~/ui/Media';

export function ImageContentSectionGroup(section: Extract<ArticleSections, { _type: 'imageContentSection' }>) {
	return (
		<section
			data-group='ImageContentSectionGroup'
			className={cn(
				section.field_displayInline && 'float-left aspect-3/2 max-md:w-full md:h-[17rem] mr-8',
				'flex flex-col gap-4 items-center',
			)}
		>
			<Media image={section.img_image} />
			{section.field_caption && <Caption>{section.field_caption}</Caption>}
		</section>
	);
}
