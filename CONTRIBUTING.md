# Contributing

friskeval is one file of instructions (`skill/SKILL.md`) plus docs and an installer.
Contributions that make it sharper or the install smoother are welcome.

## Good contributions

- **A miss** — if friskeval didn't catch/do something it should, open an issue with
  the example and the output, or a PR adding a concise item to `skill/SKILL.md`.
- **A false positive** — show the case and why it's fine. We'd rather tighten the
  instructions than train people to ignore the tool.
- **A new harness** — add it to `install.sh` / `install.ps1`.
- **A translation** — add a `README.<lang>.md` and link it in the language row.

## Style for `skill/SKILL.md`

- Keep each item **one or two lines, concrete, with the action**.
- Don't add noise; breadth at the cost of false positives is a net loss.

## Commits

[Conventional Commits](https://www.conventionalcommits.org): `<type>(<scope>)?: <subject>` —
`feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
CI lints every PR. Enable the dep-free local hook once:

```bash
git config core.hooksPath .githooks
```

## License

By contributing you agree your work is MIT-licensed.
