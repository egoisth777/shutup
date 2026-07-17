---
description: Select or disable the concise response style
argument-hint: [full|ultra|off]
---

# /shutup

Select the response style through environment variables before starting Claude Code:

- Full (default): leave `SHUTUP_ULTRA` and `SHUTUP_OFF` unset.
- Ultra: set `SHUTUP_ULTRA=1`.
- Off: set `SHUTUP_OFF=1` (or `SHUTUP_DISABLE=1`).
- Per-prompt reminder: set `SHUTUP_REINFORCE=1`.

Environment changes take effect when the hook process next runs. Restart the session when the host does not propagate environment changes to running processes.
