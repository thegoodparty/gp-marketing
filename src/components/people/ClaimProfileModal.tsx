'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { APP_SIGN_UP_HREF, trackEvent, trackSignUpClicked } from '~/lib/analytics';
import { ClaimProfileBlock } from '~/ui/ClaimProfileBlock';
import { Button, ButtonLink } from '~/ui/Inputs/Button';
import { TextInput } from '~/ui/Inputs/TextInput';
import { IconResolver } from '~/ui/IconResolver';
import { Text } from '~/ui/Text';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type NotifyValues = { firstname: string; email: string };

function NotifyForm({ personId, displayName }: { personId: string; displayName: string }) {
	const [isSuccess, setIsSuccess] = useState(false);
	const {
		register,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<NotifyValues>({ defaultValues: { firstname: '', email: '' } });

	async function onSubmit(values: NotifyValues) {
		try {
			const res = await fetch('/api/people/claim-request', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ personId, firstname: values.firstname, email: values.email }),
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
		<form
			className='flex w-full flex-col gap-4 text-left'
			onSubmit={(e) => void handleSubmit(onSubmit)(e)}
			noValidate
		>
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
		</form>
	);
}

export type ClaimProfileModalProps = {
	personId: string;
	displayName: string;
	persona: 'candidate' | 'officeholder' | 'both' | 'past';
};

export function ClaimProfileModal({ personId, displayName, persona }: ClaimProfileModalProps) {
	const [open, setOpen] = useState(false);
	const isRunning = persona === 'candidate' || persona === 'both';

	const headline = `Is this you, ${displayName}?`;
	const bannerBody = isRunning
		? 'Claim this profile to share why you\u2019re running, your top issues, and how voters can reach you.'
		: 'Claim this profile to share your record, your priorities in office, and how constituents can reach you.';

	return (
		<Dialog.Root open={open} onOpenChange={setOpen}>
			<ClaimProfileBlock
				layout='banner'
				backgroundColor='bright-yellow'
				headline={headline}
				body={bannerBody}
				claimButton={{
					buttonType: 'button',
					label: 'Claim your profile',
					onClick: () => setOpen(true),
					buttonProps: { styleType: 'primary', styleSize: 'md' },
				}}
			/>

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
