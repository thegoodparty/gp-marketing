'use client';

import { useEffect, useState } from 'react';

import { ComponentButton } from './Inputs/Button.tsx';
import { IconResolver } from './IconResolver.tsx';

export type ElectionsPositionShareButtonProps = {
	url: string;
	title?: string;
	label: string;
	className?: string;
};

/**
 * "Share this page". Opens the device share sheet where the browser has one
 * (phones, Safari) and otherwise copies the page URL, saying so on the button
 * for a moment. There is no custom modal: the native sheet is the modal the
 * spreadsheet asks for, and a copied link is the honest desktop fallback.
 */
export function ElectionsPositionShareButton(props: ElectionsPositionShareButtonProps) {
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (!copied) return;
		const timer = window.setTimeout(() => setCopied(false), 2000);
		return () => window.clearTimeout(timer);
	}, [copied]);

	const share = async () => {
		const data = { url: props.url, title: props.title };
		if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
			try {
				await navigator.share(data);
				return;
			} catch (error) {
				if (error instanceof DOMException && error.name === 'AbortError') return;
			}
		}
		try {
			await navigator.clipboard.writeText(props.url);
			setCopied(true);
		} catch {
			window.prompt('Copy this link', props.url);
		}
	};

	return (
		<ComponentButton
			buttonType='button'
			label={copied ? 'Link copied' : props.label}
			onClick={() => void share()}
			iconRight={<IconResolver icon={copied ? 'check' : 'share'} className='size-4' />}
			className={props.className}
			buttonProps={{ styleType: 'secondary', styleSize: 'md' }}
		/>
	);
}
