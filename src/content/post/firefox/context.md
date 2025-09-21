---
title: "Firefox Privacy Checklist: Additional Context"
description: "A checklist for configuring Mozilla Firefox for a more private browsing experience."
publishDate: "2025-09-21"
# updatedDate: "2025-08-29"
tags:
  - tools
---

I posted my [Firefox privacy checklist](/firefox) on [Hacker News](https://news.ycombinator.com/item?id=45073746) and got a ton of great feedback. This post aims to collect what I've learned from the comments, putting the checklist in a broader context.

When browsing the web, there are often tradeoffs between privacy and convenience. My checklist tries to maintain a convenient browsing experience and take back as much privacy as possible (while still being convenient).

## Firefox Forks

If you want more privacy (and probably a less convenient browsing experience), then consider a Firefox variant that offers more privacy out of the box:

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

I do a lot of browsing on mobile, so one thing I like about the checklist is it can be used on both desktop and mobile. If you want to optimize your desktop browser then customizing `user.js` is probably the way to go.

## Browser Fingerprint

There are websites one can use to inspect their web browser's fingerprint:

- [EFF's Cover Your Tracks](https://coveryourtracks.eff.org/)
- [Am I Unique](https://amiunique.org/)
- [CreepJS](https://abrahamjuliot.github.io/creepjs/)
- [Fingerprint](https://fingerprint.com/)

After using these tools, I concluded that my browser fingerprint is unique (I am not covering my tracks).

## Extensions

A number of great extensions came up in the comments, I've put them in the table below.

| \# Users   | Extension                                                                                   | Description                                                        |
|-----------:|---------------------------------------------------------------------------------------------|--------------------------------------------------------------------|
| 9,846,109  | [uBlock Origin](https://addons.mozilla.org/en-US/firefox/addon/ublock-origin/)              | Efficient wide-spectrum content blocker. Easy on CPU and memory. |
| 1,821,323  | [Privacy Badger](https://addons.mozilla.org/en-US/firefox/addon/privacy-badger17/)          | Automatically learns to block hidden trackers. Made by the leading digital rights nonprofit [EFF](https://www.eff.org/) to stop companies from spying on you. |
| 537,303    | [ClearURLs](https://addons.mozilla.org/en-US/firefox/addon/clearurls/)                      | Removes tracking elements from URLs. |
| 378,338    | [Multi-Account Containers](https://addons.mozilla.org/en-US/firefox/addon/multi-account-containers/) | Keep parts of your online life separated in color-coded tabs. Cookies are separated by container.                                                           |
| 264,525    | [NoScript](https://addons.mozilla.org/en-US/firefox/addon/noscript/)                        | Only run web content from sites you trust. Protect against cross-site scripting and other web security exploits.                                                                   |
| 250,837    | [Decentraleyes](https://addons.mozilla.org/en-US/firefox/addon/decentraleyes/)              | Protect against tracking through "free", centralized, content delivery.                                                                   |
| 184,798    | [Cookie AutoDelete](https://addons.mozilla.org/en-US/firefox/addon/cookie-autodelete/)      | When a tab closes, any cookies not being used are automatically deleted. Keep the ones you trust (forever/until restart) while deleting the rest.                                                                   |

## External Tools

A couple firewall applications were mentioned as helpful for monitoring and managing the connections made by Firefox:

- "The [Little Snitch](https://www.obdev.at/products/littlesnitch/index.html) Network Monitor shows you where your Mac connects to on the Internet. You decide what you want to allow or deny."
- "[OpenSnitch](https://github.com/evilsocket/opensnitch) is a GNU/Linux interactive application firewall inspired by Little Snitch."

## AI and CPU Usage

A number of readers suggested turning off Firefox's new built-in AI features. I found this article from Neowin especially informative: [Mozilla under fire for Firefox AI "bloat" that blows up CPU and drains battery](https://www.neowin.net/news/mozilla-under-fire-for-firefox-ai-bloat-that-blows-up-cpu-and-drains-battery/). TLDR: When Firefox introduced their AI features, they also introduced a performance bug. I am currently running Firefox version 143.0.1 and I haven't seen any performance issues with the AI features turned on. That being said, the AI features don't sound that useful so I see how turning them off makes a lot of sense.
