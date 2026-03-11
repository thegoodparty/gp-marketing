import { ComponentErrorBoundary } from '~/ui/ComponentErrorBoundary';
import { AIPlatformSection } from '~/ui/AIPlatformSection.tsx';
import { CTABlock } from '~/ui/CTABlock.tsx';
import { ExperimentHeroB } from '~/ui/ExperimentHeroB.tsx';
import { FeaturesBlock } from '~/ui/FeaturesBlock.tsx';
import { StatsBlock } from '~/ui/StatsBlock.tsx';
import { StrikethroughBlock } from '~/ui/StrikethroughBlock.tsx';
import { TestimonialBlock } from '~/ui/TestimonialBlock.tsx';
import { ThreePillarsBlock } from '~/ui/ThreePillarsBlock.tsx';
import {
	heroB,
	strikethroughB,
	statsB,
	pillarsHeaderB,
	pillarsB,
	peopleHeaderB,
	peopleB,
	techHeaderB,
	techPlatformPillarsB,
	techChatMessagesB,
	toolsHeaderB,
	toolsB,
	ctaB,
} from './data/variantB.tsx';

export function HomepageVariantB() {
	return (
		<>
			<ComponentErrorBoundary componentName="ExperimentHeroB">
				<ExperimentHeroB
					manifesto={heroB.manifesto}
					title={heroB.title}
					subtitle={heroB.subtitle}
					buttons={heroB.buttons}
				/>
			</ComponentErrorBoundary>

			<ComponentErrorBoundary componentName="StrikethroughBlock">
				<StrikethroughBlock lines={strikethroughB.lines} punchline={strikethroughB.punchline} />
			</ComponentErrorBoundary>

			<ComponentErrorBoundary componentName="StatsBlock">
				<StatsBlock backgroundColor="midnight" stats={statsB} />
			</ComponentErrorBoundary>

			<ComponentErrorBoundary componentName="ThreePillarsBlock">
				<ThreePillarsBlock header={pillarsHeaderB} pillars={pillarsB} />
			</ComponentErrorBoundary>

			<ComponentErrorBoundary componentName="TestimonialBlock">
				<TestimonialBlock
					backgroundColor="midnight"
					header={peopleHeaderB}
					items={peopleB}
				/>
			</ComponentErrorBoundary>

			<ComponentErrorBoundary componentName="AIPlatformSection">
				<AIPlatformSection
					backgroundColor="cream"
					header={techHeaderB}
					pillars={techPlatformPillarsB}
					chatMessages={techChatMessagesB}
				/>
			</ComponentErrorBoundary>

			<ComponentErrorBoundary componentName="FeaturesBlock (Tools)">
				<FeaturesBlock
					backgroundColor="cream"
					header={toolsHeaderB}
					items={toolsB}
				/>
			</ComponentErrorBoundary>

			<ComponentErrorBoundary componentName="CTABlock">
				<CTABlock
					backgroundColor="midnight"
					color="midnight"
					title={ctaB.title}
					copy={ctaB.copy}
					buttons={ctaB.buttons}
					showLogo
				/>
			</ComponentErrorBoundary>
		</>
	);
}
