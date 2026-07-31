// Diff live captures against Figma references, SECTION BY SECTION, and score
// layout parity per band + overall.
//
// For each state and each band (nav/breadcrumb/body/cta/pledge/elections/footer):
// crop the Figma band (by fraction) and the live band (by DOM box), normalize
// both to a common width+height, mask any data-gap regions, and compute a
// blur/downscale layout score. Missing-in-one-side bands score 1.0 (structural
// miss). The state's overall score is the height-weighted mean of its bands.
// Emits report.json + per-state diff overlays and [figma|live|diff] strips.

import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
	FIGMA_DIR,
	CANON_WIDTH,
	LAYOUT_BLUR_SIGMA,
	LAYOUT_DOWNSCALE_WIDTH,
	TOLERANCE,
	BAND_ORDER,
	BAND_CLASS,
	GATED_CLASSES,
	REPORT_ONLY_BANDS,
	GLOBAL_MASKS,
	stateById,
} from './config.mjs';
import { normalize, applyMasks, layoutDiff, sideBySide, cropBandByFraction, cropBandByBox } from './lib/image.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const FIGMA_SECTIONS = JSON.parse(readFileSync(join(HERE, 'figma-sections.json'), 'utf8'));
// A band counts toward a state's gate when its class is gated AND it isn't a
// per-state report-only band (unreliable Figma reference — see REPORT_ONLY_BANDS).
const isGated = (bandId, stateId) =>
	GATED_CLASSES.includes(BAND_CLASS[bandId]) && !(REPORT_ONLY_BANDS[stateId]?.includes(bandId));

export async function diffAll(outDir) {
	const capture = JSON.parse(readFileSync(join(outDir, 'capture.json'), 'utf8'));
	const diffDir = join(outDir, 'diff');
	const sxsDir = join(outDir, 'side-by-side');
	mkdirSync(diffDir, { recursive: true });
	mkdirSync(sxsDir, { recursive: true });

	const rows = [];
	for (const cap of capture) {
		const st = stateById(cap.id);
		const figmaPath = join(FIGMA_DIR, `figma-${st.figma}.png`);
		const spec = FIGMA_SECTIONS[st.id];
		const figmaBands = new Map((spec?.bands ?? []).map(b => [b.id, b]));

		const bandResults = [];
		const stripPanels = [];
		for (const bandId of BAND_ORDER) {
			const fb = figmaBands.get(bandId);
			const lb = cap.bands?.[bandId];
			if (!fb && !lb) continue; // band exists in neither -> not applicable

			// Design-space weight = how much of the frame this band occupies.
			const weight = fb ? fb.y1f - fb.y0f : 0.05;
			const cls = BAND_CLASS[bandId] ?? 'feature';

			if (!fb || !lb) {
				bandResults.push({ id: bandId, cls, score: 1, weight, missing: fb ? 'live' : 'figma' });
				continue;
			}

			const figmaCrop = await cropBandByFraction(figmaPath, fb.y0f, fb.y1f);
			const liveCrop = await cropBandByBox(cap.fullPath, lb);

			const fMeta = await sharp(figmaCrop).resize({ width: CANON_WIDTH }).metadata();
			const aMeta = await sharp(liveCrop).resize({ width: CANON_WIDTH }).metadata();
			const height = Math.max(fMeta.height, aMeta.height);
			const dims = { width: CANON_WIDTH, height };

			let fNorm = await normalize(figmaCrop, dims);
			let aNorm = await normalize(liveCrop, dims);
			const bandMasks = [...(GLOBAL_MASKS ?? []), ...(st.masks ?? [])].filter(m => m.band === bandId);
			fNorm = await applyMasks(fNorm, bandMasks, dims);
			aNorm = await applyMasks(aNorm, bandMasks, dims);

			const { score, diffPng } = await layoutDiff(fNorm, aNorm, {
				blurSigma: LAYOUT_BLUR_SIGMA,
				downscaleWidth: LAYOUT_DOWNSCALE_WIDTH,
			});
			const heightDelta = Math.abs(fMeta.height - aMeta.height) / Math.max(fMeta.height, aMeta.height);
			bandResults.push({ id: bandId, cls, score, weight, heightDelta, figmaHeight: fMeta.height, liveHeight: aMeta.height });
			stripPanels.push({ id: bandId, fNorm, aNorm, diffPng });
		}

		// The GATE: height-weighted mean over gated (feature) bands only. Chrome
		// and data bands are reported but never block. `overallAll` keeps the
		// everything-in score for reference.
		const gated = bandResults.filter(b => isGated(b.id, st.id));
		const gsum = gated.reduce((s, b) => s + b.weight, 0) || 1;
		const overall = gated.reduce((s, b) => s + b.score * b.weight, 0) / gsum;
		const asum = bandResults.reduce((s, b) => s + b.weight, 0) || 1;
		const overallAll = bandResults.reduce((s, b) => s + b.score * b.weight, 0) / asum;
		const worst = [...gated].sort((a, b) => b.score - a.score)[0] ?? [...bandResults].sort((a, b) => b.score - a.score)[0];

		const sxsPath = join(sxsDir, `${st.id}.png`);
		await writeBandStrip(stripPanels, bandResults, sxsPath);
		// Keep the worst band's overlay handy as the state diff image.
		const worstPanel = stripPanels.find(p => p.id === worst?.id);
		const diffPath = join(diffDir, `${st.id}.png`);
		if (worstPanel) writeFileSync(diffPath, worstPanel.diffPng);

		const active = st.status === 'active';
		rows.push({
			id: st.id,
			label: st.label,
			status: st.status,
			overall,
			overallAll,
			pass: active ? overall <= TOLERANCE : null,
			worstBand: worst ? { id: worst.id, score: worst.score, missing: worst.missing } : null,
			bands: bandResults.map(b => ({
				id: b.id,
				cls: b.cls,
				gated: isGated(b.id, st.id),
				score: Number(b.score.toFixed(4)),
				weight: Number(b.weight.toFixed(4)),
				heightDelta: b.heightDelta != null ? Number(b.heightDelta.toFixed(3)) : null,
				missing: b.missing ?? null,
			})),
			figmaPath,
			actualPath: cap.fullPath,
			diffPath,
			sxsPath,
			captureStatus: cap.status,
			captureError: cap.error,
		});
	}

	rows.sort((a, b) => b.overall - a.overall);
	const report = { tolerance: TOLERANCE, generatedAt: new Date().toISOString(), rows };
	writeFileSync(join(outDir, 'report.json'), JSON.stringify(report, null, 2));
	return report;
}

// One vertical strip per state: for each band a [figma | live | diff] row, so the
// whole state reads top-to-bottom the way the page does.
async function writeBandStrip(panels, bandResults, outPath) {
	if (panels.length === 0) {
		await sharp({ create: { width: 300, height: 80, channels: 3, background: { r: 240, g: 240, b: 240 } } })
			.png()
			.toBuffer()
			.then(b => writeFileSync(outPath, b));
		return;
	}
	const rows = [];
	for (const p of panels) {
		const h = Math.min(700, (await sharp(p.fNorm).metadata()).height);
		const strip = await sideBySide(p.fNorm, p.aNorm, p.diffPng, { height: h });
		rows.push(strip);
	}
	const metas = await Promise.all(rows.map(r => sharp(r).metadata()));
	const width = Math.max(...metas.map(m => m.width));
	const gap = 24;
	const totalH = metas.reduce((s, m) => s + m.height, 0) + gap * (rows.length - 1);
	let y = 0;
	const composites = [];
	for (let i = 0; i < rows.length; i++) {
		composites.push({ input: rows[i], left: 0, top: y });
		y += metas[i].height + gap;
	}
	const out = await sharp({ create: { width, height: totalH, channels: 3, background: { r: 255, g: 255, b: 255 } } })
		.composite(composites)
		.png()
		.toBuffer();
	writeFileSync(outPath, out);
}

if (import.meta.url === `file://${process.argv[1]}`) {
	const outDir = process.env.HARNESS_OUT || '/tmp/people-harness/adhoc';
	const report = await diffAll(outDir);
	for (const r of report.rows) {
		const b = r.bands.map(x => `${x.id}:${(x.score * 100).toFixed(0)}`).join(' ');
		console.log(`${r.id} overall=${(r.overall * 100).toFixed(2)}% ${r.pass === false ? 'FAIL' : r.pass ? 'ok' : 'blk'}  [${b}]`);
	}
}
