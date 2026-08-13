'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { APP_SIGN_UP_HREF, trackEvent, trackSignUpClicked } from '~/lib/analytics';
import { buildClaimRequestBody } from '~/lib/claimRequest';
import { ClaimProfileBlock } from '~/ui/ClaimProfileBlock';
import { Button, ButtonLink } from '~/ui/Inputs/Button';
import { TextInput } from '~/ui/Inputs/TextInput';
import { IconResolver } from '~/ui/IconResolver';
import { Text } from '~/ui/Text';
import { scrollToPersonClaimForm } from './claimFormAnchor';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Stable identity for HubSpot's non-HubSpot ("collected") forms tool. DO NOT
 * rename or drop it.
 *
 * The site-wide HubSpot tracking script names a collected form after a CSS
 * selector built from the `<form>` tag's `id` **and** its class list — the id is
 * not a replacement for the classes, it is a prefix to them. An id alone yields
 * `#person-claim-notify`; an id plus classes yields
 * `#person-claim-notify .flex, .w-full, .flex-col, .gap-4, .text-left`, which
 * re-keys the form in HubSpot the moment anyone touches its spacing or width.
 * HubSpot then files submissions under a brand-new form and orphans the
 * workflows attached to the old one, with no error anywhere. That is why the
 * `<form>` below carries the id and nothing else: every styling class lives on
 * the wrapper `<div>` inside it, where designers can churn it freely.
 *
 * Distinct from {@link PersonClaimCTABand}'s id on purpose. HubSpot groups
 * submissions by this value, and the two forms are different intents that want
 * different follow-up: this one is a visitor asking us to nudge someone else,
 * that one is the person claiming their own page.
 */
const NOTIFY_FORM_ID = 'person-claim-notify';

type NotifyValues = { firstname: string; email: string; marketingConsent: boolean };

/**
 * The "Not [Name]?" form in the dialog body. Exported so the HubSpot id contract
 * can be asserted directly (see claimFormIds.test.tsx) without standing up
 * Radix's dialog, whose event delegation does not survive JSDOM.
 */
export function NotifyForm({ personId, displayName }: { personId: string; displayName: string }) {
	const [isSuccess, setIsSuccess] = useState(false);
	// marketingConsent starts false against the Figma dialog (1901:51851), which
	// draws the box ticked: a pre-ticked box opts the sender in unless they notice
	// and clear it, which is not consent under GDPR. Do not restore Figma parity.
	const {
		register,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<NotifyValues>({ defaultValues: { firstname: '', email: '', marketingConsent: false } });

	async function onSubmit(values: NotifyValues) {
		try {
			const res = await fetch('/api/people/claim-request', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				// `notify` marks this as a visitor nudging someone else, which is what
				// gp-api counts into that person's candidate_profile_requests.
				body: buildClaimRequestBody({
					personId,
					firstname: values.firstname,
					email: values.email,
					marketingConsent: values.marketingConsent,
					source: 'notify',
				}),
			});
			if (!res.ok) throw new Error('Submission failed');
			trackEvent('Person Profile Notify Submitted', { personId });
			setIsSuccess(true);
		} catch {
			setError('root', { message: 'Something went wrong. Please try again.' });
		}
	}

	if (isSuccess) {
		return (
			<div
				className='rounded-md border border-success-200 bg-success-50 px-4 py-3'
				role='status'
				aria-live='polite'
			>
				<Text styleType='body-2'>
					Thanks — we&apos;ll let {displayName} know their GoodParty.org profile is ready to claim.
				</Text>
			</div>
		);
	}

	return (
		<form id={NOTIFY_FORM_ID} onSubmit={(e) => void handleSubmit(onSubmit)(e)} noValidate>
			<div className='flex w-full flex-col gap-4 text-left'>
				<TextInput
					label='Your name (optional)'
					autoComplete='name'
					error={errors.firstname?.message}
					{...register('firstname')}
				/>
				<TextInput
					label='Your email'
					type='email'
					required
					autoComplete='email'
					inputMode='email'
					error={errors.email?.message}
					{...register('email', {
						required: 'Email is required',
						pattern: { value: EMAIL_PATTERN, message: 'Enter a valid email address' },
					})}
				/>
				<label htmlFor='notify-marketing-consent' className='flex items-start gap-2.5'>
					<input
						id='notify-marketing-consent'
						type='checkbox'
						className='mt-0.5 h-5 w-5 shrink-0 rounded border-neutral-300 text-btn-primary-bg accent-btn-primary-bg focus:outline-none focus-visible:ring-2 focus-visible:ring-btn-primary-bg/30'
						{...register('marketingConsent')}
					/>
					<Text as='span' styleType='body-2'>
						Sign up for marketing communications from{' '}
						<a
							href='https://goodparty.org'
							target='_blank'
							rel='noopener noreferrer'
							className='underline'
							onClick={(e) => e.stopPropagation()}
						>
							GoodParty.org
						</a>
						. Unsubscribe at any time.
					</Text>
				</label>
				{errors.root?.message && (
					<Text styleType='caption' className='text-error-600' role='alert'>
						{errors.root.message}
					</Text>
				)}
				<Button
					parent='ClaimProfileModal'
					type='submit'
					styleType='secondary'
					styleSize='md'
					isLoading={isSubmitting}
					disabled={isSubmitting}
					className='w-fit'
				>
					Notify {displayName}
				</Button>
			</div>
		</form>
	);
}

export type Persona = 'candidate' | 'officeholder' | 'both' | 'past';

export type ClaimProfileModalProps = {
	personId: string;
	displayName: string;
	persona: Persona;
	/**
	 * Most specific place the profile resolves to (city, else county, else
	 * state). Fills the "[Location]" the Figma voter card opens with for someone
	 * in office; omit it and that sentence falls back to a generic subject.
	 */
	locationLabel?: string | null;
	/**
	 * Which trigger to render (the dialog itself is identical):
	 *  - `banner`      full-width yellow CMS banner (default; legacy section use)
	 *  - `voter-card`  in-column light-blue prompt aimed at visitors (nudge them to complete their profile)
	 *  - `owner-card`  in-column light-blue prompt aimed at the person ("Are you …?")
	 */
	variant?: 'banner' | 'voter-card' | 'owner-card';
};

/** Running now — the tense the owner-facing copy is written in. */
function isRunning(persona: Persona): boolean {
	return persona === 'candidate' || persona === 'both';
}

/** Currently serving — the axis the voter-facing copy splits on (see `voterCopy`). */
function holdsOffice(persona: Persona): boolean {
	return persona === 'officeholder' || persona === 'both';
}

/**
 * Voter-facing card copy, verbatim from the unclaimed Figma frames.
 *
 * Note the split is NOT the owner card's "is running" one. The candidate-only
 * frame (D, card 1958:108619) sells casting an informed vote, while both frames
 * for someone already in office — officeholder (E, card 1928:99467) and
 * simultaneous candidate/officeholder (F, card 1928:100987), which are
 * word-for-word identical — sell transparency about their record. So persona
 * `both` takes the office copy, the opposite of how `isRunning` groups it.
 *
 * `location` fills Figma's "[Location]"; there is no locality on the view, so
 * the caller derives it and a profile that resolves to no place at all keeps the
 * sentence readable with a generic subject rather than an empty one.
 *
 * Persona `past` never reaches here: past-election profiles lead with the voter
 * guide disclaimer instead of a claim prompt (Figma H), so no claim card renders.
 */
function voterCopy(displayName: string, persona: Persona, location: string | null): { heading: string; body: string } {
	if (holdsOffice(persona)) {
		return {
			heading: `${location ?? 'Your community'} deserves greater transparency. Ask ${displayName} to complete their profile.`,
			body: `Advocate for transparency in local government. Send a message to ${displayName} to share their top priorities and accomplishments with constituents like you.`,
		};
	}
	return {
		heading: `Want to learn more about this candidate? Ask ${displayName} to complete their profile.`,
		body: `Step into the voting booth fully informed. Send a message to ${displayName} to share their top issues.`,
	};
}

/** In-column light-blue claim prompt (voter- or owner-facing) — a Figma content-well card. */
function ClaimPromptCard({
	displayName,
	persona,
	locationLabel = null,
	variant,
	onClaim,
}: {
	displayName: string;
	persona: Persona;
	locationLabel?: string | null;
	variant: 'voter-card' | 'owner-card';
	onClaim: VoidFunction;
}) {
	const owner = variant === 'owner-card';
	const voter = voterCopy(displayName, persona, locationLabel);
	const heading = owner ? `Are you ${displayName}?` : voter.heading;
	const body = owner
		? isRunning(persona)
			? 'Complete your profile now to share why you\u2019re running, your top issues, and how voters can reach you.'
			: 'Complete your profile now to share your record, your priorities in office, and how constituents can reach you.'
		: voter.body;
	const cta = owner ? 'Complete your profile' : 'Send request';

	return (
		<div
			className='flex flex-col gap-4 rounded-3xl border border-blue-200 bg-blue-100 p-6'
			data-component='ClaimPromptCard'
			data-variant={variant}
		>
			<Text as='h2' styleType='subtitle-1'>
				{heading}
			</Text>
			<Text styleType='body-2'>{body}</Text>
			<Button
				parent='ClaimProfileModal'
				styleType='primary'
				styleSize='md'
				className='w-fit'
				onClick={onClaim}
				iconRight={owner ? undefined : <IconResolver icon='arrow-up-right' className='h-4 w-4' />}
			>
				{cta}
			</Button>
		</div>
	);
}

export function ClaimProfileModal({
	personId,
	displayName,
	persona,
	locationLabel = null,
	variant = 'banner',
}: ClaimProfileModalProps) {
	const [open, setOpen] = useState(false);
	const running = isRunning(persona);

	// The owner-facing prompts ("is this you?") pull the person down to the claim
	// form at the bottom of their own profile rather than opening this dialog, so
	// there is one place to claim from and the Win/Serve branch happens once, on
	// submit. If the band is not on the page the dialog is still the fallback.
	const claimHere = () => {
		if (!scrollToPersonClaimForm()) setOpen(true);
	};
	// The voter-facing prompt is unchanged: it asks a visitor to nudge someone
	// else, which is the dialog's "Not [Name]?" notify form, not the claim form.
	const openDialog = () => setOpen(true);

	const headline = `Is this you, ${displayName}?`;
	const bannerBody = running
		? 'Claim this profile to share why you\u2019re running, your top issues, and how voters can reach you.'
		: 'Claim this profile to share your record, your priorities in office, and how constituents can reach you.';

	return (
		<Dialog.Root open={open} onOpenChange={setOpen}>
			{variant === 'banner' ? (
				<ClaimProfileBlock
					layout='banner'
					backgroundColor='bright-yellow'
					headline={headline}
					body={bannerBody}
					claimButton={{
						buttonType: 'button',
						label: 'Claim your profile',
						onClick: claimHere,
						buttonProps: { styleType: 'primary', styleSize: 'md' },
					}}
				/>
			) : (
				<ClaimPromptCard
					displayName={displayName}
					persona={persona}
					locationLabel={locationLabel}
					variant={variant}
					onClaim={variant === 'owner-card' ? claimHere : openDialog}
				/>
			)}

			<Dialog.Portal>
				<Dialog.Overlay className='fixed inset-0 z-40 bg-midnight-900/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in' />
				<Dialog.Content
					className='fixed left-1/2 top-1/2 z-50 flex w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col gap-6 rounded-2xl bg-white p-6 shadow-xl focus:outline-none sm:p-8'
					aria-describedby={undefined}
				>
					<div className='flex items-start justify-between gap-4'>
						<Dialog.Title asChild>
							<Text as='h2' styleType='heading-sm'>
								Claim your GoodParty.org profile
							</Text>
						</Dialog.Title>
						<Dialog.Close asChild>
							<Button
								parent='ClaimProfileModal'
								styleType='ghost'
								iconOnly
								aria-label='Close'
								iconLeft={<IconResolver icon='x' className='h-5 w-5' />}
							/>
						</Dialog.Close>
					</div>

					<Text styleType='body-2'>
						If you&apos;re {displayName}, create a free account to verify your identity and take control of
						this page — add your story, issues, and contact details.
					</Text>

					<ButtonLink
						parent='ClaimProfileModal'
						href={APP_SIGN_UP_HREF}
						styleType='primary'
						styleSize='lg'
						className='w-full'
						onClick={() =>
							trackSignUpClicked({ href: APP_SIGN_UP_HREF, label: 'Claim profile', formId: null })
						}
						iconRight={<IconResolver icon='arrow-up-right' className='h-5 w-5' />}
					>
						Claim this profile
					</ButtonLink>

					<div className='flex flex-col gap-4 border-t border-gray-200 pt-6'>
						<Text styleType='subtitle-2'>Not {displayName}?</Text>
						<Text styleType='body-2'>
							Let them know their profile is ready to claim on GoodParty.org.
						</Text>
						<NotifyForm personId={personId} displayName={displayName} />
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
