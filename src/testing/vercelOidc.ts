/**
 * Drives the real `@vercel/oidc` through the same inputs Vercel provides, so the
 * auth tests need no module mock: the request-context `x-vercel-oidc-token`
 * header (functions) and the VERCEL_OIDC_TOKEN env var (builds).
 */

const REQUEST_CONTEXT = Symbol.for('@vercel/request-context');

const OIDC_ENV_KEYS = ['GP_API_AUTH_MODE', 'GP_API_SERVICE_TOKEN', 'VERCEL_OIDC_TOKEN', 'VERCEL_OIDC_TOKEN_FILE'] as const;

const base64Url = (value: object): string => Buffer.from(JSON.stringify(value)).toString('base64url');

/** An unsigned JWT that @vercel/oidc accepts as unexpired; gp-api is what verifies the signature. */
export const fakeVercelOidcToken = (sub: string): string =>
	`${base64Url({ alg: 'RS256' })}.${base64Url({ sub, exp: Math.floor(Date.now() / 1000) + 3600 })}.signature`;

/** Sets the per-request `x-vercel-oidc-token` header the way a Vercel function sees it. */
export const setVercelRequestOidcToken = (token: string): void => {
	(globalThis as Record<symbol, unknown>)[REQUEST_CONTEXT] = { get: () => ({ headers: { 'x-vercel-oidc-token': token } }) };
};

/** Snapshots the OIDC env and request context; the returned function restores both. */
export const saveVercelOidcEnv = (): (() => void) => {
	const saved = OIDC_ENV_KEYS.map(key => [key, process.env[key]] as const);
	for (const key of OIDC_ENV_KEYS) Reflect.deleteProperty(process.env, key);
	return () => {
		for (const [key, value] of saved) {
			if (value === undefined) Reflect.deleteProperty(process.env, key);
			else process.env[key] = value;
		}
		Reflect.deleteProperty(globalThis, REQUEST_CONTEXT);
	};
};
