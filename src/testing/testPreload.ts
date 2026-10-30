import { blockVercelOidcToken } from './vercelOidc';

// Without this, a `vc link`ed checkout lets @vercel/oidc refresh a real token through the Vercel CLI during any test that reads gp-api.
blockVercelOidcToken();
