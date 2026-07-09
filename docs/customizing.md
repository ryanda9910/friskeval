# Customizing

friskeval is one file of instructions: `skill/SKILL.md` (installed at
`~/.claude/skills/friskeval/SKILL.md`). Edit it to change behavior — no build, no code.

## Add or remove behavior

Edit **The process** section of `skill/SKILL.md`. To drop the security-only
scope-overclaim check for a general catalog, remove step 3; to add a new check (e.g.
"every skill must declare at least 3 positive trigger prompts"), add a numbered step.

## Tune the strictness

The reference engine uses cosine `0.75` (error) / `0.5` (warn) for collision and `0.5`
for the overclaim term-overlap fraction. Lower them to catch drift earlier; raise them
for a noisier catalog. They live at the top of `scripts/friskeval.js`.

## Scope

By default friskeval scores the whole catalog so a new skill is compared against every
existing one — that is the point. To check a single pair, pass a two-entry `skills.json`.

## Project-specific rules

Use `--project` install to commit a tuned `./.claude/skills/friskeval/SKILL.md` so
your team shares the same behavior.
