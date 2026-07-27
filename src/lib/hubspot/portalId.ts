const DEFAULT_PORTAL_ID = '21589597';

export function getHubSpotPortalId(): string {
	return process.env['NEXT_PUBLIC_HUBSPOT_PORTAL_ID'] ?? DEFAULT_PORTAL_ID;
}
