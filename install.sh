#!/usr/bin/env bash
# patdown — frisk your diff before it ships.
# Installs the skill into every coding agent it can find. Safe to re-run.
#
#   curl -fsSL https://raw.githubusercontent.com/ryanda9910/friskeval/main/install.sh | bash
#
# Flags:  --project  also install into ./.claude (this repo only)
set -euo pipefail

RAW="https://raw.githubusercontent.com/ryanda9910/friskeval/main/skill/SKILL.md"
NAME="patdown"
PROJECT=0
[ "${1:-}" = "--project" ] && PROJECT=1

say() { printf '  %s\n' "$1"; }
fetch() {
  if command -v curl >/dev/null 2>&1; then curl -fsSL "$RAW"
  elif command -v wget >/dev/null 2>&1; then wget -qO- "$RAW"
  else echo "need curl or wget" >&2; exit 1; fi
}

echo "patdown — installing the diff pat-down skill"
SKILL="$(fetch)"
[ -n "$SKILL" ] || { echo "could not download SKILL.md" >&2; exit 1; }

installed=0

# Claude Code — native skill (the real home)
for base in "$HOME/.claude" "${XDG_CONFIG_HOME:-$HOME/.config}/claude"; do
  if [ -d "$base" ] || [ "$base" = "$HOME/.claude" ]; then
    mkdir -p "$base/skills/$NAME"
    printf '%s' "$SKILL" > "$base/skills/$NAME/SKILL.md"
    say "✓ Claude Code     $base/skills/$NAME/SKILL.md"
    installed=1
    break
  fi
done

# Project-local Claude skill (opt-in)
if [ "$PROJECT" = "1" ]; then
  mkdir -p ".claude/skills/$NAME"
  printf '%s' "$SKILL" > ".claude/skills/$NAME/SKILL.md"
  say "✓ This project     .claude/skills/$NAME/SKILL.md"
  installed=1
fi

# Other agents that read AGENTS.md / rules — drop a portable copy + a pointer.
# (Codex, Cursor, Gemini CLI, opencode, Aider, Copilot CLI, … all honor a rules file.)
for dir in "$HOME/.codex" "$HOME/.cursor" "$HOME/.config/opencode" "$HOME/.gemini"; do
  if [ -d "$dir" ]; then
    mkdir -p "$dir/patdown"
    printf '%s' "$SKILL" > "$dir/patdown/patdown.md"
    say "✓ $(basename "$dir")            $dir/patdown/patdown.md"
    installed=1
  fi
done

echo
if [ "$installed" = "1" ]; then
  say "Done. Your agent will pat down its own diffs before saying \"done\"."
  say "Force a check anytime with:  /patdown"
else
  say "No agents detected. Copy skill/SKILL.md into your agent's skills/rules dir."
fi
