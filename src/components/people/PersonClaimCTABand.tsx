'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { trackEvent } from '~/lib/analytics';
import { Container } from '~/ui/Container';
import { Button } from '~/ui/Inputs/Button';
import { TextInput } from '~/ui/Inputs/TextInput';
import { Text } from '~/ui/Text';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type NotifyValues = { firstname: string; email: string };

export type PersonClaimCTABandProps = {
	personId: string;
	displayName: string;
	/** Running personas get "share why you're running"; office personas get "your record". */
	isRunning: boolean;
};

/**
 * Full-width light-blue claim CTA band for UNCLAIMED empowered person profiles
 * (Figma states D/E/F/H). Mirrors the Figma "Are you [Name]? Complete your
 * profile now." band: centered heading + body over an inline name/email form
 * that posts to the same claim-request endpoint as the claim modal. Rendered in
 * the person `person-cta` section slot (below the content well, above the
 * elections index) in place of the claimed "Join the movement" CTA.
 *
 * Carries NO marketing-consent checkbox, unlike the claim modal, which is what
 * the frame specifies (band 1922:92593 has name + email + submit; the modal's
 * dialog 1901:51851 adds the opt-in). The two forms hit one endpoint but are
 * different acts: the modal asks a visitor to opt in while notifying someone
 * else, whereas this band is the person themselves entering their own address to
 * claim their page. The proxy therefore records `marketingConsent: false` for
 * every submission from here — absent an opt-in that is the accurate value, not
 * a dropped field.
 */
export function PersonClaimCTABand({ personId, displayName, isRunning }: PersonClaimCTABandProps) {
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
			trackEvent('Person Profile Claim CTA Submitted', { personId });
			setIsSuccess(true);
		} catch {
			setError('root', { message: 'Something went wrong. Please try again.' });
		}
	}

	const body = isRunning
		? 'Your community deserves accountable leadership. Claim your profile and share why you\u2019re running and your top priorities with residents. Enter your email to get started.'
		: 'Your community deserves accountable leadership. Claim your profile and share your record and priorities in office with residents. Enter your email to get started.';

	return (
		<article className='py-(--container-padding) bg-goodparty-cream' data-component='CTABannerBlock'>
			<Container size='xl'>
				<div className='flex flex-col items-center gap-6 rounded-2xl bg-blue-100 p-6 text-center text-midnight-900 md:p-12'>
					<div className='flex max-w-2xl flex-col items-center gap-3 md:gap-4'>
						<Text as='h2' styleType='heading-lg'>
							{`Are you ${displayName}? Complete your profile now.`}
						</Text>
						<Text styleType='body-1'>{body}</Text>
					</div>
					{isSuccess ? (
						<div
							className='w-full max-w-md rounded-md border border-success-200 bg-success-50 px-4 py-3'
							role='status'
							aria-live='polite'
						>
							<Text styleType='body-2'>
								Thanks — we&apos;ll be in touch at that address about claiming your profile.
							</Text>
						</div>
					) : (
						<form
							className='flex w-full max-w-md flex-col gap-4 text-left'
							onSubmit={(e) => void handleSubmit(onSubmit)(e)}
							noValidate
						>
							<TextInput
								label='Name (optional)'
								autoComplete='name'
								error={errors.firstname?.message}
								{...register('firstname')}
							/>
							<TextInput
								label='Email address'
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
								parent='PersonClaimCTABand'
								type='submit'
								styleType='primary'
								styleSize='md'
								isLoading={isSubmitting}
								disabled={isSubmitting}
								className='mx-auto w-fit'
							>
								Submit
							</Button>
						</form>
					)}
				</div>
			</Container>
		</article>
	);
}
