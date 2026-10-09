# Analytics: what the site sends, and where

Three destinations receive events from this site, and they are not the same thing:

| Destination | How it is loaded | How code reaches it | Who reads it |
| --- | --- | --- | --- |
| **GA4** | Google Tag Manager container `GTM-M53W2ZV` ([src/ui/GTM.tsx](../src/ui/GTM.tsx)) | A push to `window.dataLayer` that a Custom Event trigger in the container forwards to the GA4 tag. The code never calls GA4 itself. | Marketing's reports |
| **Amplitude** | [src/ui/Amplitude.tsx](../src/ui/Amplitude.tsx) | `trackEvent` in [src/lib/analytics.ts](../src/lib/analytics.ts) | Product analytics and experiments |
| **Segment** | [src/ui/Segment.tsx](../src/ui/Segment.tsx) | `trackSegmentEvent` in the same file | HubSpot automation, through Segment's HubSpot destination |

GA4 also measures some things on its own, with no code involved: page views, sessions,
scroll, engagement time, outbound link clicks (`click`) and file downloads, plus whatever
tags the GTM container adds (scroll percentages, timers, a few click tags). None of that
is in this repo. To see what the container does, export it (GTM Admin > Export Container).

## The helpers

Everything lives in [src/lib/analytics.ts](../src/lib/analytics.ts).

- `trackDataLayerEvent(event, properties)` pushes `{ event, ...properties }` to
  `window.dataLayer`. This is the only path to GA4.
- `trackVoterGuideEvent(key, properties)` sends one voter guide event (below) to every
  destination it belongs to: the data layer under its GA4 name, Amplitude under its
  title-case name, and Segment for the events marketing automates on. It adds
  `page_path` and turns `undefined` into `null`.
- `trackVoterGuideProfileViewed(view)` is the profile page view. The data layer gets it
  at once; Amplitude waits for its SDK, because `trackEvent` has no queue and the SDK
  loads after the page is interactive.
- The shared button (`ComponentButton`) takes an `analytics` prop, `{ event, properties }`,
  so a server-rendered block can ask for a click event without handing a function to a
  client component (which renders fine in SSR tests and throws on Vercel).

The older helpers stay as they are: the search events, `Sign Up Clicked` (with its
`sign_up_click` data layer push keyed on `formId`), `Person Profile Notify Submitted`,
the demo request and click-to-call events, and `Scroll Depth`.

## The voter guide events

Every event carries `page_path` (the page it fired on). The GA4 name is what the GTM
trigger matches; the Amplitude name is the same event in Amplitude. Properties are the
data layer keys, which are also the Amplitude property names.

| What the visitor did | GA4 event (data layer) | Amplitude event | Where it fires | Properties |
| --- | --- | --- | --- | --- |
| Clicked an office row | `voter_guide_office_click` | Voter Guide - Office Clicked | The offices list on location pages (`list: offices`) and the nearby offices block on position pages (`list: nearby`) | `list`, `office_name`, `office_level` (local, county, state, or null), `office_type`, `election_date`, `pledged_count`, `href` |
| Changed the year or level filter | `voter_guide_offices_filter_change` | Voter Guide - Offices Filter Changed | The offices list | `filter` (year or level), `value`, `page_level` |
| Clicked a hero button ("See who's an independent", "Local races") | `voter_guide_hero_button_click` | Voter Guide - Hero Button Clicked | The location page hero | `label`, `href`, `location_level` (state, county, city, district), `state` |
| Clicked a featured candidate card | `voter_guide_featured_candidate_click` | Voter Guide - Featured Candidate Clicked | The featured candidates carousel | `name`, `office`, `location`, `is_pledged`, `position` (0-based slot), `href` |
| Paged a carousel (arrow, dot or swipe) | `voter_guide_carousel_page` | Voter Guide - Carousel Paged | Featured candidates and featured cities | `carousel` (featured_candidates or featured_cities), `index`, `direction` (next or prev) |
| Clicked a person on a position page | `voter_guide_position_person_click` | Voter Guide - Position Person Clicked | The candidates and officeholders lists | `list` (candidates or officeholders), `name`, `href`, `party`, `is_pledged`, `is_winner`, `seat`, `decided` |
| Clicked Show more | `voter_guide_show_more_click` | Voter Guide - Show More Clicked | Position candidates (`position_candidates`), the offices list (`offices`), the counties and cities index (`locations_index`) | `list`, `hidden_count` (not on the offices list), `page_level` (offices list only) |
| Viewed a profile | `voter_guide_profile_view` | Voter Guide - Profile Viewed | Every /people page, once per load | `person_id`, `profile_state` (the Figma letter A to L), `persona` (candidate, officeholder, both, past), `claimed`, `pledged`, `removed`, `unpublished`, `party_class` (republican, democrat, independent, other, or null) |
| Opened the pledge pop-up | `voter_guide_pledge_modal_open` | Voter Guide - Pledge Modal Opened | All five openers | `source`: profile_hero, pledge_callout, position_people_lists, position_content, featured_candidates |
| Clicked a claim-your-profile call to action | `voter_guide_claim_profile_click` | Voter Guide - Claim Profile Clicked (also sent to Segment) | The claim block on any template (`claim_block`) and the claim band on unclaimed profiles (`claim_band`) | `source`, `label`, `href`, `layout` (claim block only: card or banner) |
| Clicked a place in the counties and cities index | `voter_guide_location_index_click` | Voter Guide - Location Index Clicked | The index on state and county pages | `place_name`, `place_level` (county, city, town, district), `href`, `searched` (true when the index was filtered first) |
| Clicked a featured city card | `voter_guide_featured_city_click` | Voter Guide - Featured City Clicked | The featured cities carousel | `city_name`, `state`, `open_elections_count`, `href` |
| Clicked a link that leaves the site | none (GA4 has its own `click`) | Voter Guide - Outbound Link Clicked | Any link to a host outside goodparty.org on an /elections or /people page | `href`, `host`, `link_text` |

The claim band still sends `Sign Up Clicked` and the `sign_up_click` data layer push as
before; the claim event is in addition to them.

## Setting up GA4 (whoever owns the GTM container)

Nothing reaches GA4 until the container forwards it. For each row above with a GA4
event name:

1. **Trigger:** Triggers > New > Custom Event, with the event name exactly as written
   (for example `voter_guide_office_click`). One trigger per event.
2. **Variables:** Variables > New > Data Layer Variable, one per property you want in
   GA4, named after the key (for example `office_level`). The same variable serves every
   event that carries that key.
3. **Tag:** Tags > New > Google Analytics: GA4 Event. Event name: the same name as the
   trigger. Event parameters: one row per property, parameter name = the key, value = the
   Data Layer Variable. Fire it on the trigger from step 1.
4. **GA4 custom dimensions:** a parameter is only reportable once GA4 knows it. In GA4,
   Admin > Custom definitions > Create custom dimension, event scoped, with the parameter
   name. Do this for the keys you will filter or break down by: `office_level`,
   `location_level`, `profile_state`, `claimed`, `pledged`, `party_class`, `source`,
   `list`, `carousel`, `filter`. GA4 keeps a limit of 50 event-scoped dimensions per
   property; the property had three when this was written.
5. **Preview** the container on a voter guide page, click an office row, and confirm the
   event shows in Tag Assistant with its parameters, then publish the container.

Two things to know about the data layer:

- GTM keeps the last value of every key across pushes. That is why the code pushes
  `null` for anything it does not know: a tag reading `office_level` on a nearby
  offices click sees null, not the level from an earlier offices list click. A tag
  should only read keys its own event sets.
- Nothing in the data layer reaches GA4 without a tag. The push is visible in the
  browser (see below) even when the container ignores it, so "I can see it in the data
  layer" does not mean "it is in GA4".

## Checking it works

On any deploy (preview or production), open a voter guide page, open the browser
console, do the thing, and read:

```js
window.dataLayer.filter(e => String(e.event).startsWith('voter_guide_'))
```

Each entry is one event with its properties. For Amplitude, the Network tab shows a
request to `api2.amplitude.com` with the title-case event name in its body. In
production, GA4's Realtime report shows the event under its data layer name once the
container forwards it.
