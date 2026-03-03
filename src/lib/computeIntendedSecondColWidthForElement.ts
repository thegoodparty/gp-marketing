type Breakpoints = Record<'sm' | 'md' | 'lg' | 'xl' | '2xl', number>;

const DEFAULT_BPS: Breakpoints = { sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 };

// Tailwind defaults (px). Add your custom tokens (e.g. "max-xl") here.
const MAX_W_TOKENS_PX: Record<string, number | 'none' | 'full'> = {
	none: 'none',
	full: 'full',
	xs: 320,
	sm: 384,
	md: 448,
	lg: 512,
	xl: 576,
	'2xl': 672,
	'3xl': 768,
	'4xl': 896,
	'5xl': 1024,
	'6xl': 1152,
	'7xl': 1280,

	// Custom example to support `max-w-max-xl!`
	'max-xl': 1280,
};

function activeForViewport(prefix: string | null, vw: number, bps: Breakpoints): boolean {
	if (!prefix) return true;
	return vw >= bps[prefix as keyof Breakpoints];
}

function pickActiveClass(
	classList: string[],
	vw: number,
	bps: Breakpoints,
	base: RegExp,
	bp: (bp: keyof Breakpoints) => RegExp,
): string | null {
	const order: (keyof Breakpoints | null)[] = [null, 'sm', 'md', 'lg', 'xl', '2xl'];
	let found: string | null = null;
	for (const k of order) {
		if (!activeForViewport(k, vw, bps)) continue;
		const re = k ? bp(k) : base;
		for (const raw of classList) {
			const cls = raw.replace(/!$/, ''); // ignore trailing !
			if (re.test(cls)) found = cls; // last match wins
		}
	}
	return found;
}

function parseFrList(value: string): number[] {
	const tokens = value.replace(/_/g, ' ').trim().split(/\s+/);
	return tokens.map(t => {
		const m = t.match(/^([0-9.]+)fr$/);
		if (!m) throw new Error(`Only 'fr' units supported: "${t}"`);
		return parseFloat(m[1]!);
	});
}

function resolveMaxWidthFromClass(cls: string | null, vw: number, bps: Breakpoints, root = 16): number {
	if (!cls) return vw;
	const raw = cls.includes(':') ? cls.split(':').pop()! : cls;

	const arb = raw.match(/^max-w-\[(.+?)\]$/);
	if (arb) {
		const val = arb[1]!;
		if (/^\d+(\.\d+)?px$/.test(val)) return parseFloat(val);
		if (/^\d+(\.\d+)?rem$/.test(val)) return parseFloat(val) * root;
		if (/^\d+(\.\d+)?$/.test(val)) return parseFloat(val) * 4; // Tailwind spacing unit
		return vw; // %, ch, var(...) → treat as full
	}

	const scr = raw.match(/^max-w-screen-(sm|md|lg|xl|2xl)$/);
	if (scr) return bps[scr[1] as keyof Breakpoints];

	const tok = raw.match(/^max-w-([A-Za-z0-9-]+)$/);
	if (tok) {
		const key = tok[1]!;
		const v = MAX_W_TOKENS_PX[key];
		if (v === 'none') return Number.POSITIVE_INFINITY;
		if (v === 'full' || v === undefined) return vw;
		return v as number;
	}

	return vw;
}

/**
 * Intended 2nd column width (px) for `el`.
 * - Uses classes to pick grid template & max-w.
 * - Uses computed styles for gap / padding / margin.
 * - If fewer than 2 columns are active (e.g., before `lg`), returns the **single-column width**.
 */
export function computeIntendedSecondColWidthForElement(
	el: HTMLElement,
	opts?: { breakpoints?: Partial<Breakpoints>; rootFontSizePx?: number; viewportWidth?: number },
): number {
	const bps: Breakpoints = { ...DEFAULT_BPS, ...(opts?.breakpoints || {}) };
	const vw = opts?.viewportWidth ?? window.innerWidth;
	const root = opts?.rootFontSizePx ?? 16;
	const classList = (el.getAttribute('class') || '').trim().split(/\s+/).filter(Boolean);

	// 1) Active grid template (may not exist before lg)
	const gridClass = pickActiveClass(classList, vw, bps, /^grid-cols-\[(.+?)\]$/, bp => new RegExp(`^${bp}:grid-cols-\\[(.+?)\\]$`));
	const frs = gridClass ? parseFrList(gridClass.match(/\[(.+?)\]$/)![1]!) : [1]; // default: one column
	const cols = frs.length;

	// 2) Active max-w
	const maxWClass = pickActiveClass(
		classList,
		vw,
		bps,
		/^max-w-(\[.+?\]|screen-(sm|md|lg|xl|2xl)|none|full|[A-Za-z0-9-]+)!?$/,
		bp => new RegExp(`^${bp}:max-w-(\\[.+?\\]|screen-(sm|md|lg|xl|2xl)|none|full|[A-Za-z0-9-]+)!?$`),
	);
	const maxW = resolveMaxWidthFromClass(maxWClass, vw, bps, root);

	// 3) Read actual gap/padding/margin
	const cs = getComputedStyle(el);
	const gapX = parseFloat(cs.columnGap || (cs as any).gap || '0') || 0;
	const padL = parseFloat(cs.paddingLeft) || 0;
	const padR = parseFloat(cs.paddingRight) || 0;
	const marL = parseFloat(cs.marginLeft) || 0;
	const marR = parseFloat(cs.marginRight) || 0;
	const chrome = padL + padR + marL + marR;

	// 4) Intended container width (clamped by max-w) and content width
	const containerWidth = Math.min(vw, maxW);
	const totalGaps = gapX * Math.max(cols - 1, 0);
	const contentWidth = Math.max(0, containerWidth - chrome - totalGaps);

	// 5) If < 2 cols active → return single-column width (your requirement)
	if (cols < 2) return contentWidth;

	// 6) Otherwise, fr-share for column 2
	const sumFr = frs.reduce((a, b) => a + b, 0);
	return Math.floor((frs[1]! / sumFr) * contentWidth);
}
