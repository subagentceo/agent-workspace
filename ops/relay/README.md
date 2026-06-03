# gh-commit-relay — Pushing to GitHub Without a Local Token

The container has no GitHub credentials. All writes to GitHub go through the `gh-commit-relay`
Cloudflare Worker, which holds a `GITHUB_TOKEN` secret and proxies the GitHub Contents API.

## How it works

1. Write a JSON array of jobs to KV key `commit-jobs` (namespace `847586f6b96f4edd820f31814e9bcac8`).
2. `GET https://tools.agentknowledgeworkers.com/relay` — the Worker runs each job.
3. Read KV key `commit-results` for per-file status + commit SHAs.

## Job shapes

Inline (small files):
```json
{ "repo": "subagentceo/coworkers-native", "path": "Sources/CoworkersNative/Foo.swift",
  "message": "feat: add Foo", "branch": "main", "contentB64": "<base64>" }
```

KV-sourced (large files):
```json
{ "repo": "subagentceo/coworkers-native", "path": "src/big.js",
  "message": "feat: big file", "branch": "main", "source": "kv", "kvKey": "staged-big" }
```

## base64 helper (required)

```js
function b64(str){ const bytes=new TextEncoder().encode(str); let bin='';
  for(const b of bytes) bin+=String.fromCharCode(b); return btoa(bin); }
```

## The relay updates existing files

The relay GETs the current file SHA first and includes it on PUT, so re-pushing a path
updates it (does not 409). Safe to push the same file repeatedly across loop iterations.

## Companion workers

- `repo-creator` (`/repo-creator`) — creates a repo under the org + initial README.
- `repo-verify` (`/verify`) — lists repo files via the authenticated API.

## Verifying a push

`GET https://tools.agentknowledgeworkers.com/verify` returns, per repo, the file tree and
push timestamp — use it instead of unauthenticated api.github.com (which rate-limits the
container's shared egress IP).
