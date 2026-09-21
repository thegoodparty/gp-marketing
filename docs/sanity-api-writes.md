# Writing content into Sanity via the API

Most content on this site is typed into Sanity Studio by a person. Content can also
be written programmatically, straight into the Content Lake over Sanity's API, by a
script in this repo (see `scripts/`) or by an outside job or tool holding a Sanity
token.

**Status: nothing is writing into Sanity via the API on a schedule today.** GoodParty
used AirOps for this; as of September 2026 that is retired with no replacement. The
rules below are not vendor-specific. They describe what this
repo requires of *any* API writer, and they still apply to the one-off maintenance
scripts in `scripts/`.

Two things matter whenever content arrives this way:

1. **Studio validation does not run.** Anything the Studio would have enforced (most
   importantly the FAQ slug contract) has to be enforced by the writer itself.
2. **The site cache has to be told.** A write alone does not change the live site.
   The revalidation webhook below is what makes new content appear.

## The revalidation webhook

This part is live and applies to *all* content changes, including ordinary Studio
publishes. It is the reason a content edit goes live without a deploy.

When a document changes in Sanity, a Sanity webhook POSTs the document to
`/api/revalidate` on the site. That route ([src/app/api/revalidate/route.ts](../src/app/api/revalidate/route.ts))
busts the Next.js cache tag for the document type and revalidates the specific paths
that render it. Without it, pages serve stale cached HTML: Sanity fetches are cached
by tag with no time limit, so a stale page stays stale until something revalidates it.

### Endpoint

**POST** `https://<your-site>/api/revalidate`

**Authorization (one of):**

- Header `x-sanity-webhook-secret: <secret>`, compared against `SANITY_REVALIDATE_SECRET`
- Header `sanity-webhook-signature`, the HMAC signature Sanity sends when the webhook
  has a secret configured

Do not pass the secret in a query parameter; it will show up in logs.

**Body:** the Sanity document JSON. It must include `_type`, plus the slug path for
slug-based routes.

**Response (200):**

```json
{
	"revalidated": true,
	"tag": "article",
	"paths": ["/blog", "/blog/article/my-slug"]
}
```

A `layout` field is also returned for document types that force a full layout
revalidation (navigation, footer, and similar global content).

### Configuring it

**1. Generate a shared secret:**

```bash
openssl rand -hex 32
```

**2. Create the webhook** at [manage.sanity.io](https://manage.sanity.io) under your
project > **API** > **Webhooks**:

- **Name:** `Next.js revalidation`
- **URL:** `https://goodparty.org/api/revalidate` (or the environment you are wiring up)
- **Dataset:** `production`
- **Trigger on:** Create, Update, Delete
- **HTTP method:** POST
- **Secret:** paste the generated secret to use HMAC verification. Alternatively,
  leave **Secret** empty and add a header `x-sanity-webhook-secret` with that value;
  the route accepts either.
- **Filter:** leave empty to fire on every document, or narrow it with a GROQ filter,
  for example:

  ```
  _type in ["article", "glossary", "faq", "goodpartyOrg_landingPages", "policy", "categories", "topics", "goodpartyOrg_home", "goodpartyOrg_contact", "goodpartyOrg_navigation", "goodpartyOrg_footer", "goodpartyOrg_allArticles", "goodpartyOrg_glossary", "goodpartyOrg_404Page", "goodpartyOrg_allComponents", "quoteCollections"]
  ```

**3. Set the same secret as an environment variable.** On Vercel: **Settings** >
**Environment Variables** > add `SANITY_REVALIDATE_SECRET`, apply it to Production
(and Preview if needed), then redeploy. Locally, put it in `.env.local`:

```
SANITY_REVALIDATE_SECRET=<your-secret>
```

## Setting up an API writer

If a script, job, or third-party tool needs to create or update content:

1. **Mint a dedicated token.** At [manage.sanity.io](https://manage.sanity.io), open
   your project > **API** tab > **Add API Token**, name it after the thing that will
   use it, and give it **Editor** permission. Editor grants write access to every
   document type; for tighter scope, create a custom Sanity role limited to the types
   that writer actually touches (for example `article`, `glossary`,
   `goodpartyOrg_landingPages`).
2. **Do not reuse another token.** In particular, do not hand out
   `SANITY_STUDIO_API_TOKEN`, which the repo's own maintenance scripts use. One token
   per writer, so it can be revoked on its own.
3. **Point it at the `production` dataset**, with the project ID from
   `NEXT_PUBLIC_SANITY_PROJECT_ID`.

## What an API writer must get right

### Document types and slug paths

Documents are written as JSON and must match the Sanity schema. The types that carry
public URLs:

| Type                         | Use case        | Slug path                             | Notes                              |
| ---------------------------- | --------------- | ------------------------------------- | ---------------------------------- |
| `article`                    | Blog posts      | `editorialOverview.field_slug`         | Body is portable text              |
| `glossary`                   | Political terms | `glossaryTermOverview.field_slug`      |                                    |
| `goodpartyOrg_landingPages`  | Landing pages   | `detailPageOverviewNoHero.field_slug`  |                                    |
| `policy`                     | Policy pages    | `policyOverview.field_slug`            |                                    |
| `faq`                        | FAQ entries     | `faqOverview.field_slug`               | Required and unique; see rules below |
| `categories`                 | Blog sections   | `tagOverview.field_slug`               |                                    |
| `topics`                     | Blog tags       | `tagOverview.field_slug`               |                                    |

### FAQ slug rules (required)

Studio validation does **not** run for Content Lake API writes, so an API writer has
to enforce the same slug contract the Studio does:

1. **Format:** lowercase letters, numbers, and hyphens only
   (`^[a-z0-9]+(?:-[a-z0-9]+)*$`). No spaces, uppercase, or slashes.
2. **Generate from the question** using the same algorithm as `slugifyFaqQuestion`
   in [src/lib/faqSlugFormat.ts](../src/lib/faqSlugFormat.ts): lowercase, strip
   non-alphanumerics except spaces and hyphens, collapse whitespace to `-`. Example:
   `What is GoodParty.org?` becomes `what-is-goodpartyorg`.
3. **Collision suffix:** if that slug already belongs to another FAQ, append
   `-{last6 of published document id}` and repeat until unique, for example
   `what-is-goodpartyorg-bbb222`.
4. **Preflight uniqueness query** (raw perspective, authenticated):

   ```groq
   count(*[_type == "faq" && faqOverview.field_slug == $slug && _id != $publishedId && !sanity::versionOf($publishedId)])
   ```

   Abort the write when the count is greater than zero.

5. **Post-write audit.** After creating or updating FAQs over the API, run:

   ```bash
   bun run sanity:backfill:faq-slugs -- --audit
   ```

   It must report zero remaining patches, zero preflight errors, and zero duplicate
   stored slugs.

### Portable text (rich content)

`article` bodies and other rich text fields are portable text, not HTML or markdown.
A writer either emits portable text blocks directly or converts HTML to portable text
before writing (Sanity publishes `@portabletext/block-tools` for this).

### Draft vs. published

Sanity documents written with a `drafts.` id prefix are drafts. **The site only
renders published documents** (`sanityClient` pins `perspective: 'published'`), so a
writer has to publish explicitly for content to appear.

### GROQ queries

Content can be read back with GROQ, for example:

```groq
*[_type == "article"] | order(editorialOverview.field_publishedDate desc) {
	_id,
	"title": editorialOverview.field_editorialTitle,
	"slug": editorialOverview.field_slug,
	"publishedAt": editorialOverview.field_publishedDate
}
```

## Testing checklist

1. **Token:** read a document of the target type with the new token. Confirm results.
2. **Create:** write a test document (a glossary term is low risk). Verify it appears
   in Sanity Studio.
3. **Publish:** publish the test document.
4. **Webhook:** check the delivery at manage.sanity.io under **API** > **Webhooks** >
   your webhook > **Attempts**. Expect a 200.
5. **Revalidation:** visit the affected page. The new content should be there
   immediately, not after some later cache expiry.

## Troubleshooting

| Issue                            | Check                                                                    |
| -------------------------------- | ------------------------------------------------------------------------ |
| 503 Revalidation not configured  | `SANITY_REVALIDATE_SECRET` is set in the deployment environment            |
| 401 Invalid signature            | The webhook secret matches the env var; HMAC needs the raw request body    |
| 401 Invalid header / Authorization failed | The webhook sends `x-sanity-webhook-secret` or `sanity-webhook-signature` |
| 400 Invalid payload: missing `_type` | The webhook projection is dropping `_type` from the body               |
| Content not updating             | The webhook filter may exclude that document type; check webhook attempts  |
| Wrong paths revalidated          | `_type` and the slug path in the payload must match the schema             |
