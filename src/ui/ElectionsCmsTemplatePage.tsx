import type { ReactNode } from 'react';

import { PledgeCopyProvider } from '~/experiments/PledgeCopyProvider';
import { PageSections, type SectionOverrides, type TokenMap } from '~/PageSections';
import { ElectionsLandingSearchProvider } from '~/ui/ElectionsLandingSearchContext';
import { PageSchema } from '~/ui/PageSchema';

type Props = {
	pageSections: Parameters<typeof PageSections>[0]['pageSections'];
	sectionOverrides?: SectionOverrides;
	tokens?: TokenMap;
	schemas?: Array<unknown>;
	enableLandingSearch?: boolean;
	/** The place the pledge pop-up names. Defaults to the most specific place in the page's tokens. */
	pledgeLocation?: string | null;
};

export function ElectionsCmsTemplatePage(props: Props) {
	const pledgeLocation =
		props.pledgeLocation ?? props.tokens?.['[County or City]'] ?? props.tokens?.['[location]'] ?? props.tokens?.['[State]'] ?? null;
	const body: ReactNode = (
		<PledgeCopyProvider location={pledgeLocation}>
			{props.schemas?.map((schema, index) => (schema ? <PageSchema key={`schema-${index}`} schema={schema} /> : null))}
			<PageSections pageSections={props.pageSections} sectionOverrides={props.sectionOverrides} tokens={props.tokens} />
		</PledgeCopyProvider>
	);

	if (props.enableLandingSearch) {
		return <ElectionsLandingSearchProvider>{body}</ElectionsLandingSearchProvider>;
	}

	return body;
}
