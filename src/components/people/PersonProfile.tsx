import type { PersonProfileView } from '~/lib/peopleProfile';
import { PageSections } from '~/PageSections';
import { PERSON_PROFILE_SECTIONS } from './personProfileSections';
import { buildPersonProfileTokens, buildPersonSectionOverrides } from './personSectionOverrides';

/**
 * Public /people/<slug> profile — Option A (template-driven).
 *
 * Renders the `personProfile` code-default section layout with the resolved
 * per-person data injected via SectionOverrides (see personSectionOverrides).
 * Per-state (A–L) behaviour — empowerment framing, removal stripping, and
 * claim/pledge/CTA visibility — is expressed by suppressing sections in the
 * override builder, so it holds for any editor-authored template too.
 *
 * The /people route renders the Sanity-resolved template (custom → global →
 * this code default) via `renderElectionTemplatePage`; this component is the
 * direct-render entry used by Storybook and any caller with a resolved view.
 */
export function PersonProfile({ view }: { view: PersonProfileView }) {
	return (
		<article data-component='PersonProfilePage' data-state={view.state}>
			<PageSections
				pageSections={PERSON_PROFILE_SECTIONS}
				sectionOverrides={buildPersonSectionOverrides(view)}
				tokens={buildPersonProfileTokens(view)}
				// The default section error boundary is an async server component; this
				// direct-render entry (Storybook / preview) uses the sync passthrough.
				disableErrorBoundary
			/>
		</article>
	);
}
