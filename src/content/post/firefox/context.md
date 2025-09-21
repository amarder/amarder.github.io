---
title: "Firefox Privacy Checklist - Additional Context"
description: "A checklist for configuring Mozilla Firefox for a more private browsing experience."
publishDate: "2025-09-21"
# updatedDate: "2025-08-29"
tags:
  - tools
---

I posted my [Firefox privacy checklist](/firefox) on [Hacker News](https://news.ycombinator.com/item?id=45073746) and received excellent feedback. This post collects what I learned from the comments, providing broader context for the checklist.

When browsing the web, there are often trade-offs between privacy and convenience. My checklist aims to maintain a convenient browsing experience while reclaiming as much privacy as possible.

## Firefox Forks

If you want more privacy (though likely with a less convenient browsing experience), consider a Firefox variant that offers enhanced privacy out of the box:

- [LibreWolf](https://librewolf.net/)
- [Waterfox](https://www.waterfox.net/)
- [Mullvad Browser](https://mullvad.net/en/browser)
- [Tor Browser](https://www.torproject.org/download/)

I have very little personal experience with these browsers.

## Desktop Hardening

There are great resources for hardening the desktop version of Firefox:

- [arkenfox](https://github.com/arkenfox/user.js)
- [Betterfox](https://github.com/yokoffing/Betterfox)
- [Firefox Profilemaker](https://ffprofile.com/)

I do a lot of browsing on mobile, so one thing I like about the checklist is that it works on both desktop and mobile. If you want to optimize your desktop browser, customizing `user.js` is probably the way to go.

## Browser Fingerprint

There are websites you can use to inspect your web browser's fingerprint:

- [EFF's Cover Your Tracks](https://coveryourtracks.eff.org/)
- [Am I Unique](https://amiunique.org/)
- [CreepJS](https://abrahamjuliot.github.io/creepjs/)
- [Fingerprint](https://fingerprint.com/)

After using these tools, I concluded that my browser fingerprint is unique; I am not covering my tracks.

## Extensions

Several great extensions came up in the comments. I've listed them in the table below.

| \# Users   | Extension                                                                                   | Description                                                        |
|-----------:|---------------------------------------------------------------------------------------------|--------------------------------------------------------------------|
| 9,846,109  | [uBlock Origin](https://addons.mozilla.org/en-US/firefox/addon/ublock-origin/)              | Efficient wide-spectrum content blocker. Easy on CPU and memory. |
| 1,821,323  | [Privacy Badger](https://addons.mozilla.org/en-US/firefox/addon/privacy-badger17/)          | Automatically learns to block hidden trackers. Made by the digital rights nonprofit [EFF](https://www.eff.org/) to stop companies from spying on you. |
| 537,303    | [ClearURLs](https://addons.mozilla.org/en-US/firefox/addon/clearurls/)                      | Removes tracking elements from URLs. |
| 378,338    | [Multi-Account Containers](https://addons.mozilla.org/en-US/firefox/addon/multi-account-containers/) | Keep parts of your online life separated in color-coded tabs. Cookies are separated by container.                                                           |
| 264,525    | [NoScript](https://addons.mozilla.org/en-US/firefox/addon/noscript/)                        | Only runs web content from sites you trust. Protects against cross-site scripting and other web security exploits.                                                                   |
| 250,837    | [Decentraleyes](https://addons.mozilla.org/en-US/firefox/addon/decentraleyes/)              | Protects against tracking through "free", centralized content delivery.                                                                   |
| 184,798    | [Cookie AutoDelete](https://addons.mozilla.org/en-US/firefox/addon/cookie-autodelete/)      | When a tab closes, any cookies not being used are automatically deleted. Keep the ones you trust (forever/until restart) while deleting the rest.                                                                   |

## External Tools

A couple of firewall applications were mentioned as helpful for monitoring and managing Firefox connections:

- "The [Little Snitch](https://www.obdev.at/products/littlesnitch/index.html) Network Monitor shows you where your Mac connects to on the Internet. You decide what you want to allow or deny."
- "[OpenSnitch](https://github.com/evilsocket/opensnitch) is a GNU/Linux interactive application firewall inspired by Little Snitch."

## AI and CPU Usage

Several readers suggested turning off Firefox's new built-in AI features. I found this article from Neowin especially informative: [Mozilla under fire for Firefox AI "bloat" that blows up CPU and drains battery](https://www.neowin.net/news/mozilla-under-fire-for-firefox-ai-bloat-that-blows-up-cpu-and-drains-battery/). TLDR: When Firefox introduced its AI features, it also introduced a performance bug. I am currently running Firefox version 143.0.1 and haven't seen any performance issues with the AI features enabled. That said, the AI features don't seem particularly useful, so turning them off makes a lot of sense.
