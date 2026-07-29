import type { ReactNode } from 'react';

import { PageSections, type SectionOverrides, type TokenMap } from '~/PageSections';
import { ElectionsLandingSearchProvider } from '~/ui/ElectionsLandingSearchContext';
import { PageSchema } from '~/ui/PageSchema';

type Props = {
	pageSections: Parameters<typeof PageSections>[0]['pageSections'];
	sectionOverrides?: SectionOverrides;
	tokens?: TokenMap;
	schemas?: Array<unknown>;
	enableLandingSearch?: boolean;
};

export function ElectionsCmsTemplatePage(props: Props) {
	const body: ReactNode = (
		<>
			{props.schemas?.map((schema, index) => (schema ? <PageSchema key={`schema-${index}`} schema={schema} /> : null))}
			<PageSections pageSections={props.pageSections} sectionOverrides={props.sectionOverrides} tokens={props.tokens} />
		</>
	);

	if (props.enableLandingSearch) {
		return <ElectionsLandingSearchProvider>{body}</ElectionsLandingSearchProvider>;
	}

	return body;
}
