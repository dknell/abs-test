# Engineering Standards

> **This document is the build contract for AI software development agents.**
> If you are an agent working in this repository, read this top to bottom before
> you touch code. The build pipeline (`.agent-pipeline/config.yml`) points here as
> the single source of truth for *how* to build. When this document and your own
> judgment disagree, this document wins. When this document is silent, follow the
> existing patterns in the codebase.

---

## 1. How to use this document

- Rules marked **MUST** / **MUST NOT** are non-negotiable. A change that violates
  one of them is not "done," even if it works.
- Rules marked **SHOULD** are strong defaults. Deviate only with a stated reason
  in the PR description.
- Everything else is guidance — apply taste and match the surrounding code.
- If a requirement here is genuinely ambiguous or seems wrong for the task, **stop
  and ask** rather than guessing (see §12).

---

## 2. Tech stack

| Concern            | Choice                                   | Notes |
| ------------------ | ---------------------------------------- | ----- |
| Language           | **TypeScript** (`strict: true`)          | No plain `.js`/`.jsx` in app code. |
| Framework          | **Next.js** (App Router)                 | Server Components by default. |
| UI library         | **React 18+**                            | Function components + hooks only. |
| Styling            | **Tailwind CSS**                         | Utility-first; tokens over magic numbers. |
| Package manager    | **pnpm** (workspaces)                    | `npm` and `yarn` are forbidden. |
| Monorepo runner    | **Turborepo**                            | All build/test/lint go through `turbo`. |
| Unit/component test| **Vitest** + **React Testing Library**   | Behavior, not implementation. |
| End-to-end test    | **Playwright**                           | Critical user flows only. |
| Lint / format      | **ESLint** (`next/core-web-vitals`) + **Prettier** | Prettier owns formatting; ESLint owns correctness. |
| Commits            | **Conventional Commits**                 | See §10. |

You **MUST NOT** introduce a new framework, language, package manager, test
runner, or styling system without an explicit instruction to do so.

---

## 3. Repository layout

This is a Turborepo + pnpm workspace. Respect the boundaries:

```
.
├── apps/
│   └── web/                      # The Next.js application
│       ├── app/                  # App Router routes, layouts, pages,
│       │                         #   globals.css, and co-located *.test.tsx
│       ├── components/           # App-specific components (add as needed)
│       ├── lib/                  # App-specific utilities/data access (add as needed)
│       ├── e2e/                  # Playwright end-to-end specs (*.spec.ts)
│       ├── public/               # Static assets
│       ├── postcss.config.mjs    # Tailwind v4 PostCSS plugin
│       ├── vitest.config.ts      # Vitest (unit/component) config
│       ├── vitest.setup.ts       # jest-dom matcher registration
│       └── playwright.config.ts  # Playwright (E2E) config
├── packages/
│   ├── ui/                       # Shared React components            (@repo/ui)
│   ├── eslint-config/            # Shared ESLint flat config (@repo/eslint-config)
│   └── typescript-config/        # Shared tsconfig bases (@repo/typescript-config)
├── .agent-pipeline/              # Pipeline config — PROTECTED, do not edit (§11)
├── turbo.json                    # Turborepo task graph
├── pnpm-workspace.yaml           # Workspace + allowed build scripts
├── .nvmrc                        # Pinned Node version
├── .prettierrc.json              # Prettier config
└── STANDARDS.md                  # This file
```

Rules:
- Code shared by more than one app **MUST** live in `packages/*`, not be copied.
- An app **MUST NOT** import from another app. Cross-cutting code goes in a package.
- Reusable, generic, presentational components belong in `packages/ui`.
  App-specific components belong in `apps/web/components`.
- Shared lint and TypeScript settings live in `packages/eslint-config` and
  `packages/typescript-config`; extend those rather than redefining config per app.
- **Styling/Tailwind** is configured CSS-first (Tailwind v4): the entry point is
  `apps/web/app/globals.css` (`@import "tailwindcss"`) with `postcss.config.mjs`.
  There is no `tailwind.config.js`.
- Reference workspace packages by their package name (e.g. `@repo/ui`), never by
  relative path across package boundaries.

---

## 4. Environment & commands

- **Node:** use the version pinned in `.nvmrc`. The `engines` field in
  `package.json` is authoritative; do not bump it casually.
- **Install:** `pnpm install` (uses the committed `pnpm-lock.yaml`).
- **You MUST keep `pnpm-lock.yaml` in sync** with `package.json` changes and commit it.

Canonical pipeline commands (these are exactly what the build agent runs — see
`.agent-pipeline/config.yml`). Treat them as the definition of "green":

```bash
pnpm turbo run build    # production build of all workspaces
pnpm turbo run test     # full test suite
pnpm turbo run lint     # ESLint + typecheck
```

Useful local commands:

```bash
pnpm dev                            # run the Next.js app in dev mode
pnpm turbo run test --filter=web    # scope a task to one workspace
pnpm --filter web add <pkg>         # add a dependency to a specific workspace
```

You **MUST NOT** invoke `next`, `vitest`, `eslint`, etc. directly as the
acceptance signal — the pipeline runs them through `turbo`, and that is what gates
your change.

---

## 5. Coding standards

### TypeScript
- **MUST** keep `strict` mode satisfied. No `// @ts-ignore`, no `// @ts-nocheck`.
- **MUST NOT** use `any`. Use `unknown` + narrowing, generics, or a real type.
- **SHOULD** prefer `type` aliases for unions/props and `interface` for
  extendable object contracts. Be consistent within a file.
- Export types alongside the code that owns them; avoid a global "types dumping ground."

### React / Next.js (App Router)
- **Server Components by default.** Add `"use client"` only when the component
  needs state, effects, browser APIs, or event handlers — and keep the client
  boundary as small and as low in the tree as possible.
- **MUST NOT** put secrets, tokens, or server-only logic in a client component.
  Server-only modules **SHOULD** use `import "server-only"` to enforce this.
- Data fetching happens in Server Components / route handlers (§7), not in
  `useEffect` waterfalls.
- One component per file. Components are function components; no class components.
- Co-locate a component's styles, tests, and subcomponents with it.

### Naming & files
- Components: `PascalCase` filenames (`UserCard.tsx`).
- Hooks: `useThing.ts`. Non-component utilities: `camelCase.ts`.
- Route segments follow Next.js conventions (`page.tsx`, `layout.tsx`,
  `loading.tsx`, `route.ts`).
- Name things for what they do, not how they're built. No abbreviations that a
  newcomer wouldn't recognize.

### General
- Small, focused modules. If a file is doing two jobs, split it.
- No dead code, no commented-out blocks, no leftover `console.log`.
- Handle errors explicitly; never swallow a caught error silently.

---

## 6. Styling (Tailwind)

- **MUST** style with Tailwind utility classes. No inline `style={{…}}` except for
  truly dynamic values (e.g. a computed transform).
- **MUST NOT** hard-code colors, spacing, or font sizes that bypass the Tailwind
  theme — use theme tokens so the design system stays coherent.
- Extract a component (or a `packages/ui` component) instead of copy-pasting the
  same long className string in three places.
- Use the `cn()` / `clsx` helper for conditional classes; don't build class
  strings with template-literal `if`-soup.

---

## 7. Data fetching & state

- **Fetch on the server first.** Read data in Server Components or route handlers
  (`app/**/route.ts`); pass it down as props.
- Reach for client state only for genuinely interactive UI (forms, toggles,
  optimistic updates). Keep it local; lift state only when shared.
- **MUST NOT** add a global state-management library for state that
  `useState`/`useContext` or the server can already handle. Justify any such
  dependency in the PR.
- All external/network access goes through a typed function in `lib/` (or a
  package), never an ad-hoc `fetch` scattered through components.

---

## 8. Testing — TDD-first (REQUIRED)

This repo is **test-driven**. The acceptance gate is `per-issue`, and every issue
ships with tests written *before* the implementation.

**The workflow you MUST follow for each behavior change:**
1. **Red** — write a failing test that describes the desired behavior. Run it;
   confirm it fails for the right reason.
2. **Green** — write the minimum code to make the test pass.
3. **Refactor** — clean up with the tests still green.

Rules:
- Every behavior change **MUST** be covered by a test. No new behavior merges
  without a test that would fail if the behavior regressed.
- **MUST NOT** delete, skip (`.skip`), or weaken a test to get the suite green.
  Fix the code, or — if the test is genuinely wrong — fix the test and say so in
  the PR.
- Test **behavior, not implementation.** Query the DOM the way a user would
  (roles, labels, text) via React Testing Library. Avoid asserting on internal
  state or snapshotting large trees.
- **Layers:**
  - *Unit/component* (Vitest + RTL) — the default; cover logic and component behavior.
  - *Integration* — for module interactions and route handlers.
  - *E2E* (Playwright) — reserve for critical end-to-end user flows; keep it lean.
- New or changed code **SHOULD** keep meaningful coverage; don't chase a coverage
  number with assertion-free tests.

---

## 9. Definition of Done

A change is done only when **all** of these are true:

- [ ] Tests were written first and now pass.
- [ ] `pnpm turbo run lint` is green (ESLint + typecheck, zero errors).
- [ ] `pnpm turbo run test` is green (no skipped/disabled tests added).
- [ ] `pnpm turbo run build` succeeds.
- [ ] `pnpm-lock.yaml` is committed and in sync.
- [ ] The change is scoped to the issue — no unrelated refactors riding along.
- [ ] No protected path was modified (§11) and no forbidden pattern was introduced.
- [ ] PR description explains *what* and *why*, and notes any `SHOULD` deviations.

If any box is unchecked, the work is **not** done — keep going or ask.

---

## 10. Git & PR conventions

- **Branches:** `type/short-description` (e.g. `feat/user-profile-card`,
  `fix/login-redirect`).
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/) —
  `feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`. One logical change per
  commit; imperative mood.
- **PRs:** keep them small and reviewable. State the intent and the testing done.
  A PR that touches dozens of files for one issue is a smell — split it.
- **MUST NOT** force-push over shared history or rewrite `main`.
- **MUST NOT** commit secrets, `.env` files, or generated build artifacts.

---

## 11. Guardrails (protected paths & policy gate)

These mirror `.agent-pipeline/config.yml`. The pipeline enforces them, but you are
expected to respect them *before* it has to.

**Protected paths — MUST NOT modify without an explicit human instruction:**
- `.github/**` (CI/CD workflows)
- `infra/**` (infrastructure)
- `.agent-pipeline/**` (the build pipeline config itself)

**Forbidden patterns — MUST NOT introduce:**
- `DROP TABLE`
- `DELETE FROM` without a `WHERE` clause

More generally:
- **MUST NOT** add destructive or irreversible operations (data deletion, schema
  drops, bulk mutations) without explicit instruction and a safeguard.
- **Secrets** come from environment variables, never source. Reference
  `process.env.*` server-side only; never expose a secret to the client bundle
  (anything not prefixed `NEXT_PUBLIC_` stays server-side — and secrets must never
  be `NEXT_PUBLIC_`).
- **MUST NOT** weaken auth, validation, or escaping to make something pass.
- Treat all user input as untrusted: validate and sanitize at the boundary.

---

## 12. When blocked or ambiguous

Do **not** guess your way past uncertainty. Instead:

- If requirements are ambiguous, the chosen approach conflicts with this document,
  or a task would require touching a protected path — **stop and ask** the
  requester before proceeding.
- If a test is failing for a reason you don't understand, investigate the root
  cause; do not paper over it by deleting or skipping the test.
- If you must make a non-obvious assumption to keep moving, state it explicitly in
  the PR description so a human can correct it.
- Prefer the smallest change that satisfies the issue. Leave the codebase cleaner
  than you found it, but don't expand scope on your own initiative.
