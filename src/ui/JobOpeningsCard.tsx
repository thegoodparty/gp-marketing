import { cn, tv } from './_lib/utils';
import { IconResolver } from './IconResolver';
import { Text } from './Text';
import { Anchor, type AnchorProps } from './Anchor';

const styles = tv({
	slots: {
		base: 'bg-white rounded-2xl p-6 overflow-clip flex flex-col h-full',
		content: 'flex flex-col flex-1 gap-6 md:gap-8',
		info: 'flex flex-col flex-1 gap-3 items-start',
		tag: 'bg-lavender-100 rounded-full px-4 py-2.5 font-secondary text-sm font-semibold',
		meta: 'flex items-center gap-2',
		metaText: 'font-secondary text-body-2',
		cta: [
			'group/button inline-flex items-center justify-center gap-2 w-full',
			'rounded-full border border-black px-6 py-2.5 h-10',
			'text-sm font-semibold font-secondary',
			'transition-all duration-normal ease-smooth',
			'hover:bg-black/5 focus:ring-4 focus:ring-[#A3A3A3]/50',
			'cursor-pointer',
		],
		ctaArrow: 'min-w-6 min-h-6 w-6 h-6',
	},
});

export type JobOpeningsCardProps = {
	className?: string;
	title?: string;
	tag?: string;
	location?: string;
	jobType?: string;
	href?: AnchorProps['href'];
};

export function JobOpeningsCard(props: JobOpeningsCardProps) {
	const { base, content, info, tag, meta, metaText, cta, ctaArrow } = styles();

	return (
		<div className={cn(base(), props.className)} data-component='JobOpeningsCard'>
			<div className={content()}>
				<div className={info()}>
					{props.title && (
						<Text as='h3' styleType='subtitle-1'>
							{props.title}
						</Text>
					)}
					{props.tag && <span className={tag()}>{props.tag}</span>}
					{props.location && (
						<div className={meta()}>
							<IconResolver icon='map-pin' />
							<span className={metaText()}>{props.location}</span>
						</div>
					)}
					{props.jobType && (
						<div className={meta()}>
							<IconResolver icon='briefcase-business' />
							<span className={metaText()}>{props.jobType}</span>
						</div>
					)}
				</div>
				{props.href ? (
					<Anchor href={props.href} target='_blank' rel='noopener noreferrer' className={cta()}>
						<span>Learn more</span>
						<IconResolver icon='arrow-right' className={ctaArrow()} />
					</Anchor>
				) : (
					<div className={cta()}>
						<span>Learn more</span>
						<IconResolver icon='arrow-right' className={ctaArrow()} />
					</div>
				)}
			</div>
		</div>
	);
}
