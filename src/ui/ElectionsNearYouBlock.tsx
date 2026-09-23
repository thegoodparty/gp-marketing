'use client';

import { useState } from 'react';

import { cn, tv } from './_lib/utils.ts';
import { Container } from './Container.tsx';
import { Text } from './Text.tsx';
import { ComponentButton } from './Inputs/Button.tsx';
import { primaryButtonStyleType } from './_lib/designTypesStore.ts';

const styles = tv({
	slots: {
		base: 'relative bg-midnight-900',
		content: 'relative flex flex-col gap-6 py-16 px-4 text-center md:items-center',
		textContainer: 'flex flex-col gap-3 md:gap-4 max-w-[40rem] mx-auto',
		searchRow: 'flex flex-col gap-4 w-full max-w-md mx-auto sm:flex-row sm:items-start',
		inputColumn: 'flex flex-col gap-1.5 w-full text-left',
		input: [
			'w-full min-h-12 rounded-lg border border-black/30 bg-white px-4 py-3',
			'text-black placeholder:text-black/70',
			'focus:border-black focus:outline-none focus:ring-2 focus:ring-black/30',
			'font-secondary text-[0.875rem]',
		],
		error: 'font-secondary text-caption text-error-600',
	},
	variants: {
		backgroundColor: {
			cream: {
				base: 'bg-goodparty-cream',
				content: 'text-black',
			},
			midnight: {
				base: 'bg-midnight-900',
				content: 'text-white',
			},
		},
	},
});

export type ElectionsNearYouBlockProps = {
	className?: string;
	heading?: string;
	body?: string;
	buttonLabel?: string;
	backgroundColor?: 'cream' | 'midnight';
	// Pending Emily's confirmation on what the social-proof line says; the field is
	// editable in Sanity already so content can be authored ahead of the UI.
	showSocialProof?: boolean;
};

export function ElectionsNearYouBlock(props: ElectionsNearYouBlockProps) {
	const [error, setError] = useState<string | undefined>(undefined);

	const {
		base,
		content,
		textContainer,
		searchRow,
		inputColumn,
		input,
		error: errorClass,
	} = styles({
		backgroundColor: props.backgroundColor ?? 'midnight',
	});

	// Submit and validation are wired in a follow-up task; this only guards against
	// a native form submit and clears any previously shown error.
	const handleSearch = () => {
		setError(undefined);
	};

	return (
		<section className={cn(base(), props.className)} data-component='ElectionsNearYouBlock'>
			<Container>
				<div className={content()}>
					<div className={textContainer()}>
						{props.heading && (
							<Text as='h2' styleType='heading-lg'>
								{props.heading}
							</Text>
						)}
						{props.body && <Text styleType='body-1'>{props.body}</Text>}
					</div>
					<div className={searchRow()}>
						<div className={inputColumn()}>
							<input
								type='text'
								className={input()}
								placeholder='Enter your city or county'
								aria-label='City or county'
								aria-invalid={error ? true : undefined}
							/>
							{error && <span className={errorClass()}>{error}</span>}
						</div>
						<ComponentButton
							buttonType='button'
							label={props.buttonLabel ?? 'Search'}
							buttonProps={{ styleType: primaryButtonStyleType }}
							onClick={handleSearch}
							className='w-full sm:w-auto'
						/>
					</div>
				</div>
			</Container>
		</section>
	);
}
