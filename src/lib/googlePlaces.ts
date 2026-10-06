import { normalizeStateCode } from '~/constants/usStateCodes';

/**
 * Lazy loader + session-token management for the Places API (New) JS library.
 * Loaded via a plain script tag rather than the `importLibrary` bootstrap
 * snippet: the classic `libraries=places` query param exposes the same New
 * Places classes (`AutocompleteSuggestion`, `AutocompleteSessionToken`) under
 * `google.maps.places`, so a script tag needs no extra bootstrap code and no
 * new npm dependency.
 */

const GOOGLE_PLACES_SCRIPT_ID = 'gp-google-places-loader';

// administrative_area_level_2 is the county-equivalent primary type in the US
// (parishes, boroughs, etc. all resolve under it); the only other type this
// request can return, locality, is a city or a New England town.
const COUNTY_PRIMARY_TYPE = 'administrative_area_level_2';

// Opaque: callers only ever store and pass this back, never inspect it.
export type PlacesSessionToken = object;
type AutocompleteSessionToken = PlacesSessionToken;

type AutocompletePlacePrediction = {
	placeId: string;
	text: { text: string };
	mainText?: { text: string };
	secondaryText?: { text: string };
	types: string[];
};

type AutocompleteSuggestionResult = {
	placePrediction?: AutocompletePlacePrediction;
};

type AutocompleteRequest = {
	input: string;
	sessionToken: AutocompleteSessionToken;
	includedRegionCodes?: string[];
	includedPrimaryTypes?: string[];
};

type GooglePlacesLibrary = {
	AutocompleteSuggestion: {
		fetchAutocompleteSuggestions(request: AutocompleteRequest): Promise<{ suggestions: AutocompleteSuggestionResult[] }>;
	};
	AutocompleteSessionToken: new () => AutocompleteSessionToken;
};

declare global {
	interface Window {
		google?: {
			maps?: {
				places?: GooglePlacesLibrary;
			};
		};
	}
}

export type ParsedPlaceSuggestion = { city: string; state: string } | { county: string; state: string };

export type PlaceSuggestion = {
	id: string;
	description: string;
	parsed: ParsedPlaceSuggestion | undefined;
};

/**
 * Parses one AutocompleteSuggestion's structured prediction text into the
 * `{ city, state } | { county, state }` shape `resolvePlace` expects. Pure
 * and exported for testing; the caller decides what to do with `undefined`
 * (a prediction Google returned without a resolvable state token).
 */
export function parsePlacePrediction(prediction: AutocompletePlacePrediction): ParsedPlaceSuggestion | undefined {
	const mainText = prediction.mainText?.text?.trim();
	const secondaryText = prediction.secondaryText?.text?.trim();
	if (!mainText || !secondaryText) return undefined;

	// secondaryText can lead with a disambiguating county before the state
	// (e.g. "Greene County, Missouri, USA" for Springfield, MO), so scan every
	// comma-separated token for the first one that resolves to a state rather
	// than assuming the state is always first.
	const state = secondaryText.split(',').reduce<ReturnType<typeof normalizeStateCode>>(
		(found, token) => found ?? normalizeStateCode(token.trim()),
		null,
	);
	if (!state) return undefined;

	return prediction.types.includes(COUNTY_PRIMARY_TYPE) ? { county: mainText, state } : { city: mainText, state };
}

let scriptLoadPromise: Promise<void> | undefined;

async function injectGooglePlacesScript(apiKey: string): Promise<void> {
	return new Promise((resolve, reject) => {
		const existing = document.getElementById(GOOGLE_PLACES_SCRIPT_ID);
		if (existing instanceof HTMLScriptElement) {
			if (window.google?.maps?.places) {
				resolve();
				return;
			}
			// A tag that already fired `error` will never fire `load` or `error` again, so
			// listening on it would hang forever. Drop it and inject a fresh one below.
			if (existing.dataset['failed']) {
				existing.remove();
			} else {
				existing.addEventListener('load', () => resolve(), { once: true });
				existing.addEventListener(
					'error',
					() => {
						existing.dataset['failed'] = '1';
						reject(new Error('Google Places script failed to load'));
					},
					{ once: true },
				);
				return;
			}
		}

		const script = document.createElement('script');
		script.id = GOOGLE_PLACES_SCRIPT_ID;
		script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&loading=async`;
		script.async = true;
		script.addEventListener('load', () => resolve(), { once: true });
		script.addEventListener(
			'error',
			() => {
				script.dataset['failed'] = '1';
				reject(new Error('Google Places script failed to load'));
			},
			{ once: true },
		);
		document.head.appendChild(script);
	});
}

/**
 * Lazily loads the Places API (New) JS library on first call, caching the
 * promise so a re-focus or a second keystroke awaits the same load instead of
 * injecting a second script tag. Rejects (never throws) when the browser key
 * is unset or the script fails to load; callers degrade to a free-text
 * submit rather than surfacing this as a user-facing error.
 */
export async function ensureGooglePlacesLoaded(): Promise<void> {
	if (scriptLoadPromise) return scriptLoadPromise;

	const apiKey = process.env['NEXT_PUBLIC_GOOGLE_PLACES_BROWSER_KEY'];
	if (typeof window === 'undefined' || !apiKey) {
		scriptLoadPromise = Promise.reject(new Error('Google Places browser key is not configured'));
		return scriptLoadPromise;
	}

	scriptLoadPromise = injectGooglePlacesScript(apiKey)
		.then(() => {
			if (!window.google?.maps?.places) throw new Error('Google Places script loaded without google.maps.places');
		})
		.catch((error: unknown) => {
			// A rejected promise is still truthy, so without this the guard above would
			// hand every later caller the same cached failure and the existing-tag retry
			// in injectGooglePlacesScript could never run. Only the load path resets: a
			// missing key is a config error and stays rejected on purpose.
			scriptLoadPromise = undefined;
			throw error;
		});
	return scriptLoadPromise;
}

/** Starts one session token for a search cycle (first keystroke through selection). */
export function startPlacesSession(): AutocompleteSessionToken {
	const places = window.google?.maps?.places;
	if (!places) throw new Error('Google Places library is not loaded');
	return new places.AutocompleteSessionToken();
}

/**
 * Fetches suggestions for one input value. Only `locality` (cities/towns,
 * including New England towns) and `administrative_area_level_2` (counties
 * and county-equivalents) come back, per the US-only, city/county scope this
 * search covers. Never calls Place Details, so billing stays scoped to the
 * autocomplete session the caller's token belongs to.
 */
export async function fetchPlaceSuggestions(input: string, sessionToken: AutocompleteSessionToken): Promise<PlaceSuggestion[]> {
	const places = window.google?.maps?.places;
	if (!places) return [];

	const { suggestions } = await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
		input,
		sessionToken,
		includedRegionCodes: ['us'],
		includedPrimaryTypes: ['locality', 'administrative_area_level_2'],
	});

	return suggestions
		.map(suggestion => suggestion.placePrediction)
		.filter((prediction): prediction is AutocompletePlacePrediction => Boolean(prediction))
		.flatMap(prediction => {
			const parsed = parsePlacePrediction(prediction);
			// Drop suggestions we can't parse rather than list them: selecting one
			// would store an undefined place and silently fall back to an
			// unresolvable free-text submit with no indication anything was lost.
			if (!parsed) return [];
			return [{ id: prediction.placeId, description: prediction.text.text, parsed }];
		});
}

export type SuggestionQueryRefs = {
	latestQuery: { current: string };
	sessionToken: { current: PlacesSessionToken | null };
};

export type SuggestionQueryDeps = {
	ensureGooglePlacesLoaded(): Promise<void>;
	startPlacesSession(): AutocompleteSessionToken;
	fetchPlaceSuggestions(input: string, sessionToken: AutocompleteSessionToken): Promise<PlaceSuggestion[]>;
};

const defaultSuggestionQueryDeps: SuggestionQueryDeps = { ensureGooglePlacesLoaded, startPlacesSession, fetchPlaceSuggestions };

/**
 * Orchestrates one input change's suggestion fetch: loads the library if it
 * hasn't loaded yet, reuses or starts a session token, fetches, and returns
 * `undefined` (a "discard this response" sentinel) unless `value` is still
 * the latest thing the caller's ref says was typed - an earlier keystroke's
 * slower response must not overwrite a later one's result. Exported (with
 * injectable deps) so that ordering guarantee is testable against
 * controllable dependency promises, not just read off the source.
 */
export async function runSuggestionQuery(
	value: string,
	refs: SuggestionQueryRefs,
	deps: SuggestionQueryDeps = defaultSuggestionQueryDeps,
): Promise<PlaceSuggestion[] | undefined> {
	try {
		await deps.ensureGooglePlacesLoaded();
	} catch {
		return refs.latestQuery.current === value ? [] : undefined;
	}
	if (refs.latestQuery.current !== value) return undefined;

	const token = refs.sessionToken.current ?? deps.startPlacesSession();
	refs.sessionToken.current = token;

	let results: PlaceSuggestion[];
	try {
		results = await deps.fetchPlaceSuggestions(value, token);
	} catch {
		return refs.latestQuery.current === value ? [] : undefined;
	}

	return refs.latestQuery.current === value ? results : undefined;
}
