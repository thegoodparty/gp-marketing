'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { trackPersonProfileNotifySubmitted } from '~/lib/analytics';
import { buildClaimRequestBody } from '~/lib/claimRequest';
import { Button } from '~/ui/Inputs/Button';
import { TextInput } from '~/ui/Inputs/TextInput';
import { IconResolver } from '~/ui/IconResolver';
import { Text } from '~/ui/Text';

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
 * The dialog body from Figma 1901:51851 — name, email, marketing opt-in, and a
 * Cancel/Submit footer. Exported so the HubSpot id contract can be asserted
 * directly (see claimFormIds.test.tsx) without standing up Radix's dialog, whose
 * event delegation does not survive JSDOM; `onCancel` is therefore optional so
 * the form renders outside a `Dialog.Root` too.
 */
export function NotifyForm({
	personId,
	displayName,
	onCancel,
}: {
	personId: string;
	displayName: string;
	onCancel?: VoidFunction;
}) {
	const [isSuccess, setIsSuccess] = useState(false);
	// marketingConsent starts false against the Figma dialog, which draws the box
	// ticked: a pre-ticked box opts the sender in unless they notice and clear it,
	// which is not consent under GDPR. Do not restore Figma parity here.
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
			// The lead is stored by now, so reading the id back must not be able to
			// fail the submission — hence the fallback rather than a rethrow.
			let claimRequestId: string | null = null;
			try {
				const payload = (await res.json()) as { claimRequestId?: string | null };
				claimRequestId = payload.claimRequestId ?? null;
			} catch {
				claimRequestId = null;
			}
			// After the 201, so the count means completed asks. This is the signal
			// marketing automates on: gp-api's HubSpot counter only ever sees the
			// subjects that resolve to a single CRM contact — see
			// trackPersonProfileNotifySubmitted.
			trackPersonProfileNotifySubmitted({ personId, claimRequestId });
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
					label='Name (optional)'
					placeholder='First name'
					autoComplete='name'
					error={errors.firstname?.message}
					{...register('firstname')}
				/>
				<TextInput
					label='Email address'
					placeholder='Email address'
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
				<label htmlFor='notify-marketing-consent' className='flex items-start gap-2'>
					<input
						id='notify-marketing-consent'
						type='checkbox'
						className='mt-1 h-4 w-4 shrink-0 rounded-[4px] border-neutral-300 text-btn-primary-bg accent-btn-primary-bg focus:outline-none focus-visible:ring-2 focus-visible:ring-btn-primary-bg/30'
						{...register('marketingConsent')}
					/>
					<Text as='span' styleType='caption' className='text-neutral-500'>
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
				<div className='flex items-center justify-end gap-2'>
					{onCancel && (
						<Button
							parent='ClaimProfileModal'
							type='button'
							styleType='outline'
							styleSize='md'
							onClick={onCancel}
						>
							Cancel
						</Button>
					)}
					<Button
						parent='ClaimProfileModal'
						type='submit'
						styleType='primary'
						styleSize='md'
						isLoading={isSubmitting}
						disabled={isSubmitting}
					>
						Submit
					</Button>
				</div>
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
	 * state). Fills the "[Location]" the Figma card opens with for someone in
	 * office; omit it and that sentence falls back to a generic subject.
	 */
	locationLabel?: string | null;
};

/** Currently serving — the axis the voter-facing copy splits on (see `voterCopy`). */
function holdsOffice(persona: Persona): boolean {
	return persona === 'officeholder' || persona === 'both';
}

/**
 * Voter-facing card copy, verbatim from the unclaimed Figma frames.
 *
 * The split is on holding office, not on running. The candidate-only frame (D,
 * card 1958:108619) sells casting an informed vote, while both frames for
 * someone already in office — officeholder (E, card 1928:99467) and simultaneous
 * candidate/officeholder (F, card 1928:100987), which are word-for-word
 * identical — sell transparency about their record. So persona `both` takes the
 * office copy even though they are also running.
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

/**
 * The dialog's one line, verbatim from Figma 1901:51851. Exported so it can be
 * asserted without standing up the Radix dialog, whose click delegation does not
 * survive JSDOM.
 *
 * It asks the reader to nudge someone else. It is deliberately not a pitch to
 * claim: anyone who opened this dialog has just told us they are not the person.
 */
export function notifyDialogTitle(displayName: string): string {
	return `Ask ${displayName} to complete their profile and contribute to transparency.`;
}

/**
 * In-column light-blue notify prompt — the Figma content-well card
 * (D 1958:108619 / E 1928:99467): a `rounded-3xl` blue-100 panel with centered
 * 32px heading, 20px body, and one midnight "Send request" button beneath.
 *
 * This is the ONLY claim-related card in the content well. The frames put no
 * owner-facing "are you [Name]?" prompt at the top of the page — the person's
 * own way in is the claim band below the well (see PersonClaimCTABand) — so do
 * not reintroduce one here.
 *
 * The heading is `section-heading`, NOT `heading-sm`. Figma names this type
 * style `heading-lg`, but its value is 32/44 and gp-marketing's `heading-lg` is
 * 48/60 — the scales do not line up, so tokens have to be matched by value (see
 * harness/FOLLOWUPS.md). `heading-sm` was the earlier by-name guess: it reaches
 * 32px only at ≥1440 and carries a 125% line-height, so it rendered 32/40 on
 * desktop and 24/30 on the mobile artboard, where the frame is still 32/44.
 * `section-heading` is the flat 32/44 the frames use on both artboards.
 */
function ClaimPromptCard({
	displayName,
	persona,
	locationLabel = null,
	onNotify,
}: {
	displayName: string;
	persona: Persona;
	locationLabel?: string | null;
	onNotify: VoidFunction;
}) {
	const { heading, body } = voterCopy(displayName, persona, locationLabel);

	return (
		<div
			className='flex flex-col items-center gap-6 rounded-3xl bg-blue-100 p-6 text-center text-midnight-900 md:px-10 md:py-12'
			data-component='ClaimPromptCard'
		>
			<div className='flex flex-col gap-3 md:gap-4'>
				<Text as='h2' styleType='section-heading'>
					{heading}
				</Text>
				<Text styleType='body-1'>{body}</Text>
			</div>
			<Button
				parent='ClaimProfileModal'
				styleType='secondary'
				styleSize='lg'
				className='w-full md:w-fit'
				onClick={onNotify}
				iconRight={<IconResolver icon='arrow-up-right' className='h-4 w-4' />}
			>
				Send request
			</Button>
		</div>
	);
}

/**
 * The visitor-facing "ask [Name] to complete their profile" prompt and the
 * dialog it opens, both from the Figma unclaimed frames.
 *
 * Despite the name this is a NOTIFY surface, not a claim one: everything it
 * submits is a visitor nudging someone else, filed under the `notify` source.
 * The person's own claim path is entirely in PersonClaimCTABand.
 */
export function ClaimProfileModal({ personId, displayName, persona, locationLabel = null }: ClaimProfileModalProps) {
	const [open, setOpen] = useState(false);

	return (
		<Dialog.Root open={open} onOpenChange={setOpen}>
			<ClaimPromptCard
				displayName={displayName}
				persona={persona}
				locationLabel={locationLabel}
				onNotify={() => setOpen(true)}
			/>

			<Dialog.Portal>
				<Dialog.Overlay className='fixed inset-0 z-40 bg-midnight-900/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in' />
				<Dialog.Content
					className='fixed left-1/2 top-1/2 z-50 flex w-[calc(100%-2rem)] max-w-[425px] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-lg border border-neutral-300 bg-white p-6 shadow-lg focus:outline-none'
					aria-describedby={undefined}
				>
					<Dialog.Title asChild>
						{/*
						 * Pinned to the frame's 18/28 rather than the `subtitle-2` token,
						 * which steps up to 20px past 1440. The dialog is a fixed 425px
						 * panel, so scaling its title with the viewport only costs it a
						 * third line of wrap.
						 */}
						<h2 className='font-secondary pr-6 text-[1.125rem]/[1.75rem] font-semibold text-black'>
							{notifyDialogTitle(displayName)}
						</h2>
					</Dialog.Title>

					<NotifyForm personId={personId} displayName={displayName} onCancel={() => setOpen(false)} />

					<Dialog.Close asChild>
						<Button
							parent='ClaimProfileModal'
							styleType='ghost'
							iconOnly
							aria-label='Close'
							className='absolute right-3 top-3 opacity-70'
							iconLeft={<IconResolver icon='x' className='h-4 w-4' />}
						/>
					</Dialog.Close>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
