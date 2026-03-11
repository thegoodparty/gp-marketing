import { ComponentErrorBoundary } from '~/ui/ComponentErrorBoundary';
import { AIPlatformSection } from '~/ui/AIPlatformSection.tsx';
import { CTABlock } from '~/ui/CTABlock.tsx';
import { DuopolyProblemBlock } from '~/ui/DuopolyProblemBlock.tsx';
import { ExperimentHeroA } from '~/ui/ExperimentHeroA.tsx';
import { FeaturesBlock } from '~/ui/FeaturesBlock.tsx';
import { StatsBlock } from '~/ui/StatsBlock.tsx';
import { TestimonialBlock } from '~/ui/TestimonialBlock.tsx';
import {
	heroA,
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

export function HomepageVariantA() {
	return (
		<>
			<ComponentErrorBoundary componentName="ExperimentHeroA">
				<ExperimentHeroA
					badgeText={heroA.badgeText}
					title={heroA.title}
					subtitle={heroA.subtitle}
					buttons={heroA.buttons}
				/>
			</ComponentErrorBoundary>

			<ComponentErrorBoundary componentName="StatsBlock">
				<StatsBlock backgroundColor="midnight" stats={statsA} />
			</ComponentErrorBoundary>

			<ComponentErrorBoundary componentName="DuopolyProblemBlock">
				<DuopolyProblemBlock title={problemA.title} paragraphs={problemA.paragraphs} />
			</ComponentErrorBoundary>

			<ComponentErrorBoundary componentName="TestimonialBlock">
				<TestimonialBlock
					backgroundColor="midnight"
					header={heroesHeaderA}
					items={heroesA}
				/>
			</ComponentErrorBoundary>

			<ComponentErrorBoundary componentName="AIPlatformSection">
				<AIPlatformSection
					backgroundColor="cream"
					header={aiPlatformHeaderA}
					pillars={aiPlatformPillarsA}
					chatMessages={aiChatMessagesA}
				/>
			</ComponentErrorBoundary>

			<ComponentErrorBoundary componentName="FeaturesBlock (Tools)">
				<FeaturesBlock
					backgroundColor="cream"
					header={toolsHeaderA}
					items={toolsA}
				/>
			</ComponentErrorBoundary>

			<ComponentErrorBoundary componentName="CTABlock">
				<CTABlock
					backgroundColor="midnight"
					color="midnight"
					title={ctaA.title}
					copy={ctaA.copy}
					buttons={ctaA.buttons}
					showLogo
				/>
			</ComponentErrorBoundary>
		</>
	);
}
