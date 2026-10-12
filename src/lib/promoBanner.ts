export type PromoBannerPathRules = {
	include?: ReadonlyArray<string | null | undefined> | null;
	exclude?: ReadonlyArray<string | null | undefined> | null;
};

export type PromoBannerSchedule = {
	startsAt?: string | null;
	endsAt?: string | null;
};

const cleanRules = (rules: PromoBannerPathRules['include']): string[] =>
	(rules ?? []).map(rule => (rule ?? '').trim().toLowerCase()).filter(rule => rule.length > 0);

const ruleMatches = (rule: string, pathname: string): boolean => {
	const path = pathname.toLowerCase().replace(/\/+$/, '') || '/';
	if (rule === '/') return path === '/';
	return `${path}/`.includes(rule);
};

/** The Studio URL rules: a "hide on" match wins, and an empty "only show on" list means every page. */
export const promoBannerShowsOn = (pathname: string, rules: PromoBannerPathRules): boolean => {
	const exclude = cleanRules(rules.exclude);
	if (exclude.some(rule => ruleMatches(rule, pathname))) return false;
	const include = cleanRules(rules.include);
	return include.length === 0 || include.some(rule => ruleMatches(rule, pathname));
};

const toTime = (value: string | null | undefined): number | null => {
	if (!value) return null;
	const time = Date.parse(value);
	return Number.isNaN(time) ? null : time;
};

export const promoBannerIsLive = (schedule: PromoBannerSchedule, now: number): boolean => {
	const start = toTime(schedule.startsAt);
	const end = toTime(schedule.endsAt);
	if (start !== null && now < start) return false;
	if (end !== null && now >= end) return false;
	return true;
};

export const PROMO_BANNER_DISMISSED_STORAGE_KEY = 'gp-promo-banner-dismissed';

/** Changes with the message, destination or start date, so a new promo shows again to people who dismissed the last one. */
export const promoBannerDismissKey = (parts: { text: string; href?: string | null; startsAt?: string | null }): string => {
	const input = [parts.text, parts.href ?? '', parts.startsAt ?? ''].join('|');
	let hash = 5381;
	for (let i = 0; i < input.length; i++) hash = ((hash << 5) + hash + input.charCodeAt(i)) >>> 0;
	return hash.toString(36);
};

/**
 * Hides the server-rendered banner before first paint when the visitor dismissed it or the
 * schedule says it is not live. Cached HTML can be hours old and never knows the visitor, so
 * both checks have to run in the browser, and running them here instead of after hydration
 * is what stops the banner flashing in and out. It hides through a style rule rather than
 * touching the element, because changing an attribute React rendered trips a hydration warning.
 */
export const promoBannerPrePaintScript = (args: { dismissKey: string } & PromoBannerSchedule): string => {
	const start = toTime(args.startsAt);
	const end = toTime(args.endsAt);
	const storageKey = JSON.stringify(PROMO_BANNER_DISMISSED_STORAGE_KEY);
	const dismissKey = JSON.stringify(args.dismissKey);
	const hide = `var s=document.createElement("style");s.textContent="[data-promo-banner="+JSON.stringify(${dismissKey})+"]{display:none}";document.head.appendChild(s)`;
	return `(function(){var d=null;try{d=localStorage.getItem(${storageKey})}catch(e){}var n=Date.now();if(d===${dismissKey}||(${start}!==null&&n<${start})||(${end}!==null&&n>=${end})){${hide}}})();`;
};

/** "3d 04:12:09" until the target, "00:05:00" inside the last day, and null once the moment has passed. */
export const formatPromoCountdown = (target: string | null | undefined, now: number): string | null => {
	const targetTime = toTime(target);
	if (targetTime === null) return null;
	const remaining = Math.floor((targetTime - now) / 1000);
	if (remaining <= 0) return null;
	const days = Math.floor(remaining / 86400);
	const clock = [Math.floor((remaining % 86400) / 3600), Math.floor((remaining % 3600) / 60), remaining % 60]
		.map(part => String(part).padStart(2, '0'))
		.join(':');
	return days > 0 ? `${days}d ${clock}` : clock;
};
