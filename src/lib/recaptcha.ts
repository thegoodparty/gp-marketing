const SITEVERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

/**
 * Whether the server holds a reCAPTCHA secret. The browser shows the checkbox
 * only when `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is set, and this side checks it only
 * when `RECAPTCHA_SECRET_KEY` is, so set both together in Vercel: a secret
 * without the site key rejects every submission, since no browser sends a token.
 */
export function isRecaptchaConfigured(): boolean {
	return Boolean(process.env['RECAPTCHA_SECRET_KEY']);
}

/**
 * Asks Google whether a checkbox token is genuine. Tokens are single use and
 * expire after two minutes. Any failure to reach Google counts as a failed
 * check: the visitor can tick the box and send again, a bot cannot.
 */
export async function verifyRecaptchaToken(token: string, remoteIp?: string | null): Promise<boolean> {
	const secret = process.env['RECAPTCHA_SECRET_KEY'];
	if (!secret || !token) return false;

	const params = new URLSearchParams({ secret, response: token });
	if (remoteIp) params.set('remoteip', remoteIp);

	try {
		const res = await fetch(SITEVERIFY_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: params.toString(),
		});
		if (!res.ok) return false;
		const payload = (await res.json()) as { success?: unknown };
		return payload.success === true;
	} catch {
		return false;
	}
}
