import Link from 'next/link';
import { Container } from '~/ui/Container';
import { CandidatesBlock, type CandidateCard } from '~/ui/CandidatesBlock';

export type CandidatesPageContentProps = {
	officeName: string;
	stateName: string;
	candidates: CandidateCard[];
	backHref: string;
	backLabel: string;
};

export function CandidatesPageContent(props: CandidatesPageContentProps) {
	const { officeName, stateName, candidates, backHref, backLabel } = props;

	return (
		<>
			<Container size="xl" className="py-(--container-padding)">
				<p className="mb-6 font-secondary text-body-2 text-neutral-600">
					<Link href={backHref} className="text-goodparty-blue hover:underline">
						{backLabel}
					</Link>
				</p>
			</Container>
			<CandidatesBlock
				backgroundColor="cream"
				header={{
					title: `Candidates for ${officeName}`,
					copy: `Candidates running for ${officeName} in ${stateName}.`,
				}}
				candidates={candidates}
			/>
		</>
	);
}
