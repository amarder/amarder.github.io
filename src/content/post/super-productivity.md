---
title: "My Super Productivity Setup"
description: "How I organize work and personal tasks in Super Productivity with cross-device sync."
publishDate: "2026-03-06"
tags:
  - tools
---

I've been searching for a task manager that checks all my boxes: open source, recurring tasks, calendar integration, and cross-device sync. After using [Obsidian Tasks](/post/obsidian/) and a brief stint with TickTick, I landed on [Super Productivity](https://super-productivity.com/). It's local-first, keyboard-driven, and has apps for macOS, Linux, and Android — no account required.

## Projects

I keep all my tasks — work and personal — on my personal machines so everything lives in one place. To keep them organized I use two top-level project folders:

- **Work**
- **Personal**

Create a project from the sidebar menu (☰ → Projects). Each project has a flat task list where you capture everything. Each morning I drag a few items into the global **Today** view — that's my commitment for the day. The project lists themselves act as backlogs.

There's an "Enable Project Backlog" toggle when creating a project, but I leave it off. Turning it on adds a backlog drawer at the bottom of the project page for sprint-style planning — it's slick and unobtrusive, but more structure than I need.

I assign tasks to a project with the `+` button when adding a task:

```
Review PR for auth refactor #Work
```

Within each project I use **tags** to slice across contexts (`#email`, `#deep-work`, `#errand`) so I can filter by what kind of work I'm in the mood for.

## Syncing Across Devices

Super Productivity's built-in WebDAV sync option is labeled "experimental" and have reports of data loss from conflict resolution failures ([#4737](https://github.com/johannesjo/super-productivity/issues/4737), [#3361](https://github.com/johannesjo/super-productivity/issues/3361), [#5965](https://github.com/super-productivity/super-productivity/issues/5965)). I'm using WebDAV sync with [Fastmail's WebDAV server](https://www.fastmail.help/hc/en-us/articles/1500000277882-Remote-file-access-WebDAV).

### Fastmail WebDAV Setup

1. In Fastmail, go to **Settings → Privacy & Security → Integrations**.
2. Click **New App Password**, enter your password to verify, and give it a name (e.g. "Super Productivity").
3. Under data access, select **Files (WebDAV)** — not the default mail/contacts/calendars option.
4. Copy the generated password.
5. In Super Productivity, go to **Settings → Sync** and configure:
   - **Sync provider:** WebDAV
   - **Base URL:** `https://webdav.fastmail.com/username.fastmail.com/files/` (replace `username.fastmail.com` with your email, substituting `.` for `@`)
   - **Username:** your full Fastmail email address
   - **Password:** the app password from step 4
   - **Only sync manually:** enabled

Under the hood, sync uploads a single `sync-data.json` file to your WebDAV server, tagged with a revision number. Conflicts happen when two devices both write between syncs — the app makes you pick one side and throws the other away.

To keep this safe I enable **"only sync manually"** in the WebDAV settings, which turns sync into an explicit pull/push workflow:

1. **Stop any running timers** — syncing while a task is being timed can corrupt the data. I learned this the hard way: the receiving device flagged the database as corrupted and "fixed" it by duplicating every task.
2. Open the app on whatever device you want to use.
3. **Sync** to pull the latest data.
4. Work — add tasks, track time, whatever.
5. **Stop any running timers**, then **sync** to push your changes.
6. Switch devices and repeat.

This avoids background syncs racing between devices. It's the same mental model as `git pull` / `git push` — you're always in control of when data moves.

A few more precautions:

- **Disable auto-updates** on Android (F-Droid doesn't auto-update by default; on Google Play, disable it per-app).
- **Upgrade all devices together.** Different versions can use different sync file formats, so update desktop and Android at the same time.
- **Export a backup before upgrading** (Settings → Import/Export → Export). The export is a JSON file you can reimport if something goes wrong.

## Calendar Integration

Super Productivity can overlay calendar events on your task timeline, which is helpful for planning your day around meetings. I have two calendars connected:

- **Fastmail** — my personal calendar via an ICS URL (using "iCal Other").
- **Outlook 365 (work)** — also via an ICS URL.

Both only show busy/free times, not event titles. I prefer this over CalDAV since it avoids exposing the titles of all my events to the app.

The calendar overlay is read-only — events appear alongside your tasks, but tasks don't sync back to the calendar.

## Android

The app is available on [Google Play](https://play.google.com/store/apps/details?id=com.superproductivity.superproductivity) and [F-Droid](https://f-droid.org/packages/com.superproductivity.superproductivity/). Both the CalDAV calendar overlay and WebDAV sync work on the native Android app without the cross-origin restrictions you might hit using Super Productivity in the browser.

## Keyboard Shortcuts

The keyboard-first design is one of my favorite things about this app. Here are the shortcuts I use most:

**Global (application-wide):**

| Shortcut          | Action                            |
|-------------------|-----------------------------------|
| `Shift+A`         | Add new task                      |
| `w`               | Focus on first task               |
| `f`               | Enter focus mode                  |

**Task (applies to selected task):**

| Shortcut              | Action                        |
|-----------------------|-------------------------------|
| `Enter`               | Edit title                    |
| `d`                   | Toggle completed state        |
| `y`                   | Start/stop task               |
| `a`                   | Add subtask                   |
| `t`                   | Edit estimate / time spent    |
| `s`                   | Schedule task                 |
| `Shift+T`             | Move to Today's task list     |
| `Shift+B`             | Move to task backlog          |
| `Ctrl+Shift+↑/↓`      | Move task up/down in the list |
