# Hydration — Restoring Context After Compaction

If you are a fresh instance with no memory of this project, run these steps to fully
restore context. Everything needed is persisted; nothing depends on chat history.

## Step 1 — Read the memory store (authoritative state)

KV namespace `6db7fc3e28e04dc8bf85848faa369576` ("ke-memory-store") on Cloudflare account
`e6294e3ea89f8207af387d459824aaae`.

```js
const KV = "6db7fc3e28e04dc8bf85848faa369576";
const keys = await cloudflare.request({ method:"GET",
  path:`/accounts/${accountId}/storage/kv/namespaces/${KV}/keys`, query:{ prefix:"memory:" }});
for (const k of keys.result) {
  const v = await cloudflare.request({ method:"GET",
    path:`/accounts/${accountId}/storage/kv/namespaces/${KV}/values/${k.name}` });
  // JSON.parse(v.result).content holds the memory text
}
```

Store index: key `memory_store:ms_ke_ios_builder_loop`. Read paths in order:
project/mission, env/container-constraints, cloudflare/account, cloudflare/deployed-workers,
github/repos, tools/mobai, loop/architecture, hydration/instructions.

## Step 2 — Read this repo

- `README.md` — the map
- `docs/OUTCOMES.md` — what we are trying to achieve
- `docs/breadcrumbs/INDEX.md` — every object ID
- `ops/loop/STATE.md` — the current phase

## Step 3 — Re-probe tools if the container was reset

```bash
cd /tmp
git clone --depth 1 https://github.com/MobAI-App/ios-builder && rm -rf ios-builder/.git
git clone --depth 1 https://github.com/MobAI-App/mobai-mcp && rm -rf mobai-mcp/.git
apk add --no-cache go
cd /tmp/ios-builder && GOTOOLCHAIN=auto GOFLAGS=-mod=mod go build -o builder ./cmd/builder
cd /tmp/mobai-mcp && npm install && npm run build
```

## Step 4 — Do not re-attempt proven dead ends

- Local Swift compile (musl + 2 GB disk). Use GitHub Actions.
- In-Worker `eval()` (CF blocks it). Use Containers or browser.
- `workers.dev` URLs (disabled). Use zone routes on `agentknowledgeworkers.com`.

## Step 5 — Resume the loop

Pick up from the phase in `ops/loop/STATE.md`. The next action is always written there.
