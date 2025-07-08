---
title: "Firefox Privacy Checklist"
description: "A checklist for configuring Mozilla Firefox for a more private and secure browsing experience."
publishDate: "2025-07-03"
tags:
  - tools
---

While there are many web browsers to choose from, I've settled on Mozilla Firefox. This post is a checklist of how I've configured it to better protect my privacy online.

A quick note: If you're looking for a browser that offers a high degree of privacy right out of the box with minimal setup, Brave is an excellent choice. However, I have a personal preference for Firefox for a few key reasons: it's developed by the non-profit Mozilla Foundation, I value its commitment to open-source principles, and I'm not interested in the cryptocurrency features that are integrated into Brave.

This checklist will walk you (and me) through the essential settings and add-ons I use to harden Firefox.

### 1. Basic Privacy Settings

Access Firefox's settings by clicking the menu button (three horizontal lines) in the top-right corner and selecting "Settings."

- [ ] **Change Default Search Engine:** In the **Search** tab, change the "Default Search Engine" to a privacy-respecting option like DuckDuckGo.
- [ ] **Enable HTTPS-Only Mode:** In the **Privacy & Security** tab, scroll down to "HTTPS-Only Mode" and select "Enable HTTPS-Only Mode in all windows."
- [ ] **Disable Telemetry:** Still in **Privacy & Security**, scroll to "Firefox Data Collection and Use" and uncheck all the boxes to stop Firefox from sending data back to Mozilla.
- [ ] **Set Enhanced Tracking Protection to Strict:** Under **Privacy & Security**, set "Enhanced Tracking Protection" to **Strict**. This offers stronger protection against trackers. If a site breaks, you can easily disable it for that specific site by clicking the shield icon in the address bar.

### 2. Recommended Add-ons

- [ ] **Install uBlock Origin:** A comprehensive content blocker that stops ads and tracking scripts, which speeds up page loading and enhances privacy.
- [ ] **Install ClearURLs:** This add-on automatically removes tracking elements from URLs, helping prevent another form of web tracking.
- [ ] **Install Privacy Badger:** From the Electronic Frontier Foundation, Privacy Badger automatically learns to block invisible trackers. Instead of keeping lists of what to block, it discovers trackers based on their behavior.

### 3. Advanced Configuration (`about:config`)

To access this, type `about:config` into the address bar and accept the warning.

**Warning:** Changing these settings can potentially affect browser performance or cause some websites to break. Proceed with caution.

- [ ] **Resist Fingerprinting:**
    - Search for `privacy.resistFingerprinting` and set its value to `true`.
    - This makes your browser fingerprint less unique. It may cause minor display issues on some sites.

- [ ] **Isolate Cookies to the First-Party Domain:**
    - Search for `privacy.firstparty.isolate` and set its value to `true`.
    - This prevents cookies from tracking you from one site to another but can break single sign-on for some websites.

By following this checklist, you can significantly improve your privacy while using Firefox. Please let me know if I'm missing anything in the comments.
