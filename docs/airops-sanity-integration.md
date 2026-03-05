# AirOps + Sanity Integration

This guide covers connecting [AirOps](https://www.airops.com/) to the Good Party Marketing Sanity CMS and configuring on-demand cache revalidation so content created or updated via AirOps appears on the site immediately.

## Prerequisites

- Access to the Sanity project (manage.sanity.io)
- AirOps account with integration permissions
- Deployed Next.js site URL (e.g. https://goodparty.org)

**Configuration:** Use the project ID from `NEXT_PUBLIC_SANITY_PROJECT_ID` or your Sanity project settings. Replace `{project-id}` in the steps below.

## Step 1: Create a Sanity API Token for AirOps

1. Go to [manage.sanity.io](https://manage.sanity.io)
2. Select your project (ID: `{project-id}`)
3. Open the **API** tab
4. Click **Add API Token**
5. Set name: `AirOps`
6. Set permissions: **Editor**
7. Click **Save**
8. Copy the generated token and store it securely

**Scope:** Editor grants full write access to all document types. For tighter security, create a custom role in Sanity scoped only to the document types AirOps needs (e.g. `article`, `glossary`, `goodpartyOrg_landingPages`).

**Security:** Do not reuse `SANITY_STUDIO_API_TOKEN`. Use a dedicated token for AirOps.

## Step 2: Configure AirOps Integration

1. In AirOps, go to **Settings > Integrations**
2. Click **Add New** and select **Sanity**
3. Enter:
   - **API Key:** The token from Step 1
   - **Project ID:** `{project-id}`
   - **Dataset:** `production`
4. Click **Save**

AirOps can now list, fetch, create, update, publish, and query Sanity content.

## Step 3: Set Up Sanity Webhook for Revalidation

When AirOps creates or updates content, the site cache must be invalidated. Configure a Sanity webhook to call the revalidation endpoint.

### 3a. Generate a Shared Secret

```bash
openssl rand -hex 32
```

Save this value. You will use it in Step 3b and Step 4.

### 3b. Create the Webhook

1. Go to [manage.sanity.io](https://manage.sanity.io) > your project
2. Open **API** > **Webhooks**
3. Click **Create webhook**
4. Configure:
   - **Name:** `Next.js revalidation`
   - **URL:** `https://goodparty.org/api/revalidate` (replace with your production URL)
   - **Dataset:** `production`
   - **Trigger on:** Create, Update, Delete (or only Create + Update if preferred)
   - **Filter:** Leave empty to trigger on all documents, or use a GROQ filter to limit to content types, e.g.:
     ```
     _type in ["article", "glossary", "goodpartyOrg_landingPages", "policy", "categories", "topics", "goodpartyOrg_home", "goodpartyOrg_contact", "goodpartyOrg_navigation", "goodpartyOrg_footer"]
     ```
   - **Secret:** Paste the secret from 3a (enables HMAC signature verification)
   - **HTTP method:** POST

5. Click **Save**

### 3c. Alternative: Custom Header (Simpler)

If you prefer not to use HMAC, add a custom header instead:

1. In the webhook configuration, under **Headers**, add:
   - **Name:** `x-sanity-webhook-secret`
   - **Value:** Your secret from 3a

2. Leave **Secret** empty. The route validates the custom header.

## Step 4: Add Environment Variable

Add the same secret to your deployment environment:

**Vercel:**
1. Project **Settings** > **Environment Variables**
2. Add `SANITY_REVALIDATE_SECRET` with the value from Step 3a
3. Apply to Production (and Preview if needed)
4. Redeploy

**Local development (.env.local):**
```
SANITY_REVALIDATE_SECRET=<your-secret-from-step-3a>
```

## AirOps Workflow Guidance

### Document Types and Schema Compliance

AirOps creates documents via JSON. The payload must match the Sanity schema. Key types:

| Type | Use Case | Slug Path | Notes |
|------|----------|-----------|-------|
| `article` | Blog posts | `editorialOverview.field_slug` | Requires portable text for body |
| `glossary` | Political terms | `glossaryTermOverview.field_slug` | |
| `goodpartyOrg_landingPages` | Landing pages | `detailPageOverviewNoHero.field_slug` | |
| `policy` | Policy pages | `policyOverview.field_slug` | |
| `categories` | Blog sections | `tagOverview.field_slug` | |
| `topics` | Blog tags | `tagOverview.field_slug` | |

### Portable Text (Rich Content)

For `article` body and other rich text fields, use **Resource HTML** in AirOps Create/Update:

- AirOps converts HTML to Sanity Portable Text
- Example: `{ "body": "<h1>Title</h1><p>Paragraph.</p>" }`

### Draft vs. Published

- Sanity creates documents as drafts (`drafts.` prefix)
- Use AirOps **Publish Resource** to make content live
- The site only displays published documents

### GROQ Queries

Use **Execute Query** in AirOps for custom fetches:

```groq
*[_type == "article" && status == "published"] | order(publishedAt desc) { _id, title, slug, publishedAt }
```

## Testing Checklist

1. **Token:** In AirOps, run List Resources for type `article`. Confirm results.
2. **Create:** Create a test document (e.g. glossary term) via AirOps. Verify it appears in Sanity Studio.
3. **Publish:** Publish the test document via AirOps.
4. **Webhook:** Trigger a document update in Sanity Studio. Check webhook attempts in manage.sanity.io (API > Webhooks > your webhook > Attempts). Expect 200 response.
5. **Revalidation:** After a publish, visit the affected page. Content should appear without waiting for cache TTL (12h).

## Revalidation Endpoint Reference

**POST** `https://<your-site>/api/revalidate`

**Authorization (one of):**
- Header: `x-sanity-webhook-secret: <secret>`
- Header: `sanity-webhook-signature` (HMAC when webhook secret is configured)

Do not pass the secret in query parameters; it will appear in logs.

**Body:** Sanity document JSON with `_type` (and `slug` path for slug-based routes)

**Response (200):**
```json
{
  "revalidated": true,
  "paths": ["/blog", "/blog/article/my-slug"],
  "_type": "article"
}
```

## Troubleshooting

| Issue | Check |
|-------|-------|
| 503 Revalidation not configured | `SANITY_REVALIDATE_SECRET` is set in Vercel/env |
| 401 Invalid signature | Secret in webhook matches env; use raw body for HMAC |
| 401 Missing authorization | Webhook sends `x-sanity-webhook-secret` or `sanity-webhook-signature` |
| Content not updating | Webhook filter may exclude the document type; check webhook attempts |
| Wrong paths revalidated | Verify `_type` and slug path in payload match schema |
