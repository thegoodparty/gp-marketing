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

const ledgerPath = process.argv[2];
if (!ledgerPath) {
	console.error('Usage: bun verify-ledger.ts <path to research/<state>.json>');
	process.exit(2);
}

const entries = (await Bun.file(ledgerPath).json()) as Entry[];
const pages = new Map<string, string>();
const misses: Entry[] = [];
const manual: Entry[] = [];

for (const url of new Set(entries.filter(e => !e.manual).map(e => e.url))) {
	const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
	pages.set(url, res.ok ? normalize(await res.text()) : '');
	if (!res.ok) console.error(`HTTP ${res.status} for ${url}`);
}

for (const e of entries) {
	if (e.manual) {
		manual.push(e);
		continue;
	}
	if (!pages.get(e.url)?.includes(normalize(e.quote))) misses.push(e);
}

console.log(`${entries.length} claims, ${entries.length - misses.length - manual.length} quotes found, ${misses.length} missing, ${manual.length} manual`);
for (const e of misses) console.log(`MISSING  ${e.citation}\n  quote: "${e.quote}"\n  url:   ${e.url}`);
for (const e of manual) console.log(`MANUAL   ${e.citation} (${e.url})`);
process.exit(misses.length ? 1 : 0);
