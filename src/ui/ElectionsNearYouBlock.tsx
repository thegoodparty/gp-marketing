'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import {
	ComboBox as AreaComboBox,
	Input as AreaInput,
	Label as AreaLabel,
	ListBox as AreaListBox,
	ListBoxItem as AreaListBoxItem,
	Popover as AreaPopover,
} from 'react-aria-components';

import { cn, tv } from './_lib/utils.ts';
import { Container } from './Container.tsx';
import { Text } from './Text.tsx';
import { Button } from './Inputs/Button.tsx';
import { primaryButtonStyleType } from './_lib/designTypesStore.ts';
import { trackEvent } from '~/lib/analytics';
import {
	ELECTIONS_SEARCH_VIEWED_EVENT,
	submitElectionsNearYouSearchOnce,
	type ElectionsNearYouSearchDeps,
} from '~/lib/electionsNearYouSearch';
import {
	ensureGooglePlacesLoaded,
	runSuggestionQuery,
	type ParsedPlaceSuggestion,
	type PlaceSuggestion,
	type PlacesSessionToken,
} from '~/lib/googlePlaces';
import type { ResolvedPlace } from '~/lib/resolvePlace';

const styles = tv({
	slots: {
		base: 'relative bg-midnight-900',
		content: 'relative flex flex-col gap-6 py-16 px-4 text-center md:items-center',
		textContainer: 'flex flex-col gap-3 md:gap-4 max-w-[40rem] mx-auto',
		searchRow: 'flex flex-col gap-4 w-full max-w-md mx-auto sm:flex-row sm:items-start',
		inputColumn: 'flex flex-col gap-1.5 w-full text-left',
		input: [
			'w-full min-h-12 rounded-lg border border-black/30 bg-white px-4 py-3',
			'text-black placeholder:text-black/70',
			'focus:border-black focus:outline-none focus:ring-2 focus:ring-black/30',
			'font-secondary text-[0.875rem]',
		],
		error: 'font-secondary text-caption text-error-600',
		popover: 'max-w-md rounded-lg bg-white p-2 shadow-xl-duo',
		listbox: 'max-h-60 overflow-auto outline-none',
		listboxItem: [
			'cursor-pointer rounded-md px-3 py-2 font-secondary text-[0.875rem] text-black',
			'outline-none data-[focused]:bg-black/5 data-[hovered]:bg-black/5',
		],
	},
	variants: {
		backgroundColor: {
			cream: {
				base: 'bg-goodparty-cream',
				content: 'text-black',
			},
			midnight: {
				base: 'bg-midnight-900',
				content: 'text-white',
			},
		},
	},
});

export type ElectionsNearYouBlockProps = {
	className?: string;
	heading?: string;
	body?: string;
	buttonLabel?: string;
	backgroundColor?: 'cream' | 'midnight';
	// Pending Emily's confirmation on what the social-proof line says; the field is
	// editable in Sanity already so content can be authored ahead of the UI.
	showSocialProof?: boolean;
};

// No CMS field distinguishes where a page places this block yet, so Phase 1
// hardcodes the one value the Viewed event needs today rather than adding a
// schema field a real second placement hasn't asked for.
const BLOCK_PLACEMENT = 'elections_near_you_block';

const MIN_QUERY_LENGTH = 3;

const RESOLVED_PLACE_MATCHED_LEVELS = new Set(['city', 'county', 'state']);

// fetch's `.json()` types as `unknown` in this repo's DOM lib; narrow it at the
// boundary rather than casting; anything that isn't this shape is treated the
// same as a network failure by the caller.
function isResolvedPlace(data: unknown): data is ResolvedPlace {
	if (typeof data !== 'object' || data === null) return false;
	if ('url' in data) {
		const { url, matchedLevel } = data as { url: unknown; matchedLevel: unknown };
		return typeof url === 'string' && typeof matchedLevel === 'string' && RESOLVED_PLACE_MATCHED_LEVELS.has(matchedLevel);
	}
	if ('error' in data) return (data as { error: unknown }).error === 'unresolved';
	return false;
}

async function resolvePlaceOverHttp(params: { city?: string; county?: string; state?: string }): Promise<ResolvedPlace> {
	const search = new URLSearchParams();
	if (params.city) search.set('city', params.city);
	if (params.county) search.set('county', params.county);
	if (params.state) search.set('state', params.state);

	const response = await fetch(`/api/elections/resolve-place?${search.toString()}`);
	if (!response.ok) throw new Error(`resolve-place responded ${response.status}`);

	const data = await response.json();
	if (!isResolvedPlace(data)) throw new Error('resolve-place returned an unexpected response shape');
	return data;
}

export function ElectionsNearYouBlock(props: ElectionsNearYouBlockProps) {
	const errorId = `elections-near-you-error-${useId()}`;

	const [inputValue, setInputValue] = useState('');
	const [selectedPlace, setSelectedPlace] = useState<ParsedPlaceSuggestion | undefined>(undefined);
	const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
	const [error, setError] = useState<string | undefined>(undefined);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Guards, not state: none of these should trigger a re-render on their own.
	const placesLoadStartedRef = useRef(false);
	const sessionTokenRef = useRef<PlacesSessionToken | null>(null);
	const latestQueryRef = useRef('');
	const isSubmittingRef = useRef(false);

	useEffect(() => {
		// window.location.pathname (not usePathname()) matches this repo's other
		// analytics call sites (e.g. ClickToCallBlock) and, unlike the hook, needs
		// no App Router context — this component's own DOM test renders it via
		// renderToStaticMarkup with no router mounted.
		const pagePath = typeof window !== 'undefined' ? window.location.pathname : null;
		trackEvent(ELECTIONS_SEARCH_VIEWED_EVENT, { pagePath, placement: BLOCK_PLACEMENT });
		// Fires once per mount, matching "once per page view per block instance".
	}, []);

	const handleFocus = useCallback(() => {
		if (placesLoadStartedRef.current) return;
		placesLoadStartedRef.current = true;
		// No Google request happens before this call. A failure here (ad blocker,
		// key outage) is swallowed: suggestions simply never populate and submit
		// falls through to the free-text path, so the control never goes dead.
		void ensureGooglePlacesLoaded().catch(() => undefined);
	}, []);

	const handleInputChange = useCallback((value: string) => {
		setInputValue(value);
		setSelectedPlace(undefined);
		setError(undefined);
		latestQueryRef.current = value;

		if (value.trim().length < MIN_QUERY_LENGTH) {
			setSuggestions([]);
			return;
		}

		void runSuggestionQuery(value, { latestQuery: latestQueryRef, sessionToken: sessionTokenRef }).then(results => {
			// `undefined` is runSuggestionQuery's "discard this response" sentinel
			// for a keystroke that is no longer the latest one.
			if (results !== undefined) setSuggestions(results);
		});
	}, []);

	const handleSelectionChange = useCallback(
		(key: React.Key | null) => {
			if (key == null) return;
			const chosen = suggestions.find(suggestion => suggestion.id === key);
			if (!chosen) return;

			setInputValue(chosen.description);
			setSelectedPlace(chosen.parsed);
			setSuggestions([]);
			setError(undefined);
			// Ends this search cycle. Google expects one session token per
			// autocomplete session (first keystroke through selection); the next
			// keystroke after a selection starts a new search and gets a new one.
			sessionTokenRef.current = null;
		},
		[suggestions],
	);

	const handleSubmit = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault();
			if (isSubmittingRef.current) return;
			setIsSubmitting(true);

			const deps: ElectionsNearYouSearchDeps = {
				resolvePlace: resolvePlaceOverHttp,
				trackEvent,
				// A full navigation, not the App Router's client-side `push`: the
				// destination is a different, server-rendered elections page, and
				// this keeps the block free of a router dependency it would
				// otherwise need to mock out in its own SSR-rendered DOM test.
				navigate: url => window.location.assign(url),
			};

			void submitElectionsNearYouSearchOnce({ rawInput: inputValue, place: selectedPlace }, deps, { isSubmitting: isSubmittingRef })
				.then(result => {
					if (result && !result.ok) setError(result.error);
				})
				.finally(() => {
					setIsSubmitting(false);
				});
		},
		[inputValue, selectedPlace],
	);

	const {
		base,
		content,
		textContainer,
		searchRow,
		inputColumn,
		input,
		error: errorClass,
		popover,
		listbox,
		listboxItem,
	} = styles({
		backgroundColor: props.backgroundColor ?? 'midnight',
	});

	return (
		<section className={cn(base(), props.className)} data-component='ElectionsNearYouBlock'>
			<Container>
				<div className={content()}>
					<div className={textContainer()}>
						{props.heading && (
							<Text as='h2' styleType='heading-lg'>
								{props.heading}
							</Text>
						)}
						{props.body && <Text styleType='body-1'>{props.body}</Text>}
					</div>
					<form onSubmit={handleSubmit} className={searchRow()} noValidate>
						<div className={inputColumn()}>
							<AreaComboBox
								inputValue={inputValue}
								onInputChange={handleInputChange}
								onSelectionChange={handleSelectionChange}
								allowsCustomValue
								menuTrigger='input'
								className='flex flex-col gap-1.5 w-full text-left'
							>
								<AreaLabel hidden>City or county</AreaLabel>
								<AreaInput
									className={input()}
									placeholder='Enter your city or county'
									onFocus={handleFocus}
									aria-invalid={error ? true : undefined}
									aria-describedby={error ? errorId : undefined}
								/>
								<AreaPopover placement='bottom start' className={popover()} style={{ width: 'var(--trigger-width)' }}>
									<AreaListBox className={listbox()}>
										{suggestions.map(suggestion => (
											<AreaListBoxItem key={suggestion.id} id={suggestion.id} textValue={suggestion.description} className={listboxItem()}>
												{suggestion.description}
											</AreaListBoxItem>
										))}
									</AreaListBox>
								</AreaPopover>
							</AreaComboBox>
							{error && (
								<span id={errorId} className={errorClass()}>
									{error}
								</span>
							)}
						</div>
						<Button
							parent='ElectionsNearYouBlock'
							styleType={primaryButtonStyleType}
							isLoading={isSubmitting}
							disabled={isSubmitting}
							className='w-full sm:w-auto'
						>
							{props.buttonLabel ?? 'Search'}
						</Button>
					</form>
				</div>
			</Container>
		</section>
	);
}
