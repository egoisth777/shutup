# Install

Shutup supports five targets.

| Target | Command | Installed form |
| --- | --- | --- |
| Claude Code | `claude plugin install shutup@shutup` | Native plugin hook, skills, commands |
| Codex | `npx shutup codex` | Fenced rules in `~/.codex/AGENTS.md`, commands in `~/.codex/prompts/` |
| Google Antigravity | `npx shutup agy` | Fenced rules when a verified local path exists |
| Pi | `npx shutup pi` | Fenced rules and commands when verified local paths exist |
| Oh My Pi | `npx shutup oh-my-pi` | Fenced rules and commands when verified local paths exist |

Run `npx shutup --list` to see detected targets and resolved paths. Unverified adapters are skipped with a warning; add `--strict` to make skips fail. Use `--dry-run` to preview writes and `--all --yes` for every detected target.

The installer replaces only content between `<!-- shutup-begin -->` and `<!-- shutup-end -->`. Reinstall is idempotent. It never changes existing legacy-fork artifacts.

Behavior is session-scoped and best-effort. Set `SHUTUP_OFF=1`, `SHUTUP_ULTRA=1`, or `SHUTUP_REINFORCE=1` before starting the agent. Use `/shutup` to re-assert style during a long session.

## Windows

Use Node directly or the PowerShell shim:

```powershell
node .\bin\install.js codex --dry-run
.\install.ps1 codex
```

## Uninstall

```sh
npx shutup <target> --uninstall
```

Uninstall removes Shutup-managed hooks, skills, commands, and marker blocks. Unrelated content remains.
