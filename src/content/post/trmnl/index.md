---
title: "TRMNL: My New ePaper Dashboard"
description: ""
publishDate: "2026-04-06"
---

<div style="position: relative; width: 100%; padding-top: 56.25%; margin-bottom: 1.5em;">
  <iframe 
    src="https://www.youtube.com/embed/D0wQ8gCxCvw?si=xdFaZu__ZaTw-a99" 
    title="YouTube video player"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    referrerpolicy="strict-origin-when-cross-origin"
    allowfullscreen
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
  ></iframe>
</div>

Recently, I've been eyeing the [TRMNL X](https://youtu.be/D0wQ8gCxCvw?si=YwOn7qDHiALbWdZM) - it looks like some sweet hardware. As, I've read up on it, I learned that I could transform an old Kindle (which I had) into a TRMNL. I used TRMNL's open source code to transform my Kindle into a TRMNL, code [here](https://github.com/usetrmnl/trmnl-kindle). I also self-hosted [Terminus](https://github.com/usetrmnl/terminus) - TRMNL's "flagship" Bring Your Own Server (BYOS). I was disappointed with both open source offerings:

1. When running TRMNL's code on my Kindle, the clock would be drawn over my dashboard. Not great. So, I modified their code using AI to make it more reliable. I've posted the results [here](https://github.com/amarder/trmnl-kindle).

2. After spinning up Terminus, I discovered that it does not currently support plugins (one of TRMNL's main features). Not great. I moved over to using [LaraPaper](https://github.com/usetrmnl/larapaper), which supports plugins.

Following the common tradition of blogging about blogging, I wanted disply my web analytics on my new dashboard. Building on a plugin created by [Nick Winans](https://nick.winans.io/), I put together [trmnl-umami](https://github.com/amarder/trmnl-umami).

There are some big TODOs left on the software I've posted:

1. trmnl-kindle crashes when I try to start it via KUAL.
2. trmnl-kindle has not been optimized to extend battery life.
3. trmnl-umami only supports full layout (not half or quadrant layouts).

![A screenshot of trmnl-umami](umami.png)

If you're curious about turning an old Kindle into a TRMNL, let me know. The current open source solutions are a quite rough so it might help to have a companion to go down this rabbit hole.