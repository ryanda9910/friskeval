<p align="center">
  <img src="assets/logo.svg" alt="friskeval" width="96" height="96" />
</p>

<h1 align="center">friskeval</h1>

<p align="center"><b>Linter routing untuk katalog skill — deteksi tabrakan dan klaim scope berlebih sebelum kamu rilis skill.</b></p>

<p align="center">
  <a href="README.md">🇺🇸 English</a> · 🇮🇩 Bahasa Indonesia · <a href="README.zh-CN.md">🇨🇳 简体中文</a>
</p>

<p align="center">
  <img src="demo.gif" alt="demo friskeval" width="760" />
</p>

friskeval adalah pemeriksa yang dijalankan agen pada **katalog skill-nya sendiri**
(Claude Code — juga Codex, Cursor, Gemini CLI, opencode) sebelum merilis skill baru.
`description` sebuah skill adalah satu-satunya hal yang dibaca router untuk memutuskan
kapan skill itu aktif, jadi dua deskripsi yang tumpang-tindih diam-diam berebut prompt
yang sama tanpa ada error yang memperingatkanmu. friskeval mengukur tumpang-tindih itu
— deterministik, offline, tanpa token — dan menolak bilang "selesai" selama skill baru
bertabrakan dengan skill yang sudah ada di katalog.

## Sebelum / Sesudah

**Tanpa friskeval** — kamu menambah `gatefrisk` lalu memperluas deskripsinya hingga
ikut menyebut "hook agen yang auto-run input tak tepercaya". Sekarang ia diam-diam
berebut prompt audit-hook dengan `hookfrisk`. Cosine cuma 0.21, jadi cek duplikat biasa
bilang "aman". Audit nyata mulai salah rute dan kamu tak pernah tahu:

```
$ git commit -m "feat: broaden gatefrisk"
# lolos. tanpa error. prompt hookfrisk kadang salah rute ke gatefrisk.
```

**Dengan friskeval** — cek scope-overclaim menyebut kosakata pinjaman yang tepat
sebelum kamu rilis:

```
friskeval — 7 skills · 1 issue
  ✓ collision   gatefrisk ~ hookfrisk = 0.21   (di bawah 0.5)
  ⚠ overclaim   gatefrisk carries 50% of hookfrisk's domain terms
                [hook, command, input] → hapus atau persempit gatefrisk
  ✓ routing     21/21 prompt merutekan ke pemiliknya
cosine bilang "ok" — overclaim yang menangkapnya. Perbaiki deskripsi sebelum selesai.
```

## Pasang

```bash
# macOS / Linux / WSL
curl -fsSL https://raw.githubusercontent.com/ryanda9910/friskeval/main/install.sh | bash

# Windows (PowerShell)
irm https://raw.githubusercontent.com/ryanda9910/friskeval/main/install.ps1 | iex
```

Cari semua coding agent yang kamu punya lalu pasang skill-nya. ~10 detik, aman
dijalankan ulang. Tanpa key, tanpa akun, tanpa dependency.

## Lisensi

MIT.
