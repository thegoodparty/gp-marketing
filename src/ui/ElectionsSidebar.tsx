import { cn, tv } from './_lib/utils.ts';
import { Text } from './Text.tsx';
import { ComponentButton, type ComponentButtonProps } from './Inputs/Button.tsx';
import { IconResolver } from './IconResolver.tsx';
import { Anchor } from './Anchor.tsx';

const styles = tv({
	slots: {
		base: 'flex flex-col gap-6 p-6 bg-white rounded-xl',
		section: 'flex flex-col gap-4',
		linkItem: 'flex items-center gap-3 py-3 border-b border-gray-200 last:border-b-0',
		linkIcon: 'min-w-5 min-h-5 w-5 h-5 max-w-5 max-h-5 flex-shrink-0',
		linkText: 'flex-1',
		infoItem: 'flex flex-col gap-2 py-4 border-b border-gray-200 last:border-b-0',
		label: '',
		value: '',
	},
});

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
	const { base, section, linkItem, linkIcon, linkText, infoItem, label, value } = styles();

	return (
		<aside className={cn(base(), props.className)} data-component='ElectionsSidebar'>
			{props.links && props.links.length > 0 && (
				<div className={section()}>
					{props.links.map((link, index) => (
						<div key={index} className={linkItem()}>
							{link.icon && (
								<IconResolver icon={link.icon} className={linkIcon()} />
							)}
							<Anchor href={link.href} className={linkText()}>
								<Text as='span' styleType='body-2'>
									{link.label}
								</Text>
							</Anchor>
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
