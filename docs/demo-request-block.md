# Demo Request Block

`component_demoRequestBlock` is the three-step demo request form that sits in front of
the sales calendar. It replaces the pattern of pasting a HubSpot meetings embed into a
hero, which put a calendar link on the marketing site for anyone to book. With this
block, a visitor answers a few questions first, and only a candidate who qualifies sees
the calendar. Everyone else is sent to the product tour.

## What the block does

1. **Step 1, the race:** city, state, office (a dropdown with a free-text "Something
   else").
2. **Step 2, goals and stage:** what they want help with (multi-select) and where the
   campaign is today.
3. **Step 3, contact:** name, email, mobile, and an SMS consent checkbox.
4. On submit the block POSTs the answers to the qualifier API and shows a short
   "checking" state.
5. **Pass:** the HubSpot meetings calendar renders inline (through `EmbedHtml`, so the
   usual host allowlist applies) with a fallback link.
6. **Tour:** a product tour card with a countdown, then a redirect to `/product-tour`.

The block never receives the calendar URL unless the API says pass, so the URL is not
in the page source.

## The qualifier API

The decision is made by a small service that marketing owns, outside this repo:

- **Endpoint:** the block's `Qualifier API Endpoint` field, default
  `https://demo-qualifier-production.up.railway.app/qualify` (Railway project
  `demo-qualifier`). Source and env reference live in the Growth team's
  `demo-qualifier/service` folder (Jack Nagel).
- **What it does:** estimates the town's population (Census, with a model fallback),
  normalizes a free-text office onto a fixed taxonomy, applies hard gates (population
  floor, office type, at least one qualifying goal, campaign stage), writes the contact
  to HubSpot, and returns `{ outcome: 'pass', calendar_url }` or
  `{ outcome: 'tour', redirect_url, redirect_seconds }`.
- **Rules and thresholds** are environment variables on that service, not code here. To
  change who qualifies, change them there.
- **CORS:** the service allows `goodparty.org`, `www.goodparty.org`,
  `http://localhost:3009`, and `https://*.vercel.app`, so the flow works on local dev
  and on Vercel preview deployments as well as production.

If the API is unreachable the block returns the visitor to the contact step with a
generic error and nothing is lost on the visitor's side, but no contact is written.

## Fields

| Field                    | Purpose                                                      |
| ------------------------ | ------------------------------------------------------------ |
| Heading, Body            | Left-column copy                                             |
| Talking Points           | Numbered list of what the demo covers                        |
| Qualifier API Endpoint   | Where answers are posted (https only)                        |
| Background Variant       | `cream` (default) or `midnight`                              |

## Analytics

Events go to both Amplitude (`trackEvent`) and Segment (`trackSegmentEvent`) with
`page_path`: `Demo Request Viewed`, `Demo Request Step Completed` (`step`),
`Demo Request Submitted` (`stage`, `office`), `Demo Request Qualified` (`outcome`),
`Demo Request Tour Redirected`. Score the page on downstream speed to Pro and CAS
handoffs, not on submissions.

## Where it is used

Intended for `/new-demo` (and later `/get-a-demo`). It renders on `/all` for
verification like every block.
