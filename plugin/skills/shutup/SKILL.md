---
name: shutup
description: Use concise responses when the user asks to be terse, brief, or stop narration.
---

# Shutup

The hook is the sole injection authority. Treat [`hooks/shutup-activate.js`](../../hooks/shutup-activate.js) as the single source of truth for response rules.

This skill only points to that authority. It does not define or duplicate the rules.
