import { ComponentErrorBoundary } from '~/ui/ComponentErrorBoundary';
import { AIPlatformSection } from '~/ui/AIPlatformSection.tsx';
import { CTABlock } from '~/ui/CTABlock.tsx';
import { DuopolyProblemBlock } from '~/ui/DuopolyProblemBlock.tsx';
import { ExperimentHeroC } from '~/ui/ExperimentHeroC.tsx';
import { FeaturesBlock } from '~/ui/FeaturesBlock.tsx';
import { StatsBlock } from '~/ui/StatsBlock.tsx';
import { TestimonialBlock } from '~/ui/TestimonialBlock.tsx';
import {
	creamBackgroundType,
	midnightBackgroundType,
	whiteBackgroundType,
} from '~/ui/_lib/designTypesStore.ts';
import {
	statsA,
	problemA,
	heroesHeaderA,
	heroesA,
	aiPlatformHeaderA,
	aiPlatformPillarsA,
	aiChatMessagesA,
	toolsHeaderA,
	toolsA,
	ctaA,
} from './data/variantA.tsx';
import { heroC } from './data/variantC.tsx';

export function HomepageVariantC() {
	return (
		<>
			<ComponentErrorBoundary componentName="ExperimentHeroC">
				<ExperimentHeroC
					badgeText={heroC.badgeText}
					title={heroC.title}
					subtitle={heroC.subtitle}
					buttons={heroC.buttons}
					candidates={heroC.candidates}
				/>
			</ComponentErrorBoundary>

			<ComponentErrorBoundary componentName="StatsBlock">
				<StatsBlock backgroundColor={midnightBackgroundType} stats={statsA} />
			</ComponentErrorBoundary>

			<ComponentErrorBoundary componentName="DuopolyProblemBlock">
				<DuopolyProblemBlock title={problemA.title} paragraphs={problemA.paragraphs} />
			</ComponentErrorBoundary>

			<ComponentErrorBoundary componentName="TestimonialBlock">
				<TestimonialBlock
					backgroundColor={midnightBackgroundType}
					header={heroesHeaderA}
					items={heroesA}
				/>
			</ComponentErrorBoundary>

			<ComponentErrorBoundary componentName="AIPlatformSection">
				<AIPlatformSection
					backgroundColor={creamBackgroundType}
					header={aiPlatformHeaderA}
					pillars={aiPlatformPillarsA}
					chatMessages={aiChatMessagesA}
				/>
			</ComponentErrorBoundary>

			<ComponentErrorBoundary componentName="FeaturesBlock (Tools)">
				<FeaturesBlock
					backgroundColor={whiteBackgroundType}
					header={toolsHeaderA}
					items={toolsA}
				/>
			</ComponentErrorBoundary>

			<ComponentErrorBoundary componentName="CTABlock">
				<CTABlock
					backgroundColor={midnightBackgroundType}
					color={midnightBackgroundType}
					title={ctaA.title}
					copy={ctaA.copy}
					buttons={ctaA.buttons}
					showLogo
				/>
			</ComponentErrorBoundary>
		</>
	);
}
