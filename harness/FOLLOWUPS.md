# Parity follow-ups (data gaps, chrome, and masked regions)

Anything the harness can't legitimately close via layout fixes. Each entry:
state(s), region, why, and where the real fix lives. Rows marked "report-only"
are excluded from the 3% gate by band class in `config.mjs` (not masked).

| State(s) | Band/region | Why not gated | Real fix owner | How handled |
|----------|-------------|---------------|----------------|-------------|
| all | `elections` index county list | Diff is dominated by how many counties are **seeded** vs the mock's long list — data volume, not layout | seeded election data / elections-api | report-only (class `data`) |
| all | `nav`, `breadcrumb`, `footer` | Shared, already-shipped site chrome; live DOM box bounds don't map cleanly to the thin Figma bands | marketing site chrome (out of scope) | report-only (class `chrome`) |
| ~~all~~ | ~~Hero **headshot** in `body`~~ | **RESOLVED (was a false-parity trap).** The old `GLOBAL_MASKS` painted the avatar disc flat gray on BOTH sides, so an *empty/broken* hero photo scored the same as a real one — that is exactly how a hero with no photo once passed the gate. Fix: dev fixtures now seed real per-state headshots (`devPeopleProfileFixtures.ts`, on both `overlay.avatarUrl` and `person.headshotUrl`), the mask is removed, and capture now asserts the hero photo actually decoded (`capture.mjs` → `avatar`, a hard fail on `BROKEN`). | — | seeded photos + `avatar` presence gate (no mask) |
| A/D/E/F + any empowered w/ density | Voter-density **heatmap** in District Information | Density data not wired to these seeded people; the map is the largest single red blob in the `body` diff (bottom of the content well) | people-api / gp-api voter-density | flag — nested deep in a content card, so masking both sides precisely is not wired; contributes to the `body` residual below |
| H | `pledge` band | Cached Figma "H" frame is a **cloned Claimed-candidate frame** (its desktop frame is literally named "Claimed profile: Candidate only" and still carries a Pledge instance + claimed CTA). Our correct unclaimed render omits the pledge, so the band can never match | design file (re-export a real unclaimed-past frame) | `REPORT_ONLY_BANDS.H` |
| I | Sidebar rows/icons | Unclaimed → no owner overlay/office, so Current Term, Office Contact, Office Mailing Address and the gov/Instagram contact icons have **no data**; live correctly renders only Election Date / Political Affiliation / Contact(3). Figma shows the full filled template | people-api (owner claim / office data) | data gap — flag |
| K, L | Sidebar top rows | Removal frames use a **generic full template**: figma K (a candidate, holds no office) still shows a "Current Term" row, and figma L (a non-running officeholder) still shows an "Election Date" row — both factually inapplicable placeholders. Live renders the semantically-correct rows per persona. Removal also suppresses owner content (`links=[]`) by design | design file (per-persona removal frames) + product (removal suppression) | reference artifact + data suppression — flag |

## RESOLVED — sidebar rebuilt to the Figma structure

The sidebar was structurally wrong (a card of labeled URL rows + an "About
Office"/"Party" card). It is now the Figma single-card layout with
divider-separated rows: **Election Date** and/or **Current Term** (persona
"both" shows both), **Political Affiliation** (flag icon), a **Contact** row of
circular icon-only buttons, and — for anyone currently in office — **Office
Contact** (email/phone links) and **Office Mailing Address**. Changes:
`src/ui/ElectionsSidebar.tsx` (new Figma render path + tighter row spacing +
larger 48px icon circles; legacy `links`/`aboutOffice` path kept for the
`/elections` template), `buildSidebar` in `personSectionOverrides.tsx`, the
`government` link icon `globe → landmark`, and `PersonProfileView.officeAddress`.

Isolated sidebar parity (`harness/measure-sidebar.mjs`, measured at the harness's
effective ~90px sidebar resolution): **9/12 states ≤ 2.26%** (A 2.01, B 1.65,
C 1.49, D 2.20, E 1.78, F 1.66, G 2.03, H 2.26, J 1.64). The three over-3% states
are the reference/data-gap cases in the table above (I 3.40, K 4.41, L 4.13) —
their live sidebars are the semantically-correct subset of the generic Figma
template.

## RESOLVED this loop

- **D/E/F/H unclaimed CTA structure** — was `missing:live`; now renders the
  full-width interactive `PersonClaimCTABand` ("Are you …? Complete your profile
  now." + inline name/email form) in the `person-cta` slot, matching Figma.
- **A/B/C/G claimed CTA** — centered content, title now wraps to 2 lines
  (`md:mx-auto md:max-w-2xl`), and the "Learn more" button renders (was absent
  because the seed authored the button in `ctaAction`, not `primaryCTA`; now
  injected via the section override). `cta` band 7% → 6% and no longer the
  dominant term (band weight is only ~0.08 of the gated mean).
- **Claimed CTA button color** — Figma shows a dark **navy filled** button; live
  was rendering a light `outline` button because `CTABannerBlock` inverts the
  button style for the card color (`secondary → outline` on a cream/blue card).
  Fix: new `preserveButtonStyle` opt-out on `CTABannerBlock` (plumbed through
  `CTABannerBlockSection` + the override type); the person CTA now passes
  `styleType: 'secondary'` (= `bg-midnight-900`) with `preserveButtonStyle`, so
  it renders the navy button. `/elections` keeps the inverse mapping unchanged.

## Harness honesty fix (why an empty hero once passed)

The blurred per-band layout score is a *layout-tolerance*, not a pixel diff —
it intentionally mushes text so real seeded copy vs Figma lorem doesn't dominate.
Two things made it certify a visibly-broken hero as a match:

1. **The headshot mask** painted the avatar disc gray on both sides, so a broken
   photo == a real photo. **Removed.**
2. **Body-band dilution** — the avatar is a sliver of the tall `body` band, so
   even un-masked its diff barely moves the score. A blurred comparison can't
   reliably catch a missing photo.

Fix: the hero photo is now guarded *directly* by a capture-time assertion
(`captureAvatar`) that a decoded `<img headshot>` (or the intentional silhouette
placeholder for removed profiles) is present, surfaced as a **hard FAIL** in the
report independent of the blurred score. Don't re-add the headshot mask.

## Body band — enriched dev fixtures + honest scoring

> **Calibration note.** An earlier pass reported "all 12 green, PARITY REACHED"
> at 2.26–2.97%. That was under the old config that **masked the headshot** and
> blurred hard enough to hide hero drift — i.e. partly false confidence. With the
> mask removed and the avatar guarded directly, the blurred `body`/`cta` scores
> now hover *around* the 3% tolerance because the residual is **seeded-vs-mock
> text content** (verified by full-page Figma-vs-live montages: the hero photo,
> sidebar, content-well order, CTA, pledge, elections, and footer all match
> structurally). The gate is a layout-tolerance; treat a state as done when the
> montage matches structurally AND `avatar` is `photo`/`placeholder` (not
> `BROKEN`), not when the blurred number ticks under an arbitrary line.

The `body` residual was **data volume**, not layout: the live pages read sparse
seeded records from election-api-dev / gp-api-dev (1 issue, 1–2 experience rows,
no interlinks, no voter density) while the Figma mocks are fully populated. Fix
(dev-only): `src/lib/devPeopleProfileFixtures.ts` + a guarded branch in
`src/app/people/[slug]/page.tsx`. When `PEOPLE_DEV_FIXTURES=true`, `resolveView`
serves an enriched, mock-volume view per harness slug through the **same**
`composeView` → `buildPersonSectionOverrides` → template pipeline. Persona/state
resolution is delegated to the shared `STATE_FIXTURES` matrix so each slug lands
on its intended state; only content volume (3 issues, 4–5 experience rows,
5 "other candidates", 6 "nearby officials", voter-density cells, full bios/why-
running, contacts, an elections index) is layered on. Prod never sets the flag
and reads the live APIs unchanged.

Run the harness with the flag:
```
PEOPLE_DEV_FIXTURES=true npm run dev   # dev server on :3009
node harness/run.mjs --run final        # capture + diff all 12
```

The historical diagnosis below is kept for context.

### Original diagnosis (pre-fixtures)

The `body` band carries ~0.60 of the gated weight and sat at **~3.4–5.2%**
across states, which kept every state above the 3% gate. Investigation
(batch3) showed this residual was **distributed content divergence between real
seeded data and the fully-populated Figma placeholder mocks**, not a fixable
layout defect:

- The layout skeleton matches: dark hero, sidebar, and the content-well section
  order (Why I'm Running → Campaign Issues → About Me → Recent Experience →
  Other candidates → About position → District map) all render correctly, in the
  right place, with the right styling/colors.
- Ruled out as causes: (a) export **resolution** — degrading a crisp live crop to
  the Figma export width self-diffs at only 0.09%; (b) **height-squash artifact** —
  `normalize` pads top-anchored, it does not stretch.
- Live bodies are ~24% **shorter** than the mocks (G/I/L up to ~73% shorter):
  the mocks show 3 campaign issues / 4+ experience rows / long lorem, while the
  sparse seeded people have 1 issue / 2 rows / short real text. Masking the
  bottom 30% of the body still leaves 2.7–3.7% — the divergence is throughout,
  driven by real-vs-placeholder **text density** and **content volume**.
- Sidebar structure differed from the mock (mock: "Election Date / Political
  Affiliation / Contact icon-row"; old live: "Website / Email / Facebook / About
  Office / Party"). **RESOLVED** — the sidebar was rebuilt to the Figma layout
  (see "RESOLVED — sidebar rebuilt to the Figma structure" above).

**Conclusion (superseded):** the sub-3% gate on `body` was not reachable against
these Figma references with the *default* sparse dev dataset. Rather than split
`body` into sub-bands, we took the richer-data path — the `PEOPLE_DEV_FIXTURES`
override above — which brought every state to green through the real render
pipeline.

### Remaining true follow-ups (not blocking the gate)

- **Real backend data volume.** The enrichment lives only behind the dev flag.
  Production parity still depends on election-api / gp-api actually returning
  comparable content (issues, experience, interlinks, voter density) for real
  people. Owner: people-api / seeded election data.
- **Sidebar structure** — RESOLVED (rebuilt to the Figma single-card layout;
  9/12 states ≤2.26% isolated sidebar diff). The remaining I/K/L residuals are
  the reference/data-gap cases now tabulated at the top of this doc.
- **H reference** is a mislabeled clone of a Claimed-candidate frame; `pledge`
  stays `REPORT_ONLY_BANDS.H`. Re-export a real unclaimed-past frame to gate it.

## RESOLVED — hero→content gap (the visible "huge whitespace")

**Symptom.** A large empty cream area between the hero and the content well: the
whole right-hand side was blank from the dark band down to the first content card.

**Root cause — a structural mismatch, not a padding value.** The Figma frames use
two *continuous, staggered* columns spanning hero + content: the portrait
STRADDLES the dark band, so the right-hand content column starts 48px below the
band (beside the photo) and the left sidebar starts 48px below the photo. Live
instead stacked three self-contained sections — hero (sized by the 320px photo)
→ a full-width "Took the GoodParty.org Pledge" band → content well (pt-80) —
so the content began below *everything*:

| boundary | design | live (before) |
| --- | --- | --- |
| band bottom → content column top | 48px | **314px** |
| portrait bottom → sidebar top | 48px | **210px** |

**Fix.**
- `ProfileHero`: `md:overflow-visible md:z-10`, container `md:pb-0`, and the
  portrait gets `md:-mb-[104px] lg:-mb-[120px]` so it stops contributing its full
  height to the flow — the hero box ends at the band and the photo overflows past
  it (z-10 keeps it above the next section's cream background).
- The pledge pill moved from its own full-width band into the hero's tag row
  (`pledged` prop) — same feature, zero vertical cost, and it no longer collides
  with the straddling portrait. **Placement is a design deviation to review:** the
  Figma hero shows only the persona tag there.
- `ProfileContentBlock`: section padding to 48px (`0.6 x --container-padding`),
  and the sidebar column clears the portrait with `md:mt-[104px] lg:mt-[120px]`
  (MARGIN, not padding — padding would ride along inside the sticky box). Applied
  to `sidebarStandalone` too, or a card-less profile would be overlapped.

Verified by `harness/spacing-check.mjs`: both hero gaps are 48px design / 48px
live, delta 0, on all 12 states.

## RESOLVED — content→next-section gap (the "huge gap below the content")

**Symptom.** A visible band of empty whitespace between the content well and the
next full-width section (blue CTA / elections), on every state. The raster gate
never caught it: it lives *inside* the `body` band (which is defined to end at
the next section's top, see extract-figma-sections.mjs), and blur+downscale to
320px mushes an 80px gap in a ~3600px band into ~nothing.

**Diagnosis (spec-driven, not raster).** New tool `harness/spacing-check.mjs`
reads the design's real content-well bottom from the get_metadata node tree (the
number the band extractor discards) and the live perceived gap from the DOM:
- design gap = next full-width section top − content **column** bottom = **48px**
  (a clean 3rem token; confirmed on A/C/D/G/H/I/J/K/L — B/E/F under-report due to
  an extra wrapper frame in those dumps, a parse quirk, not a design diff).
- live gap was **80px** — the full `--container-padding` bottom padding on
  `ProfileContentBlock`. The next section's own top padding is *inside* its
  full-bleed color band, so the perceived white gap is content padding-bottom
  alone.

**Fix.** `ProfileContentBlock` base padding split: keep
`pt-(--container-padding)` (hero→content rhythm unchanged) and set
`pb-[calc(var(--container-padding)*0.6)]` → 48px at the 1440 desktop the design
targets, degrading responsively. Post-fix spacing-check: live 48px == design
48px (delta 0) on every cleanly-measured state.

**Note on the raster gate (Goodhart) — read this before trusting the 3% number.**
Neither spacing fix moves the raster score, because the gate cannot see spacing:

| | before (final-honest) | after (herofix) |
| --- | --- | --- |
| gated range | 2.77% – 3.53% | 2.69% – 3.70% |
| states over 3% | 9 of 12 | 10 of 12 |
| worst bands | `cta 5.9%` / `body 3.5%` | `cta 5.9%` / `body 3.5%` (unchanged) |

The deltas are +0.02…+0.18pp — noise. The binding bands are *blurred text /
content-volume* differences (seeded copy vs Figma placeholder), which is why the
worst-band values are byte-identical before and after. Two conclusions:
1. The states were **already** over 3% before any of this work; the earlier
   "all 12 green" claim did not hold at `final-honest`.
2. A 266px layout hole moved this metric by ~0.1pp. The `body` band is *defined*
   to span hero→content-bottom as one blurred unit, so a gap **inside** it is
   structurally invisible. Use `spacing-check.mjs` for spacing; the raster gate is
   only a coarse backstop for gross layout.

## Design-token divergence: gp-marketing scale ≠ the Figma (shadcn) scale

The Figma "Marketing Design System" file builds many components (e.g. the inline
"Pro Blocks / Tagline" persona/status pill) on the **shadcn token scale** — the
same scale gp-webapp uses, but **not** the one gp-marketing uses. Same class
names, different values, so copying a Figma class name into gp-marketing silently
renders the wrong thing.

Confirmed radius divergence:

| class | Figma / gp-webapp (shadcn) | gp-marketing (`src/ui/_styles/globals.css`) |
| --- | --- | --- |
| `rounded-sm` | 4px | 8px |
| `rounded-md` | 6px | 12px |
| `rounded-lg` | 8px | 16px |

gp-marketing has **no 6px radius token**, so matching a shadcn `rounded-md` (6px)
needs the arbitrary `rounded-[6px]` (that is why the Recent Experience / status
pills now use it). Shadows diverge too: Tailwind v4 `shadow-sm` is a stronger
two-layer shadow than Figma's `shadow/xs` (= `shadow-xs`, `0 1px 2px .05`).

Consequence for parity work: **map Figma tokens by VALUE, never by class name.**
The `/marketing-ui-clone` skill reads gp-marketing's own token values from
`src/ui/_styles/{globals,colors}.css` and resolves each Figma value against them
(exact → class; no match → arbitrary value + a flag added here).

**DECISION FOR THE TEAM (not a bug — do NOT do this on a feature branch):** should
gp-marketing adopt the shadcn/design-system token scale (a site-wide migration
touching every `rounded-*`/`shadow-*`), or is the heavier marketing scale
intentional? Until that is decided, parity work uses exact values for
shadcn-derived components. This section is the evidence base — append each new
"Figma value has no gp-marketing token" case as the loop finds it.

- **Hero band gradient blue `#26498f`** (ProfileHero, Figma frame A `1901:50311`:
  `linear-gradient(156.73deg, #0b1529 68.4%, #26498f 125.1%)`). RESOLVED: promoted
  to the `--goodparty-blue-bright` token (`hsl(220 58% 35%)`, == `#26498f`; a
  lighter, more-saturated member of the midnight family) in `_styles/colors.css`,
  and the gradient now references it. The stops were also re-fit (`--midnight-900`
  30% → `--goodparty-blue-bright`) because Figma's `68.4% / 125.1%` stops were
  measured on its full-height hero frame and pushed the blue off-canvas on our
  short 224px band, making it read as one flat color. Flag for design: bless
  `--goodparty-blue-bright` as an official token / sync it to Figma.

### Related infra bug: tailwind-merge drops font-size when combined with text color

The tailwind-merge used by the `Text` component / `cn` / `tv` slots does not
recognize gp-marketing's custom `text-*` **color** utilities (`text-midnight-900`)
or **size** utilities (`text-caption`, `text-body-2`, arbitrary `text-[…]`). It
therefore treats a text-size and a text-color on the same element as one
conflicting `text-*` group and keeps only the last (the color), **silently
dropping the size** — even with `text-[length:…]`/`text-[color:…]` type hints. This
is why the two hero pills rendered at 16px vs 12px until size and color were split
onto separate elements (`ProfileHero` `tag`/`tagText`/`pledgeTag`). Per-component
workaround: keep text-size and text-color on different elements. **Proper fix
(owner: design-system/tokens):** extend the tailwind-merge config with classGroups
for the custom `text-*` sizes and the brand color scales so they stop colliding.

<!-- Add rows as the loop uncovers genuine data gaps. Do NOT use this file to
     excuse real layout bugs — only true data/heatmap/chrome exceptions belong. -->
