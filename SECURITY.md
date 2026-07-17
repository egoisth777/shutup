# Security policy

Only the latest stable release receives security fixes. Report vulnerabilities through [GitHub private vulnerability reporting](https://github.com/egoisth777/shutup/security/advisories/new), not a public issue.

## Installer writes

Shutup writes hooks, commands, skills, and fenced instruction blocks only for selected targets. Predictable user-owned paths are hostile inputs: every write must reject symlink targets and symlinked parents, use a private temporary file with mode `0600`, and atomically rename it into place. Validation failure must leave the original file unchanged.

The installer preserves content outside Shutup markers and never migrates or removes legacy-fork artifacts. Use `--dry-run` to inspect planned changes.

## Privacy

Runtime hooks make no network requests. Installation may invoke package, GitHub, or agent-plugin tooling requested by the user. Shutup collects no telemetry, credentials, prompts, or source files.
