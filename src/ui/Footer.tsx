import type { List_footerLegalNavigation } from 'sanity.types';

import { Container } from './Container';
import { Media } from './Media';
import { NavLink } from './Nav/DesktopNav/NavLink';
import { Text } from './Text';

interface FooterProps {
	copyright?: string;
	message?: string;
	logo?: any;
	legalNav?: List_footerLegalNavigation;
	groupedNav?: any;
}

export function Footer(props: FooterProps) {
	return (
		<div data-component='Footer' className='py-(--container-padding) bg-midnight-900 text-white '>
			<Container size='xl' className='flex flex-col justify-center items-center gap-12'>
				<div className='grid grid-cols-2 md:grid-cols-4 w-full max-md:gap-x-6 max-md:gap-y-8'>
					{props.groupedNav?.map(group => (
						<div key={group._key} className='flex flex-col gap-8'>
							<Text styleType='text-2xl' className='font-semibold'>
								{group.groupTitle}
							</Text>
							<ul className='flex flex-col gap-6'>
								{group.list_footerNavigationGroup?.map(link => (
									<li key={link._key}>
										<NavLink {...link} />
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
				<div className='w-full before:block before:h-0.25 before:w-full before:bg-white/25' />
				<div className='flex flex-col gap-6 items-center max-w-[23.688rem] text-center'>
					{props.logo && <Media image={props.logo} className='w-[16.25rem] h-[3.313rem]' />}
					{props.message && <Text styleType='text-xs'>{props.message}</Text>}
					{props.copyright && <Text styleType='text-xs'>{props.copyright}</Text>}
					{props.legalNav?.length && (
						<ul className='flex gap-3 items-center [&>li]:flex [&>li:not(:last-child)]:after:content-["|"] [&>li:not(:last-child)]:after:ml-3 [&>li:not(:last-child)]:after:font-semibold'>
							{props.legalNav.map(link => (
								<li key={link._key}>
									<NavLink textStyleType='text-xs' {...link} />
								</li>
							))}
						</ul>
					)}
				</div>
			</Container>
		</div>
	);
}
