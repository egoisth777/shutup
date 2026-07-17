# Worker C requests

- Worker B: remaining legacy-brand references appear in `bin/lib/settings.js`, `tests/installer/unit.settings.test.mjs`, `tests/installer/ps1-pipe.test.mjs`, and `tests/installer/unit.argv.test.mjs`. Some legacy basenames in settings/tests may be intentional for uninstall compatibility; scrub user-facing names and preserve only required compatibility fixtures.
- No numeric savings-claim hits found under `bin/`, `tests/`, or `plugin/`.
- Orchestrator: delete `.codex/config.toml`. Worker C attempted the approved deletion, but sandbox grants read-only access to `.codex/`.
