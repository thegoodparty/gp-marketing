import type { Rule } from 'sanity';
import {resolveValue} from '../../utils/resolveValue.ts';
import {handleReplacements} from '../../utils/handleReplacements.ts';
import {getIcon} from '../../utils/getIcon.tsx';

export const faqOverview = {
  title: 'FAQ',
  name: 'faqOverview',
  type: 'object',
  options: {
    collapsed: false,
    columns: 1,
  },
  icon: getIcon('QuestionAnswering'),
  fields: [
    {
      title: 'Question',
      name: 'field_question',
      type: 'field_question',
    },
    {
      title: 'Slug',
      name: 'field_slug',
      type: 'field_slug',
      // Required + unique on disk. Existing docs: scripts/post-merge-faq-internal-links.ts
      validation: (Rule: Rule) =>
        Rule.required().custom(async (value: string | undefined, context) => {
          if (!value) return true;
          const { document, getClient } = context;
          const client = getClient({ apiVersion: '2025-09-25' });
          const publishedId = String(document?._id ?? '').replace(/^drafts\./, '');
          const existing = await client.fetch(
            `*[_type == "faq" && faqOverview.field_slug == $slug && _id != $publishedId && _id != $draftId][0]._id`,
            { slug: value, publishedId, draftId: `drafts.${publishedId}` },
          );
          return existing ? `Slug "${value}" is already used by another FAQ` : true;
        }),
    },
    {
      title: 'Answer',
      name: 'block_answer',
      type: 'block_answer',
    },
  ],
  preview: {
    select: {
      title: 'field_question',
      _type: '_type',
    },
    prepare: x => {
const infer = {
      singletonTitle: null,
      icon: getIcon('QuestionAnswering'),
      fallback: {},
    }
         const title = resolveValue('title', faqOverview.preview.select, x);         const subtitle = resolveValue('subtitle', faqOverview.preview.select, x);         const media = resolveValue('media', faqOverview.preview.select, x);         return handleReplacements({           title: infer.singletonTitle || title || undefined,           subtitle: subtitle ? subtitle : infer.fallback['title'],           media: media || infer.icon         }, x, infer.fallback);       },
  },
}