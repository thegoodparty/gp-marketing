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

### Choose a path

The screen after Get started is a selection, not two competing calls to action:
Jordan Avery's name, office and district sit at the top, then two selectable
cards ("Claim this profile" / "Ask Jordan Avery to complete this profile") and a
single Continue button that stays disabled until one is chosen. The cards are
real radio inputs in a `radiogroup`, so arrow keys move between them, and the
choice is held in `state.path` and restored when you navigate back.

### Account creation

Two columns on desktop: the profile being claimed on the left (name, office,
district, affiliation, `Unclaimed` status) above a short "what happens next"
list, with the form on the right. The summary sticks on scroll, so the profile
stays attached to the whole account journey. It stacks to one column on mobile,
summary first.

Sign-up and sign-in switch in place and keep whatever has been typed. Required
fields and the terms agreement are validated; `Create account` simulates
authentication and goes straight to the profile editor. Authenticating uses
`location.replace`, so `#account` leaves the history stack — you cannot go back
to creating an account once you have one, and Back from the editor lands on the
path screen instead of bouncing off a screen that would immediately redirect.
Reaching `#account` while signed in redirects to the editor.

Single sign-on is a **proposal**. This repo only links out to
`app.goodparty.org/sign-up` and `/login`; it holds no auth UI, so nothing here
confirms which methods the app actually supports. The one button shown is marked
as unconfirmed and needs checking against gp-webapp.

### Profile editor

The centre of the flow. Two columns on desktop: a sticky sidebar carrying the
candidate summary, profile status, a three-step progress indicator and the
read-only record fields; the three editable sections on the right, all on one
screen. It stacks to one column on mobile.

The sections match the public profile exactly: **Why I'm Running for Office**
and **About Me** are long text with guidance and a character counter;
**Campaign Issues** is a repeatable issue title plus a position, which can be
added, edited and removed.

Behaviour worth knowing:

- **Nothing is required.** Both `Save and continue` and `I'll do this later` go
  to the pledge, and both keep the work. Validation only objects to what has
  actually been entered wrong: an issue with a position but no title, or text
  over its limit.
- **Autosave.** Typing shows "Saving…" then "Draft saved" in the sidebar. That
  indicator is how the screen states the draft is private and already kept,
  instead of repeating a banner per field.
- **Public labelling.** Each section carries a `Public` chip, and the notice at
  the top explains that those sections appear publicly only after publishing.
- **Read-only spine.** Office, district, election and affiliation sit in the
  sidebar behind lock icons, with a "Report a problem" link marked as a
  proposal — no correction process is confirmed.

Nothing is prefilled for Jordan Avery, since an unclaimed profile has no
authored content; the sections start genuinely empty rather than seeded with
invented text.

### Pledge

Approved language only. The three commitments and their full text come verbatim
from `PLEDGE_MODAL_COPY` in `src/ui/PledgeModal.tsx`; the one-line summaries on
the cards are orientation, and the full text is shown in a disclosure before
anyone agrees. Nothing here invents a binding term.

The screen asks who is claiming before it asks for agreement. A representative
gets a **candidate-consent-required** state rather than a checkbox, because a
pledge is a statement GoodParty.org publishes about a named person. An
eligibility panel states the live rule (a major-party line on any current
affiliation disqualifies) and links to help.

### Verification

Nothing about the method is settled, and the screen says so. The proposed
process is behind a `Proposed` chip with an explicit notice that no provider has
been chosen and no government-ID, EIN or third-party check exists. Four states
are reviewable — not submitted, pending, approved, more information needed — via
the inline prototype control or the panel.

### Review and publish

Publishing is gated on **two independent conditions**: the pledge step being
finished, and profile access being verified. Neither alone is enough, and a
finished profile is neither. The rendered gate and the click handler read the
same predicate, so the button can never look available while the handler
refuses. Pending verification replaces Publish with a waiting state; moderation
turns it into "Submit updates for review" and the completion screen says the
updates are in review rather than live.

### Prototype controls

The floating **Prototype** button opens a panel that jumps to any screen and
forces the states that otherwise take a full play-through: signed in/out, role,
pledge, verification status, profile content, moderation, published. Labelled as
presentation aids, not product.

Note on naming: the pledge is called the **People First Pledge** throughout. It was
renamed from "GoodParty.org Pledge" in Oct 2026 (see `LEGACY_PLEDGE_PHRASE` in
`src/ui/_lib/attributionCopy.ts`).

Screens are hash-routed (`#profile`, `#path`, `#account`, `#edit`, `#pledge`,
`#verify`, `#preview`, `#done`, `#voter-review`, `#voter-sent`), so browser back
and forward work and nothing typed is lost moving between them.
