# Real runs

Actual friskeval runs (not mockups), on the real 7-skill `frisk` security catalog
(patdown, gatefrisk, hookfrisk, testfrisk, envxray, mcpfrisk, agentfrisk).
Reproduce: `node scripts/friskeval.js examples/skills.json examples/cases.json`.

The engine is deterministic and offline, so these outputs are byte-for-byte
reproducible — no API key, no tokens, no network.

---

## Case 1 — a clean, real security-skill catalog

Input: the 7 shipped `frisk` skill descriptions (`examples/skills.json`) + their
trigger prompts (`examples/cases.json`).

friskeval said (verbatim):
```
friskeval — 7 skills

== collision (cosine similarity between descriptions) ==
  ok       hookfrisk ~ agentfrisk  = 0.13
  ok       mcpfrisk ~ agentfrisk  = 0.10
  ok       gatefrisk ~ testfrisk  = 0.07
  ok       hookfrisk ~ mcpfrisk  = 0.04
  ok       patdown ~ envxray  = 0.04
  ok       hookfrisk ~ testfrisk  = 0.04

== scope overclaim (does one security skill claim another's domain?) ==
  ok — each skill owns a distinct security domain

== trigger routing ==
  trigger rank-1 rate: 100% (21/21 positives rank their skill first)

PASS
```
Notable: every one of these seven descriptions uses the same shape ("frisk your X
for Y before you ship"), yet the highest collision is 0.13 — far below the 0.5 warn
line. Structural similarity is not routing collision, and friskeval measures the
difference instead of guessing. All 21 trigger prompts route to their owner first.

---

## Case 2 — a skill that drifts into a neighbour's domain

Input: the same catalog, but `gatefrisk`'s description is edited to also mention
reading "agent hooks for commands that auto-run on untrusted input, curl piped to
bash" — i.e. it starts claiming `hookfrisk`'s job.

friskeval said (verbatim):
```
== collision (cosine similarity between descriptions) ==
  ok       gatefrisk ~ hookfrisk  = 0.21
  ...

== scope overclaim (does one security skill claim another's domain?) ==
  ⚠ gatefrisk carries 50% of hookfrisk's domain terms [hook, command, input] — may claim hookfrisk's scope
```
Notable: cosine similarity only rose to **0.21** — still "ok", a pure collision
check would have missed this. The **scope-overclaim** dimension caught it, naming
the exact borrowed terms (`hook, command, input`). That is the check a generic
skill-catalog linter does not have, and the reason friskeval is aimed at security
catalogs where one skill quietly eating another's territory is a real misroute.

---

## Case 3 — an off-topic prompt is nobody's, and that's fine

Input: the clean catalog, with a negative prompt `"update the architecture diagram
in the docs"` declared for `patdown`.

Notable: all seven skills score exactly `0.0000` for that prompt (it shares no
vocabulary with any of them). friskeval does **not** fail patdown for landing on an
arbitrary tie-order #1 at score ~0 — a prompt nobody owns is correct routing, not an
over-broad description. Only a #1 rank with a *real* score counts as an over-broad
failure. This precision guard is what keeps the linter from crying wolf on every
unrelated prompt.
