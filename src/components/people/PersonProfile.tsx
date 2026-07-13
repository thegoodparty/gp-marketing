import { Container } from '~/ui/Container';
import type {
	PersonProfileLink,
	PersonProfileView,
} from '~/lib/peopleProfile';
import { mapAttribution, mapStyleUrl } from '~/lib/env';
import { VoterDensityMapCard } from '~/components/people/VoterDensityMapCard';

// Below this rendered-voter coverage the density surface is too partial to be
// trustworthy, so the map is hidden (the profile still renders everything
// else). Coverage may be null when upstream has no meta row; in that case we
// fall back to "render if there are cells at all".
const MIN_VOTER_DENSITY_COVERAGE = 0.5;

function formatTermYear(date: string | null): string | null {
	if (!date) return null;
	const parsed = new Date(date);
	if (Number.isNaN(parsed.getTime())) return null;
	return String(parsed.getUTCFullYear());
}

function TermRange({ start, end }: { start: string | null; end: string | null }) {
	const startYear = formatTermYear(start);
	const endYear = formatTermYear(end);
	if (!startYear && !endYear) return null;
	return (
		<span>
			{startYear ?? '—'} – {endYear ?? 'Present'}
		</span>
	);
}

function LinkPill({ link }: { link: PersonProfileLink }) {
	const isExternal = link.href.startsWith('http');
	return (
		<a
			href={link.href}
			target={isExternal ? '_blank' : undefined}
			rel={isExternal ? 'noopener noreferrer' : undefined}
			className='inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-gray-800 transition-colors hover:border-black/20 hover:bg-gray-50'
		>
			{link.label}
		</a>
	);
}

function SectionCard({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<section className='rounded-2xl border border-black/5 bg-white p-6 shadow-sm sm:p-8'>
			<h2 className='mb-4 text-xl font-semibold text-gray-900'>{title}</h2>
			{children}
		</section>
	);
}

export function PersonProfile({ view }: { view: PersonProfileView }) {
	const {
		displayName,
		roleTitle,
		party,
		isVerified,
		avatarUrl,
		coverImageUrl,
		initials,
		bio,
		whyRunning,
		accomplishments,
		term,
		districtLabel,
		stateLabel,
		issues,
		links,
		voterDensity,
	} = view;

	const locationLabel = [districtLabel, stateLabel].filter(Boolean).join(', ');

	// Progressive enhancement: only show the map when we actually have cells and
	// coverage is either healthy or unknown. Otherwise the sidebar simply omits
	// it — no map, no error, no layout shift for the SSR content.
	const showVoterDensity =
		!!voterDensity &&
		voterDensity.cells.length > 0 &&
		(voterDensity.coverage === null ||
			voterDensity.coverage >= MIN_VOTER_DENSITY_COVERAGE);

	return (
		<article className='pb-16'>
			{/* Cover / hero band */}
			<div className='relative h-40 w-full bg-gradient-to-r from-emerald-700 to-teal-600 sm:h-56'>
				{coverImageUrl ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img
						src={coverImageUrl}
						alt=''
						className='h-full w-full object-cover'
						loading='eager'
					/>
				) : null}
			</div>

			<Container size='lg' className='relative'>
				{/* Header card overlapping the cover */}
				<div className='-mt-16 mb-8 flex flex-col gap-4 rounded-2xl border border-black/5 bg-white p-6 shadow-sm sm:-mt-20 sm:flex-row sm:items-end sm:gap-6 sm:p-8'>
					<div className='shrink-0'>
						{avatarUrl ? (
							// eslint-disable-next-line @next/next/no-img-element
							<img
								src={avatarUrl}
								alt={displayName}
								className='h-28 w-28 rounded-2xl border-4 border-white object-cover shadow-md sm:h-32 sm:w-32'
								loading='eager'
							/>
						) : (
							<div className='flex h-28 w-28 items-center justify-center rounded-2xl border-4 border-white bg-emerald-100 text-3xl font-bold text-emerald-700 shadow-md sm:h-32 sm:w-32'>
								{initials}
							</div>
						)}
					</div>
					<div className='min-w-0 flex-1'>
						<div className='flex flex-wrap items-center gap-2'>
							<h1 className='text-2xl font-bold text-gray-900 sm:text-3xl'>{displayName}</h1>
							{isVerified ? (
								<span className='inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700'>
									Verified
								</span>
							) : null}
						</div>
						{roleTitle ? (
							<p className='mt-1 text-lg text-gray-700'>{roleTitle}</p>
						) : null}
						<div className='mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-500'>
							{party ? (
								<span className='rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-700'>
									{party}
								</span>
							) : null}
							{locationLabel ? <span>{locationLabel}</span> : null}
						</div>
					</div>
				</div>

				<div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
					{/* Main column */}
					<div className='flex flex-col gap-6 lg:col-span-2'>
						{bio ? (
							<SectionCard title='About'>
								<p className='whitespace-pre-line leading-relaxed text-gray-700'>{bio}</p>
							</SectionCard>
						) : null}

						{whyRunning ? (
							<SectionCard title='Why I serve'>
								<p className='whitespace-pre-line leading-relaxed text-gray-700'>{whyRunning}</p>
							</SectionCard>
						) : null}

						{issues.length > 0 ? (
							<SectionCard title='Top issues'>
								<ul className='flex flex-col gap-5'>
									{issues.map((issue) => (
										<li key={issue.id}>
											<h3 className='font-semibold text-gray-900'>{issue.title}</h3>
											{issue.description ? (
												<p className='mt-1 whitespace-pre-line leading-relaxed text-gray-700'>
													{issue.description}
												</p>
											) : null}
										</li>
									))}
								</ul>
							</SectionCard>
						) : null}

						{accomplishments.length > 0 ? (
							<SectionCard title='Accomplishments'>
								<ul className='flex flex-col gap-4'>
									{accomplishments.map((item, i) => (
										<li key={`${item.title}-${i}`} className='border-l-2 border-emerald-500 pl-4'>
											<div className='flex flex-wrap items-baseline justify-between gap-2'>
												<h3 className='font-semibold text-gray-900'>{item.title}</h3>
												{item.date ? (
													<span className='text-sm text-gray-500'>{item.date}</span>
												) : null}
											</div>
											{item.description ? (
												<p className='mt-1 leading-relaxed text-gray-700'>{item.description}</p>
											) : null}
										</li>
									))}
								</ul>
							</SectionCard>
						) : null}
					</div>

					{/* Sidebar */}
					<aside className='flex flex-col gap-6'>
						{term && (formatTermYear(term.start) || formatTermYear(term.end)) ? (
							<SectionCard title='In office'>
								<dl className='flex flex-col gap-3 text-sm'>
									{roleTitle ? (
										<div>
											<dt className='text-gray-500'>Office</dt>
											<dd className='font-medium text-gray-900'>{roleTitle}</dd>
										</div>
									) : null}
									<div>
										<dt className='text-gray-500'>Term</dt>
										<dd className='font-medium text-gray-900'>
											<TermRange start={term.start} end={term.end} />
										</dd>
									</div>
									{locationLabel ? (
										<div>
											<dt className='text-gray-500'>District</dt>
											<dd className='font-medium text-gray-900'>{locationLabel}</dd>
										</div>
									) : null}
								</dl>
							</SectionCard>
						) : null}

						{links.length > 0 ? (
							<SectionCard title='Connect'>
								<div className='flex flex-wrap gap-2'>
									{links.map((link) => (
										<LinkPill key={`${link.kind}-${link.href}`} link={link} />
									))}
								</div>
							</SectionCard>
						) : null}

						{showVoterDensity && voterDensity ? (
							<VoterDensityMapCard
								cells={voterDensity.cells}
								styleUrl={mapStyleUrl}
								attribution={mapAttribution}
							/>
						) : null}
					</aside>
				</div>
			</Container>
		</article>
	);
}
