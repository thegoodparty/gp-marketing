'use client';
import { isValidRichText } from '~/ui/_lib/isValidRichText';
import { Anchor } from '~/ui/Anchor';
import { CategoryAutocomplete } from '~/ui/BlogHero';
import { Container } from '~/ui/Container';
import { Text } from '~/ui/Text';
import { usePathname } from 'next/navigation';

type GlossaryHeroProps = {
	title: string;
	copy?: string;
	navigation?: { _id: string; title: string; href: string }[];
	searchTerms?: { _id: string; title: string; href: string }[];
};

export function GlossaryHero(props: GlossaryHeroProps) {
	const pathname = usePathname();
	return (
		<div className='bg-goodparty-cream'>
			<Container size='xl' className='py-(--container-padding) flex flex-col gap-6'>
				<Text as='h1' styleType='heading-xl'>
					{props.title}
				</Text>
				{isValidRichText(props.copy) && (
					<Text styleType='body-1' className='max-w-[43.75rem]'>
						{props.copy}
					</Text>
				)}
				<div className='grid grid-cols-1 md:grid-cols-[auto_16rem] lg:grid-cols-[auto_20rem] gap-x-4 gap-y-6 pt-[1.5rem] md:pt-[3rem] md:pb-[3rem] lg:pb-[5rem]'>
					<div className='flex flex-wrap items-center gap-x-2 gap-y-2'>
						<Text as='span' styleType='text-xl'>
							#
						</Text>
						{props.navigation?.map((item, index) => {
							return (
								<Text
									as='span'
									key={`${index}-${item?.title}-${item?.href}-${item?._id}`}
									styleType='text-xl'
									className={`uppercase ${pathname === item.href || (pathname === '/political-terms' && index === 0) ? 'text-black font-bold' : 'text-neutral-400 font-normal hover:text-black'}`}
								>
									<Anchor href={item.href} className={''}>
										{item.title}
									</Anchor>
								</Text>
							);
						})}
					</div>
					{props.searchTerms && props.searchTerms.length > 0 && <CategoryAutocomplete items={props.searchTerms} />}
				</div>
				<hr className='hidden md:block border-neutral-200' />
			</Container>
		</div>
	);
}
