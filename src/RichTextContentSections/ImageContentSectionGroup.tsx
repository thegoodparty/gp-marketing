import type { ArticleSections } from '~/RichTextContentSections';

import { cn } from '~/ui/_lib/utils';
import { Caption } from '~/ui/Caption';
import { Media } from '~/ui/Media';

export function ImageContentSectionGroup(section: Extract<ArticleSections, { _type: 'imageContentSection' }>) {
	return (
		<section
			data-group='ImageContentSectionGroup'
			className={cn(
				section.field_displayInline && 'md:max-w-[55%] xxl:max-w-[40%]',
				section.field_displayInline
					? section.field_inlineMediaAlignmentRightLeft === 'Right'
						? 'float-right ml-8'
						: 'float-left mr-8'
					: '',
				'flex flex-col gap-4 items-center w-full',
			)}
		>
			<Media image={section.img_image} aspectRatio={section.field_aspectRatio} className='w-full' />
			{section.field_caption && <Caption>{section.field_caption}</Caption>}
		</section>
	);
}
