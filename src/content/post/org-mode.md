---
title: "Org Mode: My Approach"
description: "Org-node turns your Org files into a fast, linked knowledge base — no database sync, no enforced structure, and it works alongside Org-roam."
publishDate: 2026-07-26
draft: true
tags:
  - tools
  - emacs
---

:::warning
![](/sickos.jpeg)
:::

[Org-node](https://github.com/meedstrom/org-node) is an Emacs package for turning a pile of Org files into a linked knowledge base — a personal wiki, a Zettelkasten, a collection of daily notes, whatever you want. If you've heard of [Org-roam](/post/org-roam), org-node covers the same ground. The difference is that it's built for speed, and it doesn't ask you to structure your notes any particular way.

## What is a "node"?

A **node** is any file or any heading that you've given an Org ID. That's the whole model. There's no special note format to learn — if it has an ID, you can link to it and see what links back.

This means you can keep single-topic files *and* break a big file into linkable headings, mixing both freely. Org-node doesn't care.

## Speed is the point

Org-roam keeps your notes in a SQLite database that has to be synced. As your collection grows, that sync gets slow. Org-node skips the database — it parses your files in parallel across several Emacs subprocesses and holds everything in memory.

The maintainer's benchmark on a 3,000-note collection tells the story:

| Operation | Org-roam | Org-node |
|---|---|---|
| Initial indexing | 2m 48s | 2s |
| Saving a file | 5–10s | instant |
| Showing backlinks | 5–10s | instant |

For a small collection you won't notice. For a large one, this is the difference between a tool that stays out of your way and one that makes you wait.

## The two commands you'll use most

Most of the workflow runs through two commands:

| Command | What it does |
|---|---|
| `org-node-find` | Jump to a note by title — or create it if it doesn't exist |
| `org-node-insert-link` | Search your notes and insert a link to one |

Everything else — backlinks, refiling, sequences — builds on those.

## Backlinks, in the same window

When you visit a node, org-node can show its backlinks right there, instantly, without popping open a separate buffer. Optionally it will also write those backlinks directly into your files and keep them up to date, so the links survive even outside Emacs.

## Node sequences

A **sequence** (`org-node-seq`) is an ordered chain of notes you can page through — next, previous, jump to a specific one. It's a natural fit for daily journals, a numbered reading series, or the chapters of something you're writing. Org-roam has no equivalent.

## Link hygiene

Because org-node already has a fast, complete index of every note, it can help you keep the graph tidy:

- **Dead-link detection** — find links pointing at IDs that no longer exist
- **Link fixing** — repair links after things move
- **Rename-on-retitle** — update a file's name when you change its title
- **Duplicate-title warnings** — catch two notes fighting over the same name

## It plays well with what you already have

Two practical points make org-node easy to try:

- **It uses plain `org-id`**, the same as Org-roam, so the two share the same on-disk format. You can run both at once and back out anytime — there's nothing to migrate.
- **It hooks into ordinary `org-capture`**, so you're not learning a separate capture system.

## Getting started

Org-node is on MELPA. On [Doom Emacs](/post/org-roam), add the package in `~/.config/doom/packages.el`:

```elisp
(package! org-node)
```

Then in `~/.config/doom/config.el`, point Org at your notes folder and enable org-node:

```elisp
(setq org-directory (file-truename "~/Documents/org/"))

(after! org
  (setq org-id-locations-file (concat org-directory ".org-id-locations")))

(use-package! org-node
  :after org
  :config
  (org-node-cache-mode))
```

The `file-truename` call matters if your notes folder is a symlink or lives in a synced directory (iCloud, Dropbox, and the like) — resolving it keeps your `org-id` links stable.

Then run `doom sync`, restart Emacs, and build the index with `M-x org-node-reset`. From here on, just run `org-node-find` and start typing: if the note exists, you'll jump to it; if it doesn't, you'll create it. That's the whole loop.

