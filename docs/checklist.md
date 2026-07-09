# Reference

What friskeval does, in detail. Mirrors `skill/SKILL.md`.

## 1. Collision (cosine similarity between descriptions)

Every pair of skill descriptions is compared with TF-IDF cosine similarity.
Two skills that are near-duplicates fight for the same prompts.

```
✗ ERROR   payfrisk ~ chargefrisk = 0.81   # near-identical descriptions
⚠ WARN    gatefrisk ~ routefrisk = 0.57   # drifting toward overlap
ok        hookfrisk ~ agentfrisk = 0.13
```
**Fix:** rewrite the newer skill's description to name its own distinct domain
and drop the shared vocabulary. Threshold: `≥0.75` error, `≥0.5` warn.

## 2. Scope overclaim (security catalogs)

Each skill's discriminative terms (rare across the catalog) are derived; any other
skill whose description carries ≥50% of them is flagged as claiming that territory.
A pure collision check misses this — the descriptions can still look distinct.

```
⚠ gatefrisk carries 50% of hookfrisk's domain terms [hook, command, input]
    → may claim hookfrisk's scope
```
**Fix:** remove the borrowed domain terms from the overclaiming skill, or merge the
two if they genuinely do the same job.

## 3. Trigger routing

For each positive prompt in `cases.json`, the owning skill must rank in the top-k
(default 3). Each negative prompt must NOT rank #1 with a real score.

```
✗ testfrisk: positive ranked #4 (need top 3) — "did I test the new branch"
   → the description is missing the vocabulary users actually say
```
**Fix:** a positive miss means the description lacks user vocabulary — add it. A
negative #1 at a real score means the description is over-broad — narrow it. A
negative #1 at score ~0 is an off-topic prompt nobody owns, and passes.

---

friskeval reports real signal only — if it's fine, it isn't flagged.
