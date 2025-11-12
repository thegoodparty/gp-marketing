import type { ArticleSections } from '~/RichTextContentSections';
import { muxVideo } from '~/ui/_data/media';

import { Caption } from '~/ui/Caption';
import { Media } from '~/ui/Media';
import type { SanityImage } from '~/ui/types';

export function VideoSectionGroup(section: Extract<ArticleSections, { _type: 'videoSection' }>) {
	return (
		<section data-group='ImageContentSectionGroup' className='flex flex-col gap-4 items-center'>
			<Media image={section.img_fallbackImage as unknown as SanityImage} video={muxVideo} />
			{section.field_caption && <Caption>{section.field_caption}</Caption>}
		</section>
	);
}
