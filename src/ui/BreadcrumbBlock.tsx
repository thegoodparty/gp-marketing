import { cn, tv } from './_lib/utils';
import { Breadcrumbs } from './Breadcrumbs';
import { Container } from './Container';

const styles = tv({
	slots: {
		base: 'py-(--container-padding)',
	},
	variants: {
		backgroundColor: {
			midnight: {
				base: 'bg-midnight-900',
			},
			cream: {
				base: 'bg-goodparty-cream',
			},
		},
	},
});

export type BreadcrumbItem = {
	id?: string;
	href?: string;
	label: string;
};

export type BreadcrumbBackgroundColor = 'cream' | 'midnight';

export type BreadcrumbBlockProps = {
	className?: string;
	backgroundColor?: BreadcrumbBackgroundColor;
	breadcrumbs: BreadcrumbItem[];
};

export function BreadcrumbBlock(props: BreadcrumbBlockProps) {
	const backgroundColor = props.backgroundColor ?? 'cream';
	const { base } = styles({ backgroundColor });

	return (
		<section className={cn(base(), props.className)} data-component='BreadcrumbBlock'>
			<Container size='xl'>
				<Breadcrumbs items={props.breadcrumbs} backgroundColor={backgroundColor} />
			</Container>
		</section>
	);
}
