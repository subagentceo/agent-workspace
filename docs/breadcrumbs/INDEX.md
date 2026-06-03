# Breadcrumb Index — Every Object ID

## Cloudflare Account

| Key | Value |
|---|---|
| Account ID | `e6294e3ea89f8207af387d459824aaae` |
| Account name | Alex@jadecli.com's Account |
| Auth emails | `admin@jadecli.com`, `alex@jadecli.com`, `zhouk.alex@gmail.com` |
| workers.dev | **DISABLED** account-wide |
| Session cookie | `s=base64({email,ts})` — 24h expiry |
| Zone | `agentknowledgeworkers.com` |
| Zone ID | `ea55e090c620a2da4ec1dfa89872c7f8` |

## Live Workers

| Worker | URL | KV | Status |
|---|---|---|---|
| coworkers-agent | `agentknowledgeworkers.com` | `fb6b8ec36e00493dbd199c626d2c70f5` | ✅ LIVE |
| sandbox-agent | `sandbox.agentknowledgeworkers.com` | `cd31beacf6704b09b8962ba4cc963745` | ✅ LIVE (eval blocked) |
| gh-commit-relay | `tools.../relay` | `847586f6b96f4edd820f31814e9bcac8` | ✅ LIVE |
| repo-creator | `tools.../repo-creator` | same | ✅ LIVE |
| repo-verify | `tools.../verify` | same | ✅ LIVE |

## KV Namespaces

| Name | ID |
|---|---|
| coworkers-agent data | `fb6b8ec36e00493dbd199c626d2c70f5` |
| sandbox-agent data | `cd31beacf6704b09b8962ba4cc963745` |
| relay / tools | `847586f6b96f4edd820f31814e9bcac8` |
| **ke-memory-store** | `6db7fc3e28e04dc8bf85848faa369576` |

## Relay Details

| Key | Value |
|---|---|
| Job key | `commit-jobs` |
| Result key | `commit-results` |
| Secret store | `565244614fc34be7aa8488ce46112f60` |
| Secret name | `GITHUB_TOKEN` |
| Job shape | `{repo, path, message, branch, contentB64}` |

## Container (Firecracker microVM)

| Key | Value |
|---|---|
| DO ID | `8779a4fbeaba54e81591edd0234035d79df0826f04c561edadde75032305` |
| App ID | `08c9c460-5792-4faa-848c-c5b7a79b8a12` |
| OS | Alpine Linux 3.19, musl libc, x86_64 |
| Location | gig02, Brazil (SAM) |
| Kernel | `6.12.81-cloudflare-firecracker-2026.4.25` |
| Disk | 2 GB total |
| Swift | NOT installable (musl + disk) |

## GitHub Repos (org: subagentceo)

| Repo | Files | Notes |
|---|---|---|
| coworkers-native | 11 | iOS Swift source. Needs: ios-build.yml |
| xcode-ai | 3 | Xcode extension source |
| sandbox-agent | 4 | Deployed CF Worker |
| agent-workspace | this | Control plane (this repo) |
| knowledge-engineering | — | branch `claude/dreamy-noether-VEIgr` — managed_agents.py reference |
