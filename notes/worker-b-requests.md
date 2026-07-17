# Worker B requests

- `plugin/hooks/shutup-activate.js` was absent while installer work began. `bin/install.js` includes a temporary `FULL_RULES` fallback; remove or leave only as an emergency guard after plugin hook exports `FULL_RULES` and `ULTRA_RULES`.
