/**
 * Self-driving demo for the README recording (VHS). Key-free and deterministic —
 * replays a representative friskeval run. Faithful to the real runs in CASES.md.
 * Run: node examples/demo.mjs
 */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const C = {
  reset: "\x1b[0m", dim: "\x1b[2m", b: "\x1b[1m",
  green: "\x1b[38;5;42m", red: "\x1b[38;5;203m", yellow: "\x1b[38;5;221m",
  grey: "\x1b[90m", cyan: "\x1b[36m", plus: "\x1b[38;5;42m",
};
async function line(s = "", d = 55) { process.stdout.write(s + "\n"); await sleep(d); }
async function type(s, speed = 12) { for (const ch of s) { process.stdout.write(ch); await sleep(speed); } process.stdout.write(C.reset + "\n"); }

async function main() {
  await line(`${C.green}${C.b}  friskeval${C.reset} ${C.dim}— routing linter for a skill catalog${C.reset}\n`, 400);

  // 1) the change that triggers it: a new/edited skill description
  await type(`${C.cyan}$${C.reset} git diff --stat`, 22);
  await sleep(120);
  await line(`  skills/gatefrisk/SKILL.md | 2 +-`, 60);
  await line(`${C.plus}+ ... also reads your agent hooks for commands that auto-run ...${C.reset}`, 60);
  await line();

  // 2) run the skill
  await type(`${C.cyan}$${C.reset} ${C.b}/friskeval${C.reset}`, 24);
  await sleep(300);
  await line(`${C.dim}  building TF-IDF over 7 descriptions…${C.reset}`, 600);
  await line();

  // 3) the report — faithful to CASES.md Case 2
  await line(`${C.b}friskeval${C.reset} ${C.dim}— 7 skills · 1 issue${C.reset}`, 250);
  await line(`  ${C.green}✓ collision${C.reset}  gatefrisk ~ hookfrisk = 0.21  ${C.dim}(under 0.5)${C.reset}`, 300);
  await line(`  ${C.yellow}⚠ overclaim${C.reset}  gatefrisk carries 50% of ${C.b}hookfrisk${C.reset}'s domain terms`, 320);
  await line(`               ${C.dim}[hook, command, input]${C.reset} → drop them or narrow gatefrisk`, 300);
  await line(`  ${C.green}✓ routing${C.reset}   21/21 prompts rank their owner first`, 250);
  await line(`${C.b}cosine said "ok" — overclaim caught it. Fix the description before done.${C.reset}`, 200);
  await line();
  await sleep(400);
  await line(`${C.green}  github.com/ryanda9910/friskeval${C.reset}`, 100);
  await line();
}
main();
