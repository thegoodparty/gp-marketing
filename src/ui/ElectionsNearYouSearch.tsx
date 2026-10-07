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
import { Button } from './Inputs/Button.tsx';
import { primaryButtonStyleType } from './_lib/designTypesStore.ts';
import { trackEvent } from '~/lib/analytics';
import {
	ELECTIONS_SEARCH_MIN_QUERY_LENGTH,
	ELECTIONS_SEARCH_VIEWED_EVENT,
	placeForSubmit,
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
		form: 'flex w-full flex-col',
		inputColumn: 'flex w-full flex-col gap-1.5 text-left',
		inputWrapper: 'relative w-full',
		inputIcon: 'pointer-events-none absolute top-1/2 -translate-y-1/2',
		input: [
			'h-10 w-full border border-[#d4d4d4] bg-white pr-4',
			'text-black placeholder:text-[#767676]',
			'focus:border-midnight-400 focus:outline-none focus:ring-2 focus:ring-midnight-400/40',
			'font-secondary',
		],
		button: 'w-full sm:w-auto',
		error: 'font-secondary text-caption text-error-600',
		popover: 'max-w-md rounded-lg bg-white p-2 shadow-xl-duo',
		listbox: 'max-h-60 overflow-auto outline-none',
		listboxItem: [
			'cursor-pointer rounded-md px-3 py-2 font-secondary text-[0.875rem] text-black',
			'outline-none data-[focused]:bg-black/5 data-[hovered]:bg-black/5',
		],
	},
	variants: {
		// `inline` is the Near You block's fixed-width row; `fluid` lets the input
		// take whatever width its parent gives it, for the search hero's column.
		layout: {
			inline: {
				form: 'gap-4 sm:w-auto sm:flex-row sm:items-start sm:gap-2',
				inputColumn: 'sm:w-[21.875rem]',
			},
			fluid: {
				form: 'gap-2 sm:flex-row sm:items-start',
				inputColumn: 'sm:flex-1',
			},
		},
		// `pill` is the Near You block's rounded field with the map pin; `field`
		// is the search hero's squared field with the search icon (Figma 2035:1476).
		appearance: {
			pill: {
				inputIcon: 'left-4',
				input: 'rounded-full pl-10 text-base',
			},
			field: {
				inputIcon: 'left-3',
				input: 'rounded-sm pl-8 text-[0.875rem] placeholder:text-[#737373]',
			},
		},
	},
});

// Figma asset "Icon / MapPin" (node 767:10724), rendered at 16px per the design.
function MapPinIcon({ className }: { className?: string }) {
	return (
		<svg className={className} width='16' height='16' viewBox='0 0 24 24' fill='none' aria-hidden='true' xmlns='http://www.w3.org/2000/svg'>
			<path
				d='M12.5996 22.7998C12.2441 23.0663 11.7559 23.0663 11.4004 22.7998L12 22L12.5996 22.7998ZM19 10C19 8.14348 18.2629 6.36256 16.9502 5.0498C15.6374 3.73705 13.8565 3 12 3C10.1435 3 8.36256 3.73705 7.0498 5.0498C5.73705 6.36256 5 8.14348 5 10C5 12.605 6.77013 15.3619 8.74707 17.5859C9.71193 18.6714 10.6803 19.5789 11.4082 20.2158C11.6306 20.4104 11.8309 20.5786 12 20.7188C12.1691 20.5786 12.3694 20.4104 12.5918 20.2158C13.3197 19.5789 14.2881 18.6714 15.2529 17.5859C17.2299 15.3619 19 12.605 19 10ZM14 10C14 8.89543 13.1046 8 12 8C10.8954 8 10 8.89543 10 10C10 11.1046 10.8954 12 12 12C13.1046 12 14 11.1046 14 10ZM16 10C16 12.2091 14.2091 14 12 14C9.79086 14 8 12.2091 8 10C8 7.79086 9.79086 6 12 6C14.2091 6 16 7.79086 16 10ZM21 10C21 13.395 18.7701 16.6381 16.7471 18.9141C15.7121 20.0784 14.6802 21.0461 13.9082 21.7217C13.5216 22.0599 13.198 22.3264 12.9697 22.5098C12.8556 22.6015 12.7651 22.6729 12.7021 22.7217C12.6708 22.746 12.6461 22.7652 12.6289 22.7783C12.6204 22.7848 12.6132 22.7893 12.6084 22.793C12.606 22.7948 12.604 22.7968 12.6025 22.7979L12.6006 22.7998C12.6003 22.8 12.6 22.8 12 22C11.4 22.8 11.3997 22.8 11.3994 22.7998L11.3975 22.7979C11.396 22.7968 11.394 22.7948 11.3916 22.793C11.3868 22.7893 11.3796 22.7848 11.3711 22.7783C11.3539 22.7652 11.3292 22.746 11.2979 22.7217C11.2349 22.6729 11.1444 22.6015 11.0303 22.5098C10.802 22.3264 10.4784 22.0599 10.0918 21.7217C9.31976 21.0461 8.28792 20.0784 7.25293 18.9141C5.22987 16.6381 3 13.395 3 10C3 7.61305 3.94791 5.32357 5.63574 3.63574C7.32357 1.94791 9.61305 1 12 1C14.3869 1 16.6764 1.94791 18.3643 3.63574C20.0521 5.32357 21 7.61305 21 10Z'
				fill='#0A0A0A'
			/>
		</svg>
	);
}

// Figma asset "Icon / Search" (node 2001:298), rendered at 16px per the design.
function SearchIcon({ className }: { className?: string }) {
	return (
		<svg className={className} width='16' height='16' viewBox='0 0 24 24' fill='none' aria-hidden='true' xmlns='http://www.w3.org/2000/svg'>
			<path
				d='M18 11C18 7.13401 14.866 4 11 4C7.13401 4 4 7.13401 4 11C4 14.866 7.13401 18 11 18C14.866 18 18 14.866 18 11ZM20 11C20 13.125 19.2618 15.0766 18.0303 16.6162L21.707 20.293C22.0976 20.6835 22.0976 21.3165 21.707 21.707C21.3165 22.0974 20.6835 22.0975 20.293 21.707L16.6162 18.0303C15.0766 19.2618 13.125 20 11 20C6.02944 20 2 15.9706 2 11C2 6.02944 6.02944 2 11 2C15.9706 2 20 6.02944 20 11Z'
				fill='#0A0A0A'
			/>
		</svg>
	);
}

export type ElectionsNearYouSearchProps = {
	className?: string;
	buttonLabel?: string;
	/**
	 * Where on the page this search sits, sent with every analytics event so
	 * the same search can be told apart when two blocks carry it on one page.
	 */
	placement: string;
	/** The `data-component` attribute of the block that owns the button, for click tracking. */
	parent: string;
	layout?: 'inline' | 'fluid';
	appearance?: 'pill' | 'field';
};

const MIN_QUERY_LENGTH = ELECTIONS_SEARCH_MIN_QUERY_LENGTH;

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

/**
 * The city-or-county search form shared by the Elections Near You block and the
 * Elections Search Hero: Google Places suggestions, the resolve-place lookup,
 * the analytics events and the navigation all live here, so the two blocks
 * cannot drift apart in behaviour.
 */
export function ElectionsNearYouSearch(props: ElectionsNearYouSearchProps) {
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

	const { placement } = props;

	useEffect(() => {
		// window.location.pathname (not usePathname()) matches this repo's other
		// analytics call sites (e.g. ClickToCallBlock) and, unlike the hook, needs
		// no App Router context — the owning blocks' DOM tests render this via
		// renderToStaticMarkup with no router mounted.
		const pagePath = typeof window !== 'undefined' ? window.location.pathname : null;
		trackEvent(ELECTIONS_SEARCH_VIEWED_EVENT, { pagePath, placement });
		// Fires once per mount, matching "once per page view per block instance".
	}, [placement]);

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
				// this keeps the form free of a router dependency the owning blocks
				// would otherwise need to mock out in their SSR-rendered DOM tests.
				navigate: url => window.location.assign(url),
			};

			// A submit before the suggestions have arrived (the Google script loads
			// on first focus) waits for them, so the first try resolves a real
			// place instead of the bare text.
			const fetchSuggestions = async (value: string) => {
				latestQueryRef.current = value;
				return runSuggestionQuery(value, { latestQuery: latestQueryRef, sessionToken: sessionTokenRef });
			};

			void placeForSubmit({ rawInput: inputValue, selected: selectedPlace, suggestions, fetchSuggestions })
				.then(async place => submitElectionsNearYouSearchOnce({ rawInput: inputValue, place }, deps, { isSubmitting: isSubmittingRef }))
				.then(result => {
					if (result && !result.ok) setError(result.error);
				})
				.finally(() => {
					setIsSubmitting(false);
				});
		},
		[inputValue, selectedPlace, suggestions],
	);

	const layout = props.layout ?? 'inline';
	const appearance = props.appearance ?? 'pill';
	const { form, inputColumn, inputWrapper, inputIcon, input, button, error: errorClass, popover, listbox, listboxItem } = styles({ layout, appearance });
	const Icon = appearance === 'field' ? SearchIcon : MapPinIcon;

	return (
		<form onSubmit={handleSubmit} className={cn(form(), props.className)} noValidate data-component='ElectionsNearYouSearch'>
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
					<div className={inputWrapper()}>
						<Icon className={inputIcon()} />
						<AreaInput
							className={input()}
							placeholder='Enter your city or county'
							onFocus={handleFocus}
							aria-invalid={error ? true : undefined}
							aria-describedby={error ? errorId : undefined}
						/>
					</div>
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
				parent={props.parent}
				styleType={primaryButtonStyleType}
				styleSize='md'
				isLoading={isSubmitting}
				disabled={isSubmitting}
				className={button()}
			>
				{props.buttonLabel ?? 'Search'}
			</Button>
		</form>
	);
}
