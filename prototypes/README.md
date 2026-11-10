# Prototypes

Self-contained, clickable design prototypes. These are **not** part of the Next.js
app: they are single HTML files, they ship nothing to goodparty.org, and nothing in
`src/` imports them. Open one by double-clicking it, or publish it for review.

They are deliberately kept out of `public/`, which Vercel would serve on the live
site.

| File | What it shows | Status |
| --- | --- | --- |
| `profile-claiming-onboarding.html` | Profile claiming and onboarding, both the candidate and the voter path | Design review (Bryan, Jack), Nov 2026 |

## profile-claiming-onboarding.html

An unclaimed `/people/*` profile through to a published one, and the voter
"ask them to complete it" path, as one continuous flow with working navigation.

- **Example candidate:** Jordan Avery, U.S. Congress, Minnesota's 5th Congressional
  District, Nonpartisan. Fictional. Biography and issue fields start empty on
  purpose — no biographical detail is invented.
- **Grounded in the real product.** The "choose a path" screen mirrors
  `src/ui/ProfileRequestModal.tsx`; the pledge screen uses the three real pillars
  from `PLEDGE_MODAL_COPY` in `src/ui/PledgeModal.tsx`; the eligibility rule is the
  one `composeView` applies (a major-party line on any current affiliation
  disqualifies). Colours, type and button shapes come from `src/ui/_styles/`.
- **Everything is simulated.** No account is created, no request is sent, no
  identity is verified and nothing is published.
- **Marked proposals.** Anything not yet settled — above all the identity
  verification methods — carries a `Proposal` chip.

### Entry point

The entry screen is built against the live `/people/*` page rather than invented:
a midnight hero band carrying the name, office, location, persona tag and the
pledge callout, then the two-column content well — a sticky sidebar card
(Election Date, Political Affiliation, pledge row, Contact) beside a column of
separate white cards with the cream page showing through the gaps.

Section names, grouping and placeholder copy come from
`src/components/people/personSectionOverrides.tsx`: `Why I'm Running for Office`
and `Campaign Issues` share one card, `About Me` and `Recent Experience` share the
next, and the empty-state lines are the ones marketing wrote ("… has not filled out
this section yet"). The claim callout is the `lead` slot card, with the same
radial gradient `ClaimProfileBlock` uses for its `inset` layout.

Note on naming: the pledge is called the **People First Pledge** throughout. It was
renamed from "GoodParty.org Pledge" in Oct 2026 (see `LEGACY_PLEDGE_PHRASE` in
`src/ui/_lib/attributionCopy.ts`).

Screens are hash-routed (`#profile`, `#path`, `#account`, `#edit`, `#pledge`,
`#verify`, `#preview`, `#done`, `#voter-review`, `#voter-sent`), so browser back
and forward work and nothing typed is lost moving between them.
