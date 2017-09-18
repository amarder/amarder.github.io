---
layout: post
title: Mac OS X for Social Science
date: 2013-08-13
draft: true
---

I recently learned about the Python distribution
[Anaconda][Anaconda]. I really appreciate Anaconda for making
scientific computing with Python much easier on Mac OS X. My current
goal is to do most of my work on the Mac, while keeping around a
virtual machine with Ubuntu to play around with new software (apt-get
is just great). This document outlines my Mac OS X setup.

# Emacs

To get Emacs working fullscreen well, I followed Kieran Healy's
suggestion and installed Yamamoto Mitsuharu's port of Emacs. It can be
found here:

https://github.com/railwaycat/emacs-mac-port

I installed it following "Plan A" since it was easiest.

# Emacs Starter Kit

I forked Kieran Healy's Emacs Starter Kit for Social Scientists. My
fork can be found here:

https://github.com/amarder/emacs-starter-kit

My personal branch is named `amarder`, it branches off of `orgv8`. To
get everything working smoothly on Mac OS X, I had some issues
installing org-mode version 8. This email thread was particularly
helpful as I think there is a bug when upgrading org-mode with the
starter kit loaded:

http://comments.gmane.org/gmane.emacs.orgmode/70880

One reason for building off the orgv8 branch is there's is much better
support for R Markdown files than the master branch. This alone makes
the switch worthwhile for me.

# Python

I found that [Anaconda][https://store.continuum.io/cshop/anaconda/]
from Continuum Analytics to be the easiest way to get Python up and
running on the Mac.

Once that is up and running
[elpy][https://github.com/jorgenschaefer/elpy] provides amazing Python
support for Emacs.

[Alfred]: http://www.alfredapp.com/
[KeyRemap]: https://pqrs.org/macosx/keyremap4macbook/
[Slate]: https://github.com/jigish/slate
