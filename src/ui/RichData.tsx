import type { ReactNode } from 'react';
import { PortableText, type PortableTextProps } from '@portabletext/react';

import { resolveComponentColor } from './_lib/resolveComponentColor.tsx';

import { Anchor } from './Anchor.tsx';
import { CircleIcon } from './CircleIcon.tsx';
import { FeatureTooltip } from './FeatureTooltip.tsx';
import { ResponsiveImage } from './ResponsiveImage.tsx';
import { IconResolver } from './IconResolver.tsx';

export function isRecord(value: unknown): value is Record<string, unknown> {
	return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

const types = () => ({
	image(component) {
		return <ResponsiveImage image={component.value} />;
	},
});

const additionalMarks = {
	inlineInternalLink(mark) {
		return (
			<>
				{mark.value?.field_internalLink?.href ? (
					<Anchor href={mark.value?.field_internalLink?.href} className='link-inverse'>
						{mark.children}
					</Anchor>
				) : (
					mark.children
				)}
			</>
		);
	},
	inlineExternalLink(mark) {
		return (
			<>
				{mark.value?.field_externalLink ? (
					<Anchor href={mark.value?.field_externalLink} className='link-inverse'>
						{mark.children}
					</Anchor>
				) : (
					mark.children
				)}
			</>
		);
	},
	inlineEmailLink(mark) {
		return (
			<>
				{mark.value?.field_emailLink ? (
					<Anchor href={mark.value?.field_emailLink} className='link-inverse'>
						{mark.children}
					</Anchor>
				) : (
					mark.children
				)}
			</>
		);
	},
	inlineFeaturesItem(mark) {
		const feature = mark.value?.ref_inlineFeaturesItem;
		const overview = feature?.featureOverview;
		if (!feature) return mark.children;

		return (
			<FeatureTooltip
				name={overview?.field_featureName}
				description={overview?.field_featureDescription}
				icon={<CircleIcon icon={overview?.field_icon} iconBg={resolveComponentColor(feature.planColor)} />}
			>
				<span className='underline cursor-pointer'>{mark.children}</span>
			</FeatureTooltip>
		);
	},
	highlight(mark) {
		return <span className='bg-yellow-200 px-1 rounded text-dark'>{mark.children}</span>;
	},
};

export function getAnchorId(text: string) {
	return text.toString().toLowerCase().replace(/ /g, '-');
}

export const block = ({ isInline }: { isInline?: boolean }) => ({
	normal(mark) {
		if (isInline) {
			return <>{mark.children}</>;
		}
		return <p className='font-secondary'>{mark.children}</p>;
	},
	blockquote(mark) {
		return <blockquote className='font-secondary py-2 pl-8 border-l-4 border-lavender-200 italic'>"{mark.children}"</blockquote>;
	},
	h1(mark) {
		return <h1 id={getAnchorId(mark.children)}>{mark.children}</h1>;
	},
	h2(mark) {
		return <h2 id={getAnchorId(mark.children)}>{mark.children}</h2>;
	},
	h3(mark) {
		return <h3>{mark.children}</h3>;
	},
	h4(mark) {
		return <h4>{mark.children}</h4>;
	},
	h5(mark) {
		return <h5>{mark.children}</h5>;
	},
	h6(mark) {
		return <h6>{mark.children}</h6>;
	},
});

export const marks = () => ({
	em(mark) {
		return <em>{mark.children}</em>;
	},
	sub(mark) {
		return <sub>{mark.children}</sub>;
	},
	sup(mark) {
		return <sup>{mark.children}</sup>;
	},
	strong(mark) {
		return <strong>{mark.children}</strong>;
	},
	code(mark) {
		return <code>{mark.children}</code>;
	},
	underline(mark) {
		return <span className='underline'>{mark.children}</span>;
	},
	'strike-through': mark => {
		return <del>{mark.children}</del>;
	},
	...additionalMarks,
});

export function RichData({ isInline, value }: { isInline?: boolean; value: PortableTextProps['value'] | ReactNode }) {
	if (!value) {
		return null;
	}
	if (!Array.isArray(value)) {
		if (typeof value === 'object') {
			if (!('_key' in value) && !('_type' in value)) {
				console.warn('Invalid RichText object', value);
				return null;
			}
		} else {
			return value;
		}
	}
	return (
		<PortableText
			value={value}
			components={{
				types: types(),
				marks: marks(),
				block: block({ isInline }),
				list: {
					bullet: ({ children }) => <ul className='list-disc pl-6'>{children}</ul>,
					number: ({ children }) => <ol className='list-decimal pl-6'>{children}</ol>,
				},
				listItem: {
					bullet: ({ children }) => <li>{children}</li>,
					number: ({ children }) => <li>{children}</li>,
					checked: ({ children }) => (
						<li className='flex gap-2'>
							<IconResolver icon='check' />
							<div>{children}</div>
						</li>
					),
				},
				hardBreak: () => (isInline ? false : <br />),
			}}
		/>
	);
}
