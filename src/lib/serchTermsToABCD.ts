export function searchTermsToABCD(terms: { _id: string; title: string; href: string }[]) {
	const letters: { _id: string; title: string; href: string }[] = [];
	for (const term of terms) {
		const letter = term.title.charAt(0).toLowerCase();
		if (!letters.find(l => l.title === letter)) {
			letters.push({ _id: term._id, title: letter, href: `/political-terms/${letter}` });
		}
	}
	return letters.sort((a, b) => a.title.localeCompare(b.title));
}
