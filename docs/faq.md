# FAQ

### What is this, exactly?

A skill (plain instructions) your coding agent follows. It adds no network calls,
no telemetry, no account — your code goes wherever your agent already sends it and
nowhere new.

### How is it different from a linter / CLI tool?

A linter checks code syntax; friskeval checks **routing** — whether your skill
descriptions collide or one claims another's domain. It runs deterministic TF-IDF over
the descriptions (no LLM call, no tokens), so it is repeatable and CI-safe, but the
agent reasons about *which* wording to fix using the context a plain tool lacks.

### Will it slow me down?

No. It reads only the skill descriptions in the catalog (frontmatter, a few KB), runs
in milliseconds, and fires only when your diff touches a SKILL.md.

### Does it spam?

It's instructed not to: it only flags real signal and never invents problems.

### What languages / stacks?

Any — it operates on SKILL.md descriptions, not source code. The reference engine is
JavaScript (Node, zero-dep) but the skill itself is language-agnostic.

### Which agents?

Claude Code (native), plus Codex, Cursor, Gemini CLI, opencode, Aider, Copilot CLI.

### It missed / mis-flagged something.

Open an issue with the example and the output — the checklist is a living file.
