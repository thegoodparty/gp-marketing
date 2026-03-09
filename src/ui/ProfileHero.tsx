import Image from 'next/image';
import { cn, tv } from './_lib/utils.ts';
import { Container } from './Container.tsx';
import { Text } from './Text.tsx';
import { ResponsiveImage } from './ResponsiveImage.tsx';
import type { SanityImage } from './types.ts';
import type { backgroundTypeValues } from './_lib/designTypesStore.ts';
import { Logo } from '~/sanity/utils/Logo.tsx';

const styles = tv({
	slots: {
		base: 'relative py-12 md:py-16 lg:py-20 overflow-hidden',
		backgroundWrapper: 'absolute top-0 bottom-0 max-md:-left-[var(--container-padding)] max-md:-right-[var(--container-padding)] md:inset-0',
		topSection: 'absolute top-0 left-0 right-0 h-[60%]',
		bottomSection: 'absolute bottom-0 left-0 right-0 h-[40%]',
		container: 'relative z-10 flex flex-col items-start gap-8 md:flex-row md:items-start md:gap-12 lg:gap-40',
		imageWrapper: 'relative flex-shrink-0 z-20',
		image: 'rounded-full overflow-hidden w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 mt-8 md:mt-12 lg:mt-16',
		badge: 'absolute bottom-0 right-0 translate-x-[-2%] translate-y-1/17 z-30',
		content: 'flex flex-col gap-6 text-left z-10',
		heading: '',
		office: '',
		attribution: 'flex items-center justify-start gap-1',
		attributionIcon: 'w-[37px] h-[28px]',
		attributionText: 'text-sm',
	},
	variants: {
		backgroundColor: {
			midnight: {
				base: 'text-white',
				topSection: 'bg-midnight-900',
				bottomSection: 'max-md:bg-midnight-900',
				heading: 'text-white',
				office: 'text-white',
				attributionText: 'text-white',
			},
			cream: {
				base: 'text-midnight-900',
				topSection: 'bg-goodparty-cream',
				bottomSection: 'max-md:bg-goodparty-cream',
				heading: 'text-midnight-900',
				office: 'text-midnight-900',
				attributionText: 'text-midnight-900',
			},
		},
	},
});

export type ProfileHeroProps = {
	className?: string;
	backgroundColor?: (typeof backgroundTypeValues)[number];
	candidateName: string;
	office: string;
	profileImage?: SanityImage;
	profileImageUrl?: string;
	isEmpowered?: boolean;
};

export function ProfileHero(props: ProfileHeroProps) {
	const backgroundColor = props.backgroundColor ?? 'midnight';
	const { base, backgroundWrapper, topSection, bottomSection, container, imageWrapper, image, badge, content, heading, office, attribution, attributionIcon, attributionText } = styles({ backgroundColor });

	return (
		<section className={cn(base(), props.className)} data-component="ProfileHero">
			<div className={backgroundWrapper()}>
				<div className={topSection()} />
				<div className={bottomSection()} />
			</div>
			<Container size="xl">
				<div className={container()}>
					<div className={imageWrapper()}>
						<div className={cn(image(), 'relative')}>
							{props.profileImageUrl ? (
								<Image
									src={props.profileImageUrl}
									alt={`${props.candidateName} headshot`}
									fill
									unoptimized
									className="object-cover object-center"
								/>
							) : props.profileImage ? (
								<ResponsiveImage image={props.profileImage} />
							) : (
								<div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-400">
									<svg
										stroke="currentColor"
										fill="currentColor"
										strokeWidth="0"
										viewBox="0 0 512 512"
										className="w-1/2 h-1/2"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path d="M256 256a112 112 0 1 0-112-112 112 112 0 0 0 112 112zm0 32c-69.42 0-208 42.88-208 128v64h416v-64c0-85.12-138.58-128-208-128z" />
									</svg>
								</div>
							)}
						</div>
						<Logo width={80} height={65} className={badge()} />
					</div>
					<div className={content()}>
						<div>
							<Text as="h1" styleType={props.candidateName.length > 28 ? 'heading-md' : 'heading-lg'} className={heading()}>
								{props.candidateName}
							</Text>
							<Text as="p" styleType="subtitle-1" className={office()}>
								{props.office}
							</Text>
						</div>
						{props.isEmpowered && (
						<div className={attribution()}>
							<Logo className={attributionIcon()} />
							<Text as="span" styleType="body-2" className={attributionText()}>
								Empowered by GoodParty.org
							</Text>
						</div>
						)}
					</div>
				</div>
			</Container>
		</section>
	);
}
