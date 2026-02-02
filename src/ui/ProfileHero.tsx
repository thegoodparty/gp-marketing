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
		imageWrapper: 'relative flex-shrink-0 z-20 mt-14 md:mt-16 lg:mt-20',
		image: 'rounded-full overflow-hidden w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64',
		badge: 'absolute bottom-0 right-0 translate-x-[25%] translate-y-1/4 w-32 h-24 md:w-40 md:h-28 lg:w-48 lg:h-32 z-30',
		content: 'flex flex-col gap-3 md:gap-4 text-left z-10',
		heading: '',
		office: '',
		attribution: 'flex items-center justify-start mt-2',
		attributionIcon: 'w-[37px] h-[28px]',
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
							<Logo width={200} height={150} className={badge()} />
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
