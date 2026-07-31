// Parity harness orchestrator.
//
//   node harness/run.mjs                 # capture + diff ALL states -> report
//   node harness/run.mjs A,C,G           # only those states
//   node harness/run.mjs --no-capture    # re-diff last capture (fast iterate on masks)
//   node harness/run.mjs --run <name>    # name the run dir (default: timestamp)
//
// Prints a ranked table, writes gallery.html + report.md, and exits non-zero if
// any ACTIVE state exceeds TOLERANCE — so it doubles as a CI-style gate.

import { mkdirSync, writeFileSync, existsSync, symlinkSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { STATES, OUT_ROOT, TOLERANCE } from './config.mjs';
import { capture } from './capture.mjs';
import { diffAll } from './diff.mjs';

const args = process.argv.slice(2);
const flag = name => args.includes(name);
const valOf = name => {
	const i = args.indexOf(name);
	return i >= 0 ? args[i + 1] : undefined;
};
const stateArg = args.find(a => !a.startsWith('--') && a !== valOf('--run'));
const selected = stateArg ? stateArg.split(',').map(id => STATES.find(s => s.id === id)).filter(Boolean) : STATES;

const runName = valOf('--run') || new Date().toISOString().replace(/[:.]/g, '-');
const outDir = join(OUT_ROOT, runName);
mkdirSync(outDir, { recursive: true });

if (!flag('--no-capture')) {
	console.log(`Capturing ${selected.length} state(s) -> ${outDir}/actual`);
	await capture(selected, outDir);
} else {
	console.log('Skipping capture (--no-capture); re-diffing existing capture.json');
}

console.log('Diffing against Figma references...');
const report = await diffAll(outDir);

// "latest" convenience symlink.
const latest = join(OUT_ROOT, 'latest');
try {
	if (existsSync(latest)) rmSync(latest, { recursive: true, force: true });
	symlinkSync(outDir, latest);
} catch {}

writeGallery(outDir, report);
writeMarkdown(outDir, report);
printTable(report);

const failing = report.rows.filter(r => r.pass === false);
console.log(`\nRun dir: ${outDir}`);
console.log(`Gallery: ${join(outDir, 'gallery.html')}`);
if (failing.length) {
	console.log(`\n${failing.length} state(s) over ${(TOLERANCE * 100).toFixed(0)}%: ${failing.map(f => f.id).join(', ')}`);
	process.exitCode = 1;
} else {
	console.log(`\nAll active states within ${(TOLERANCE * 100).toFixed(0)}%. PARITY REACHED.`);
}

function printTable(report) {
	console.log(`\n  gated overall = feature bands only (body/cta/pledge). all = every band incl. chrome/data.`);
	console.log(`  avatar = hero headshot check (photo ok / placeholder / BROKEN=hard fail).`);
	console.log(`\n  state  gated    all     avatar       gate   worst feature band   capture`);
	console.log(`  -----  -------  ------  -----------  -----  -------------------  -------`);
	for (const r of report.rows) {
		const gate = r.pass === false ? 'FAIL' : r.pass ? ' ok ' : 'blkd';
		const sc = `${(r.overall * 100).toFixed(2)}%`.padStart(6);
		const all = `${(r.overallAll * 100).toFixed(1)}%`.padStart(6);
		const av = r.avatar ? (r.avatar.ok === false ? 'BROKEN' : r.avatar.kind) : '-';
		const w = r.worstBand ? `${r.worstBand.id}${r.worstBand.missing ? `(missing:${r.worstBand.missing})` : ` ${(r.worstBand.score * 100).toFixed(0)}%`}` : '-';
		console.log(`  ${r.id.padEnd(5)}  ${sc}   ${all}  ${av.padEnd(11)}  ${gate}   ${w.padEnd(19)}  ${r.captureStatus ?? r.captureError ?? ''}  ${r.label}`);
	}
}

function writeMarkdown(outDir, report) {
	const lines = [
		`# Parity report — ${report.generatedAt}`,
		``,
		`Tolerance: ${(report.tolerance * 100).toFixed(0)}% (height-weighted overall). Ranked worst-first.`,
		``,
		`Gated overall = feature bands (body/cta/pledge). Chrome (nav/breadcrumb/footer)`,
		`and data (elections) bands are report-only — see FOLLOWUPS.md.`,
		``,
		`| State | Label | Gated | All | Gate | Per-band (★=gated) |`,
		`|-------|-------|-------|-----|------|--------------------|`,
		...report.rows.map(r => {
			const perBand = r.bands
				.map(b => `${b.gated ? '★' : ''}${b.id} ${(b.score * 100).toFixed(0)}%${b.missing ? `(miss:${b.missing})` : ''}`)
				.join(', ');
			return `| ${r.id} | ${r.label} | ${(r.overall * 100).toFixed(2)}% | ${(r.overallAll * 100).toFixed(1)}% | ${
				r.pass === false ? 'FAIL' : r.pass ? 'ok' : 'blocked'
			} | ${perBand} |`;
		}),
	];
	writeFileSync(join(outDir, 'report.md'), lines.join('\n'));
}

function writeGallery(outDir, report) {
	const rel = p => p.replace(`${outDir}/`, '');
	const cards = report.rows
		.map(r => {
			const pct = `${(r.overall * 100).toFixed(2)}% <small>(all ${(r.overallAll * 100).toFixed(1)}%)</small>`;
			const badge =
				r.pass === false
					? `<span style="color:#f66;font-weight:700">FAIL ${pct}</span>`
					: r.pass
						? `<span style="color:#4c8;font-weight:700">ok ${pct}</span>`
						: `<span style="color:#888;font-weight:700">blocked ${pct}</span>`;
			const perBand = r.bands
				.map(b => `<code class="${b.gated ? 'g' : b.cls}">${b.gated ? '★' : ''}${b.id} ${(b.score * 100).toFixed(0)}%${b.missing ? `⚠${b.missing}` : ''}</code>`)
				.join(' ');
			return `<section>
  <h2>${r.id} — ${r.label} &nbsp; ${badge}</h2>
  <div class="bands">${perBand}</div>
  <div class="strip"><img src="${rel(r.sxsPath)}" loading="lazy"/></div>
</section>`;
		})
		.join('\n');
	const html = `<!doctype html><meta charset="utf-8"><title>People parity</title>
<style>
 body{font-family:ui-sans-serif,system-ui;margin:24px;background:#0b1020;color:#e6e9f0}
 h1{font-size:20px} h2{font-size:15px;margin:28px 0 8px} small{color:#8b93a7}
 .strip{overflow:auto;border:1px solid #232a44;border-radius:8px;background:#fff}
 .strip img{display:block;max-width:none}
 .legend{color:#8b93a7;font-size:13px}
 .bands{margin:6px 0 8px} .bands code{background:#141b33;color:#c7d0e6;padding:2px 6px;border-radius:4px;margin-right:4px;font-size:12px}
 .bands code.g{background:#1d3a1d;color:#bdf0bd} .bands code.data{background:#3a2f14;color:#f0dca0} .bands code.chrome{opacity:.6}
</style>
<h1>Person Public Profiles — Figma parity</h1>
<p class="legend">Each strip: <b>Figma</b> (left) · <b>Live</b> (middle) · <b>Diff</b> (right, red = differs). Tolerance ${(report.tolerance * 100).toFixed(0)}%. Ranked worst-first.</p>
${cards}`;
	writeFileSync(join(outDir, 'gallery.html'), html);
}
