import type { ReactNode } from 'react';
import { cn, tv } from './_lib/utils.ts';
import { Text } from './Text.tsx';
import { isValidRichText } from './_lib/isValidRichText.ts';

const styles = tv({
	slots: {
		base: 'flex flex-col gap-6',
		heading: '',
		content: '',
	},
});

export type ProfileContentCardProps = {
	className?: string;
	cardType?: 'about-me' | 'why-running' | 'top-issues';
	heading?: string;
	content?: ReactNode;
};

export function ProfileContentCard(props: ProfileContentCardProps) {
	const { base, heading, content } = styles();

	return (
		<article className={cn(base(), props.className)} data-component='ProfileContentCard'>
			{props.heading && (
				<Text as='h2' styleType='heading-md' className={heading()}>
					{props.heading}
				</Text>
			)}
			{isValidRichText(props.content) && (
				<div className={content()}>
					<Text styleType='body-1'>{props.content}</Text>
				</div>
			)}
		</article>
	);
}
