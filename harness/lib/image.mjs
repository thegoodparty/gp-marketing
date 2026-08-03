// Image primitives for the parity harness, built on `sharp` (already a dep).
// No pixelmatch/pngjs needed — we compare raw RGB buffers ourselves so we control
// exactly how the score is computed (blur/downscale/masking).

import sharp from 'sharp';

const WHITE = { r: 255, g: 255, b: 255 };

/**
 * Load an image, flatten transparency onto white, scale to `width` (aspect
 * preserved), then force the canvas to exactly `width`×`height` by padding the
 * bottom with white (shorter images) or cropping from the top (taller images).
 * Top-anchored so both images share the y=0 origin and vertical drift shows up
 * as a real difference rather than being hidden by a re-center.
 */
export async function normalize(input, { width, height }) {
	const scaled = sharp(input).flatten({ background: WHITE }).resize({ width });
	const buf = await scaled.png().toBuffer();
	const meta = await sharp(buf).metadata();
	let pipe = sharp(buf);
	if (meta.height < height) {
		pipe = pipe.extend({ top: 0, bottom: height - meta.height, left: 0, right: 0, background: WHITE });
	} else if (meta.height > height) {
		pipe = pipe.extract({ left: 0, top: 0, width, height });
	}
	return pipe.png().toBuffer();
}

/** Crop a full-width horizontal band from a PNG by fractional y range. */
export async function cropBandByFraction(input, y0f, y1f) {
	const buf = await sharp(input).png().toBuffer();
	const meta = await sharp(buf).metadata();
	const top = Math.max(0, Math.round(y0f * meta.height));
	const bottom = Math.min(meta.height, Math.round(y1f * meta.height));
	const height = Math.max(1, bottom - top);
	return sharp(buf).extract({ left: 0, top, width: meta.width, height }).png().toBuffer();
}

/** Crop a full-width horizontal band from a PNG by a pixel box (uses y/height). */
export async function cropBandByBox(input, box) {
	const buf = await sharp(input).png().toBuffer();
	const meta = await sharp(buf).metadata();
	const top = Math.max(0, Math.round(box.y));
	const height = Math.max(1, Math.min(meta.height - top, Math.round(box.height)));
	return sharp(buf).extract({ left: 0, top, width: meta.width, height }).png().toBuffer();
}

/** Raw RGB pixels of a PNG buffer at its native size. */
export async function toRaw(pngBuffer) {
	const { data, info } = await sharp(pngBuffer).removeAlpha().raw().toBuffer({ resolveWithObject: true });
	return { data, width: info.width, height: info.height, channels: info.channels };
}

/** Paint mask rectangles (fractional [x,y,w,h]) flat gray on a PNG buffer. */
export async function applyMasks(pngBuffer, masks, { width, height }) {
	if (!masks || masks.length === 0) return pngBuffer;
	const rects = masks.map(m => {
		const [fx, fy, fw, fh] = m.rect;
		const left = Math.max(0, Math.round(fx * width));
		const top = Math.max(0, Math.round(fy * height));
		const w = Math.min(width - left, Math.round(fw * width));
		const h = Math.min(height - top, Math.round(fh * height));
		return { left, top, w, h };
	}).filter(r => r.w > 0 && r.h > 0);
	if (rects.length === 0) return pngBuffer;
	const overlays = await Promise.all(
		rects.map(async r => ({
			input: await sharp({ create: { width: r.w, height: r.h, channels: 3, background: { r: 128, g: 128, b: 128 } } }).png().toBuffer(),
			left: r.left,
			top: r.top,
		})),
	);
	return sharp(pngBuffer).composite(overlays).png().toBuffer();
}

/**
 * The layout score. Blurs then downscales both images (so real text/photo
 * differences fade to similar-density gray while section order/spacing/sizing/
 * color survive), then computes the mean per-pixel color distance normalized to
 * 0..1. Returns { score, diffPng } where diffPng is a full-res red-highlight
 * overlay of where the *unblurred* pixels differ (for human/agent inspection).
 */
export async function layoutDiff(aPng, bPng, { blurSigma, downscaleWidth, threshold = 0.12 }) {
	const small = pngB =>
		sharp(pngB).blur(blurSigma).resize({ width: downscaleWidth }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
	const [sa, sb] = await Promise.all([small(aPng), small(bPng)]);
	const n = Math.min(sa.data.length, sb.data.length);
	let sum = 0;
	for (let i = 0; i < n; i += 3) {
		const dr = sa.data[i] - sb.data[i];
		const dg = sa.data[i + 1] - sb.data[i + 1];
		const db = sa.data[i + 2] - sb.data[i + 2];
		// Euclidean RGB distance normalized by max possible (~441.7).
		sum += Math.sqrt(dr * dr + dg * dg + db * db) / 441.673;
	}
	const score = sum / (n / 3);

	// Full-res overlay: mark pixels whose normalized distance exceeds `threshold`.
	const [ra, rb] = await Promise.all([toRaw(aPng), toRaw(bPng)]);
	const w = Math.min(ra.width, rb.width);
	const h = Math.min(ra.height, rb.height);
	const out = Buffer.alloc(w * h * 3);
	let changed = 0;
	for (let y = 0; y < h; y++) {
		for (let x = 0; x < w; x++) {
			const ia = (y * ra.width + x) * 3;
			const ib = (y * rb.width + x) * 3;
			const io = (y * w + x) * 3;
			const dr = ra.data[ia] - rb.data[ib];
			const dg = ra.data[ia + 1] - rb.data[ib + 1];
			const db = ra.data[ia + 2] - rb.data[ib + 2];
			const dist = Math.sqrt(dr * dr + dg * dg + db * db) / 441.673;
			if (dist > threshold) {
				out[io] = 255;
				out[io + 1] = 0;
				out[io + 2] = 0;
				changed++;
			} else {
				// Dim the matching base so the red pops.
				out[io] = 40 + ra.data[ia] * 0.6;
				out[io + 1] = 40 + ra.data[ia + 1] * 0.6;
				out[io + 2] = 40 + ra.data[ia + 2] * 0.6;
			}
		}
	}
	const diffPng = await sharp(out, { raw: { width: w, height: h, channels: 3 } }).png().toBuffer();
	return { score, rawChangedFraction: changed / (w * h), diffPng };
}

/** Side-by-side [figma | actual | diff] strip for quick eyeballing. */
export async function sideBySide(figmaPng, actualPng, diffPng, { height }) {
	const panel = async (b, tint) => {
		const resized = await sharp(b).resize({ height, fit: 'contain', background: WHITE }).png().toBuffer();
		return resized;
	};
	const [f, a, d] = await Promise.all([panel(figmaPng), panel(actualPng), panel(diffPng)]);
	const metas = await Promise.all([f, a, d].map(x => sharp(x).metadata()));
	const gap = 16;
	const totalW = metas.reduce((s, m) => s + m.width, 0) + gap * 2;
	const composites = [];
	let x = 0;
	for (let i = 0; i < 3; i++) {
		composites.push({ input: [f, a, d][i], left: x, top: 0 });
		x += metas[i].width + gap;
	}
	return sharp({ create: { width: totalW, height, channels: 3, background: WHITE } }).composite(composites).png().toBuffer();
}
