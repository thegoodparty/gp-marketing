'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { trackEvent } from '~/lib/analytics';
import { isSafeRelativeRedirect } from '~/lib/isSafeRelativeRedirect';
import { Button } from '../Inputs/Button.tsx';
import { TextInput } from '../Inputs/TextInput.tsx';
import { Text } from '../Text.tsx';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type NewsletterValues = {
	firstname: string;
	lastname: string;
	email: string;
};

export function Newsletter({
	formId,
	submitLabel = 'Subscribe',
	redirectTo,
}: {
	formId: string;
	submitLabel?: string;
	redirectTo?: string;
}) {
	const [isSuccess, setIsSuccess] = useState(false);
	const {
		register,
		handleSubmit,
		reset,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<NewsletterValues>({ defaultValues: { firstname: '', lastname: '', email: '' } });

	async function onSubmit(values: NewsletterValues) {
		try {
			const res = await fetch('/api/hubspot/newsletter', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ formId, ...values }),
			});

			if (!res.ok) {
				throw new Error('Submission failed');
			}

			trackEvent('Newsletter Form Submitted', {
				formId,
				page_path: typeof window !== 'undefined' ? window.location.pathname : null,
			});

			if (redirectTo && isSafeRelativeRedirect(redirectTo)) {
				const separator = redirectTo.includes('?') ? '&' : '?';
				window.location.assign(`${redirectTo}${separator}submissionGuid=${crypto.randomUUID()}`);
				return;
			}

			reset();
			setIsSuccess(true);
		} catch {
			setError('root', { message: 'Something went wrong. Please try again.' });
		}
	}

	if (isSuccess) {
		return (
			<div
				data-component='Newsletter'
				className='rounded-md border border-success-200 bg-success-50 px-4 py-3'
				role='status'
				aria-live='polite'
			>
				<Text styleType='body-2'>Thanks for subscribing. Check your inbox to confirm.</Text>
			</div>
		);
	}

	return (
		<form data-component='Newsletter' className='flex w-full max-w-md flex-col gap-4 text-left' onSubmit={handleSubmit(onSubmit)} noValidate>
			<TextInput
				label='First Name'
				required
				autoComplete='given-name'
				error={errors.firstname?.message}
				{...register('firstname', { required: 'First name is required' })}
			/>
			<TextInput
				label='Last Name'
				required
				autoComplete='family-name'
				error={errors.lastname?.message}
				{...register('lastname', { required: 'Last name is required' })}
			/>
			<TextInput
				label='Email'
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
			<Button parent='Newsletter' type='submit' styleType='primary' isLoading={isSubmitting} disabled={isSubmitting} className='w-fit'>
				{submitLabel}
			</Button>
		</form>
	);
}
