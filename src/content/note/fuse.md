---
title: "FUSE on macOS"
publishDate: "2026-03-15T13:00:00-05:00"
---

If you're looking to use [FUSE](https://en.wikipedia.org/wiki/Filesystem_in_Userspace) on macOS, do not use [macFuse](https://macfuse.github.io/), use [FUSE-T](https://www.fuse-t.org/) instead.

> The main motivation for FUSE-T is to replace macFuse, which implements its own kernel extension to make FUSE work. With each version of macOS, it's getting harder and harder to load kernel extensions. Apple strongly discourages it and, for this reason, software distributions that include macFuse are very difficult to install. 