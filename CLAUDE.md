# CLAUDE.md — `viucraft` JavaScript SDK

Guidance for Claude Code when working in this repo. This is one of three distinct repos in the VIUCraft workspace (see `../CLAUDE.md`). It is the **public, customer-facing npm package** — held to a higher bar than internal code, because every defect ships to every integrator and a bad URL or type silently breaks their app.

## Project Overview

`viucraft` is the official JavaScript/TypeScript SDK for the VIUCraft image-processing API. It is a **thin, zero-dependency client** over the backend REST API (`../viucraft/`, PHP/Symfony — the source of truth). The SDK holds no business logic of its own; its only job is to talk to that API **correctly** and present a clean, typed, ergonomic surface.

- **Package:** `viucraft` (unscoped, **public** on npm), currently **v2.1.0**, MIT.
- **Runtime:** Node.js **≥18** (relies on native `fetch`, `FormData`, `AbortController` — that's why there are zero runtime deps).
- **Also runs in browsers** (see `src/browser-example.html`) — keep it environment-agnostic; no Node-only APIs in shipped code.

## Technology Stack

- **Language:** TypeScript (strict). Target `es2020`, `moduleResolution: bundler` (`tsconfig.json`).
- **Build:** `tsup` (esbuild) → dual **CJS + ESM** with `.d.ts`/`.d.mts`, sourcemaps, tree-shaking (`tsup.config.ts`).
- **Tests:** **Jest** + `ts-jest` (`jest.config.ts`), `testEnvironment: node`, coverage gate **80%** global.
- **Package manager:** **npm** (this repo uses `package-lock.json` + `npm ci`, unlike the pnpm sibling repos — do not introduce pnpm here).
- **Runtime dependencies:** **none, by design.** This is a hard invariant (see Quality Gates).

## Architecture

The public surface is whatever `src/index.ts` exports — nothing else is API.

```
src/
├── index.ts                    # Public API barrel — the ONLY exported surface
├── client/
│   ├── ViucraftClient.ts       # Main entry. Holds config + namespaced resources + image() builder
│   └── FetchClient.ts          # HTTP layer: native fetch, AbortController timeout (30s default),
│                               #   429 retry w/ Retry-After + exponential backoff, error mapping
├── builder/
│   └── ImageBuilder.ts         # Chainable transform-URL builder (NO network) — client.image(id)
├── resources/                  # One class per API namespace (client.<name>.<method>())
│   ├── ImagesResource.ts       # upload, delete, list, ...
│   ├── BatchResource.ts        DiscoveryResource.ts   PresetsResource.ts
│   ├── WebhooksResource.ts     WarmSetsResource.ts    AnalyticsResource.ts   UsageResource.ts
├── errors.ts                   # Typed error hierarchy (see below)
├── types.ts                    # All request/response + config types
├── utils.ts                    # formatProcessingInstructions / formatShortInstructions (URL grammar)
├── validation.ts               # Client-side param validation (throws ViucraftValidationError)
└── __tests__/                  # Jest specs, colocated by unit; helpers/mockFetch.ts
```

**Two usage modes (both must always work):**

```ts
import { ViucraftClient } from 'viucraft';

const client = new ViucraftClient({ apiKey, subdomain });   // paid tier
// or: const client = await ViucraftClient.create({ apiKey }); // resolves endpoint first (v2.1)

// 1. URL builder — pure, no network, no await:
const url = client.image(imageId).resize(800, 600).setFormat('webp').toURL();

// 2. API calls — namespaced resources, async:
const { image_id } = await client.images.upload(blobOrFile);
await client.images.delete(image_id);
```

**Config** (`ViucraftClientConfig` in `src/types.ts`): `apiKey` (required), `subdomain` (paid), `accountId` (free tier → `/free/acc_*` URLs), `baseUrl`, `enforceHttps`, `timeout`, `retry`. Config is **mutable at runtime** so the client can self-heal after a plan change — `resolveEndpoint()` (or the `create()` factory) fetches `GET /api/v1/account` and, after a paid→free downgrade (`subdomain: null`), switches URL generation to the shared free-tier form. Don't cache the subdomain elsewhere.

**Error hierarchy** (`src/errors.ts`) — all extend `ViucraftError` (carries `code`, `status?`, `rateLimit?`, `responseData?`):
`ViucraftValidationError` (client-side, has `parameterName`), `ViucraftRateLimitError` (429, `retryAfter`), `ViucraftNetworkError`, `ViucraftTimeoutError` (`timeoutMs`). Every error class re-sets its prototype (`Object.setPrototypeOf`) so `instanceof` works after transpile — preserve that pattern in any new error.

## The Shared API Contract (why correctness is everything here)

The backend defines the contract; this SDK and `../viucraft-cli/` consume it. The SDK's whole value is encoding it **exactly**:

- **Auth:** `X-API-Key` header. Keys are `vc_live_*` / `vc_test_*`.
- **Delivery URL grammar:** `https://{subdomain}.viucraft.com/{operations}/{image-id}.{ext}` — the **extension is mandatory** (a bare `/{id}` → **405**). Free tier: `https://viucraft.com/free/acc_{accountId}/{operations}/{id}.{ext}`.
- **Operation formats:** standard underscore (`resize_width_800_height_600`) vs short dash (`resize-800-600`), produced by `utils.ts`. ⚠️ The server does **not** accept the dash form for every op (e.g. `smartcrop`/`thumbnail` only serve the underscore form) — see Known Defects.
- **`image_id` is the canonical handle; `filename` is not** (original upload name, collision-prone). Never key on `filename`.

**When the backend changes the contract** (endpoint, response shape, URL grammar, error code, key format), this SDK and the CLI must be updated to match — coordinated, in the same body of work. Each repo commits independently (no root git). The authoritative contract reference is `../.planning/codebase/INTEGRATIONS.md` and the backend itself.

---

## 🔒 Quality Gates

This is a published package: **green tests are necessary but not sufficient.** A gate that passes against a wrong contract is a liability. Run the full gate before every commit; never weaken a gate to make a commit pass.

### Gate 1 — Build (must produce a complete dual-format package)
```bash
npm run build
# Then verify all four artifacts exist (this is exactly what release CI checks):
test -f dist/index.js && test -f dist/index.mjs && test -f dist/index.d.ts && test -f dist/index.d.mts
```

### Gate 2 — Typecheck (strict, zero errors)
```bash
npx tsc --noEmit
```
`tsconfig.json` has `strict: true`. No `any` leaking into the public surface — use `unknown` + narrowing. Every public symbol must carry accurate types and TSDoc.

### Gate 3 — Tests + coverage
```bash
npm test                 # all green
npm run test:coverage    # must stay ≥ 80% (jest.config.ts coverageThreshold)
```
**Never lower `coverageThreshold` to pass.** World-class target: drive toward **90%+** and require a test for every new public method, every error path, and every URL-grammar branch. Tests mock HTTP via `src/__tests__/helpers/mockFetch.ts` — never hit the live API in unit tests.

### Gate 4 — Zero-runtime-dependency invariant
```bash
node -e "const p=require('./package.json'); if(p.dependencies && Object.keys(p.dependencies).length){console.error('FAIL: runtime deps added:',p.dependencies);process.exit(1)} console.log('OK: zero runtime deps')"
```
The package's headline feature is **zero deps**. Anything needed must be a `devDependency` or use a Node/web built-in. Adding a runtime dependency is a deliberate, reviewed, semver-minor decision — not a default.

### Gate 5 — Public-surface discipline
- Any new export **must** be added to `src/index.ts` and have TSDoc. If it's not in `index.ts`, it's not public and tests/docs shouldn't imply it is.
- Removing/renaming/changing the type of any `index.ts` export is a **breaking change** → major bump + `MIGRATION.md` entry. Treat the export list as the API contract.

### Gate 6 — Contract fidelity (the gate that makes this world-class)
The SDK's output must be **valid against the live server**, not merely self-consistent. Before shipping any change to `ImageBuilder.ts`, `utils.ts`, or `validation.ts`:
- Generated URLs must contain **no `//`**, must include the mandatory extension, and must use a grammar the server accepts **for that specific op**.
- A unit test must assert the exact string for each affected op — and that assertion must match what the API returns 200 for, not what the builder happens to emit today.
- See `docs/VIUCRAFT-INTEGRATION-FEEDBACK.md` (workspace) for the real-world failures this gate exists to prevent.

### Release gates (tag-driven)
Publishing is automated on a `sdk-v<version>` git tag (`.github/workflows/sdk-release.yml`): test matrix (Node 18/20/22) → build + dist check → `npm publish --access public`. The publish job **fails if `package.json` version ≠ tag version**. So a release requires, in order:
1. Update `package.json` `version` (semver: breaking→major, feature→minor, fix→patch).
2. Update `CHANGELOG.md` (Keep a Changelog format) and, for breaking changes, `MIGRATION.md`.
3. Commit, then tag `sdk-v<version>` to match exactly.

---

## ⚠️ Known Defects — fix-and-regress (do NOT trust the current green suite)

These are confirmed live in **v2.1.0**. The test suite currently passes *because it encodes the bug* — fixing the code requires fixing the test, not the other way around.

1. **Double-slash on no-op canonical URLs (P1, ships 405s).** `ImageBuilder.toURL()` builds `` `${baseUrl}/${formattedInstructions}/${id}.${fmt}` ``; with no operations chained, `formattedInstructions` is `''`, yielding `https://sub.viucraft.com//{id}.ext` → **405** in production. **`src/__tests__/ImageBuilder.test.ts:16` asserts the broken `//` output as correct** — that test locks in the bug. Fix: omit the empty operations segment when there are no instructions, and rewrite that test to assert the single-slash canonical URL the server returns 200 for.

2. **`crop()` lower-bound validation is dead (P2).** In `ImageBuilder.crop()`: `validateRange('height', height, height, MAX_DIMENSION)` — the min bound is `height` itself, so the lower-bound check can never fail. Should be `validateRange('height', height, 1, MAX_DIMENSION)`.

3. **`useShort` grammar — `noise` order mismatch (FIXED 2026-06-16).** The audit suspected `smartcrop`/`thumbnail` dash-forms returned 400; a live URL contract test against a staging tenant (`scripts/url-contract-test.mjs`) **disproved that** — `scrop-W-H`, `thumb-W-H`, and `thumb-W-H-crop` all return 200. The real defect was `noise`: the server's dash parser maps `noise-<amount>-<type>` (amount first, per the backend `SHORT_FORMAT_MAP`), but the SDK emitted `noise-<type>-<amount>`, so `noise-gaussian-0.2` → 400. `utils.ts` now emits the explicit long form for `noise` in short mode (server-valid for any params). Two bug-locking tests were corrected. Re-run the contract test after any `utils.ts`/`ImageBuilder.ts` change.

Treat any new code in these files as guilty until a contract-fidelity test (Gate 6) proves it innocent.

---

## Coding Conventions

- ESM-first source, strict TS, no `any` in public types. TSDoc on every public method (explain the *why* / the non-obvious contract bit, like "extension is mandatory").
- Builder methods return `this` for chaining and validate eagerly (throw `ViucraftValidationError` with a precise `parameterName`).
- All network I/O goes through `FetchClient` — never call `fetch` directly from a resource.
- Keep it isomorphic: no `node:*` imports, no `Buffer`, no filesystem in shipped code (uploads take `Blob | File`).
- Don't log secrets — there's a masked-key helper for safe logging; use it.

## Gaps to close to reach "world-class" (currently missing — wire these up)

The bar above is enforceable only partway today. To fully close it, add (each is low-effort, high-leverage):
- **Lint + format:** no ESLint or Prettier config exists. Add ESLint (flat config) + `typescript-eslint` + `eslint-config-prettier` and a `lint`/`format:check` script, then make them Gate 0. Match the CLI repo's setup (`../viucraft-cli/eslint.config.js`).
- **`typecheck` script:** add `"typecheck": "tsc --noEmit"` so Gate 2 is a named script, not tribal knowledge.
- **CI on PRs/pushes:** the only workflow (`sdk-release.yml`) runs **only on `sdk-v*` tags** — meaning nothing is tested until release. Add a `ci.yml` that runs lint + typecheck + test + build on every push/PR (Node 18/20/22).
- **Publint / are-the-types-wrong:** add `npx publint` and `attw` to the release gate to catch ESM/CJS/types export mistakes before npm.
- **API-surface snapshot:** consider `@microsoft/api-extractor` (or a committed `index.d.ts` snapshot test) so accidental public-API changes fail CI (enforces Gate 5 automatically).

When you add these, update this file to promote them from "gaps" to enforced gates.
