// Ad-hoc sidebar parity measurement.
//
// The sidebar is the left column of the body, starting just below the hero. Its
// absolute y differs between Figma and live because the hero heights differ, so
// a body-top-anchored crop misaligns them. This script detects the hero bottom
// (dark → light transition) in each image and crops the sidebar column anchored
// there, so the score reflects sidebar STRUCTURE parity, not hero drift.
//
//   node harness/measure-sidebar.mjs <runDir> [A,B,...]
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalize, layoutDiff } from './lib/image.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const FIGMA_SECTIONS = JSON.parse(readFileSync(join(HERE, 'figma-sections.json'), 'utf8'));
const CANON = 1000;
const SB_X0 = 0.015;
const SB_X1 = 0.27;
const SB_HEIGHT_FRAC = 0.34; // sidebar column height as a fraction of body height
const PAD_FRAC = 0.015; // small gap below the hero before the sidebar card

const runDir = process.argv[2] || '/tmp/people-harness/sb2';
const only = process.argv[3] ? process.argv[3].split(',') : null;
const cap = JSON.parse(readFileSync(join(runDir, 'capture.json'), 'utf8'));

/**
 * Detects the white sidebar card's [top, bottom] rows within a body crop. The
 * card is pure white (255,255,255); the page bg is cream (~250,247,240, blue
 * ~240) and the hero/avatar are darker — so a per-row "near-white fraction" in
 * the left column isolates the card regardless of hero color/height. Returns the
 * longest contiguous run of card rows.
 */
async function sidebarCardBox(pngBuf) {
	const { data, info } = await sharp(pngBuf).removeAlpha().raw().toBuffer({ resolveWithObject: true });
	const { width, height, channels } = info;
	const x0 = Math.round(width * SB_X0);
	const x1 = Math.round(width * SB_X1);
	const isWhite = (i) => data[i] >= 252 && data[i + 1] >= 250 && data[i + 2] >= 250;
	const whiteRow = (y) => {
		let white = 0;
		for (let x = x0; x < x1; x++) if (isWhite((y * width + x) * channels)) white++;
		return white / (x1 - x0) > 0.4;
	};
	// Vertical extent: first→last white row, bridging internal gaps (Contact icon
	// row / dividers are non-white but <~150px tall).
	const GAP = 150;
	let top = -1;
	for (let y = 0; y < height; y++) if (whiteRow(y)) { top = y; break; }
	if (top < 0) return { left: x0, right: x1, top: 0, bottom: height };
	let bottom = top;
	let lastWhite = top;
	for (let y = top + 1; y < height; y++) {
		if (whiteRow(y)) { lastWhite = y; bottom = y; }
		else if (y - lastWhite > GAP) break;
	}
	// Horizontal extent within [top,bottom]: contiguous columns that are mostly white.
	const colWhite = (x) => {
		let white = 0;
		for (let y = top; y < bottom; y++) if (isWhite((y * width + x) * channels)) white++;
		return white / (bottom - top) > 0.4;
	};
	let left = x0;
	for (let x = 0; x < width * 0.35; x++) if (colWhite(x)) { left = x; break; }
	let right = left;
	for (let x = left; x < width * 0.35; x++) if (colWhite(x)) right = x;
	return { left, right: Math.max(right, left + 1), top, bottom };
}

async function measure(id) {
	const fm = await sharp(join('/tmp/figma-shots', `figma-${id}.png`)).metadata();
	const fb = FIGMA_SECTIONS[id].bands.find((b) => b.id === 'body');
	const fBodyTop = Math.round(fb.y0f * fm.height);
	const fBodyH = Math.round((fb.y1f - fb.y0f) * fm.height);
	const figBody = await sharp(join('/tmp/figma-shots', `figma-${id}.png`))
		.extract({ left: 0, top: fBodyTop, width: fm.width, height: fBodyH })
		.png()
		.toBuffer();

	const a = cap.find((x) => x.id === id);
	const lb = a.bands.body;
	const liveBody = await sharp(a.fullPath)
		.extract({ left: 0, top: Math.round(lb.y), width: 1440, height: Math.round(lb.height) })
		.png()
		.toBuffer();

	const fCard = await sidebarCardBox(figBody);
	const lCard = await sidebarCardBox(liveBody);

	const figSb = await sharp(figBody)
		.extract({ left: fCard.left, top: fCard.top, width: fCard.right - fCard.left, height: Math.max(1, fCard.bottom - fCard.top) })
		.png()
		.toBuffer();
	const liveSb = await sharp(liveBody)
		.extract({ left: lCard.left, top: lCard.top, width: lCard.right - lCard.left, height: Math.max(1, lCard.bottom - lCard.top) })
		.png()
		.toBuffer();

	// Both crops are the same logical card but differ in source px size (figma
	// export is ~half live width) and total card height. Stretch each to a common
	// box so the score reflects proportional row/structure parity, not export size.
	const BOX = { width: 400, height: 600 };
	const f = await sharp(figSb).flatten({ background: '#ffffff' }).resize({ ...BOX, fit: 'fill' }).png().toBuffer();
	const l = await sharp(liveSb).flatten({ background: '#ffffff' }).resize({ ...BOX, fit: 'fill' }).png().toBuffer();
	// Match the harness's EFFECTIVE resolution for this region. The harness diffs
	// the whole body at 1440→320px (~4.5 src px/output px); the sidebar is ~0.25
	// of body width, so it is only ever evaluated at ~80px wide there. Downscaling
	// the isolated card to the same ~90px keeps text as mush (content-robust) and
	// scores LAYOUT parity at the harness's real tolerance — not stricter.
	const { score } = await layoutDiff(f, l, { blurSigma: 4, downscaleWidth: 90 });

	await sharp({ create: { width: BOX.width * 2 + 16, height: BOX.height, channels: 3, background: { r: 235, g: 235, b: 235 } } })
		.composite([{ input: f, left: 0, top: 0 }, { input: l, left: BOX.width + 16, top: 0 }])
		.png()
		.toFile(join('/tmp', `sbcmp_${id}.png`));

	return score;
}

const ids = (only ?? Object.keys(FIGMA_SECTIONS)).filter((id) => cap.some((c) => c.id === id));
let worst = 0;
for (const id of ids) {
	const s = await measure(id);
	worst = Math.max(worst, s);
	console.log(`${id} sidebar diff: ${(s * 100).toFixed(2)}%  ${s <= 0.03 ? 'ok' : 'FAIL'}`);
}
console.log(`\nworst sidebar diff: ${(worst * 100).toFixed(2)}%  ${worst <= 0.03 ? 'ALL <=3%' : 'OVER 3%'}`);
