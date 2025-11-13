import { sanityFetch } from '~/sanity/sanityClient';
import { goodpartyOrg_navigationQuery } from '~/sanity/groq';
import { Nav } from '~/ui/Nav';
import { cn } from '~/ui/_lib/utils';
import { transformButtons, type ButtonType } from '~/lib/buttonTransformer';
import { Text } from '~/ui/Text';

export async function PageHeader(props: { className?: string; isDraftMode: boolean }) {
	const navigation = await sanityFetch({ query: goodpartyOrg_navigationQuery });

	// console.log(navigation?.primaryCTA);
	// console.log(navigation?.secondaryCTA);
	const nav = navigation?.navigationList
		?.map(item => {
			if (item._type === 'externalLink') {
				return {
					label: item.label,
					icon: item.icon,
					link: {
						_type: item._type,
						href: item.link.href,
					},
				};
			}
			if (item._type === 'internalLink') {
				return {
					label: item.label,
					icon: item.icon,
					link: {
						_type: item._type,
						href: item.link && 'href' in item.link ? item.link.href : undefined,
					},
				};
			}
			if (item._type === 'navigationGroup') {
				return {
					label: item.label,
					group: item.list_navigationGroup?.map(item => ({
						label: item.label,
						icon: item.icon,
						link: {
							_type: item._type,
							href: item.link && 'href' in item.link ? item.link.href : undefined,
						},
					})),
				};
			}
		})
		.filter(Boolean);

	const primaryCTA = navigation?.primaryCTA as ButtonType;
	const secondaryCTA = navigation?.secondaryCTA as ButtonType;

	return (
		<header
			data-component='Header'
			className={cn(`fixed top-0 left-0 w-full z-[50] h-full max-h-[100dvh] pointer-events-none`, props.className)}
		>
			{props.isDraftMode && (
				<div className='bg-[#2563EB] text-white py-2 flex items-center justify-center gap-6 pointer-events-auto'>
					<div className='flex items-center gap-2'>
						<Text styleType='text-md'>You are viewing this page in preview mode</Text>
						👀
					</div>

					<div className='flex items-center gap-2'>
						<a className='underline cursor-pointer' href='/api/draft-mode/disable'>
							Exit preview
						</a>
						👋
					</div>
				</div>
			)}
			<Nav
				nav={nav}
				primaryCTA={primaryCTA ? transformButtons([primaryCTA])?.[0] : undefined}
				secondaryCTA={secondaryCTA ? transformButtons([secondaryCTA])?.[0] : undefined}
			/>
		</header>
	);
}
