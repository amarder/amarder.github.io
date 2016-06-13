---
layout: post
title: Emacs Keyboard Macros - Use Caution
date: 2012-05-31
draft: true
---

If you find yourself pressing the same key combination repeatedly,
[keyboard macros][1] can save you time.

It should be noted that keyboard macros record the buttons you press.
This is a blessing and a curse.  In my Emacs setup, Emacs tries to
guess what command I want to run.  If I type

    M-x re

Emacs will suggest 'replace-regexp' if that is the last command
starting with 're' I used.  If I press enter at this point of
recording my macro, my recorded macro will be state dependent.
Depending what command I used last, Emacs might try using
'recover-file' instead of 'replace-regexp', which would have some
surprising consquences.

I think careful keyboard macros can leverage some useful features of
Emacs.  I also think [filtering text through a shell command][2] is a
cool approach.

[1]: http://emacswiki.org/emacs/KeyboardMacros
[2]: http://stackoverflow.com/questions/206806/filtering-text-through-a-shell-command-in-emacs
