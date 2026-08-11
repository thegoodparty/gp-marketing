#!/usr/bin/env bun
/**
 * Runs one half of the unit test split: `logic` (`.test.ts`) or `dom` (`.test.tsx`).
 *
 * The halves exist so the logic tests run in a process with no DOM. The DOM tests
 * install JSDOM globals on `globalThis` and leave them there, so once the halves
 * share a process a logic test that reaches for `document` finds a working one
 * instead of failing, and a DOM test inherits another file's leftover window
 * instead of building its own.
 *
 * The split used to be drawn with `bun test --path-ignore-patterns`, a flag bun
 * did not gain until 1.3. Under the 1.2.23 this repo pins, bun accepts the flag
 * and ignores it, so in CI both halves ran every test file in one process while
 * still reporting success. Handing bun an explicit file list draws the same line
 * on every bun version, and the checks below stop a bad discovery from quietly
 * degrading into "run everything" or "run nothing" the way the flag did.
 */

const ROOTS = ['src', 'scripts'];

const SUITE_EXTENSIONS = {
	logic: '.test.ts',
	dom: '.test.tsx',
} as const;

type SuiteName = keyof typeof SUITE_EXTENSIONS;

// Everything bun itself treats as a test file. A match here that no suite claims
// would run in neither half, so it fails the run rather than disappearing.
const TEST_EXTENSIONS = ['ts', 'tsx', 'js', 'jsx', 'mts', 'cts', 'mjs', 'cjs'];

function fail(message: string): never {
	console.error(`[run-test-suite] ${message}`);
	process.exit(1);
}

function discover(suite: SuiteName): string[] {
	const glob = new Bun.Glob(`**/*.test.{${TEST_EXTENSIONS.join(',')}}`);
	const files = ROOTS.flatMap(root => [...glob.scanSync({ cwd: root })].map(path => `${root}/${path}`)).sort();

	const suites: Record<SuiteName, string[]> = { logic: [], dom: [] };
	const unclaimed: string[] = [];

	for (const file of files) {
		if (file.endsWith(SUITE_EXTENSIONS.dom)) suites.dom.push(file);
		else if (file.endsWith(SUITE_EXTENSIONS.logic)) suites.logic.push(file);
		else unclaimed.push(file);
	}

	// Partitioning needs the whole corpus, because a file that lands in neither half
	// runs nowhere. Emptiness is only checked for the half being run: `bun run test`
	// runs both, so an empty half still fails, just on its own invocation.
	if (unclaimed.length > 0) {
		fail(`no suite runs these test files, so they would never execute: ${unclaimed.join(', ')}`);
	}
	if (suites[suite].length === 0) {
		fail(`the ${suite} suite matched no ${SUITE_EXTENSIONS[suite]} files under ${ROOTS.join(', ')}; test discovery is broken`);
	}

	return suites[suite];
}

const requested = process.argv[2];
if (requested !== 'logic' && requested !== 'dom') {
	fail(`usage: bun run scripts/run-test-suite.ts <${Object.keys(SUITE_EXTENSIONS).join('|')}>`);
}

const files = discover(requested);
const { exitCode, signalCode } = Bun.spawnSync([process.execPath, 'test', ...files], { stdio: ['inherit', 'inherit', 'inherit'] });

// A signal kill (OOM, timeout) leaves exitCode null, and process.exit(null) exits 0.
if (exitCode === null) {
	fail(`the ${requested} suite was killed by ${signalCode ?? 'a signal'} before it finished`);
}
process.exit(exitCode);
