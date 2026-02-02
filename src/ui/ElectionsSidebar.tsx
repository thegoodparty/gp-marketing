import { cn, tv } from './_lib/utils.ts';
import { Text } from './Text.tsx';
import { ComponentButton, type ComponentButtonProps } from './Inputs/Button.tsx';
import { IconResolver } from './IconResolver.tsx';
import { Anchor } from './Anchor.tsx';

const styles = tv({
	slots: {
		base: 'flex flex-col gap-6 p-6 bg-white rounded-xl',
		section: 'flex flex-col gap-4',
		linkItem: 'flex items-start gap-3 py-3 border-b border-gray-200 last:border-b-0',
		linkIcon: 'min-w-5 min-h-5 w-5 h-5 max-w-5 max-h-5 flex-shrink-0',
		linkText: 'flex-1 flex flex-col gap-1',
		linkLabel: 'font-semibold',
		linkUrlContainer: 'flex items-center gap-2',
		linkUrl: 'text-blue-600 hover:text-blue-800',
		infoItem: 'flex flex-col gap-2 py-4 border-b border-gray-200 last:border-b-0',
		label: '',
		value: '',
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

export type ElectionsSidebarProps = {
	className?: string;
	links?: SidebarLink[];
	aboutOffice?: string;
	termLength?: string;
	electionDate?: string;
	cta?: ComponentButtonProps;
};

export function ElectionsSidebar(props: ElectionsSidebarProps) {
	const { base, section, linkItem, linkIcon, linkText, linkLabel, linkUrlContainer, linkUrl, infoItem, label, value } = styles();

	return (
		<aside className={cn(base(), props.className)} data-component='ElectionsSidebar'>
			{props.links && props.links.length > 0 && (
				<div className={section()}>
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
			{(props.aboutOffice || props.termLength || props.electionDate || props.cta) && (
				<div className={section()}>
					{props.aboutOffice && (
						<div className={infoItem()}>
							<Text as='dt' styleType='subtitle-2' className={label()}>
								About Office
							</Text>
							<Text as='dd' styleType='body-2' className={value()}>
								{props.aboutOffice}
							</Text>
						</div>
					)}
					{props.termLength && (
						<div className={infoItem()}>
							<Text as='dt' styleType='subtitle-2' className={label()}>
								Term Length
							</Text>
							<Text as='dd' styleType='body-2' className={value()}>
								{props.termLength}
							</Text>
						</div>
					)}
					{props.electionDate && (
						<div className={infoItem()}>
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
