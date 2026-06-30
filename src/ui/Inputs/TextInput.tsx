'use client';

import { forwardRef, type InputHTMLAttributes, useId } from 'react';

import { tv } from '../_lib/utils.ts';

const styles = tv({
	slots: {
		wrapper: 'flex flex-col gap-1.5',
		label: 'font-secondary text-text-md font-semibold text-black',
		required: 'text-goodparty-red',
		input: [
			'font-secondary w-full min-h-12 rounded-md border bg-white px-3.5 py-3 text-body-2 text-black',
			'transition-colors duration-fast ease-smooth placeholder:text-neutral-400',
			'focus:outline-none focus-visible:ring-2',
			'disabled:cursor-not-allowed disabled:opacity-50',
		],
		error: 'font-secondary text-caption text-error-600',
	},
	variants: {
		invalid: {
			true: {
				input: 'border-error-500 focus-visible:border-error-500 focus-visible:ring-error-500/30',
			},
			false: {
				input: 'border-neutral-300 focus-visible:border-btn-primary-bg focus-visible:ring-btn-primary-bg/30',
			},
		},
	},
});

export type TextInputProps = {
	label: string;
	error?: string;
	required?: boolean;
	className?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'className'>;

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
	{ label, error, required, id, className, ...attr },
	ref,
) {
	const generatedId = useId();
	const inputId = id ?? generatedId;
	const errorId = `${inputId}-error`;
	const invalid = Boolean(error);
	const { wrapper, label: labelClass, required: requiredClass, input, error: errorClass } = styles({ invalid });

	return (
		<div className={wrapper()}>
			<label htmlFor={inputId} className={labelClass()}>
				{label}
				{required && (
					<span className={requiredClass()} aria-hidden='true'>
						{' '}
						*
					</span>
				)}
			</label>
			<input
				{...attr}
				ref={ref}
				id={inputId}
				required={required}
				aria-invalid={invalid || undefined}
				aria-describedby={invalid ? errorId : undefined}
				className={input({ className })}
			/>
			{invalid && (
				<span id={errorId} className={errorClass()}>
					{error}
				</span>
			)}
		</div>
	);
});
