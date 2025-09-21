---
title: "Firefox Privacy Checklist: Additional Context"
description: "A checklist for configuring Mozilla Firefox for a more private browsing experience."
publishDate: "2025-09-11"
# updatedDate: "2025-08-29"
tags:
  - tools
draft: true
---

I posted my [Firefox privacy checklist](/firefox) on [Hacker News](https://news.ycombinator.com/item?id=45073746) and got a ton of great feedback. This post aims to collect what I've learned from the comments, putting the checklist in a broader context.

When browsing the web, there are often tradeoffs between privacy and convenience. My checklist tries to maintain a convenient browsing experience and take back as much privacy as possible while still being convenient.

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

There are websites one can use to inspect their browser's fingerprint:

- [EFF's Cover Your Tracks](https://coveryourtracks.eff.org/)
- [Am I Unique](https://amiunique.org/)
- [CreepJS](https://abrahamjuliot.github.io/creepjs/)
- [Fingerprint](https://fingerprint.com/)

After using these tools, I concluded that my browser fingerprint is unique (I am not covering my tracks).

## Extensions

A number of great extensions came up in the comments, I've put them in the table below.

| \# Users   | Extension                                                                                   |
|-----------:|---------------------------------------------------------------------------------------------|
| 9,846,109  | [uBlock Origin](https://addons.mozilla.org/en-US/firefox/addon/ublock-origin/)              |
| 1,821,323  | [Privacy Badger](https://addons.mozilla.org/en-US/firefox/addon/privacy-badger17/)          |
| 537,303    | [ClearURLs](https://addons.mozilla.org/en-US/firefox/addon/clearurls/)                      |
| 378,338    | [Multi-Account Containers](https://addons.mozilla.org/en-US/firefox/addon/multi-account-containers/) |
| 264,525    | [NoScript](https://addons.mozilla.org/en-US/firefox/addon/noscript/)                        |
| 250,837    | [Decentraleyes](https://addons.mozilla.org/en-US/firefox/addon/decentraleyes/)              |
| 184,798    | [Cookie AutoDelete](https://addons.mozilla.org/en-US/firefox/addon/cookie-autodelete/)      |

## External Tools

A couple firewall tools were mentioned as helpful for getting a clear view of the connections made by Firefox:

- "The [Little Snitch](https://www.obdev.at/products/littlesnitch/index.html) Network Monitor shows you where your Mac connects to on the Internet. You decide what you want to allow or deny."
- "[OpenSnitch](https://github.com/evilsocket/opensnitch) is a GNU/Linux interactive application firewall inspired by Little Snitch."

## Config

/** AI ***/
user_pref("browser.ml.enable", false);
user_pref("browser.ml.chat.enabled", false);

"After reading some article recently, I found around 5 settings in about:config that pertain to FF's new built in AI. I changed them all from "true" to "false"."

