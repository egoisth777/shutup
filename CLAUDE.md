# Shutup maintainer rules

## Repository shape

- `plugin/` is the single Claude plugin source: manifest, hooks, skills, commands.
- `bin/` is the installer. It targets exactly Claude, Codex, Google Antigravity, Pi, and Oh My Pi.
- `tests/` verifies installer, hook, security, and source-sync contracts.
- `evals/` measures behavior. Never publish fabricated, estimated, stale, or unrepeatable numbers.
- Root install scripts stay thin delegates to `bin/install.js`; preserve the Windows quoting fix from issue 249.

## Invariants

- Marketplace source is `./plugin`; never add a duplicate plugin tree.
- Hook rule constants are runtime source of truth. Skills point to them; do not duplicate rule bodies.
- Runtime performs no flag-file or config reads. SessionStart injects rules; optional reinforcement uses `SHUTUP_REINFORCE=1`.
- Managed instruction blocks use `<!-- shutup-begin -->` and `<!-- shutup-end -->`; reinstall replaces between markers.
- Behavior claims must say session-scoped and best-effort, never guaranteed always-on.
- Predictable user-owned paths require symlink-safe atomic writes: reject symlinks, write a private temporary file, then rename.
- Human skill docs live in `plugin/skills/<name>/README.md`; model instructions live in `SKILL.md`.

## Change process

Write or update tests before behavior changes. Run `npm test` after each modification. Keep package contents limited to `bin/`, `plugin/`, `README.md`, and `LICENSE`.
