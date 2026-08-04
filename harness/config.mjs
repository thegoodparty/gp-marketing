// Person Public Profiles — Figma parity harness config.
//
// Single source of truth for the 12 Figma states (A–L). Each entry pairs a live
// /people/<slug> URL on the local dev server with its cached Figma reference PNG,
// and declares any regions we knowingly cannot match yet (heatmap, data gaps).
//
// This file is plain data (no imports) so every harness script can read it.

export const DEV_ORIGIN = 'http://localhost:3009';

// Where the cached Figma frame exports live (figma-A.png … figma-L.png).
// Re-export from Figma into this folder to refresh the source of truth.
export const FIGMA_DIR = '/tmp/figma-shots';

// Live Figma source of truth — "GoodParty — Marketing Design System". Each STATES
// entry carries its `node` id; pull the live frame via the Figma MCP
// (get_screenshot / get_design_context) with FIGMA_FILE_KEY + that node id.
export const FIGMA_FILE_KEY = 'qIOT4lO1nRw4reuj6LjLwn';

// The unclaimed-profile "claim" form overlay dialog (shared across unclaimed states).
export const FIGMA_OVERLAY_NODE = '1901:51609';

// Harness run artifacts (screenshots, diffs, reports) land here, one dir per run.
export const OUT_ROOT = '/tmp/people-harness';

// The pass/fail gate. A state is GREEN when its layout diff score is at or below
// this fraction (3%). The loop does not stop until every ACTIVE state is GREEN.
export const TOLERANCE = 0.03;

// Desktop capture viewport. Figma frames are desktop; keep this fixed so height
// drift is a signal, not noise. (Mobile parity is a separate, later pass.)
export const VIEWPORT = { width: 1440, height: 1000 };

// Canonical width every image is normalized to before diffing. Both the Figma
// ref and the live screenshot are scaled to this width (aspect preserved), then
// padded to a common height, so the diff compares like-for-like proportions
// regardless of each Figma frame's exported width.
export const CANON_WIDTH = 1000;

// Layout-score blur/downscale. Text content and photos legitimately differ from
// the Figma mock (real seeded data vs placeholders), so a raw pixel diff is
// meaningless. We blur then downscale before diffing: this collapses glyph-level
// text differences into similar-density gray while preserving what we actually
// care about — section order, spacing, sizing, color blocks, and alignment.
// Blur mushes glyph-level text (real seeded data vs Figma placeholders) into
// similar-density gray so the per-band score reflects LAYOUT (section order,
// spacing, sizing, color blocks, alignment) rather than copy. The gate is a
// layout-tolerance, not a pixel diff.
//
// This alone can't catch a missing hero photo — the avatar is a tiny fraction of
// the tall `body` band, so an empty hero barely moves the score (that, plus the
// old headshot MASK, is exactly how an empty hero once passed). The hero photo is
// instead guarded directly by an avatar-presence assertion at capture time
// (capture.mjs -> `avatar`), surfaced as a hard fail in the report.
export const LAYOUT_BLUR_SIGMA = 4;
export const LAYOUT_DOWNSCALE_WIDTH = 320;

// Region kinds we exclude from the score. A mask is
//   { band, kind, rect: [x, y, w, h] }
// where `band` is the band id it applies to and rect is in FRACTIONS of that
// band's normalized crop (0..1). Both the Figma and live band get the region
// painted flat gray before scoring.
//   - 'heatmap'  : voter-density map — data not available yet (flag, don't chase)
//   - 'dataGap'  : a region the design shows but our data genuinely can't fill
export const MASK_KINDS = ['heatmap', 'dataGap'];

// Masks applied to EVERY state (in addition to per-state `masks`).
//
// The hero headshot is NO LONGER masked. The dev fixtures now seed real headshot
// photos (devPeopleProfileFixtures.ts), so the avatar region is a legitimate,
// comparable part of the layout — masking it is exactly what let an empty hero
// pass as "parity". Production profiles carry BallotReady/authored headshots.
export const GLOBAL_MASKS = [];

// The comparison is SECTION-BASED. The Figma frame is 1440-wide — the same as
// our capture — so within a band vertical positions are directly comparable and
// a per-band blurred diff is a real gradient (unlike a full-page diff, which
// saturates the moment total page height drifts). Figma band boundaries are
// auto-extracted into figma-sections.json (see extract-figma-sections.mjs); this
// maps each band id to the live DOM box that should match it.
//
// `body` (hero + content well) has no single wrapper, so it's the union from the
// top of ProfileHero to the bottom of ProfileContentBlock — captured specially.
export const BAND_SELECTORS = {
	nav: '[data-component="Header"]',
	breadcrumb: '[data-component="BreadcrumbBlock"]',
	cta: '[data-component="CTABannerBlock"]',
	pledge: '[data-component="GoodPartyOrgPledge"]',
	elections: '[data-component="ElectionsIndexBlock"]',
	footer: '[data-component="Footer"]',
};
export const BODY_TOP_SELECTOR = '[data-component="ProfileHero"]';
export const BODY_BOTTOM_SELECTOR = '[data-component="ProfileContentBlock"]';

export const BAND_ORDER = ['nav', 'breadcrumb', 'body', 'cta', 'pledge', 'elections', 'footer'];

// Every band is scored and shown, but only some COUNT toward the 3% gate.
//   - 'feature' : sections this project actually builds/owns -> GATED at TOLERANCE
//   - 'chrome'  : shared site nav/breadcrumb/footer, already shipped -> report-only
//   - 'data'    : shared block whose diff is dominated by seeded-data VOLUME, not
//                 layout (elections index county list) -> report-only, flagged
// The gate is the design-height-weighted mean over the GATED (feature) bands.
export const BAND_CLASS = {
	nav: 'chrome',
	breadcrumb: 'chrome',
	footer: 'chrome',
	body: 'feature',
	cta: 'feature',
	pledge: 'feature',
	elections: 'data',
};
export const GATED_CLASSES = ['feature'];

// Per-state bands demoted to report-only because the cached Figma REFERENCE for
// that state is itself unreliable — not a real UI gap. H's "H: Past Unclaimed
// profile" section in the design file is a CLONED CLAIMED-candidate frame (its
// desktop frame is literally named "Claimed profile: Candidate only" and still
// carries a GoodParty.org Pledge instance + claimed CTA). Our correct unclaimed
// render omits the pledge, so that band can never match. Flagged in FOLLOWUPS.md;
// the band is still scored/shown, just excluded from H's gate.
export const REPORT_ONLY_BANDS = { H: ['pledge'] };

/**
 * The 12 states. `figma` is the cached frame letter. `status`:
 *   - 'active'  : must reach parity (counts toward the gate)
 *   - 'blocked' : cannot reach parity due to a data gap; excluded from the gate
 *                 and surfaced in FOLLOWUPS.md with `reason`.
 * `masks` are per-state exclusions (see MASK_KINDS / rectangle fractions).
 */
export const STATES = [
	{
		id: 'A',
		label: 'claimed-candidate',
		slug: 'allen-slagle-74eee01a',
		figma: 'A',
		node: '1901:50309',
		status: 'active',
		masks: [],
	},
	{
		id: 'B',
		label: 'claimed-officeholder',
		slug: 'tracy-good-ecff49d3',
		figma: 'B',
		node: '1901:52117',
		status: 'active',
		masks: [],
	},
	{
		id: 'C',
		label: 'claimed-both',
		slug: 'susan-overman-ad914b82',
		figma: 'C',
		node: '1901:53123',
		status: 'active',
		masks: [],
	},
	{
		id: 'D',
		label: 'unclaimed-indep-candidate',
		slug: 'kim-byrd-b77f912d',
		figma: 'D',
		node: '1917:88035',
		status: 'active',
		masks: [],
	},
	{
		id: 'E',
		label: 'unclaimed-indep-officeholder',
		slug: 'rob-zotti-d8c578fb',
		figma: 'E',
		node: '1917:88616',
		status: 'active',
		masks: [],
	},
	{
		id: 'F',
		label: 'unclaimed-indep-both',
		slug: 'tim-ficken-0a951485',
		figma: 'F',
		node: '1917:89211',
		status: 'active',
		masks: [],
	},
	{
		id: 'G',
		label: 'claimed-past',
		slug: 'bill-fortner-61a42912',
		figma: 'G',
		node: '1958:110869',
		status: 'active',
		masks: [],
	},
	{
		id: 'H',
		label: 'unclaimed-indep-past',
		slug: 'gregory-schreurs-136cadf0',
		figma: 'H',
		node: '1970:113629',
		status: 'active',
		masks: [],
	},
	{
		id: 'I',
		label: 'unclaimed-major-candidate',
		slug: 'jeb-hanson-3753676b',
		figma: 'I',
		node: '1958:108636',
		status: 'active',
		masks: [],
	},
	{
		id: 'J',
		label: 'unclaimed-major-officeholder',
		slug: 'deb-craft-f88e7434',
		figma: 'J',
		node: '1958:109815',
		status: 'active',
		masks: [],
	},
	{
		id: 'K',
		label: 'removal-running',
		slug: 'x-27255f40',
		figma: 'K',
		node: '1997:118776',
		status: 'active',
		masks: [],
	},
	{
		id: 'L',
		label: 'removal-officeholder',
		slug: 'x-3412f69c',
		figma: 'L',
		node: '1997:118282',
		status: 'active',
		masks: [],
	},
];

export const stateById = id => STATES.find(s => s.id === id);
