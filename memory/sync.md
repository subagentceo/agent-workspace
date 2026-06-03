# Syncing the Memory Store

The live store is in Cloudflare KV (`6db7fc3e28e04dc8bf85848faa369576`). `memory/STORE.md`
is a mirror. Keep them in sync.

## Read live -> update mirror

```js
const KV = "6db7fc3e28e04dc8bf85848faa369576";
const keys = await cloudflare.request({ method:"GET",
  path:`/accounts/${accountId}/storage/kv/namespaces/${KV}/keys`, query:{ prefix:"memory:" }});
// GET each value, JSON.parse, read .content
```

## Update live (when a milestone changes)

Bump `version`, set `updated_at`, PUT back the memory record JSON.

## When to update

- A P0/P1 outcome flips state -> update `loop/architecture` + `STATE.md`.
- A new object created (worker, KV, repo) -> update `cloudflare/*` or `github/repos` + `breadcrumbs/INDEX.md`.
- A dead end proven -> record it so no future instance repeats it.
