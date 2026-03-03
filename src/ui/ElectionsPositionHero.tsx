import { cn, tv } from './_lib/utils.ts';
import type { backgroundTypeValues } from './_lib/designTypesStore.ts';

import { Container } from './Container.tsx';
import { ComponentButton, type ComponentButtonProps } from './Inputs/Button.tsx';
import { Text } from './Text.tsx';

const styles = tv({
	slots: {
		base: 'py-16 md:py-24',
		content: 'flex flex-col gap-8',
		infoGrid: 'grid gap-8 sm:grid-cols-2 max-w-[34rem]',
		infoItem: '',
	},
	variants: {
		backgroundColor: {
			cream: {
				base: 'bg-goodparty-cream',
			},
			midnight: {
				base: 'bg-midnight-900 text-white',
			},
		},
	},
});

export type ElectionsPositionHeroProps = {
	className?: string;
	backgroundColor?: (typeof backgroundTypeValues)[number];
	officeName: string;
	countyName?: string;
	cityName?: string;
	stateName: string;
	electionDate: string;
	filingDate: string;
	cta: ComponentButtonProps;
};

export function ElectionsPositionHero(props: ElectionsPositionHeroProps) {
	const backgroundColor = props.backgroundColor ?? 'midnight';
	const { base, content, infoGrid } = styles({ backgroundColor });

	// Build location string: cityName, countyName, stateName (filtering out undefined values)
	const locationParts = [props.cityName, props.countyName, props.stateName].filter(Boolean);
	const headerText = `${props.officeName} in ${locationParts.join(', ')}`;

	return (
		<section className={cn(base(), props.className)} data-component='ElectionsPositionHero'>
			<Container size='xl'>
				<div className={content()}>
					<Text as='h1' styleType='heading-xl'>
						{headerText}
					</Text>
					<dl className={infoGrid()}>
						<div>
							<Text as='dt' styleType='subtitle-2'>
								Election date
							</Text>
							<Text as='dd' styleType='body-2'>
								{props.electionDate}
							</Text>
						</div>
						<div>
							<Text as='dt' styleType='subtitle-2'>
								Filing deadline
							</Text>
							<Text as='dd' styleType='body-2'>
								{props.filingDate}
							</Text>
						</div>
					</dl>
					<ComponentButton {...props.cta} className={cn('max-sm:w-full w-fit', props.cta.className)} />
				</div>
			</Container>
		</section>
	);
}
