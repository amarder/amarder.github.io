---
title: Colophon
description: "This page describes how this site is made, with what tools."
---

A colophon is "an inscription at the end of a book or manuscript usually 
with facts about its production." This page describes how this site is made and what tools are used. Here's a quick rundown of the tech stack:

- [Astro](https://github.com/withastro/astro)
- [Astro Cactus](https://github.com/chrismwilliams/astro-theme-cactus)
- [Cloudflare Pages](https://pages.cloudflare.com/)
- [Umami](https://umami.is/) web analytics
- [Keila](https://www.keila.io/) email newsletter

The source code for the site is available on [GitHub](https://github.com/amarder/amarder.github.io). Here are some features of the blog that are important to me:

- Dark and light mode - Astro Cactus
- Search - [Pagefind](https://pagefind.app/)
- Syntax highlighting - [Expressive Code](https://expressive-code.com/)
- Math typesetting - [KaTeX](https://katex.org/)
- Icons - [Astro Icon](https://github.com/natemoo-re/astro-icon)

If I could do it over, I suspect [Eleventy](https://www.11ty.dev/) would be easier than Astro. I also regret using a fixed-width font for the body text. Since everything is displayed in a fixed-width font, inline code like `self.regret()` has to be differentiated in other ways (Astro Cactus uses backticks and a dashed box). I might look for another theme that uses a variable-width font for the body text.