# Install

## One line

```bash
# macOS / Linux / WSL
curl -fsSL https://raw.githubusercontent.com/ryanda9910/friskeval/main/install.sh | bash
# Windows (PowerShell)
irm https://raw.githubusercontent.com/ryanda9910/friskeval/main/install.ps1 | iex
```

Idempotent — re-run to update. Needs `curl` or `wget` (macOS/Linux); no other deps.

## Where it installs

| Agent | Location |
|---|---|
| **Claude Code** (native skill) | `~/.claude/skills/friskeval/SKILL.md` |
| Codex | `~/.codex/friskeval/friskeval.md` |
| Cursor | `~/.cursor/friskeval/friskeval.md` |
| Gemini CLI | `~/.gemini/friskeval/friskeval.md` |
| opencode / Aider / Copilot CLI | manual (paste into the rules file) |

## Global vs project

- **Global** (default) — home agent dirs; applies to every repo.
- **Project** — add `-- --project` (sh) / `-project` (ps1) to also install into
  `./.claude/skills/friskeval/SKILL.md` so the skill travels with the repo.

## Manual

```bash
mkdir -p ~/.claude/skills/friskeval
cp skill/SKILL.md ~/.claude/skills/friskeval/SKILL.md
```

## Uninstall

```bash
rm -rf ~/.claude/skills/friskeval ~/.codex/friskeval ~/.cursor/friskeval ~/.gemini/friskeval
```
