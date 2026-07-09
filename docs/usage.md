# Usage

## When it runs

- **Automatically** when your diff added or changed a SKILL.md in a skills catalog.
- **On demand** via `/friskeval`.

## What it looks at

Only the skill **descriptions** in the catalog — the `name` + `description` frontmatter
of every SKILL.md, plus an optional `cases.json` of trigger prompts. It never reads or
grades skill bodies; routing is decided by descriptions.

## The output

```
friskeval — 7 skills · 1 issue
  ✓ collision   gatefrisk ~ hookfrisk = 0.21   (under 0.5)
  ⚠ overclaim   gatefrisk carries 50% of hookfrisk's domain terms
                [hook, command, input] → drop them or narrow gatefrisk
  ✓ routing     21/21 prompts rank their owner first
cosine said "ok" — overclaim caught it. Fix the description before done.
```

`✓` a check that passed · `⚠` a warning to review · `✗` an error that blocks "done".
**collision** = cosine similarity between two descriptions (≥0.75 error, ≥0.5 warn).
**overclaim** = one skill carries ≥50% of another's discriminative terms. **routing** =
share of trigger prompts that rank their owner first. The closing line names what you
must decide before the task is finished.

## The rule

Do not say "done" after adding or editing a skill while its description collides
(cosine ≥0.75) with, or overclaims (≥50% of the domain terms of), a skill already in
the catalog.
