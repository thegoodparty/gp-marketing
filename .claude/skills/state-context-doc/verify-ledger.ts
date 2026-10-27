type Entry = {
	claim: string;
	citation: string;
	url: string;
	quote: string;
	certainty?: string;
	verified?: string;
	manual?: boolean;
};

const normalize = (s: string) =>
	s
		.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
		.replace(/<[^>]+>/g, ' ')
		.replace(/&nbsp;|&#160;/g, ' ')
		.replace(/&amp;/g, '&')
		.replace(/&quot;|&#34;|[“”]/g, '"')
		.replace(/&#39;|&apos;|[‘’]/g, "'")
		.replace(/&sect;/g, '§')
		.replace(/\s+/g, ' ')
		.toLowerCase();

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Some state law sites rate-limit after a dozen quick requests; a 429 must never read as a missing quote.
const fetchPage = async (url: string): Promise<{ text: string } | { error: string }> => {
	let lastError = '';
	for (let attempt = 0; attempt < 5; attempt++) {
		if (attempt > 0) await sleep(2000 * 2 ** attempt);
		try {
			const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
			if (res.ok) return { text: normalize(await res.text()) };
			lastError = `HTTP ${res.status}`;
			if (res.status !== 429 && res.status < 500) break;
		} catch (e) {
			lastError = String(e);
			if (/certificate|issuer/i.test(lastError)) break;
		}
	}
	return { error: lastError };
};

const ledgerPath = process.argv[2];
if (!ledgerPath) {
	console.error('Usage: bun verify-ledger.ts <path to research/<state>.json>');
	process.exit(2);
}

const entries = (await Bun.file(ledgerPath).json()) as Entry[];
const pages = new Map<string, string>();
const fetchErrors = new Map<string, string>();
const misses: Entry[] = [];
const unfetched: Entry[] = [];
const manual: Entry[] = [];

for (const url of new Set(entries.filter(e => !e.manual).map(e => e.url))) {
	const result = await fetchPage(url);
	if ('text' in result) pages.set(url, result.text);
	else fetchErrors.set(url, result.error);
	await sleep(500);
}

for (const e of entries) {
	if (e.manual) manual.push(e);
	else if (fetchErrors.has(e.url)) unfetched.push(e);
	else if (!pages.get(e.url)?.includes(normalize(e.quote))) misses.push(e);
}

const found = entries.length - misses.length - unfetched.length - manual.length;
console.log(
	`${entries.length} claims, ${found} quotes found, ${misses.length} missing, ${unfetched.length} not checked (fetch failed), ${manual.length} manual`,
);
for (const e of misses) console.log(`MISSING  ${e.citation}\n  quote: "${e.quote}"\n  url:   ${e.url}`);
for (const [url, error] of fetchErrors) {
	console.log(`FETCH FAILED  ${url}\n  ${error}`);
	if (/certificate|issuer/i.test(error)) console.log('  The site sends an incomplete certificate chain. See the recipe table in SKILL.md for the fix.');
}
for (const e of manual) console.log(`MANUAL   ${e.citation} (${e.url})`);
process.exit(misses.length || unfetched.length ? 1 : 0);
