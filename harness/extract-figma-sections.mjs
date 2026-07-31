// Derive per-state Figma section bands from a get_metadata dump.
//
// The Figma page holds one 1440-wide `Desktop_Profile` frame per state (A–L).
// Each frame's full-width (width≈1440) direct children are the section blocks we
// care about: nav, breadcrumb, CTA, pledge, elections, footer. Everything between
// the breadcrumb and the first of {cta,pledge,elections,footer} is the "body"
// (hero + content well). We emit each band as a fraction of the frame height so
// it maps onto the (downscaled) cached PNG regardless of export scale.
//
//   node harness/extract-figma-sections.mjs [metadataFile] > harness/figma-sections.json
// (defaults to harness/figma-metadata.txt)

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const metaPath = process.argv[2] || join(HERE, 'figma-metadata.txt');
const text = readFileSync(metaPath, 'utf8');
const lines = text.split('\n');

// Anchor name -> band id. Matched only on full-width (≈1440) blocks so inner
// same-named frames (e.g. an Elections "Content" child) never win.
const ANCHORS = [
	{ id: 'nav', re: /Marketing Navigation/i },
	{ id: 'breadcrumb', re: /Breadcrumb/i },
	{ id: 'cta', re: /CTA Block|Join the movement/i },
	{ id: 'pledge', re: /GoodParty\.org Pledge/i },
	{ id: 'elections', re: /Elections Index/i },
	{ id: 'footer', re: /Footer/i },
];

const attr = (line, name) => {
	const m = line.match(new RegExp(`${name}="([^"]*)"`));
	return m ? m[1] : undefined;
};

// Find each state's <section name="X: ..."> ... and the Desktop_Profile frame in it.
const states = {};
let cur = null;
for (let i = 0; i < lines.length; i++) {
	const line = lines[i];
	const secName = line.match(/<section id="[^"]+" name="([A-L]): /);
	if (secName) {
		cur = { id: secName[1], frameHeight: null, anchors: {} };
		states[cur.id] = states[cur.id] ?? cur; // first occurrence wins (skip ARCHIVE dupes)
		cur = states[cur.id];
		continue;
	}
	if (!cur) continue;
	// The state's main frame.
	if (cur.frameHeight === null && /name="Desktop_Profile/.test(line)) {
		cur.frameHeight = Number(attr(line, 'height'));
		continue;
	}
	const w = Number(attr(line, 'width'));
	if (!(w >= 1400 && w <= 1480)) continue; // full-width blocks only
	const name = attr(line, 'name') ?? '';
	for (const a of ANCHORS) {
		if (cur.anchors[a.id]) continue; // first match wins
		if (a.re.test(name)) {
			cur.anchors[a.id] = { y: Number(attr(line, 'y')), h: Number(attr(line, 'height')) };
		}
	}
}

const out = {};
for (const [id, s] of Object.entries(states)) {
	const H = s.frameHeight;
	if (!H) continue;
	const a = s.anchors;
	const band = (bid, y0, y1) => ({ id: bid, y0f: y0 / H, y1f: y1 / H });
	const bands = [];
	if (a.nav) bands.push(band('nav', a.nav.y, a.nav.y + a.nav.h));
	const bodyStart = a.breadcrumb ? a.breadcrumb.y + a.breadcrumb.h : a.nav ? a.nav.y + a.nav.h : 0;
	if (a.breadcrumb) bands.push(band('breadcrumb', a.breadcrumb.y, bodyStart));
	// Body = breadcrumb end -> first of the trailing full-width blocks.
	const trailingYs = ['cta', 'pledge', 'elections', 'footer'].map(k => a[k]?.y).filter(v => v != null);
	const bodyEnd = trailingYs.length ? Math.min(...trailingYs) : H;
	bands.push(band('body', bodyStart, bodyEnd));
	for (const k of ['cta', 'pledge', 'elections', 'footer']) {
		if (a[k]) bands.push(band(k, a[k].y, a[k].y + a[k].h));
	}
	out[id] = { frameHeight: H, bands };
}

process.stdout.write(JSON.stringify(out, null, 2) + '\n');
