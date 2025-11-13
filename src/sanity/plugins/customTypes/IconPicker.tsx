import { set, type StringInputProps, unset, useColorSchemeValue } from 'sanity';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Card, Container, Dialog, Heading, Tab, TabList, TabPanel, Text, TextInput, Tooltip } from '@sanity/ui';
import { SearchIcon } from '@sanity/icons';
import { styled } from 'styled-components';
import { lucideCategories, lucideIcons } from './lucide.ts';

export function IconPicker(props: StringInputProps) {
	const [id, setId] = useState<string | undefined>();
	const [isPopupOpen, setIsPopupOpen] = useState(false);
	const [query, setQuery] = useState('');

	return (
		<Card>
			{props.value ? (
				<Current
					name={props.value}
					onClick={() => {
						props.onChange(unset());
					}}
				/>
			) : (
				<>
					<Button mode='ghost' padding={[2, 2, 3]} tone='default' text={'Select icon'} onClick={() => setIsPopupOpen(true)} />

					{isPopupOpen ? (
						<Dialog
							header='Icon Picker'
							id='icon-popup'
							onClose={() => {
								setIsPopupOpen(false);
								setQuery('');
								setId(undefined);
							}}
							zOffset={1000}
							width={1}
							animate
						>
							<Box padding={4}>
								<TextInput
									id='search'
									value={query}
									icon={SearchIcon}
									onChange={e => {
										setQuery(e.currentTarget.value);
									}}
									placeholder='Search'
									radius={2}
								/>

								<Container>
									<Box marginTop={4}>
										<TabList
											space={2}
											children={[
												<Tab
													key={'all'}
													aria-controls={'all'}
													id={'all' + 'Tab'}
													label={'All'}
													onClick={() => setId(undefined)}
													selected={id === undefined}
												/>,
												lucideCategories.map(c => (
													<Tab
														key={c.name}
														aria-controls={c.name}
														id={`${c.name}Tab`}
														label={c.title}
														onClick={() => setId(c.name)}
														selected={id === c.name}
													/>
												)),
											].flat()}
										/>

										{lucideCategories.map(c => {
											if (typeof id === 'string' && id !== c.name) {
												return null;
											}
											const termsFromUser = query.toLowerCase().split(' ');
											const members = Object.entries(lucideIcons).filter(([_, categories]) => {
												return categories.includes(c.name);
											});
											return (
												<CategoryPanel
													key={c.name}
													name={c.title}
													members={members
														.filter(([name, cats]) => {
															if (!query) {
																return true;
															}
															const termsToMatch: string[] = [name, ...cats];

															return termsFromUser.every(term => {
																return termsToMatch.some(match => match.includes(term));
															});
														})
														.map(([name]) => name)}
													setIcon={(icon: string) => {
														props.onChange([set(icon)]);
														setIsPopupOpen(false);
														setQuery('');
														setId(undefined);
													}}
												/>
											);
										})}
									</Box>
								</Container>
							</Box>
						</Dialog>
					) : null}
				</>
			)}
		</Card>
	);
}

function CategoryPanel(props: { name: string; members: string[]; setIcon: (icon: string) => void }) {
	return useMemo(
		() => (
			<TabPanel aria-labelledby={props.name} id={`${props.name}Panel`}>
				{props.members.length ? (
					<Heading as={'h4'} size={3} style={{ padding: '45px 0 25px 0' }}>
						{props.name}
					</Heading>
				) : null}
				{props.members.map(m => (
					<SearchedIcon key={m} name={m} setIcon={() => props.setIcon(m)} />
				))}
			</TabPanel>
		),
		[props.name, props.members, props.setIcon],
	);
}

const IconInline = styled.div`
	width: 2rem;
	height: 2rem;
	min-width: 2rem;
	border-radius: 5px;
	display: inline-flex;
	overflow: hidden;
	overflow: clip;
	align-items: center;
	justify-content: center;
	box-shadow: 0 0 0 1px #99999933;

	& img {
		position: absolute;
		left: 0;
		top: 0;
		object-fit: contain;
		border-radius: inherit;
	}

	& svg {
		// Shared styles for SVG icons
		color: var(--card-icon-color);
		display: block;
		flex: 1;

		// Specific styles for non Sanity icons

		&:not([data-sanity-icon]) {
			height: 1.5em;
			width: 1.5em;
			max-width: 1.5em;
			max-height: 1.5em;
		}
	}

	& > span[data-border] {
		display: block;
		position: absolute;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		box-shadow: inset 0 0 0 1px var(--card-fg-color);
		opacity: 0.1;
		border-radius: inherit;
		pointer-events: none;
	}
`;
const BigInline = styled.div`
	width: 4rem;
	height: 4rem;
	min-width: 4rem;
	border-radius: 5px;
	display: inline-flex;
	overflow: hidden;
	overflow: clip;
	align-items: center;
	justify-content: center;
	box-shadow: 0 0 0 1px #99999933;

	& div {
		width: 100%;
		height: 100%;
	}
	& img {
		position: absolute;
		left: 0;
		top: 0;
		width: 100% !important;
		height: 100% !important;
		max-width: 50% !important;
		max-height: 50% !important;
		object-fit: contain;
		border-radius: inherit;
	}

	& svg {
		// Shared styles for SVG icons
		color: var(--card-icon-color);
		display: block;
		flex: 1;

		// Specific styles for non Sanity icons

		&:not([data-sanity-icon]) {
			height: 1.5em;
			width: 1.5em;
			max-width: 1.5em;
			max-height: 1.5em;
		}
	}

	& > span[data-border] {
		display: block;
		position: absolute;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		box-shadow: inset 0 0 0 1px var(--card-fg-color);
		opacity: 0.1;
		border-radius: inherit;
		pointer-events: none;
	}
`;

const ImageCard = styled(Card)<{ scheme: string }>`
	display: flex;
	align-items: center;
	justify-content: center;
	background: none;
	position: relative;

	&:not([hidden]) {
		display: flex;
	}

	#tree-editing-dialog & {
		height: 100%;
		width: 100%;
	}
`;
function useInView(threshold = 0.1) {
	const [isInView, setIsInView] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				setIsInView(Boolean(entry?.isIntersecting));
			},
			{ threshold },
		);

		const current = ref.current;
		if (current) {
			observer.observe(current);
		}

		return () => {
			if (current) {
				observer.unobserve(current);
			}
		};
	}, [threshold]);

	return [ref, isInView] as const;
}

export function ImgIcon(props: { name: string }) {
	const scheme = useColorSchemeValue() === 'light' ? 'light' : 'dark';
	const [ref, isInView] = useInView();

	const content = useMemo(
		() => (
			<ImageCard scheme={scheme}>
				<IconWrapper code={props.name as any} />
			</ImageCard>
		),
		[props.name, scheme],
	);

	return <div ref={ref}>{isInView ? content : null}</div>;
}

function Current(props: { name: string; onClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void }) {
	return (
		<>
			<Tooltip
				animate
				padding={0}
				content={
					<Card tone={'critical'} padding={2} style={{ textAlign: 'center' }}>
						<Text size={1} style={{ paddingBottom: '10px' }}>
							{props.name}
						</Text>

						<Text muted size={2}>
							Click to remove
						</Text>
					</Card>
				}
				fallbackPlacements={['right', 'left']}
				placement='top'
				portal
			>
				<IconInline onClick={props.onClick}>
					<ImgIcon name={props.name} />
				</IconInline>
			</Tooltip>
		</>
	);
}

function SearchedIcon(props: { name: string; setIcon: () => void }) {
	return useMemo(() => {
		return (
			<Tooltip
				animate
				padding={0}
				fallbackPlacements={['right', 'left']}
				placement='top'
				portal
				content={
					<Card padding={2}>
						<Text muted size={1}>
							{props.name}
						</Text>
					</Card>
				}
			>
				<BigInline onClick={() => props.setIcon()}>
					<ImgIcon name={props.name} />
				</BigInline>
			</Tooltip>
		);
	}, [props.setIcon, props.name]);
}

export function IconWrapper({ code, ...props }) {
	if (!code) {
		console.error('Icon code is required');
		return null;
	}
	return (
		<svg width={'100%'} height={'100%'} style={{ maxWidth: '24px' }} viewBox={'0 0 24 24'} fill={'currentColor'} {...props}>
			<use href={`/icons/lucide/${code}.svg#icon`} />
		</svg>
	);
}
