# gh-commit-relay

How to push files to GitHub with no local token.

## URL: `https://tools.agentknowledgeworkers.com/relay`

- GET → runs the commit-jobs queue → returns `ok`
- KV namespace: `847586f6b96f4edd820f31814e9bcac8`
- Job key: `commit-jobs` (JSON array), Result key: `commit-results`

## Job format

```json
[{"repo":"subagentceo/REPO","path":"path/file.txt","message":"commit msg","branch":"main","contentB64":"..."}]
```

## b64 helper (required — plain btoa breaks on non-Latin1)

```js
function b64(str){const bytes=new TextEncoder().encode(str);let bin='';for(const b of bytes)bin+=String.fromCharCode(b);return btoa(bin);}
```

## Full procedure

1. Write jobs to KV (via Cloudflare API:execute)
2. `curl -s https://tools.agentknowledgeworkers.com/relay`
3. Read KV key `commit-results` to verify (status 201=created, 200=updated)

## Result shape

```json
{"at":"...","results":[{"path":"...","status":201,"commit":"abc12345","ok":true}]}
```
