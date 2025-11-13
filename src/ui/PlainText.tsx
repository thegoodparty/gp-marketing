import type { JSX, ReactNode } from 'react';
import { Text, type TextProps } from './Text';

type Props<K extends keyof JSX.IntrinsicElements = 'div'> = TextProps<K> & {
	text?: ReactNode;
	isQuote?: boolean;
};

export function PlainText<K extends keyof JSX.IntrinsicElements = 'div'>(props: Props<K>) {
	const { text, className, ...rest } = props as Props<'blockquote'>;
	const paragraphs = text && typeof text === 'string' ? text.split(/\n/) : [];
	return paragraphs.length > 1 ? (
		<Text {...rest} className={`[&>*+*]:mt-6 [&>:first-child]:mt-0! [&>:last-child]:mb-0! flex flex-wrap [&_p]:w-full ${className}`}>
			{paragraphs.map((paragraph, index) => (
				<p key={`${paragraph.slice(0, 10)}-${String(index)}`} className={'font-secondary!'}>
					{(rest.as === 'blockquote' || props.isQuote) && (index === 0 || index === paragraphs.length - 1) ? (
						index === 0 ? (
							<>
								<span className='open-quote' />
								{paragraph}
							</>
						) : (
							<>
								{paragraph}
								<span className='close-quote' />
							</>
						)
					) : (
						paragraph
					)}
				</p>
			))}
		</Text>
	) : (
		<Text {...rest} className={className}>
			{rest.as === 'blockquote' || props.isQuote ? <>"{text}"</> : text}
		</Text>
	);
}
