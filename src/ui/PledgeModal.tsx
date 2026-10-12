'use client';

import * as Dialog from '@radix-ui/react-dialog';
import type { ReactNode } from 'react';

import { cn, tv } from './_lib/utils.ts';
import { IconResolver } from './IconResolver.tsx';
import { Button, ButtonLink } from './Inputs/Button.tsx';
import { Text } from './Text.tsx';
import { Logo } from '~/sanity/utils/Logo.tsx';
import { trackVoterGuideEvent } from '~/lib/analytics';

/**
 * The pledge explainer's copy lives here rather than in Studio: the pop-up is
 * not a page section, so there is no block to hang fields on. Move it into a
 * settings document if marketing needs to edit it without a release.
 */
export const PLEDGE_MODAL_COPY = {
	title: 'The GoodParty.org Pledge',
	intro:
		'GoodParty.org only works with candidates and elected officials who agree to serve people first, independent of both major parties and big-money interests. Their stances on individual issues vary. They are eligible to take the pledge if they agree to be:',
	pillars: [
		{
			icon: 'heart',
			iconBg: 'bg-blue-200',
			title: 'Independent',
			body: 'They run and serve as nonpartisan, independent, or third-party candidates, not as Democrats or Republicans. They don’t accept endorsements from either major party.',
		},
		{
			icon: 'users-round',
			iconBg: 'bg-bright-yellow-200',
			title: 'People First',
			body: 'They raise most of their funding from individuals, not from political action committees (PACs), lobbyists, unions, or corporations. Once elected, they focus on their constituents’ problems, not on themselves or special interests.',
		},
		{
			icon: 'star',
			iconBg: 'bg-lavender-200',
			title: 'Anti-Corruption',
			body: 'They commit to being open, transparent, and accountable about their donors, positions, and progress. They answer only to the people they serve, and they stay connected and responsive to their constituents.',
		},
	],
	/** Marketing's destination for the pop-up's button (Emily, 2026-10-06); there is no pledge page on the site. */
	learnMore: { label: 'Learn more', href: '/about' },
} as const;

const styles = tv({
	slots: {
		overlay: 'fixed inset-0 z-40 bg-black/70 data-[state=open]:animate-in data-[state=open]:fade-in',
		// Figma: 1064 wide, 80px side padding, 48px top and bottom; 24px margins on the phone.
		content:
			'fixed inset-x-0 top-1/2 z-50 mx-auto flex max-h-[calc(100dvh-3rem)] w-[calc(100%-3rem)] max-w-[66.5rem] -translate-y-1/2 flex-col gap-4 overflow-y-auto rounded-lg border border-neutral-300 bg-white p-4 shadow-lg focus:outline-none md:gap-9 md:px-20 md:py-12',
		header: 'flex flex-col items-center gap-2 text-center',
		logo: 'h-10 w-[3.3333rem] md:h-16 md:w-[5.3125rem]',
		title: 'text-black max-md:text-heading-sm',
		intro: 'font-secondary text-[0.875rem]/[1.25rem] text-black md:text-[1rem]/[1.5rem]',
		pillars: 'grid gap-4 md:grid-cols-3 md:gap-12',
		pillar: 'flex flex-col gap-2 rounded-lg border border-neutral-200 p-4 text-left md:rounded-2xl md:p-5',
		pillarHeading: 'flex flex-col gap-1 md:gap-2',
		pillarIcon: 'flex size-8 items-center justify-center rounded-full text-black md:size-12',
		pillarTitle: 'text-black',
		pillarBody: 'font-secondary text-[0.875rem]/[1.25rem] text-black md:text-[1rem]/[1.5rem]',
		footer: 'flex justify-center',
		close: 'absolute right-4 top-4 md:right-6 md:top-6',
	},
});

export type PledgeModalProps = {
	/** The element that opens the pop-up: a button or link of the caller's own styling. */
	children: ReactNode;
	className?: string;
	/** Which opener this is, for the opened event: the pop-up has five, on three page types. */
	source?: string;
};

/**
 * The "what is the GoodParty.org Pledge" pop-up, for any block that wants to
 * explain the Heart & Star badge. Wrap the trigger; the pop-up manages itself.
 * Figma: 2156:29105 (desktop) and 2156:29080 (phone).
 */
export function PledgeModal(props: PledgeModalProps) {
	const { overlay, content, header, logo, title, intro, pillars, pillar, pillarHeading, pillarIcon, pillarTitle, pillarBody, footer, close } =
		styles();

	return (
		<Dialog.Root
			onOpenChange={open => {
				if (open) trackVoterGuideEvent('pledgeModalOpen', { source: props.source ?? null });
			}}
		>
			<Dialog.Trigger asChild>{props.children}</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Overlay className={overlay()} />
				<Dialog.Content className={cn(content(), props.className)} data-component='PledgeModal'>
					<div className={header()}>
						<Logo className={logo()} aria-hidden='true' />
						<Dialog.Title asChild>
							<Text as='h2' styleType='heading-lg' className={title()}>
								{PLEDGE_MODAL_COPY.title}
							</Text>
						</Dialog.Title>
						<Dialog.Description className={intro()}>{PLEDGE_MODAL_COPY.intro}</Dialog.Description>
					</div>
					<ul className={pillars()}>
						{PLEDGE_MODAL_COPY.pillars.map(item => (
							<li key={item.title} className={pillar()}>
								<div className={pillarHeading()}>
									<div className={cn(pillarIcon(), item.iconBg)}>
										<IconResolver
											icon={item.icon}
											className='min-w-4 min-h-4 w-4 h-4 max-w-4 max-h-4 md:min-w-6 md:min-h-6 md:w-6 md:h-6 md:max-w-6 md:max-h-6'
										/>
									</div>
									<Text as='h3' styleType='subtitle-1' className={pillarTitle()}>
										{item.title}
									</Text>
								</div>
								<p className={pillarBody()}>{item.body}</p>
							</li>
						))}
					</ul>
					<div className={footer()}>
						<ButtonLink
							parent='PledgeModal'
							href={PLEDGE_MODAL_COPY.learnMore.href}
							styleType='primary'
							styleSize='md'
							className='max-md:w-full'
							iconRight={<IconResolver icon='arrow-up-right' className='min-w-4 min-h-4 w-4 h-4 max-w-4 max-h-4' />}
						>
							{PLEDGE_MODAL_COPY.learnMore.label}
						</ButtonLink>
					</div>
					<Dialog.Close asChild>
						<Button
							parent='PledgeModal'
							styleType='ghost'
							iconOnly
							aria-label='Close'
							className={close()}
							iconLeft={<IconResolver icon='x' className='min-w-6 min-h-6 w-6 h-6 max-w-6 max-h-6' />}
						/>
					</Dialog.Close>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
