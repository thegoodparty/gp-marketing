---
name: ship-pr
description: Open a PR on gp-marketing following GoodParty conventions and drive it to all-green — the delegate-reviewer bot approves and every CI check passes. Use when the user says "open a PR", "ship this", "ship it", "create a PR", or otherwise wants their change turned into an approved PR.
---

# Ship a PR and drive it to green

Take a finished, verified change and turn it into a PR that is ready to merge:
open it (Phase 1), get `delegate-reviewer[bot]` to `Approved.` (Phase 2), and get
every CI check green (Phase 3). Run autonomously. The person you are working with is
usually not an engineer, so **report progress in plain language** ("opened the PR,
waiting on the automated review", "the check is failing because X, fixing it") and
only stop to ask them about a genuine decision.

**Done means: at the same commit, delegate says `Approved.` AND every required
check is green.** You never merge — opening and driving to green is the job; the
human clicks merge.

Repo conventions (from the root `AGENTS.md`): PRs target **`develop`**. PR bodies
explain **why**, not a file-by-file what. **No** "test plan" section. **No**
`Co-Authored-By: Claude` and no "Created by Claude" footer.

## Pre-flight — verify before opening (do not skip)

This repo fails quietly, so a change that looks right can still be broken. Before
opening (and before pushing any fix later), confirm all three gates locally:

```bash
rm -f node_modules/.tsbuildinfo   # the tsc cache can hide real errors locally
bun run typecheck
bun run lint
bun run test
```

If you touched a `page.tsx` or `layout.tsx` (a route file), also be aware that
`next build` validates route/layout types that `tsc --noEmit` does not — those only
surface in the Vercel build (Phase 3). If any gate fails, fix it before opening; do
not open a PR you already know will be red.

## Phase 1 — open the PR

1. **Branch first if needed.** If you are on `develop`, create a short kebab-case
   feature branch before committing. Never commit to `develop`.
2. **Run pre-flight** (above). Pass -> continue. Fail -> fix, or if it is a
   pre-existing failure unrelated to this change, tell the user and let them decide.
3. **Open or attach.** If the branch already has an open PR, reuse it (go to
   Phase 2). Otherwise push and `gh pr create --base develop`. Write a why-focused
   body (the motivation and any tradeoff or behavior change), no test-plan section,
   no AI-authorship footer. Call out any change that alters what renders on the live
   site so a human can eyeball the Vercel preview.

## Phase 2 — converge with delegate

`delegate-reviewer[bot]` reviews the PR (the `pr-reviewer` check runs it). It posts
a GitHub review:

- Approved -> body is `Approved.`
- Blockers -> body starts with `**N blocker(s).**` and asks you to reply
  `delegate review` after fixing. Findings carry `<!-- delegate-finding-id: ... -->`
  markers; in-diff findings are inline comments, others live in the review body.

Loop (budget ~3 rounds):

1. **Get the review at the current HEAD.** Compare the latest delegate review's
   `commit_id` to the PR HEAD. If a review already exists at HEAD, use it. If not, a
   freshly opened PR auto-reviews (wait ~5 min; the agent is slow on large diffs);
   if you just pushed a fix, post an issue comment `delegate review` to trigger,
   then poll.
2. **Approved** -> go to Phase 3. **Blockers** -> read each finding (review body +
   inline comments).
3. **Triage each finding — comply by default, but verify first.** Read the cited
   code before acting.
   - If the finding is right, fix it.
   - If the finding is **verifiably wrong** against the actual code, do NOT apply it.
     Reply in the finding's comment thread with the evidence (quote the real types /
     code), then re-trigger. A well-reasoned rebuttal is usually accepted. Never
     "fix" working code just to satisfy the bot — especially if the suggested change
     would introduce a bug.
   - **Escalate to the user** (do not auto-apply) for high-blast-radius findings:
     schema/type changes that ripple across pages, anything touching the shared
     election data model, deleting behavior, or anything outside this change's scope.
4. **Apply, re-verify, loop.** Make the fixes, re-run pre-flight (never push a red
   tree), commit and push, then comment `delegate review` and go back to step 1.
   If you escalated or rebutted something, still push any real fixes, then either
   wait for the user (escalation) or re-trigger (rebuttal).

## Phase 3 — confirm every check is green

The checks on a gp-marketing PR are typically: **`Verify`** (typecheck + lint +
test), **`Vercel`** (build + deploy preview — the build also enforces types/lint and
validates route types), **`pr-reviewer`** (the delegate), and **`Cursor Bugbot`**.
All re-run on every push, so anchor on HEAD.

1. `gh pr checks <n>` to enumerate. A skipped check is not required.
2. Wait for pending checks to resolve (Vercel is the slow one; it static-generates
   many pages). Poll patiently.
3. **All green + delegate `Approved.` at the same HEAD -> done.** Report success in
   plain language and stop (do not merge).
4. **A check failing** -> pull the real failure (`gh run view --log-failed` for
   `Verify`; the Vercel inspect logs for the build). Fix what your change broke and
   re-verify; if it is a pre-existing or infra failure unrelated to your change,
   escalate rather than churn.

## Stop conditions

- Delegate `Approved.` and every required check green at the same HEAD -> success.
- 3 delegate rounds reached without approval -> hand back a summary (resolved,
  outstanding, rebutted) in plain language.
- A pre-flight failure you cannot resolve, an escalated finding, or a failure that
  is pre-existing / infra -> stop and tell the user, plainly, what is blocked and
  what their options are.

## Reporting to the user

Because the user is usually not an engineer: say what happened, not how. "Opened the
PR and the automated reviewer approved it; all checks are green, so it is ready for
you to merge" is the goal. If you rebutted a bad review finding or found a real bug
along the way, mention it in one plain sentence so they know.
