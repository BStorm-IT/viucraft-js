# Viucraft SDK — AI Agent Reference

This project uses [`viucraft`](https://www.npmjs.com/package/viucraft), the official
JavaScript/TypeScript SDK for the **Viucraft** image-processing & transformation API.
This file is a quick reference for AI coding assistants working in a project that
integrates the SDK. The backend REST API is the source of truth; the SDK is a thin,
zero-dependency, fully-typed client over it.

## Install

```bash
npm install viucraft        # Node >=18 (uses native fetch/FormData/AbortController)
```

Also runs in browsers — the SDK is environment-agnostic (no Node-only APIs in shipped code).

## Authentication

- Header: `X-API-Key: <key>`.
- Keys are `vc_live_*` (live) or `vc_test_*` (test). The SDK sets the header for you.
- Never hardcode or log full keys. Get a key at https://viucraft.com/dashboard/api-keys.

## Two usage modes (both always available)

```ts
import { ViucraftClient } from 'viucraft';

// Paid tier — you have a dedicated subdomain:
const client = new ViucraftClient({ apiKey, subdomain });

// Or resolve the endpoint automatically (handles free vs paid):
const client = await ViucraftClient.create({ apiKey });
```

**1. URL builder — pure, synchronous, no network, no `await`:**

```ts
const url = client.image(imageId).resize(800, 600).setFormat('webp').toURL();
```

**2. API resources — namespaced, async:**

```ts
const { image_id } = await client.images.upload(blobOrFile); // Blob | File
await client.images.delete(image_id);
```

Resource namespaces: `images`, `batch`, `discovery`, `presets`, `webhooks`,
`warmSets`, `analytics`, `usage` (e.g. `client.<name>.<method>()`).

## Config (`ViucraftClientConfig`)

`apiKey` (required), `subdomain` (paid tier), `accountId` (free tier → `/free/acc_*` URLs),
`baseUrl`, `enforceHttps`, `timeout` (default 30s), `retry`. Config is mutable at runtime so
the client self-heals after a plan change — don't cache the subdomain elsewhere.

## Delivery URL grammar

```
Paid:  https://{subdomain}.viucraft.com/{operations}/{image-id}.{format}
Free:  https://viucraft.com/free/acc_{accountId}/{operations}/{image-id}.{format}
```

- **The file extension is mandatory.** A bare `/{image-id}` returns 405.
- `image_id` (a UUID) is the canonical handle. Never key on `filename` (collision-prone).
- Operation chains use one of two grammars:
  - Standard (underscore): `resize_width_800_height_600/quality_value_85`
  - Short (dash): `resize-800-600/q-85`
- ~35 operations are supported (resize, crop, sharpen, thumbnail, tint, gray, …).

## Error handling

All errors extend `ViucraftError` (carries `code`, `status?`, `rateLimit?`, `responseData?`):

- `ViucraftValidationError` — client-side validation (has `parameterName`).
- `ViucraftRateLimitError` — HTTP 429 (has `retryAfter`); the client auto-retries with backoff.
- `ViucraftNetworkError` — transport failure.
- `ViucraftTimeoutError` — request exceeded `timeout` (has `timeoutMs`).

`instanceof` works on every error class after transpile.

## Related tools

- **MCP server:** `npx viucraft-mcp` — exposes Viucraft as Model Context Protocol tools.
- **CLI:** `@viucraft/cli` — `npm install -g @viucraft/cli`.
- **Docs:** https://viucraft.com/docs
