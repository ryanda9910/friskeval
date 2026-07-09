<p align="center">
  <img src="assets/logo.svg" alt="friskeval" width="96" height="96" />
</p>

<h1 align="center">friskeval</h1>

<p align="center"><b>技能目录的路由检查器——在发布技能前发现描述冲突与范围越权。</b></p>

<p align="center">
  <a href="README.md">🇺🇸 English</a> · <a href="README.id.md">🇮🇩 Bahasa Indonesia</a> · 🇨🇳 简体中文
</p>

<p align="center">
  <img src="demo.gif" alt="friskeval 演示" width="760" />
</p>

friskeval 是智能体在发布新技能前，对自己的**技能目录**运行的检查（Claude Code——
也支持 Codex、Cursor、Gemini CLI、opencode）。技能的 `description` 是路由器判断何时
触发它的唯一依据，因此两个重叠的描述会悄悄争抢同一批提示，且不会报错提醒你。
friskeval 度量这种重叠——确定性、离线、不消耗 token——并在新技能与目录中已有技能
冲突时拒绝说“完成”。

## 前 / 后

**没有 friskeval** —— 你新增 `gatefrisk`，随后扩写它的描述，使其也提到“自动运行不可
信输入的智能体 hook”。它现在悄悄与 `hookfrisk` 争抢 hook 审计类提示。余弦相似度仅
0.21，普通的重复检查会说“没问题”。真实审计开始路由到错误的技能，而你毫不知情：

```
$ git commit -m "feat: broaden gatefrisk"
# 通过，无报错。hookfrisk 的提示有时被错误路由到 gatefrisk。
```

**有了 friskeval** —— 范围越权检查会在你发布前指出被借用的具体词汇：

```
friskeval — 7 skills · 1 issue
  ✓ collision   gatefrisk ~ hookfrisk = 0.21   (低于 0.5)
  ⚠ overclaim   gatefrisk carries 50% of hookfrisk's domain terms
                [hook, command, input] → 删除或收窄 gatefrisk
  ✓ routing     21/21 条提示均路由到各自的归属技能
余弦相似度说“ok”，是越权检查抓到了它。完成前请先修正描述。
```

## 安装

```bash
# macOS / Linux / WSL
curl -fsSL https://raw.githubusercontent.com/ryanda9910/friskeval/main/install.sh | bash

# Windows (PowerShell)
irm https://raw.githubusercontent.com/ryanda9910/friskeval/main/install.ps1 | iex
```

它会找出你装的每个编码 agent，把技能装进每一个。约 10 秒，可重复运行。无需密钥、无需账号、无依赖。

## 许可证

MIT。
