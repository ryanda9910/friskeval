// Conventional Commits, enforced in CI (.github/workflows/commitlint.yml) and via
// the opt-in local hook (.githooks/commit-msg). See CONTRIBUTING.md.
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      ["feat", "fix", "docs", "style", "refactor", "perf", "test", "build", "ci", "chore", "revert"],
    ],
  },
};
