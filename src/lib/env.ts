export const apiVersion = process.env.SANITY_STUDIO_CLI_QUERY_API_VERSION || '2024-01-02';

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '3rbseux7';

// This is always an empty string client side and is only used server side
export const token = process.env.SANITY_STUDIO_API_TOKEN || undefined;

// Used to verify GROQ webhook revalidation requests, defining this will also disable time-based revalidation and only use on-demand revalidation
export const revalidateSecret = process.env.SANITY_REVALIDATE_SECRET;

// Used by `sanity-plugin-iframe-pane` to verify that draft mode was initiated by a valid Studio session
export const urlSecretId = `preview.secret`;

// Ashby job board name for careers page (from https://jobs.ashbyhq.com/{name})
export const ashbyJobBoardName = process.env.ASHBY_JOB_BOARD_NAME || undefined;
