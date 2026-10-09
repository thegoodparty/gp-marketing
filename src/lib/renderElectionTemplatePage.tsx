import { ElectionsCmsTemplatePage } from '~/ui/ElectionsCmsTemplatePage';
import type { SectionOverrides } from '~/PageSections';
import type { TokenMap } from '~/lib/resolveTokens';
import { resolveElectionTemplate, type ElectionTemplateContext, type ResolvedElectionTemplate } from '~/lib/electionTemplates';

type Props = {
	context: ElectionTemplateContext;
	sectionOverrides?: SectionOverrides;
	tokens?: TokenMap;
	schemas?: Array<unknown>;
	enableLandingSearch?: boolean;
	/** The template already resolved for `context`, when the caller ran that alongside its own data fetches. */
	resolved?: ResolvedElectionTemplate;
};

export async function renderElectionTemplatePage(props: Props) {
	const resolved = props.resolved ?? (await resolveElectionTemplate(props.context, { tokens: props.tokens }));

	return (
		<ElectionsCmsTemplatePage
			pageSections={resolved.pageSections}
			sectionOverrides={props.sectionOverrides}
			tokens={resolved.tokens ?? props.tokens}
			schemas={props.schemas}
			enableLandingSearch={props.enableLandingSearch}
		/>
	);
}
