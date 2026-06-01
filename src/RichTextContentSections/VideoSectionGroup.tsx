import type { ReactElement } from 'react';
import type { ArticleSections } from '~/RichTextContentSections';
import { normalizeVideoEmbed } from '~/lib/normalizeVideoEmbed';
import { Caption } from '~/ui/Caption';
import { EmbedHtml } from '~/ui/EmbedHtml';

export function VideoSectionGroup(section: Extract<ArticleSections, { _type: 'videoSection' }>): ReactElement | null {
	const embedHtml = section.field_videoEmbedCode ? normalizeVideoEmbed(section.field_videoEmbedCode) : null;

	if (!embedHtml) return null;

	return (
		<section data-group='VideoSectionGroup' className='flex flex-col gap-4 items-center w-full'>
			<div className='w-full aspect-video rounded-[0.75rem] overflow-hidden'>
				<EmbedHtml html={embedHtml} className='w-full h-full' height='100%' />
			</div>
			{section.field_caption && <Caption>{section.field_caption}</Caption>}
		</section>
	);
}
