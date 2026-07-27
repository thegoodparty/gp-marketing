export const apiVersion = process.env['SANITY_STUDIO_CLI_QUERY_API_VERSION'] || '2024-01-02';

export const dataset = process.env['NEXT_PUBLIC_SANITY_DATASET'] || 'production';

export const projectId = process.env['NEXT_PUBLIC_SANITY_PROJECT_ID'] || '3rbseux7';

// This is always an empty string client side and is only used server side
export const token = process.env['SANITY_STUDIO_API_TOKEN'] || undefined;

// Used to verify GROQ webhook revalidation requests, defining this will also disable time-based revalidation and only use on-demand revalidation
export const revalidateSecret = process.env['SANITY_REVALIDATE_SECRET'];

// Shared secret gp-api sends to /api/revalidate-person to on-demand bust a
// public /people/* page after a publish/unpublish/delete/edit.
export const personRevalidateSecret = process.env['MARKETING_REVALIDATE_SECRET'];

// Used by `sanity-plugin-iframe-pane` to verify that draft mode was initiated by a valid Studio session
export const urlSecretId = `preview.secret`;

// Ashby job board name for careers page (from https://jobs.ashbyhq.com/{name})
export const ashbyJobBoardName = process.env['ASHBY_JOB_BOARD_NAME'] || undefined;

export const defaultRevalidate = 3600; // 1 hour, in seconds

// Basemap style for the person-profile voter-density map. Defaults to CARTO's
// hosted Positron style, which is free and needs no API key. Read server-side
// and passed to the client map as a prop, so a non-public MAP_STYLE_URL works
// too (e.g. a self-hosted Protomaps style later).
export const mapStyleUrl =
	process.env['NEXT_PUBLIC_MAP_STYLE_URL'] ||
	process.env['MAP_STYLE_URL'] ||
	'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

// Attribution required by the CARTO Positron basemap (CARTO + OpenStreetMap).
export const mapAttribution =
	'© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors, © <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>';
