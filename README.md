# shutup

Shutup makes AI coding agents answer directly and briefly. Default `full` mode keeps normal grammar. Optional `ultra` mode uses fragments and stronger compression.

Before: “Certainly! Let me walk you through the approach, then summarize the result.”

After: “Use the existing parser. It already handles this case.”

Behavior is session-scoped and best-effort. Session-start injection restores it after startup, resume, clear, and compaction. Long sessions can drift; run `/shutup` to re-assert it.

## Install

Claude Code plugin:

```sh
claude plugin marketplace add egoisth777/shutup
claude plugin install shutup@shutup
```

Other supported CLIs:

```sh
npx shutup codex
npx shutup agy
npx shutup pi
npx shutup oh-my-pi
```

See [INSTALL.md](INSTALL.md) for paths, flags, and platform notes.

## Modes

- `SHUTUP_OFF=1` disables hook injection.
- `SHUTUP_ULTRA=1` enables ultra mode.
- `SHUTUP_REINFORCE=1` enables a small per-prompt reminder for long sessions.
- `/shutup full|ultra|off` changes style conversationally for the current session.

No numeric savings claim is made until the current behavior is measured with the `evals/` harness.

## Uninstall

```sh
npx shutup claude --uninstall
npx shutup codex --uninstall
claude plugin uninstall shutup@shutup
```

Shutup is forked from the original Caveman project by Julius Brussee.
