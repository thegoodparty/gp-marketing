'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import {
	trackClickToCallCtaClicked,
	trackClickToCallCtaViewed,
	trackClickToCallPhoneSubmitted,
} from '~/lib/analytics';
import { cn, tv } from '~/ui/_lib/utils.ts';
import { resolveInverseButtonStyleType } from '~/ui/_lib/resolveButtonStyleType.ts';
import type { backgroundTypeValues } from '~/ui/_lib/designTypesStore.ts';
import { ComponentButton } from '~/ui/Inputs/Button.tsx';
import { Container } from '~/ui/Container.tsx';
import { FadeIn } from '~/ui/FadeIn.tsx';
import { Text } from '~/ui/Text.tsx';

const styles = tv({
	slots: {
		base: 'py-(--container-padding)',
		card: 'absolute inset-0 overflow-hidden rounded-2xl transition-transform duration-normal ease-smooth z-0 pointer-events-none group-hover:scale-[1.025]',
	},
	variants: {
		backgroundColor: {
			midnight: { base: 'bg-midnight-900' },
			cream: { base: 'bg-goodparty-cream' },
		},
		color: {
			red: { card: 'bg-red-100' },
			waxflower: { card: 'bg-waxflower-100' },
			'bright-yellow': { card: 'bg-bright-yellow-100' },
			'halo-green': { card: 'bg-halo-green-100' },
			blue: { card: 'bg-blue-100' },
			lavender: { card: 'bg-lavender-100' },
			midnight: { base: 'text-white', card: 'bg-midnight-900' },
			cream: { card: 'bg-goodparty-cream' },
		},
	},
});

function digitsOnly(value: string): string {
	return value.replace(/\D/g, '');
}

/** Basic US mobile validation: exactly 10 digits after stripping. */
export function isValidUsPhoneDigits(digits: string): boolean {
	return digits.length === 10;
}

export type ClickToCallBlockProps = {
	preframingText: string;
	inputPrompt: string;
	buttonText: string;
	microcopy: string;
	phoneNumberDisplay: string;
	responseTime: string;
	backgroundColor?: (typeof backgroundTypeValues)[number];
	color?: any;
	className?: string;
};

export function ClickToCallBlock(props: ClickToCallBlockProps) {
	const id = useId();
	const inputId = `click-to-call-phone-${id}`;
	const [phone, setPhone] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [submitted, setSubmitted] = useState(false);

	const backgroundColor = props.backgroundColor ?? 'cream';
	const color = props.color ?? 'red';
	const { base, card } = styles({ backgroundColor, color });
	const resolvedButtonStyle = resolveInverseButtonStyleType('primary', backgroundColor, color);

	const promptText = useMemo(() => {
		let t = props.inputPrompt;
		t = t.replace(/\[phone\]/gi, props.phoneNumberDisplay);
		t = t.replace(/\[time\]/gi, props.responseTime);
		return t;
	}, [props.inputPrompt, props.phoneNumberDisplay, props.responseTime]);

	useEffect(() => {
		const pagePath = typeof window !== 'undefined' ? window.location.pathname : null;
		trackClickToCallCtaViewed({ page_path: pagePath });
	}, []);

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const digits = digitsOnly(phone);
		const pagePath = typeof window !== 'undefined' ? window.location.pathname : null;

		trackClickToCallCtaClicked({ page_path: pagePath });

		if (!isValidUsPhoneDigits(digits)) {
			setError('Enter a valid 10-digit US phone number.');
			return;
		}
		setError(null);
		setSubmitted(true);
		trackClickToCallPhoneSubmitted({ page_path: pagePath });
	}

	return (
		<article className={cn(base(), props.className)} data-component='ClickToCallBlock'>
			<Container size='xl'>
				<div className='group relative'>
					<FadeIn>
						<div className='relative z-2 flex flex-col gap-6 p-6 text-center md:p-12 md:items-center'>
							<div className='flex max-w-2xl flex-col gap-4'>
								<Text styleType='body-1'>{props.preframingText}</Text>
								<Text styleType='body-1'>{promptText}</Text>
							</div>

							{submitted ? (
								<Text styleType='body-1'>Thanks. If this number looks right, you will get a call shortly.</Text>
							) : (
								<form
									className='flex w-full max-w-md flex-col items-stretch gap-4'
									onSubmit={handleSubmit}
									noValidate
								>
									<label className='sr-only' htmlFor={inputId}>
										Phone number
									</label>
									<input
										id={inputId}
										name='phone'
										type='tel'
										autoComplete='tel'
										inputMode='tel'
										placeholder='(555) 555-5555'
										className='rounded-full border border-black/20 bg-white px-5 py-3 text-left text-[0.875rem] text-black placeholder:text-neutral-400 focus:border-black focus:outline-none focus:ring-4 focus:ring-black/10'
										value={phone}
										onChange={(ev) => {
											setPhone(ev.target.value);
											if (error) setError(null);
										}}
										aria-invalid={Boolean(error)}
										aria-describedby={error ? `${inputId}-error` : undefined}
									/>
									{error && (
										<Text as='p' id={`${inputId}-error`} styleType='caption' className='text-red-600'>
											{error}
										</Text>
									)}
									<div className='flex justify-center'>
										<ComponentButton
											buttonType='button'
											label={props.buttonText}
											className='max-sm:w-full'
											buttonProps={{ styleType: resolvedButtonStyle, styleSize: 'lg', type: 'submit' }}
										/>
									</div>
								</form>
							)}

							<Text styleType='caption' className='max-w-xl'>
								{props.microcopy}
							</Text>
						</div>
					</FadeIn>
					<div className={card()}>
						<svg
							className='absolute z-1 max-md:top-0 max-md:left-0 md:-bottom-16 md:right-[20%] md:rotate-180'
							width='800'
							height='480'
							fill='none'
							xmlns='http://www.w3.org/2000/svg'
							aria-hidden
						>
							<ellipse cx='400' cy='240' rx='380' ry='200' fill='currentColor' className='text-black/5' />
						</svg>
					</div>
				</div>
			</Container>
		</article>
	);
}
