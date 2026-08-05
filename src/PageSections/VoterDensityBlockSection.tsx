import type { SectionOverrides, Sections } from '~/PageSections';

type Props = Extract<Sections, { _type: 'component_voterDensityBlock' }> & {
	voterDensityOverride?: SectionOverrides['component_voterDensityBlock'];
};

// Renders the district voter-density map as its own page section. The map node
// (with its coverage/k-anonymity gating already applied) is injected via the
// override by the person view model; when there's no map to show — low coverage,
// no density data, or an explicitly hidden state — the section renders nothing.
export function VoterDensityBlockSection({ voterDensityOverride }: Props) {
	if (voterDensityOverride?.hidden || !voterDensityOverride?.map) {
		return null;
	}
	return <>{voterDensityOverride.map}</>;
}
