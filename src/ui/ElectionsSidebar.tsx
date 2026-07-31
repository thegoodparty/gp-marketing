import { cn, tv } from './_lib/utils.ts';
import { Text } from './Text.tsx';
import { ComponentButton, type ComponentButtonProps } from './Inputs/Button.tsx';
import { IconResolver } from './IconResolver.tsx';
import { Anchor } from './Anchor.tsx';

const styles = tv({
	slots: {
		base: 'flex w-full min-w-0 flex-col gap-6',
		card: 'flex flex-col gap-4 p-6 bg-white rounded-xl',
		linkItem: 'flex items-start gap-3 py-3 border-b border-gray-200 last:border-b-0',
		linkIcon: 'min-w-5 min-h-5 w-5 h-5 max-w-5 max-h-5 flex-shrink-0',
		linkText: 'flex min-w-0 flex-1 flex-col gap-1',
		linkLabel: 'font-semibold',
		linkUrlContainer: 'flex min-w-0 items-start gap-2',
		linkUrl: 'min-w-0 [overflow-wrap:anywhere] text-blue-600 hover:text-blue-800',
		infoItem: 'flex flex-col gap-2 py-4 border-b border-gray-200 last:border-b-0',
		// Figma person-profile card: tighter rows (no card gap; trimmed first/last).
		figmaCard: 'flex flex-col p-6 bg-white rounded-xl',
		figmaRow: 'flex flex-col gap-2 py-3 border-b border-gray-200 last:border-b-0 first:pt-0 last:pb-0',
		label: '',
		value: 'break-words',
	},
});

function formatLinkText(href: string): string {
	// Remove protocol (http://, https://, mailto:)
	let formatted = href.replace(/^https?:\/\//, '').replace(/^mailto:/, '');
	// Remove trailing slash for display
	formatted = formatted.replace(/\/$/, '');
	return formatted;
}

export type SidebarLink = {
	label: string;
	icon?: string;
	href: string;
};

/** An icon-only contact button in the Figma "Contact" row. */
export type SidebarContactIcon = {
	icon: string;
	href: string;
	label: string;
};

/** A labeled email/phone link in the Figma "Office Contact" row. */
export type SidebarContactLink = {
	icon: string;
	href: string;
	label: string;
};

export type ElectionsSidebarProps = {
	className?: string;
	// --- Figma person-profile structure (single card, divider-separated rows) ---
	/**
	 * Leading info rows — "Election Date" and/or "Current Term". A person running
	 * while in office (persona "both") shows both, matching the Figma frame.
	 */
	topInfos?: { icon: string; label: string; value: string }[];
	/** "Political Affiliation" row value. */
	politicalAffiliation?: string;
	/** "Contact" row — a horizontal row of circular icon-only buttons. */
	contactIcons?: SidebarContactIcon[];
	/** "Office Contact" row — labeled email/phone links (officeholders). */
	officeContacts?: SidebarContactLink[];
	/** "Office Mailing Address" row — multi-line address (officeholders). */
	officeAddress?: string[];
	// --- Legacy structure (still used by the /elections template) ---
	links?: SidebarLink[];
	aboutOffice?: string;
	termLength?: string;
	electionDate?: string;
	party?: string;
	cta?: ComponentButtonProps;
};

/** A circular, light-blue icon-only contact button (Figma "Contact" row). */
function ContactIconButton({ icon, href, label }: SidebarContactIcon) {
	return (
		<Anchor
			href={href}
			aria-label={label}
			className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-midnight-900 transition-colors hover:bg-blue-200'
		>
			<IconResolver icon={icon} className='h-6 w-6' />
		</Anchor>
	);
}

export function ElectionsSidebar(props: ElectionsSidebarProps) {
	const { base, card, linkItem, linkIcon, linkText, linkLabel, linkUrlContainer, linkUrl, infoItem, figmaCard, figmaRow, label, value } = styles();

	// Figma person-profile card renders whenever any structured row is supplied.
	const hasFigmaCard =
		(props.topInfos?.length ?? 0) > 0 ||
		Boolean(props.politicalAffiliation) ||
		(props.contactIcons?.length ?? 0) > 0 ||
		(props.officeContacts?.length ?? 0) > 0 ||
		(props.officeAddress?.length ?? 0) > 0;

	if (hasFigmaCard) {
		return (
			<aside className={cn(base(), props.className)} data-component='ElectionsSidebar'>
				<div className={figmaCard()}>
					{props.topInfos?.map((row, i) => (
						<div key={i} className={figmaRow()}>
							<Text as='dt' styleType='subtitle-2' className={label()}>
								{row.label}
							</Text>
							<div className='flex items-center gap-2'>
								<IconResolver icon={row.icon} className={linkIcon()} />
								<Text as='dd' styleType='body-2' className={value()}>
									{row.value}
								</Text>
							</div>
						</div>
					))}
					{props.politicalAffiliation && (
						<div className={figmaRow()}>
							<Text as='dt' styleType='subtitle-2' className={label()}>
								Political Affiliation
							</Text>
							<div className='flex items-center gap-2'>
								<IconResolver icon='flag' className={linkIcon()} />
								<Text as='dd' styleType='body-2' className={value()}>
									{props.politicalAffiliation}
								</Text>
							</div>
						</div>
					)}
					{(props.contactIcons?.length ?? 0) > 0 && (
						<div className={figmaRow()}>
							<Text as='span' styleType='subtitle-2' className={label()}>
								Contact
							</Text>
							<div className='flex flex-wrap items-center gap-3 pt-1'>
								{props.contactIcons!.map((c, i) => (
									<ContactIconButton key={i} {...c} />
								))}
							</div>
						</div>
					)}
					{(props.officeContacts?.length ?? 0) > 0 && (
						<div className={figmaRow()}>
							<Text as='span' styleType='subtitle-2' className={label()}>
								Office Contact
							</Text>
							<div className='flex flex-col gap-2'>
								{props.officeContacts!.map((c, i) => (
									<div key={i} className='flex items-center gap-2'>
										<IconResolver icon={c.icon} className={linkIcon()} />
										<Anchor href={c.href} className={linkUrl()}>
											<Text as='span' styleType='body-2'>
												{c.label}
											</Text>
										</Anchor>
									</div>
								))}
							</div>
						</div>
					)}
					{(props.officeAddress?.length ?? 0) > 0 && (
						<div className={figmaRow()}>
							<Text as='span' styleType='subtitle-2' className={label()}>
								Office Mailing Address
							</Text>
							<div className='flex flex-col'>
								{props.officeAddress!.map((line, i) => (
									<Text key={i} as='span' styleType='body-2' className={value()}>
										{line}
									</Text>
								))}
							</div>
						</div>
					)}
				</div>
			</aside>
		);
	}

	return (
		<aside className={cn(base(), props.className)} data-component='ElectionsSidebar'>
			{props.links && props.links.length > 0 && (
				<div className={card()}>
					{props.links.map((link, index) => (
						<div key={index} className={linkItem()}>
							<div className={linkText()}>
								<Text as='span' styleType='body-2' className={linkLabel()}>
									{link.label}
								</Text>
								<div className={linkUrlContainer()}>
									{link.icon && (
										<IconResolver icon={link.icon} className={linkIcon()} />
									)}
									<Anchor href={link.href} className={linkUrl()}>
										<Text as='span' styleType='body-2'>
											{formatLinkText(link.href)}
										</Text>
									</Anchor>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
			{(props.aboutOffice || props.termLength || props.electionDate || props.party || props.cta) && (
				<div className={card()}>
					{props.aboutOffice && (
						<div
							className={cn(
								infoItem(),
								props.cta &&
									!props.termLength &&
									!props.electionDate &&
									!props.party &&
									'border-b-0',
							)}
						>
							<Text as='dt' styleType='subtitle-1' className={label()}>
								About Office
							</Text>
							<Text as='dd' styleType='body-2' className={value()}>
								{props.aboutOffice}
							</Text>
						</div>
					)}
					{props.party && (
						<div
							className={cn(
								infoItem(),
								props.cta && !props.termLength && !props.electionDate && 'border-b-0',
							)}
						>
							<Text as='dt' styleType='subtitle-2' className={label()}>
								Party
							</Text>
							<Text as='dd' styleType='body-2' className={value()}>
								{props.party}
							</Text>
						</div>
					)}
					{props.termLength && (
						<div
							className={cn(
								infoItem(),
								props.cta && !props.electionDate && 'border-b-0',
							)}
						>
							<Text as='dt' styleType='subtitle-2' className={label()}>
								Term Length
							</Text>
							<Text as='dd' styleType='body-2' className={value()}>
								{props.termLength}
							</Text>
						</div>
					)}
					{props.electionDate && (
						<div className={cn(infoItem(), props.cta && 'border-b-0')}>
							<Text as='dt' styleType='subtitle-2' className={label()}>
								Election Date
							</Text>
							<Text as='dd' styleType='body-2' className={value()}>
								{props.electionDate}
							</Text>
						</div>
					)}
					{props.cta && (
						<div className='pt-4'>
							<ComponentButton
								{...props.cta}
								className='w-full'
								buttonProps={{
									...props.cta.buttonProps,
									styleType: props.cta.buttonProps?.styleType ?? 'secondary',
								}}
							/>
						</div>
					)}
				</div>
			)}
		</aside>
	);
}
