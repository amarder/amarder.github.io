---
title: "TRMNL: My New E-Ink Dashboard"
description: ""
publishDate: "2026-04-06"
updatedDate: "2026-04-09"
tags:
  - "e-ink"
posse:
  - "[Reddit](https://www.reddit.com/r/trmnl/comments/1sdyp58/some_notes_on_bringing_your_own_device_and_server/)"
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

I've been eyeing the TRMNL X - it looks like some sweet hardware. But I'm cheap. When I learned it was possible to transform an old Kindle into a TRMNL, I had to try it before shelling out for the real thing. I had an old Kindle sitting on a shelf, so off I went. Here are my notes on the process.

**Things That Didn't Work Well**

1. **[usetrmnl/terminus](https://github.com/usetrmnl/terminus)** - TRMNL's open source Bring Your Own Server (BYOS). After spinning it up, I discovered it doesn't currently support plugins, which was a dealbreaker for me.

2. **[usetrmnl/trmnl-kindle](https://github.com/usetrmnl/trmnl-kindle)** - This code kind of works, but the Kindle OS was drawing its clock over my dashboard.

3. **[usetrmnl/trmnl-koreader](https://github.com/usetrmnl/trmnl-koreader)** - A TRMNL display plugin for KOReader. This code works reliably, but its battery life wasn't great.

4. **[nicell/trmnl-umami](https://github.com/Nicell/trmnl-umami)** - Following the longstanding tradition of blogging about blogging, I wanted to display my web analytics on my dashboard. Nick Winans' plugin was a helpful starting point, but it didn't seem to work with Umami Cloud.

**What I Landed On**

After some tinkering, I settled on three open source tools that now power my setup:

1. **[usetrmnl/larapaper](https://github.com/usetrmnl/larapaper)** - A TRMNL BYOS that supports plugins. This replaced Terminus.

2. **[amarder/kindle-trmnl](https://github.com/amarder/kindle-trmnl)** - A custom TRMNL client that takes battery efficiency to the max. After the client fetches and displays the dashboard, it immediately puts the Kindle to sleep. Pressing the power button wakes the device, updates the dashboard, and puts it back to sleep. By requiring a manual press of the power button to refresh the dashboard, we can dramatically extend the runtime on a single charge.

3. **[amarder/trmnl-umami](https://github.com/amarder/trmnl-umami)** - A custom Umami Analytics plugin, built on Nick's work.

![A screenshot of trmnl-umami](umami.png)

<!--
WARNING: Only the full layout is working in my trmnl-umami plugin (half and quadrant layouts are broken). If you need those layouts, please reach out. Knowing someone else wants to use it would motivate me to fix these issues.
-->

**Overall**

I'm very happy with my new dashboard. It gives me a dedicated place to glance at things I'd otherwise pull out my phone to check: weather, web analytics, finances. Now I can see all of that without getting sucked into my phone.