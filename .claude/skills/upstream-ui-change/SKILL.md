---
name: upstream-ui-change
description: Make a fix or feature in the shared @slauyama/ui (or @slauyama/hooks) package instead of this app, then bump the dependency here once it's released. Use whenever a bug or change is in a component/hook imported from @slauyama/ui or @slauyama/hooks, e.g. textarea text sits too high, dialog layering, button styling. Also use to resume, meaning "the ui PR merged, update the package here".
---

Two phases. Phase 1 ends at an open PR. Phase 2 runs after the user merges it.
If invoked to resume, check the PR state and skip ahead.

## Phase 1: change the ui repo

Repo: `slauyama/ui`, checked out as a sibling at `../ui` (default branch **master**).
Follow that repo's `CLAUDE.md`; it has its own conventions and commands.

1. Sync and branch:
   - `git -C ../ui checkout master`
   - `git -C ../ui pull`
   - `git -C ../ui checkout -b fix/<short-name>` (or `feat/`)
2. Reproduce in Storybook first. Find the component under `components/<name>/`
   and confirm the bug shows in its story. If it doesn't reproduce there, the
   cause is probably in how this app uses the component. Stop and fix it in
   personal-tracker instead.
3. Make the change and add or adjust a story if it covers a new state.
4. Run the ui repo's `verify-ui-change` skill steps (tsc, lint, vitest, build,
   real-browser screenshot). Don't skip the browser check.
5. Commit, push, and open the PR **with a release label**. Without one, merging
   publishes nothing:
   - `patch`: bug fixes and visual corrections (most cases)
   - `minor`: new props, variants, or components
   - `major`: breaking API changes
   - `gh pr create --repo slauyama/ui --base master --label patch ...`
6. Report the PR URL and stop. The user reviews and merges.

## Phase 2: after merge, bump here

1. Confirm it merged and released:
   - `gh pr view <n> --repo slauyama/ui --json state,mergedAt`
   - `gh run list --repo slauyama/ui --workflow on_pr_merged.yml --limit 1`.
     Wait for the `publish` job to succeed (`gh run watch <id> --repo slauyama/ui`).
   - `npm view @slauyama/ui version`. This is the new version.
2. In personal-tracker, branch from an up-to-date `main`
   (e.g. `update-ui-<version>`), then `npm install @slauyama/ui@^<version>`.
   Only `package.json` and `package-lock.json` should change.
3. `npm run lint` and `npm run build`. Then run the app and check the screen
   where the bug was reported, to confirm the fix shows up here.
4. Commit as `Update @slauyama/ui to <version>`, with a body explaining what
   changed and why it matters to this app (see commit 07176b2). Open a PR
   against `main`.

## @slauyama/hooks variant

Repo `slauyama/hooks`, sibling checkout `../hooks` (default branch **main**). It publishes on
every push to main and does **not** auto-bump. Bump `version` in its
`package.json` in the PR itself, or the publish fails. Phase 2 is the same with
`@slauyama/hooks`.
