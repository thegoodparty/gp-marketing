// Capture live /people/<slug> screenshots for the parity harness.
//
// For each state we grab a full-page PNG and record the on-page bounding box of
// every section band (nav, breadcrumb, body, cta, pledge, elections, footer) so
// the diff step can crop and compare band-by-band. deviceScaleFactor=1 keeps
// screenshot pixels == CSS pixels, so boxes crop the full-page PNG directly.
//   node harness/capture.mjs [A,B,...]   (default: all) — normally run via run.mjs

import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { DEV_ORIGIN, VIEWPORT, STATES, BAND_SELECTORS, BODY_TOP_SELECTOR, BODY_BOTTOM_SELECTOR } from './config.mjs';

export async function capture(states, outDir) {
	const shotsDir = join(outDir, 'actual');
	mkdirSync(shotsDir, { recursive: true });

	const browser = await chromium.launch();
	const results = [];
	try {
		for (const st of states) {
			const page = await browser.newPage({ viewport: VIEWPORT, deviceScaleFactor: 1 });
			const url = `${DEV_ORIGIN}/people/${st.slug}`;
			let status = null;
			let error = null;
			try {
				// domcontentloaded (not networkidle): analytics + map tiles keep the
				// socket busy forever. settle() handles fonts/images/lazy-load instead.
				const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
				status = resp?.status() ?? null;
				await settle(page);
			} catch (e) {
				error = e.message;
			}

			const fullPath = join(shotsDir, `${st.id}.png`);
			await page.screenshot({ path: fullPath, fullPage: true }).catch(e => (error = error ?? e.message));

			// A client-side navigation (map history push, analytics) can destroy the
			// evaluate context mid-capture. Guard so one flaky state can't abort the
			// whole run — the state is still recorded (with whatever we captured).
			let bands = {};
			let dims = null;
			let avatar = null;
			try {
				bands = await captureBands(page);
				dims = await page.evaluate(() => ({
					scrollHeight: document.documentElement.scrollHeight,
					clientWidth: document.documentElement.clientWidth,
				}));
				avatar = await captureAvatar(page);
			} catch (e) {
				error = error ?? e.message;
			}

			results.push({ id: st.id, url, status, error, fullPath, bands, dims, avatar });
			await page.close();
			process.stdout.write(`  captured ${st.id} (${st.label}) status=${status}${error ? ` ERROR=${error}` : ''}\n`);
		}
	} finally {
		await browser.close();
	}

	writeFileSync(join(outDir, 'capture.json'), JSON.stringify(results, null, 2));
	return results;
}

// Bounding box (CSS px) of each live band. `body` is the union from the top of
// the hero to the bottom of the content block. Missing bands are recorded null
// so the diff can flag a structural miss vs the Figma frame.
async function captureBands(page) {
	const boxOf = async selector =>
		page
			.locator(selector)
			.first()
			.boundingBox()
			.catch(() => null);

	const bands = {};
	for (const [id, selector] of Object.entries(BAND_SELECTORS)) {
		bands[id] = await boxOf(selector);
	}
	const heroBox = await boxOf(BODY_TOP_SELECTOR);
	const contentBox = await boxOf(BODY_BOTTOM_SELECTOR);
	if (heroBox && contentBox) {
		const top = Math.min(heroBox.y, contentBox.y);
		const bottom = Math.max(heroBox.y + heroBox.height, contentBox.y + contentBox.height);
		bands.body = { x: 0, y: top, width: VIEWPORT.width, height: bottom - top };
	} else {
		bands.body = heroBox ?? contentBox ?? null;
	}
	return bands;
}

// Assert the hero actually shows an avatar. The Figma design puts a real headshot
// in every hero; a broken/empty photo is the exact "profile pic is gone" bug the
// blurred layout score can't see (the avatar is a sliver of the tall body band).
// Returns { ok, kind, reason }:
//   - kind 'photo'       : an <img headshot> that actually decoded (naturalWidth>0)
//   - kind 'placeholder' : the intentional no-photo silhouette (removed profiles)
//   - ok=false           : an <img> that failed to load, or no avatar node at all
async function captureAvatar(page) {
	return page
		.evaluate(() => {
			const hero = document.querySelector('[data-component="ProfileHero"]');
			if (!hero) return { ok: false, kind: 'none', reason: 'no ProfileHero' };
			const img = Array.from(hero.querySelectorAll('img')).find(i => /headshot/i.test(i.alt || ''));
			if (img) {
				const ok = img.complete && img.naturalWidth > 0;
				return { ok, kind: 'photo', reason: ok ? '' : `img failed to load (${img.currentSrc || img.src})` };
			}
			// No headshot <img>: only valid if the intentional silhouette placeholder rendered.
			const hasPlaceholder = Boolean(hero.querySelector('svg'));
			return hasPlaceholder
				? { ok: true, kind: 'placeholder', reason: '' }
				: { ok: false, kind: 'none', reason: 'no headshot img and no placeholder' };
		})
		.catch(e => ({ ok: false, kind: 'error', reason: e.message }));
}

// Bring the page to a stable, fully-painted state. Every wait is time-bounded so
// a lazy/broken <img> that never fires load/error can't hang the run.
async function settle(page) {
	await page
		.evaluate(async () => {
			const step = window.innerHeight;
			const max = document.body.scrollHeight;
			for (let y = 0; y < max; y += step) {
				window.scrollTo(0, y);
				await new Promise(r => setTimeout(r, 120));
			}
			window.scrollTo(0, 0);
		})
		.catch(() => {});
	await page
		.evaluate(
			() =>
				new Promise(resolve => {
					const cap = setTimeout(resolve, 4000);
					Promise.all([
						document.fonts ? document.fonts.ready : Promise.resolve(),
						...Array.from(document.images).map(img =>
							img.complete ? Promise.resolve() : new Promise(r => (img.onload = img.onerror = r)),
						),
					]).then(() => {
						clearTimeout(cap);
						resolve();
					});
				}),
		)
		.catch(() => {});
	await page.waitForTimeout(800);
}

if (import.meta.url === `file://${process.argv[1]}`) {
	const arg = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : null;
	const selected = arg ? arg.split(',').map(id => STATES.find(s => s.id === id)).filter(Boolean) : STATES;
	const outDir = process.env.HARNESS_OUT || '/tmp/people-harness/adhoc';
	mkdirSync(outDir, { recursive: true });
	await capture(selected, outDir);
	console.log(`\nDone. Screenshots in ${outDir}/actual`);
}
