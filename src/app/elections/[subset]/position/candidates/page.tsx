import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCandidacies, getPositionById } from '~/lib/electionsApi';
import { isValidStateCode } from '~/constants/usStateCodes';
import { US_STATES } from '~/constants/usStates';
import { Container } from '~/ui/Container';
import { CandidatesBlock } from '~/ui/CandidatesBlock';

function getStateName(code: string): string {
	const upper = code.toUpperCase();
	const found = US_STATES.find(s => s.value === upper);
	return found?.label ?? code;
}

function slugFromName(firstName?: string, lastName?: string, id?: string): string {
	if (firstName && lastName) {
		return `${firstName}-${lastName}`.toLowerCase().replace(/\s+/g, '-');
	}
	return id ?? 'candidate';
}

export default async function Page({
	params,
	searchParams,
}: {
	params: Promise<{ subset: string }>;
	searchParams: Promise<{ positionId?: string; name?: string }>;
}) {
	const { subset } = await params;
	const { positionId, name: positionName } = await searchParams;

	if (!isValidStateCode(subset) || !positionId) {
		notFound();
	}

	const stateName = getStateName(subset);
	const [candidacies, position] = await Promise.all([
		getCandidacies({ positionId }),
		getPositionById(positionId),
	]);

	const officeName =
		position?.position?.name ??
		position?.name ??
		(typeof positionName === 'string' ? decodeURIComponent(positionName) : 'Position');

	const candidates = candidacies.map((c, i) => {
		const firstName = c.firstName ?? '';
		const lastName = c.lastName ?? '';
		const name = [firstName, lastName].filter(Boolean).join(' ') || 'Candidate';
		const slug = slugFromName(firstName, lastName, c.id);
		return {
			_key: c.id ?? `c-${i}`,
			name,
			partyAffiliation: c.party ?? 'Unknown',
			href: `/profile?slug=${encodeURIComponent(slug)}&raceId=${encodeURIComponent(c.raceId ?? positionId)}`,
		};
	});

	return (
		<>
			<Container size="xl" className="py-(--container-padding)">
				<p className="mb-6 font-secondary text-body-2 text-neutral-600">
					<Link
						href={`/elections/${subset}/position?positionId=${encodeURIComponent(positionId)}`}
						className="text-goodparty-blue hover:underline"
					>
						Back to {officeName}
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

export async function generateMetadata({
	params,
	searchParams,
}: {
	params: Promise<{ subset: string }>;
	searchParams: Promise<{ positionId?: string; name?: string }>;
}): Promise<Metadata> {
	const { subset } = await params;
	const { name } = await searchParams;
	if (!isValidStateCode(subset)) return {};
	const stateName = getStateName(subset);
	const positionName =
		typeof name === 'string' ? decodeURIComponent(name) : 'Position';
	return {
		title: `Candidates for ${positionName} in ${stateName} | Good Party`,
		description: `View candidates running for ${positionName} in ${stateName}.`,
	};
}
