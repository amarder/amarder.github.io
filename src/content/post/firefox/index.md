---
title: "Firefox Privacy Checklist"
description: "A checklist for configuring Mozilla Firefox for a more private browsing experience."
publishDate: "2025-07-03"
updatedDate: "2025-09-21"
tags:
  - tools
posse:
  - "[Hacker News](https://news.ycombinator.com/item?id=45073746)"
---

This checklist will walk you (and me) through the settings and extensions I use to increase my privacy when using [Firefox](https://www.firefox.com/).

If you're looking for a web browser that offers strong privacy out of the box with minimal setup, [Brave](https://brave.com/) is a popular choice. However, I prefer Firefox for several reasons:
- Firefox is developed by Mozilla, a nonprofit organization.
- I value Mozilla's commitment to open-source software.
- Firefox is not based on Chromium. Brave, like most browsers, is based on Chromium, which is developed primarily by Google.

While there are many web browsers to choose from, I've decided Firefox is best for me. This post outlines how I've configured it to better protect my privacy while browsing the web.

### 1. Basic Privacy Settings

Access Firefox's settings by clicking the menu button (three horizontal lines) in the top-right corner and selecting "Settings."

- [ ] **Change Default Search Engine:** In the **Search** tab, change the "Default Search Engine" to a privacy-respecting option like DuckDuckGo.
- [ ] **Enable HTTPS-Only Mode:** In the **Privacy & Security** tab, scroll down to "HTTPS-Only Mode" and select "Enable HTTPS-Only Mode in all windows."
- [ ] **Disable Telemetry:** Still in **Privacy & Security**, scroll to "Firefox Data Collection and Use" and uncheck all the boxes to stop Firefox from sending data back to Mozilla.
- [ ] **Set Enhanced Tracking Protection to Strict:** Under **Privacy & Security**, set "Enhanced Tracking Protection" to **Strict**. This offers stronger protection against trackers. If a site breaks, you can easily disable it for that specific site by clicking the shield icon in the address bar.

### 2. Recommended Extensions

- [ ] **Install [uBlock Origin](https://addons.mozilla.org/en-US/firefox/addon/ublock-origin/):** A comprehensive content blocker that stops ads and tracking scripts, speeding up page loads and enhancing privacy.
- [ ] **Install [Privacy Badger](https://addons.mozilla.org/en-US/firefox/addon/privacy-badger17/):** From the Electronic Frontier Foundation, this extension automatically learns to block invisible trackers. Instead of relying on blocklists, it discovers trackers based on their behavior.
- [ ] **Install [ClearURLs](https://addons.mozilla.org/en-US/firefox/addon/clearurls/):** This extension automatically removes tracking elements from URLs, helping to prevent another form of web tracking.

### 3. Advanced Configuration (`about:config`)

To access this, type `about:config` into the address bar and accept the warning.

**Warning:** Changing advanced configuration preferences can impact Firefox performance or security. Proceed with caution.

- [ ] **Isolate Cookies to the First-Party Domain:**
    - Search for `privacy.firstparty.isolate` and set its value to `true`.
    - This prevents cookies from tracking you across sites, but it can break single sign-on on some websites.
- **Resist Fingerprinting:**
    - I previously set `privacy.resistFingerprinting` to `true` to make my browser fingerprint less unique.
    - However, it caused minor display issues on some sites and broke image uploads to Bluesky, so I set it back to `false`.

By following this checklist, you can significantly improve your privacy while using Firefox. Please let me know if I'm missing anything in the comments.

:::note
I'm excited about [Ladybird](https://ladybird.org/), but it's currently in a pre-alpha state and only suitable for developers.

If you want to enhance your browser's privacy even further, check out [my follow-up post](/firefox/context/) for additional context.
:::