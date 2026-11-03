'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { type Dispatch, type SetStateAction, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import { cn, tv } from './_lib/utils.ts';
import { IconResolver } from './IconResolver.tsx';
import { Button, ComponentButton, type ComponentButtonProps } from './Inputs/Button.tsx';
import { TextInput } from './Inputs/TextInput.tsx';
import { Text } from './Text.tsx';
import { trackPersonProfileNotifySubmitted, trackVoterGuideEvent } from '~/lib/analytics';
import { buildClaimRequestBody } from '~/lib/claimRequest';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Public by design. Without it the form shows no checkbox (local dev, tests); see `isRecaptchaConfigured`. */
const RECAPTCHA_SITE_KEY = process.env['NEXT_PUBLIC_RECAPTCHA_SITE_KEY'];

declare global {
	interface Window {
		grecaptcha?: {
			ready(callback: () => void): void;
			render(
				container: HTMLElement,
				params: { sitekey: string; callback(token: string): void; 'expired-callback'(): void; 'error-callback'(): void },
			): number;
		};
	}
}

/**
 * Stable identity for HubSpot's non-HubSpot ("collected") forms tool. DO NOT
 * rename or drop it.
 *
 * The site-wide HubSpot tracking script names a collected form after a CSS
 * selector built from the `<form>` tag's `id` **and** its class list. An id
 * alone yields `#person-claim-notify`; an id plus classes yields
 * `#person-claim-notify .flex, .w-full, …`, which re-keys the form in HubSpot the
 * moment anyone touches its spacing. HubSpot then files submissions under a new
 * form and orphans the workflows attached to the old one, with no error
 * anywhere. That is why the `<form>` carries the id and nothing else: every
 * styling class lives on the wrapper `<div>` inside it.
 *
 * It is the id the removed "ask [Name] to complete their profile" form used
 * (until 2026-10-16), so submissions land where that form's did. The input
 * `name`s are HubSpot's default contact properties for the same reason.
 */
export const PROFILE_REQUEST_FORM_ID = 'person-claim-notify';

/**
 * The pop-up's copy lives here rather than in Studio, like the pledge pop-up's:
 * it is not a page section, so there is no block to hang fields on.
 */
export const PROFILE_REQUEST_COPY = {
	candidate: {
		overline: 'For candidates',
		title: (name: string) => `Are you ${name}?`,
		body: 'Create a free account at GoodParty.org to claim and customize your profile. Our voter guide is dedicated to spotlighting independent, people-first, and anti-corruption candidates.',
		button: 'Claim your profile',
	},
	voter: {
		overline: 'For voters',
		title: (location: string | null) => (location ? `Are you a ${location} voter?` : 'Are you a local voter?'),
		body: (name: string) =>
			`Ask ${name} to complete their profile so voters can see their bio and top campaign issues. Your community deserves accountable, transparent leadership.`,
		button: 'Send a request',
		success: (name: string) => `Thanks! We'll ask ${name} to complete their GoodParty.org profile.`,
	},
} as const;

const styles = tv({
	slots: {
		overlay: 'fixed inset-0 z-40 bg-black/70 data-[state=open]:animate-in data-[state=open]:fade-in',
		// Figma: 1064 wide with a 416px candidate panel on the left; 24px margins on the
		// phone, where the voter half comes first and the candidate half closes the card.
		// Side by side only from lg: at tablet width the voter form would get ~200px.
		content: [
			'fixed inset-x-0 top-1/2 z-50 mx-auto flex max-h-[calc(100dvh-3rem)] w-[calc(100%-3rem)] max-w-[66.5rem] -translate-y-1/2 flex-col overflow-y-auto',
			'rounded-lg border border-neutral-300 bg-white text-black shadow-lg focus:outline-none',
			'lg:grid lg:min-h-[46.75rem] lg:grid-cols-[26rem_1fr] lg:border-0',
		],
		candidatePanel: [
			'flex flex-col justify-center gap-4 px-4 py-8 md:px-10 lg:order-first lg:py-12 lg:pl-11 lg:pr-8',
			'bg-[radial-gradient(ellipse_120%_100%_at_50%_0%,var(--color-white)_0%,var(--color-blue-100)_50%,var(--color-red-100)_100%)]',
		],
		voterPanel: 'flex flex-col justify-center gap-7 px-4 py-8 md:px-10 lg:py-12 lg:pl-10 lg:pr-12',
		header: 'flex flex-col gap-4',
		overlineRow: 'flex items-center gap-2',
		iconCircle: 'flex size-12 shrink-0 items-center justify-center rounded-full',
		overline: 'font-primary text-[1.125rem]/[1.75rem] font-semibold',
		title: 'font-primary text-[2rem]/[2.75rem] font-semibold md:text-[2.5rem]/[3.25rem]',
		body: 'font-secondary text-[1.125rem]/[1.75rem] md:text-[1.25rem]/[1.75rem]',
		fields: 'grid w-full grid-cols-1 gap-4 text-left md:grid-cols-2',
		input: 'h-10 min-h-10 px-3 py-0 text-[1rem]/[1.5rem]',
		close: 'absolute right-3 top-3 md:right-5 md:top-5',
	},
});

export type ProfileRequestModalProps = {
	/** The Studio button's label, on the card's trigger. */
	triggerLabel: string;
	/** The candidate half's sign-up button: the Studio button, with its tracking and form id. */
	claimButton: ComponentButtonProps;
	personId: string;
	candidateName: string;
	/** The place the voter half asks about ("Are you a [Location] voter?"). */
	locationLabel: string | null;
};

/**
 * The unclaimed profile's claim card button and the pop-up it opens: the
 * candidate claims their page through sign-up, and a voter asks the candidate
 * to complete it. Figma 2684:9074 (desktop) and 2686:19897 (phone).
 */
export function ProfileRequestModal(props: ProfileRequestModalProps) {
	const { overlay, content, candidatePanel, voterPanel, header, overlineRow, iconCircle, overline, title, body, close } = styles();

	return (
		<Dialog.Root
			onOpenChange={open => {
				if (open) trackVoterGuideEvent('claimModalOpen', { source: 'claim_block' });
			}}
		>
			<Dialog.Trigger asChild>
				<Button
					parent='ProfileRequestModal'
					styleType='secondary'
					styleSize='lg'
					className='w-full md:w-fit'
					iconRight={<IconResolver icon='arrow-up-right' className='size-4 min-w-4' />}
				>
					{props.triggerLabel}
				</Button>
			</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Overlay className={overlay()} />
				<Dialog.Content className={content()} data-component='ProfileRequestModal' aria-describedby={undefined}>
					<section className={voterPanel()}>
						<div className={header()}>
							<div className={overlineRow()}>
								<span className={cn(iconCircle(), 'bg-blue-100')}>
									<IconResolver icon='user-round' className='size-6' />
								</span>
								<p className={overline()}>{PROFILE_REQUEST_COPY.voter.overline}</p>
							</div>
							<Dialog.Title asChild>
								<h2 className={title()}>{PROFILE_REQUEST_COPY.voter.title(props.locationLabel)}</h2>
							</Dialog.Title>
							<p className={body()}>{PROFILE_REQUEST_COPY.voter.body(props.candidateName)}</p>
						</div>
						<ProfileRequestForm personId={props.personId} candidateName={props.candidateName} />
					</section>
					<section className={candidatePanel()}>
						<div className={overlineRow()}>
							<span className={cn(iconCircle(), 'bg-white')}>
								<IconResolver icon='user-round' className='size-6' />
							</span>
							<p className={overline()}>{PROFILE_REQUEST_COPY.candidate.overline}</p>
						</div>
						<h2 className={title()}>{PROFILE_REQUEST_COPY.candidate.title(props.candidateName)}</h2>
						<p className={body()}>{PROFILE_REQUEST_COPY.candidate.body}</p>
						<ComponentButton
							{...props.claimButton}
							label={PROFILE_REQUEST_COPY.candidate.button}
							// Not the block's own class names: they pad the card's button for its own layout.
							className='w-full md:w-fit'
							iconRight={<IconResolver icon='arrow-up-right' className='size-4 min-w-4' />}
							buttonProps={{ styleType: 'secondary', styleSize: 'md' }}
						/>
					</section>
					<Dialog.Close asChild>
						<Button
							parent='ProfileRequestModal'
							styleType='ghost'
							iconOnly
							aria-label='Close'
							className={close()}
							iconLeft={<IconResolver icon='x' className='size-6' />}
						/>
					</Dialog.Close>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}

let recaptchaScript: Promise<void> | undefined;

async function loadRecaptcha(): Promise<void> {
	recaptchaScript ??= new Promise<void>((resolve, reject) => {
		const script = document.createElement('script');
		script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
		script.async = true;
		script.addEventListener('load', () => (window.grecaptcha ? window.grecaptcha.ready(resolve) : reject(new Error('reCAPTCHA missing'))), {
			once: true,
		});
		script.addEventListener(
			'error',
			() => {
				recaptchaScript = undefined;
				script.remove();
				reject(new Error('reCAPTCHA failed to load'));
			},
			{ once: true },
		);
		document.head.appendChild(script);
	});
	return recaptchaScript;
}

/**
 * Google's "I'm not a robot" box (Figma draws it above the button). Google draws
 * the widget itself at a fixed 304 by 78, so it cannot take the frame's width.
 * A token is single use, so the form remounts this after a failed send.
 */
function RecaptchaCheckbox({ siteKey, onToken }: { siteKey: string; onToken: Dispatch<SetStateAction<string | null>> }) {
	const container = useRef<HTMLDivElement>(null);
	const [failed, setFailed] = useState(false);

	useEffect(() => {
		let cancelled = false;
		loadRecaptcha()
			.then(() => {
				if (cancelled || !container.current || !window.grecaptcha) return;
				window.grecaptcha.render(container.current, {
					sitekey: siteKey,
					callback: token => onToken(token),
					'expired-callback': () => onToken(null),
					'error-callback': () => onToken(null),
				});
			})
			.catch(() => {
				if (!cancelled) setFailed(true);
			});
		return () => {
			cancelled = true;
		};
	}, [siteKey, onToken]);

	if (failed) {
		return (
			<Text styleType='caption' className='text-error-600' role='alert'>
				The spam check could not load. Refresh the page to try again.
			</Text>
		);
	}
	return <div ref={container} className='min-h-[4.875rem]' data-component='RecaptchaCheckbox' />;
}

type RequestValues = { firstname: string; lastname: string; email: string; city: string };

/**
 * The voter half's form. Exported so the HubSpot id contract can be asserted
 * without standing up Radix's dialog, whose event delegation does not survive
 * JSDOM.
 */
export function ProfileRequestForm({
	personId,
	candidateName,
	recaptchaSiteKey = RECAPTCHA_SITE_KEY,
}: {
	personId: string;
	candidateName: string;
	recaptchaSiteKey?: string;
}) {
	const { fields, input } = styles();
	const [isSuccess, setIsSuccess] = useState(false);
	const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
	const [recaptchaAttempt, setRecaptchaAttempt] = useState(0);
	const awaitingRecaptcha = Boolean(recaptchaSiteKey) && !recaptchaToken;
	const {
		register,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<RequestValues>({ defaultValues: { firstname: '', lastname: '', email: '', city: '' } });

	async function onSubmit(values: RequestValues) {
		if (awaitingRecaptcha) {
			setError('root', { message: 'Please tick “I’m not a robot” first.' });
			return;
		}
		try {
			const res = await fetch('/api/people/claim-request', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				// `notify` marks this as a visitor nudging someone else, which is what
				// gp-api counts into that person's candidate_profile_requests. The last
				// name and city are not in gp-api's contract; HubSpot's capture of the
				// form is what records them.
				body: buildClaimRequestBody({
					personId,
					firstname: values.firstname,
					email: values.email,
					source: 'notify',
					...(recaptchaToken ? { recaptchaToken } : {}),
				}),
			});
			if (!res.ok) throw new Error('Submission failed');
			// The lead is stored by now, so reading the id back must not be able to
			// fail the submission.
			let claimRequestId: string | null = null;
			try {
				const payload = (await res.json()) as { claimRequestId?: string | null };
				claimRequestId = payload.claimRequestId ?? null;
			} catch {
				claimRequestId = null;
			}
			trackPersonProfileNotifySubmitted({ personId, claimRequestId });
			setIsSuccess(true);
		} catch {
			setError('root', { message: 'Something went wrong. Please try again.' });
			// Google accepts a token once, so a retry needs a fresh tick.
			if (recaptchaSiteKey) {
				setRecaptchaToken(null);
				setRecaptchaAttempt(attempt => attempt + 1);
			}
		}
	}

	if (isSuccess) {
		return (
			<div className='rounded-md border border-success-200 bg-success-50 px-4 py-3' role='status' aria-live='polite'>
				<Text styleType='body-2'>{PROFILE_REQUEST_COPY.voter.success(candidateName)}</Text>
			</div>
		);
	}

	// The checkbox and the button sit outside the <form> on purpose. Google's
	// widget adds a hidden `g-recaptcha-response` field to whatever form holds it,
	// and HubSpot collects every field in `#person-claim-notify`. The button still
	// submits the form through its `form` attribute.
	return (
		<div className='flex w-full flex-col gap-4'>
			<form id={PROFILE_REQUEST_FORM_ID} onSubmit={e => void handleSubmit(onSubmit)(e)} noValidate>
				<div className={fields()}>
					<TextInput label='First Name' placeholder='First Name' autoComplete='given-name' className={input()} {...register('firstname')} />
					<TextInput label='Last Name' placeholder='Last Name' autoComplete='family-name' className={input()} {...register('lastname')} />
					<TextInput
						label='Email'
						placeholder='Email'
						type='email'
						autoComplete='email'
						inputMode='email'
						className={input()}
						error={errors.email?.message}
						{...register('email', {
							required: 'Email is required',
							pattern: { value: EMAIL_PATTERN, message: 'Enter a valid email address' },
						})}
					/>
					<TextInput label='City' placeholder='City' autoComplete='address-level2' className={input()} {...register('city')} />
				</div>
			</form>
			{recaptchaSiteKey && <RecaptchaCheckbox key={recaptchaAttempt} siteKey={recaptchaSiteKey} onToken={setRecaptchaToken} />}
			{errors.root?.message && (
				<Text styleType='caption' className='text-error-600' role='alert'>
					{errors.root.message}
				</Text>
			)}
			<Button
				parent='ProfileRequestModal'
				type='submit'
				form={PROFILE_REQUEST_FORM_ID}
				styleType='primary'
				styleSize='md'
				className='w-full md:w-fit'
				isLoading={isSubmitting}
				disabled={isSubmitting || awaitingRecaptcha}
				iconRight={<IconResolver icon='arrow-up-right' className='size-4 min-w-4' />}
			>
				{PROFILE_REQUEST_COPY.voter.button}
			</Button>
		</div>
	);
}
