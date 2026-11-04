import type { PledgeSubject } from '~/ui/_lib/attributionCopy';

/**
 * The voter guide pledge copy test (Jack's "Pledge callout copy test variants"
 * doc; Voter Guide Data meeting, 2026-10-19). Three arms: today's copy and two
 * rewrites, each changing the location page callout, the pledged profile's hero
 * callout and the pledge pop-up's call to action together.
 *
 * The pages it touches are cached (ISR), so the server cannot pick an arm per
 * visitor. Instead every arm is rendered into the HTML, and a script in the
 * document head picks the visitor's arm from their Amplitude device id before
 * first paint and hides the others (see {@link pledgeCopyHeadScript}). The same
 * device id always lands in the same arm, so a visitor keeps their copy across
 * pages and visits, and Amplitude can join the arm to everything else they do.
 *
 * Ending the test: set {@link PLEDGE_COPY_TEST_ENABLED} to false and everyone
 * sees control again; ship the winner by editing the copy below into the
 * control strings.
 */
export const PLEDGE_COPY_TEST_ENABLED = true;

export const PLEDGE_COPY_FLAG_KEY = 'voter-guide-pledge-copy';

export const PLEDGE_COPY_VARIANTS = ['control', 'b3', 'alt'] as const;

export type PledgeCopyVariant = (typeof PLEDGE_COPY_VARIANTS)[number];

/** The two rewrites; control is whatever the surface already renders. */
export type PledgeCopyTreatment = Exclude<PledgeCopyVariant, 'control'>;

export const PLEDGE_COPY_TREATMENTS: readonly PledgeCopyTreatment[] = ['b3', 'alt'];

/** The attribute every arm's wrapper carries; the head script's style keys on it. */
export const PLEDGE_COPY_ATTRIBUTE = 'data-pledge-copy';

/** Where the head script leaves the arm for client code (the pop-up, the analytics helpers). */
export const PLEDGE_COPY_WINDOW_KEY = '__goodpartyPledgeCopyVariant';

/**
 * Picks the arm for the Amplitude device id in `cookieHeader`, or null when the
 * visitor has no Amplitude cookie (no API key, cookies blocked), who then sees
 * control and is left out of the analysis.
 *
 * Self-contained on purpose: {@link pledgeCopyHeadScript} inlines this
 * function's source into the page head, so it may not reference anything
 * outside its own body, and it sticks to syntax the compiler leaves alone
 * (no for-of, no `??`), which would otherwise pull in helpers that are not
 * there in the head.
 */
export function pickPledgeCopyVariant(cookieHeader: string, cookieName: string, flagKey: string): 'control' | 'b3' | 'alt' | null {
	let raw: string | null = null;
	const parts = cookieHeader.split(';');
	for (let p = 0; p < parts.length; p++) {
		const part = parts[p] || '';
		const at = part.indexOf('=');
		if (at < 0) continue;
		if (part.slice(0, at).trim() === cookieName) {
			raw = part.slice(at + 1).trim();
			break;
		}
	}
	if (!raw) return null;

	let deviceId: unknown = null;
	try {
		// The Browser SDK writes btoa(encodeURIComponent(JSON)); the value itself
		// may arrive URL-encoded ('=' as '%3D') when the middleware set it.
		let value = raw;
		try {
			value = decodeURIComponent(raw);
		} catch {
			value = raw;
		}
		deviceId = (JSON.parse(decodeURIComponent(atob(value))) as { deviceId?: unknown }).deviceId;
	} catch {
		return null;
	}
	if (typeof deviceId !== 'string' || deviceId.length === 0) return null;

	// FNV-1a, so the split needs no network call and comes out the same in every browser.
	const input = `${flagKey}:${deviceId}`;
	let hash = 0x811c9dc5;
	for (let i = 0; i < input.length; i++) {
		hash ^= input.charCodeAt(i);
		hash = Math.imul(hash, 0x01000193) >>> 0;
	}
	const arms = ['control', 'b3', 'alt'] as const;
	return arms[hash % arms.length] || null;
}

export function amplitudeCookieName(apiKey: string | undefined): string | null {
	if (!apiKey || apiKey.length < 10) return null;
	return `AMP_${apiKey.substring(0, 10)}`;
}

/**
 * The inline head script. It picks the arm, stores it on `window`, and for a
 * rewrite injects a style that hides control and shows the arm. Injecting a
 * style rather than touching the rendered elements keeps React's hydration
 * clean. Control and visitors with no arm need no style: control is the only
 * arm visible by default.
 */
export function pledgeCopyHeadScript(cookieName: string): string {
	const attribute = PLEDGE_COPY_ATTRIBUTE;
	return `(function(){try{var pick=${pickPledgeCopyVariant.toString()};var v=pick(document.cookie,${JSON.stringify(cookieName)},${JSON.stringify(PLEDGE_COPY_FLAG_KEY)});window[${JSON.stringify(PLEDGE_COPY_WINDOW_KEY)}]=v;if(v&&v!=='control'){var s=document.createElement('style');s.textContent='[${attribute}="control"]{display:none!important}[${attribute}="'+v+'"]{display:contents!important}';document.head.appendChild(s);}}catch(e){}})();`;
}

/** The visitor's arm in the browser: null on the server, with the test off, or for a visitor with no Amplitude cookie. */
export function currentPledgeCopyVariant(): PledgeCopyVariant | null {
	if (!PLEDGE_COPY_TEST_ENABLED || typeof window === 'undefined' || typeof document === 'undefined') return null;
	const stored = (window as unknown as Record<string, unknown>)[PLEDGE_COPY_WINDOW_KEY];
	if (stored === null) return null;
	if (typeof stored === 'string' && (PLEDGE_COPY_VARIANTS as readonly string[]).includes(stored)) return stored as PledgeCopyVariant;
	const cookieName = amplitudeCookieName(process.env['NEXT_PUBLIC_AMPLITUDE_API_KEY']);
	return cookieName ? pickPledgeCopyVariant(document.cookie, cookieName, PLEDGE_COPY_FLAG_KEY) : null;
}

/** The location page's "What this symbol means" callout, per rewrite. */
export const PLEDGE_LOCATION_CALLOUT_COPY: Record<PledgeCopyTreatment, { title: string; body: string; linkLabel: string }> = {
	b3: {
		title: 'Tired of choosing between two broken parties?',
		body: "Candidates with this symbol run without either major party's endorsement. They signed the People First Pledge to serve people first, independent of both major parties and big-money donors.",
		linkLabel: 'See the pledge they signed',
	},
	alt: {
		title: 'One thing to check before you vote',
		body: "You can't research every candidate. This symbol tells you something concrete: they signed the People First Pledge to run without major-party endorsements, raise most of their money from individuals, and stay accountable to you.",
		linkLabel: "Here's what they pledged",
	},
};

/** The pledged profile's hero callout, per rewrite. Only the pledged sentence is tested; the other two stay as they are. */
export const PLEDGE_PROFILE_CALLOUT_COPY: Record<PledgeCopyTreatment, { sentence(name: string, subject: PledgeSubject): string; linkLabel: string }> = {
	b3: {
		sentence: (name, subject) =>
			`${name} ${subject === 'elected official' ? 'is serving' : 'is running'} without either major party's endorsement. They signed the People First Pledge to serve people first, independent of both major parties and big-money donors.`,
		linkLabel: 'See the pledge they signed',
	},
	alt: {
		sentence: name =>
			`If you check one thing about ${name}, check this. They signed the People First Pledge to run without major-party endorsements, raise most of their money from individuals, and answer to you.`,
		linkLabel: "Here's what they pledged",
	},
};

type ModalLink = { label: string; href: string };

/** The pop-up's call to action block, per rewrite. Every button goes to /about for now (Emily, 2026-10-20). */
export const PLEDGE_MODAL_CTA_COPY: Record<PledgeCopyTreatment, { prompt(location: string | null): string; primary: ModalLink; secondary?: ModalLink }> = {
	b3: {
		prompt: location => (location ? `Want a real choice in ${location}'s next election?` : 'Want a real choice in your next election?'),
		primary: { label: 'Get involved', href: '/about' },
		secondary: { label: 'Learn more about GoodParty.org', href: '/about' },
	},
	alt: {
		prompt: () => 'What the People First Pledge means for you',
		primary: { label: 'Join the independent movement', href: '/about' },
	},
};
