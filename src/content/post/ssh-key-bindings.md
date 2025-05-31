---
title: 'SSH Key Bindings'
description: "What is my SSH client sending when I press the ___ keys?"
publishDate: '2012-03-22'
updatedDate: "2025-05-31"
---

Recently, I was asked how to set up an SSH client so that <kbd>Ctrl</kbd>+<kbd>→</kbd> would move forward a word. Here are some things I learned along the
way.

It turns out different SSH clients send different keycodes for the
same keys!  [Anne Baretta][1] describes an easy way to see what your
client is sending to the terminal:

> The best way to trouble-shoot is using Ctrl-v key. Press Control
> and v simultaneously, release them, and then type one of the special
> keys, e.g. Delete. It will tell you which sequence will be sent to
> the terminal (console or xterm).

When SSH'ing into a Linux server using PuTTY <kbd>Ctrl</kbd>+<kbd>v</kbd> <kbd>Ctrl</kbd>+<kbd>→</kbd> produced

    ^[OC

Using SecureCRT <kbd>Ctrl</kbd>+<kbd>v</kbd> <kbd>Ctrl</kbd>+<kbd>→</kbd> produced nothing. Regardless of
which client I used, <kbd>Ctrl</kbd>+<kbd>→</kbd> did not move me forward a word.

[Anne Baretta][1] notes, "\e means ESC."  In SecureCRT I mapped the
key combination <kbd>Ctrl</kbd>+<kbd>→</kbd> to `\ef`. I knew that <kbd>Esc</kbd>+<kbd>f</kbd> would move
forward a word in bash since most Emacs shortcuts also work in bash. Mission accomplished!

---

2025-05-31 Update: I wanted to see if this advice still works (it does). I SSH'ed into a Linux server using Terminal on a Mac and found <kbd>Ctrl</kbd>+<kbd>v</kbd> <kbd>Ctrl</kbd>+<kbd>→</kbd> produced nothing. I also found that <kbd>Option</kbd>+<kbd>→</kbd> did move forward a word, when I checked this with <kbd>Ctrl</kbd>+<kbd>v</kbd> <kbd>Option</kbd>+<kbd>→</kbd> I was presented with:

    ^[f

[1]: https://web.archive.org/web/20180916132310/https://www.ibb.net/~anne/keyboard/troubleshooting.html