# personal-tracker

React + Vite + Firebase app. UI is built on two packages I own and publish to
GitHub Packages (`@slauyama:registry=https://npm.pkg.github.com`).

## Where a change belongs

Before editing, decide which repo owns the behavior. Don't patch around a
shared-package bug in this repo.

| Symptom is in…                                                                                                                          | Fix it in                                   |
| --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| A component imported from `@slauyama/ui` (TextField/textarea, Dialog, Button, Select, Tabs, Card, Text, etc.), its styling, tokens, or theme CSS | **`slauyama/ui`** (`../ui`), then bump here |
| A hook imported from `@slauyama/hooks`                                                                                                  | **`slauyama/hooks`** (`../hooks`), then bump here |
| How this app *uses* a component (props passed, layout around it, app-specific wrappers in `src/components/ui/`)                         | this repo                                   |
| Pages, data, Firebase, routing, business logic                                                                                          | this repo                                   |

The shared repos are expected as sibling checkouts of this one. If `../ui` or
`../hooks` is missing, clone it there (`gh repo clone slauyama/ui ../ui`).

`src/components/ui/` holds app-local wrappers, not the shared library — check
the import path, not the folder name.

Rule of thumb: if the bug would reproduce in the ui repo's Storybook with
default props, it belongs in the ui repo. If it only happens because of how
this app composes or overrides a component, fix it here.

For changes that belong upstream, use the `upstream-ui-change` skill. It does
the change in the ui (or hooks) repo, opens the PR, and after it merges and
publishes, bumps the version here.

## Commands

- `npm run dev` — Vite dev server
- `npm run lint` — eslint + tsc
- `npm run build`
