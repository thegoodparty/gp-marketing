// Spec-driven spacing check (DIAGNOSTIC ONLY — never edits layout).
//
// WHY THIS EXISTS
// The parity harness scores each state by blurring a tall `body` band down to
// 320px wide and diffing it against the Figma PNG. That band is DEFINED to end
// at the top of the next full-width section (see extract-figma-sections.mjs:
// `bodyEnd = min(cta, pledge, elections, footer).y`). So the harness never has
// the design's real content-well bottom — it just assumes the content abuts the
// next section, then blur+downscale mushes any leftover vertical whitespace into
// nothing. That is exactly why a "huge gap between the content and the blue
// section" can sail through GREEN: it lives INSIDE the body band, and the band's
// own definition hides it.
//
// A raster diff is the wrong instrument for spacing. Spacing is a NUMBER in the
// design (node geometry / auto-layout gap), so check it as a number:
//
//   design gap  = (top of next full-width section)      // from get_metadata
//               - (bottom-most content node above it)   //   ← harness discards this
//   live gap    = getBoundingClientRect(nextSection).top
//               - getBoundingClientRect(ProfileContentBlock).bottom
//   delta       = live gap - design gap                 // this is the bug, in px
//
// Both sides are in the same 1440px space (Figma frame width == capture viewport),
// so the px are directly comparable — no scaling, no blur, no masking.
//
// FIGMA SOURCE: harness/figma-metadata.txt is a cached Figma MCP `get_metadata`
// dump (node ids + geometry). To refresh it, re-run the MCP tool:
//   get_metadata({ fileKey, nodeId: <page id> })  and save the XML here.
// The point of this script is that the design numbers come from the MCP node
// tree, not from eyeballing a screenshot.
//
//   node harness/spacing-check.mjs [A,B,...]   (default: all states)

import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { DEV_ORIGIN, VIEWPORT, STATES, stateById } from './config.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const META_PATH = join(HERE, 'figma-metadata.txt');

const attr = (line, name) => {
	const m = line.match(new RegExp(`${name}="([^"]*)"`));
	return m ? m[1] : undefined;
};
const num = v => {
	const n = Number(v);
	return Number.isFinite(n) ? n : undefined;
};

// Parse the whole metadata dump once into a flat node array with canvas-absolute
// Y for every node (indentation = tree depth; 2 spaces per level).
function parseMetadata(text) {
	const lines = text.split('\n');
	const nodes = [];
	const stack = []; // { depth, absY }
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		if (/^\s*<\//.test(line)) continue; // closing tag
		const lead = line.match(/^(\s*)</);
		if (!lead) continue;
		const depth = lead[1].length / 2;
		const y = num(attr(line, 'y')) ?? 0;
		while (stack.length && stack[stack.length - 1].depth >= depth) stack.pop();
		const parentAbsY = stack.length ? stack[stack.length - 1].absY : 0;
		const absY = parentAbsY + y;
		stack.push({ depth, absY });
		const tag = line.match(/^\s*<([\w-]+)/)?.[1] ?? '';
		nodes.push({
			i,
			depth,
			absY,
			x: num(attr(line, 'x')),
			h: num(attr(line, 'height')),
			w: num(attr(line, 'width')),
			name: attr(line, 'name') ?? '',
			id: attr(line, 'id') ?? '',
			tag,
		});
	}
	return nodes;
}

// The trailing full-width blocks that can sit directly under the content well.
// First one present (smallest top) is the "next section" — the blue CTA for
// claimed states, else the pledge / elections index.
const NEXT_SECTION = [
	{ key: 'cta', re: /CTA Block|Join the movement/i, label: 'CTA (blue)' },
	{ key: 'pledge', re: /GoodParty\.org Pledge/i, label: 'pledge' },
	{ key: 'elections', re: /Elections Index/i, label: 'elections' },
];
const isFullWidth = w => w != null && w >= 1400 && w <= 1480;

// Design-side gap for one state, straight from the get_metadata node tree.
function figmaGap(nodes, stateId) {
	// Locate the state section, then its first Desktop_Profile frame (matches the
	// harness's own extractor so we compare against the same frame it scores).
	const secIdx = nodes.findIndex(n => n.tag === 'section' && new RegExp(`^${stateId}: `).test(n.name));
	if (secIdx < 0) return { error: `no section "${stateId}:" in metadata` };
	const sec = nodes[secIdx];
	// Frame subtree = nodes after the section until depth drops back to section level.
	const frame = nodes.slice(secIdx + 1).find(n => n.depth <= sec.depth ? false : /^Desktop_Profile/.test(n.name));
	if (!frame) return { error: `no Desktop_Profile frame for ${stateId}` };
	const frameAbsY = frame.absY;
	// Descendants: everything after the frame line until depth returns to <= frame depth.
	const start = nodes.indexOf(frame) + 1;
	let end = nodes.length;
	for (let k = start; k < nodes.length; k++) {
		if (nodes[k].depth <= frame.depth) {
			end = k;
			break;
		}
	}
	const desc = nodes.slice(start, end).map(n => ({ ...n, top: n.absY - frameAbsY, bottom: n.absY - frameAbsY + (n.h ?? 0) }));

	// Lower bound of the content region: bottom of breadcrumb (or nav) so the hero
	// and content well are in-scope but the site chrome is not.
	const chrome = desc.filter(n => isFullWidth(n.w) && /Breadcrumb|Marketing Navigation/i.test(n.name));
	const regionTop = chrome.length ? Math.max(...chrome.map(n => n.bottom)) : 0;

	// The next full-width section under the content well.
	let next = null;
	for (const cand of NEXT_SECTION) {
		const hit = desc
			.filter(n => isFullWidth(n.w) && cand.re.test(n.name))
			.sort((a, b) => a.top - b.top)[0];
		if (hit && (!next || hit.top < next.top)) next = { ...hit, label: cand.label, key: cand.key };
	}
	if (!next) return { error: `no trailing section (cta/pledge/elections) for ${stateId}` };

	// Bottom-most content COLUMN — the sidebar / content frames that make up the
	// well. Restrict to the frame's DIRECT children that are NOT full-width bands
	// (those are the hero background / nav / the next section itself); their max
	// bottom is the true content-well bottom the harness band extractor discards.
	// NOTE: a few states (B, E, F) wrap the content column one level deeper, so this
	// direct-child read under-reports there — a known parse quirk of the raw
	// get_metadata dump, not a real design difference. The design token is 48px.
	const columns = desc.filter(
		n => n.depth === frame.depth + 1 && n.tag === 'frame' && !isFullWidth(n.w) && n.top >= regionTop && n.bottom <= next.top + 4,
	);
	const contentBottom = columns.length ? Math.max(...columns.map(n => n.bottom)) : next.top;

	// --- HERO boundary (top of the well) ---------------------------------------
	// The design's portrait STRADDLES the dark band: the right-hand content column
	// starts just below the band (beside the photo) while the left sidebar starts
	// below the photo. Two separate gaps, and the harness's `body` band spans both
	// as one blurred unit, so it can see neither.
	const bandNode = desc
		.filter(n => isFullWidth(n.w) && /Background Rectangle/i.test(n.name))
		.sort((a, b) => a.top - b.top)[0];
	const portrait = desc.filter(n => /^Avatar$/i.test(n.name)).sort((a, b) => a.top - b.top)[0];
	const direct = desc.filter(n => n.depth === frame.depth + 1 && n.tag === 'frame');
	const RIGHT_COL_X = 500; // content column sits at x=620, sidebar at x=80
	const contentColTop = bandNode
		? Math.min(...direct.filter(n => n.x >= RIGHT_COL_X && n.top >= bandNode.bottom - 1).map(n => n.top), Infinity)
		: Infinity;
	const sidebarTop = portrait
		? Math.min(...direct.filter(n => n.x < RIGHT_COL_X && n.top >= portrait.bottom - 1).map(n => n.top), Infinity)
		: Infinity;

	return {
		nextLabel: next.label,
		nextKey: next.key,
		nextTop: Math.round(next.top),
		contentBottom: Math.round(contentBottom),
		gap: Math.round(next.top - contentBottom),
		// hero-side spec
		bandBottom: bandNode ? Math.round(bandNode.bottom) : null,
		portraitBottom: portrait ? Math.round(portrait.bottom) : null,
		gapBelowBand: bandNode && Number.isFinite(contentColTop) ? Math.round(contentColTop - bandNode.bottom) : null,
		gapBelowPortrait: portrait && Number.isFinite(sidebarTop) ? Math.round(sidebarTop - portrait.bottom) : null,
	};
}

// Live-side gap + box-model decomposition for one state.
async function liveGap(page, nextKey) {
	const NEXT_SEL = {
		cta: '[data-component="CTABannerBlock"]',
		pledge: '[data-component="GoodPartyOrgPledge"]',
		elections: '[data-component="ElectionsIndexBlock"]',
	};
	return page.evaluate(
		({ nextSel }) => {
			const content = document.querySelector('[data-component="ProfileContentBlock"]');
			const next = document.querySelector(nextSel);
			if (!content || !next) {
				return { error: `missing ${!content ? 'ProfileContentBlock' : nextSel}` };
			}
			const cs = getComputedStyle(content);
			const ns = getComputedStyle(next);
			const contentBoxBottom = content.getBoundingClientRect().bottom + scrollY;
			const nextTop = next.getBoundingClientRect().top + scrollY;

			// PERCEIVED gap = last painted content pixel → top of the next section
			// band. The next section is a full-bleed color band, so its band top is
			// its own box top (the section's padding-top is blue space ABOVE its
			// heading, not white). The content's last ink is its deepest child, so
			// the content block's bottom padding is empty WHITE space that counts.
			let inkBottom = contentBoxBottom - parseFloat(cs.paddingBottom);
			for (const child of content.children) {
				const b = child.getBoundingClientRect().bottom + scrollY;
				if (b > inkBottom - 1000) inkBottom = Math.max(inkBottom, b); // deepest real child
			}
			// Refine: deepest descendant with actual size (guards against a wrapper
			// that itself carries the trailing padding).
			let deepest = inkBottom;
			for (const el of content.querySelectorAll('*')) {
				const r = el.getBoundingClientRect();
				if (r.height >= 4 && r.width >= 4) deepest = Math.max(deepest, r.bottom + scrollY);
			}
			inkBottom = Math.min(deepest, contentBoxBottom); // never below the block itself

			// --- HERO boundary ---
			const hero = document.querySelector('[data-component="ProfileHero"]');
			const band = hero?.querySelector('div > div'); // the short dark band
			const portrait = hero?.querySelector('img')?.parentElement?.parentElement
				?? hero?.querySelector('svg')?.closest('div.relative.rounded-full');
			const aside = content.querySelector('aside');
			const sidebarCard = aside?.firstElementChild;
			const contentCol = content.querySelector('aside + div');
			const top = el => (el ? Math.round(el.getBoundingClientRect().top + scrollY) : null);
			const bot = el => (el ? Math.round(el.getBoundingClientRect().bottom + scrollY) : null);
			const bandBottom = bot(band);
			const portraitBottom = bot(portrait);
			const contentColTop = top(contentCol);
			const sidebarTop = top(sidebarCard);

			return {
				gap: Math.round(nextTop - inkBottom), // perceived white gap
				boxGap: Math.round(nextTop - contentBoxBottom), // container-edge gap
				contentPb: Math.round(parseFloat(cs.paddingBottom)),
				contentMb: Math.round(parseFloat(cs.marginBottom)),
				nextMt: Math.round(parseFloat(ns.marginTop)),
				nextPt: Math.round(parseFloat(ns.paddingTop)),
				gapBelowBand: bandBottom != null && contentColTop != null ? contentColTop - bandBottom : null,
				gapBelowPortrait: portraitBottom != null && sidebarTop != null ? sidebarTop - portraitBottom : null,
			};
		},
		{ nextSel: NEXT_SEL[nextKey] ?? NEXT_SEL.cta },
	);
}

async function main() {
	const arg = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : null;
	const selected = arg ? arg.split(',').map(id => stateById(id)).filter(Boolean) : STATES;

	const nodes = parseMetadata(readFileSync(META_PATH, 'utf8'));
	const browser = await chromium.launch();
	const rows = [];
	try {
		for (const st of selected) {
			const fig = figmaGap(nodes, st.figma);
			const page = await browser.newPage({ viewport: VIEWPORT, deviceScaleFactor: 1 });
			let live = { error: 'not measured' };
			try {
				await page.goto(`${DEV_ORIGIN}/people/${st.slug}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
				await page.waitForTimeout(1500);
				live = await liveGap(page, fig.nextKey);
			} catch (e) {
				live = { error: e.message };
			}
			await page.close();
			rows.push({ st, fig, live });
		}
	} finally {
		await browser.close();
	}

	const pad = (s, n) => String(s).padEnd(n);

	// --- Hero boundary report (top of the well) --------------------------------
	// This is the boundary that produced the visible "huge whitespace": the design
	// starts the content column 48px under the dark band (beside the straddling
	// portrait) and the sidebar 48px under the portrait.
	console.log('\nHero  →  content well  (design vs live, px @1440w)\n');
	console.log(pad('state', 7) + pad('band⊥→content', 15) + pad('live', 8) + pad('Δ', 7) + pad('photo⊥→sidebar', 16) + pad('live', 8) + 'Δ');
	console.log('-'.repeat(64));
	for (const { st, fig, live } of rows) {
		if (fig.error || live.error) continue;
		const d1 = fig.gapBelowBand != null && live.gapBelowBand != null ? live.gapBelowBand - fig.gapBelowBand : null;
		const d2 = fig.gapBelowPortrait != null && live.gapBelowPortrait != null ? live.gapBelowPortrait - fig.gapBelowPortrait : null;
		const s = v => (v == null ? '-' : String(v));
		const sd = v => (v == null ? '-' : (v > 0 ? '+' : '') + v);
		console.log(
			pad(st.id, 7) + pad(s(fig.gapBelowBand), 15) + pad(s(live.gapBelowBand), 8) + pad(sd(d1), 7) +
				pad(s(fig.gapBelowPortrait), 16) + pad(s(live.gapBelowPortrait), 8) + sd(d2),
		);
	}

	// Report.
	console.log('\nContent-well  →  next section vertical gap  (design vs live, px @1440w)\n');
	console.log(pad('state', 7) + pad('nextSection', 13) + pad('design', 9) + pad('live', 9) + pad('delta', 9) + 'verdict');
	console.log('-'.repeat(64));
	for (const { st, fig, live } of rows) {
		if (fig.error) {
			console.log(pad(st.id, 7) + `figma: ${fig.error}`);
			continue;
		}
		if (live.error) {
			console.log(pad(st.id, 7) + pad(fig.nextLabel, 13) + pad(fig.gap, 9) + `live: ${live.error}`);
			continue;
		}
		const delta = live.gap - fig.gap;
		const verdict = Math.abs(delta) <= 16 ? 'ok' : `OFF by ${delta > 0 ? '+' : ''}${delta}px`;
		console.log(
			pad(st.id, 7) +
				pad(fig.nextLabel, 13) +
				pad(fig.gap, 9) +
				pad(live.gap, 9) +
				pad((delta > 0 ? '+' : '') + delta, 9) +
				verdict,
		);
	}

	// Decomposition for the worst offender — shows WHERE the extra px come from.
	const worst = rows
		.filter(r => !r.fig.error && !r.live.error)
		.sort((a, b) => Math.abs(b.live.gap - b.fig.gap) - Math.abs(a.live.gap - a.fig.gap))[0];
	if (worst) {
		const { st, fig, live } = worst;
		console.log(`\nWorst offender: ${st.id} (${st.label}) — ${st.slug}`);
		console.log(`  design gap : ${fig.gap}px  (content ink bottom y=${fig.contentBottom} → ${fig.nextLabel} top y=${fig.nextTop})`);
		console.log(`  live gap   : ${live.gap}px perceived  (container edges abut: box-to-box=${live.boxGap}px)`);
		console.log(`  where it hides: content padding-bottom=${live.contentPb}px is empty white space` +
			`  |  ${fig.nextKey} padding-top=${live.nextPt}px is inside the color band`);
	}
	console.log('\n(Diagnostic only — no layout was changed. Figma numbers from get_metadata node tree.)');
}

main();
