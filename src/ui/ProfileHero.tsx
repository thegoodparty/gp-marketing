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
		backgroundWrapper: 'absolute inset-0',
		topSection: 'absolute top-0 left-0 right-0 h-[60%]',
		bottomSection: 'absolute bottom-0 left-0 right-0 h-[40%] bg-grey',
		container: 'relative z-10 flex flex-col items-center gap-8 md:flex-row md:items-start md:gap-12 lg:gap-16',
		imageWrapper: 'relative flex-shrink-0 z-20 md:-mt-16 lg:-mt-20',
		image: 'rounded-full overflow-hidden w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64',
		badge: 'absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 w-16 h-12 md:w-20 md:h-14 lg:w-24 lg:h-16 z-30',
		content: 'flex flex-col gap-0 text-center z-10 -mt-4 md:-mt-4',
		heading: '',
		office: '',
		attribution: 'flex items-center gap-2 justify-center',
		attributionIcon: 'w-5 h-5 flex-shrink-0',
		attributionText: 'text-sm',
	},
	variants: {
		backgroundColor: {
			midnight: {
				base: 'text-white',
				topSection: 'bg-midnight-900',
				heading: 'text-white',
				office: 'text-white',
				attributionText: 'text-white',
			},
			cream: {
				base: 'text-midnight-900',
				topSection: 'bg-goodparty-cream',
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
					{props.profileImage && (
						<div className={imageWrapper()}>
							<div className={image()}>
								<ResponsiveImage image={props.profileImage} />
							</div>
							<Logo width={100} height={75} className={badge()} />
						</div>
					)}
					<div className={content()}>
						<div>
							<Text as="h1" styleType="heading-lg" className={heading()}>
								{props.candidateName}
							</Text>
							<Text as="p" styleType="subtitle-1" className={office()}>
								{props.office}
							</Text>
						</div>
						{props.isEmpowered && (
							<div className={attribution()}>
								<svg
									className={attributionIcon()}
									viewBox="0 0 20 20"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M10.001 16.316c3.27-.589 5.44-2.373 6.548-4.202.933-1.552 1.053-3.059.462-4.306-.536-1.127-1.616-1.931-2.872-2.144-1.339-.222-2.697.25-3.768 1.423L10 7.494l-.379-.407c-1.08-1.173-2.438-1.645-3.768-1.423-1.247.203-2.337 1.016-2.872 2.144-.591 1.238-.471 2.754.462 4.306 1.108 1.83 3.279 3.613 6.548 4.202h.018Z"
										fill="currentColor"
									/>
								</svg>
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
