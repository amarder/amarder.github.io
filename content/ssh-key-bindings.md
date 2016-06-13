---
title: SSH Key Bindings
date: 2012-03-22
aliases:
  - /post/2012-03-22-ssh-key-bindings/
---

Recently, I was asked how to set up an SSH client so that Ctrl-right
would move forward a word.  Here are some things I learned along the
way.

It turns out different SSH clients send different keycodes for the
same keys!  [Anne Baretta][1] describes an easy way to see what your
client is sending to the terminal:

> The best way to trouble-shoot is using Ctrl-v key. Press Control
> and v simultaneously, release them, and then type one of the special
> keys, e.g. Delete. It will tell you which sequence will be sent to
> the terminal (console or xterm).

When SSH'ing into my server using PuTTY Ctrl-v Ctrl-right produced

    ^[OC

Using SecureCRT Ctrl-v Ctrl-right produced nothing.  Regardless of
which client I used, Ctrl-right did not move me forward a word.

[Anne Baretta][1] notes, "\e means ESC."  In SecureCRT I mapped the
key combination Ctrl-right to \ef.  I knew that ESC-f would move
forward a word in bash since most Emacs shortcuts also work in bash.

[1]: http://www.ibb.net/~anne/keyboard/troubleshooting.html
