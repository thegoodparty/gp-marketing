import type { ResolvedPlace } from '~/lib/resolvePlace';
import type { ParsedPlaceSuggestion, PlaceSuggestion } from '~/lib/googlePlaces';

/**
 * The block's submit logic as a plain function so it is testable without a
 * browser: `deps` stands in for the resolve-route fetch, Amplitude, and the
 * router, so a test can assert the exact event name/props and navigation
 * call for each resolve outcome without mocking the function under test.
 */

export type ElectionsSearchInputType = 'city' | 'county';

export type ElectionsSearchFailureReason = 'unresolved' | 'network' | 'empty_input';

export type ElectionsNearYouSearchDeps = {
	resolvePlace(params: { city?: string; county?: string; state?: string }): Promise<ResolvedPlace>;
	trackEvent(eventName: string, eventProperties?: Record<string, unknown>): void;
	navigate(url: string): void;
};

export type ElectionsNearYouSearchInput = {
	rawInput: string;
	place?: ParsedPlaceSuggestion;
};

export type ElectionsNearYouSearchResult = { ok: true } | { ok: false; error: string };

export const ELECTIONS_SEARCH_VIEWED_EVENT = 'Voter Guide - Election Search Viewed';
export const ELECTIONS_SEARCH_COMPLETED_EVENT = 'Voter Guide - Election Search Completed';
export const ELECTIONS_SEARCH_ERRORED_EVENT = 'Voter Guide - Election Search Errored';

export const ELECTIONS_SEARCH_EMPTY_INPUT_ERROR = 'Enter a city or county to search.';
export const ELECTIONS_SEARCH_UNRESOLVED_ERROR = "We couldn't find that city or county. Try a nearby one.";
export const ELECTIONS_SEARCH_NETWORK_ERROR = 'Something went wrong. Please try again.';

function inputTypeFor(place: ParsedPlaceSuggestion | undefined): ElectionsSearchInputType {
	return place && 'county' in place ? 'county' : 'city';
}

function trackErrored(deps: Pick<ElectionsNearYouSearchDeps, 'trackEvent'>, inputType: ElectionsSearchInputType, failureReason: ElectionsSearchFailureReason) {
	deps.trackEvent(ELECTIONS_SEARCH_ERRORED_EVENT, { inputType, failureReason });
}

export async function submitElectionsNearYouSearch(
	input: ElectionsNearYouSearchInput,
	deps: ElectionsNearYouSearchDeps,
): Promise<ElectionsNearYouSearchResult> {
	const inputType = inputTypeFor(input.place);
	const trimmed = input.rawInput.trim();

	if (!trimmed) {
		trackErrored(deps, inputType, 'empty_input');
		return { ok: false, error: ELECTIONS_SEARCH_EMPTY_INPUT_ERROR };
	}

	const params = input.place
		? 'county' in input.place
			? { county: input.place.county, state: input.place.state }
			: { city: input.place.city, state: input.place.state }
		: { city: trimmed };

	let result: ResolvedPlace;
	try {
		result = await deps.resolvePlace(params);
	} catch {
		trackErrored(deps, inputType, 'network');
		return { ok: false, error: ELECTIONS_SEARCH_NETWORK_ERROR };
	}

	if ('error' in result) {
		trackErrored(deps, inputType, 'unresolved');
		return { ok: false, error: ELECTIONS_SEARCH_UNRESOLVED_ERROR };
	}

	// Fired before navigate, not in a `.then` after it: the real caller's
	// `navigate` triggers a full page navigation, and Amplitude's transport is
	// fire-and-forget over the network, so ordering here (not a race with the
	// unload) is what keeps the event from being lost to the redirect.
	deps.trackEvent(ELECTIONS_SEARCH_COMPLETED_EVENT, {
		inputType,
		resolvedCityCount: result.matchedLevel === 'city' ? 1 : 0,
		// District matching isn't implemented yet - ResolvedPlace's matchedLevel
		// union has no 'district' member, so this can only ever be false today.
		hasDistrictMatch: false,
	});
	deps.navigate(`${result.url}?gp_src=search`);

	return { ok: true };
}

export type SubmitGuardRefs = { isSubmitting: { current: boolean } };

/**
 * Wraps `submitElectionsNearYouSearch` with a synchronous in-flight guard:
 * two calls fired before the first settles (a double-click before React
 * re-renders the button disabled) run the search exactly once. Exported so
 * that guarantee is testable against the real function, not a reimplemented
 * stand-in for it.
 */
export async function submitElectionsNearYouSearchOnce(
	input: ElectionsNearYouSearchInput,
	deps: ElectionsNearYouSearchDeps,
	refs: SubmitGuardRefs,
): Promise<ElectionsNearYouSearchResult | undefined> {
	if (refs.isSubmitting.current) return undefined;
	refs.isSubmitting.current = true;
	try {
		return await submitElectionsNearYouSearch(input, deps);
	} finally {
		refs.isSubmitting.current = false;
	}
}

/** Shortest input worth asking Google about; mirrors the search box's own keystroke threshold. */
export const ELECTIONS_SEARCH_MIN_QUERY_LENGTH = 3;

export type PlaceForSubmitInput = {
	rawInput: string;
	selected?: ParsedPlaceSuggestion;
	suggestions: PlaceSuggestion[];
	/** The same query the keystrokes run; `undefined` means the response was superseded. */
	fetchSuggestions(value: string): Promise<PlaceSuggestion[] | undefined>;
};

/**
 * The place a submit should resolve. A picked suggestion wins. Otherwise the
 * first suggestion already on screen, and if none has arrived yet, one fetched
 * now for the typed text. The Google script only starts loading on first
 * focus, so a quick "marion" + Enter used to submit the bare word, which no
 * state can disambiguate, and fail until the second try (Emily, 2026-10-07).
 * `undefined` means free text is all there is.
 */
export async function placeForSubmit(input: PlaceForSubmitInput): Promise<ParsedPlaceSuggestion | undefined> {
	if (input.selected) return input.selected;
	const onScreen = input.suggestions[0]?.parsed;
	if (onScreen) return onScreen;
	const trimmed = input.rawInput.trim();
	if (trimmed.length < ELECTIONS_SEARCH_MIN_QUERY_LENGTH) return undefined;
	const fetched = await input.fetchSuggestions(trimmed);
	return fetched?.[0]?.parsed;
}
