import { transformButtons } from '~/lib/buttonTransformer';
import type { ArticleSections } from '~/RichTextContentSections';
import { ComponentButton } from '~/ui/Inputs/Button';

export function ButtonSectionGroup(section: Extract<ArticleSections, { _type: 'button' }>) {
	const button = transformButtons([section])?.[0];
	return <section data-group='ButtonSectionGroup'>{button && <ComponentButton {...button} />}</section>;
}
