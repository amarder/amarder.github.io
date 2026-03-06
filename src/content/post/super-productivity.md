---
title: "My Super Productivity Notes"
description: "How I organize work and personal tasks in Super Productivity with cross-device sync."
publishDate: "2026-03-06"
tags:
  - tools
---

I've used my fair share of task managers. When I used to use Emacs, I really enjoyed [Org Mode](https://orgmode.org/). More recently, I had been using [Obsidian Tasks](https://publish.obsidian.md/tasks/Introduction). Obsidian Tasks is a great lightweight solution for keeping track of a todo list, but I wanted a more powerful tool to start tracking my time like Org Mode. I spent a day playing around with [TickTick](https://ticktick.com/), but I've decided [Super Productivity](https://super-productivity.com/) is where it's at! Here are some of the features I really value:

TODO: Clean up this list.

- open source
- recurring tasks
- calendar integration
- cross-device sync
- local-first (I control my data)
- keyboard-driven
- apps for all the major platforms
- no account required

This post will walk through how I've set up Super Productivity.

## Projects

I keep all my tasks - work and personal - on my personal machines so everything lives in one place. When I'm working on my work computer, I use my phone to track my time. To keep projects organized I use two top-level project folders:

- **Work**
- **Personal**

Inside those folders I have projects. Each project has a flat task list where you capture everything. At the end of each day I schedule tasks for tomorrow (press `s` on a task), so when I open the app in the morning my **Today** view is already populated and I can start working immediately. The project lists themselves act as backlogs.

I'm using the "Enable Project Backlog" feature on some projects where I have tasks I might do someday but don't need to see every day. Turning this on adds a backlog drawer at the bottom of the project page—it's a convenient way to stash "someday/maybe" tasks out of my daily view.

## Tags

Tags let you categorize tasks across projects. I use them for life areas that don't need their own project — things like `#Health`, `#Finances`, and `#Career`. Instead of creating near-empty projects for each of these, I keep them as tags on tasks in my Personal project:

```
Schedule dentist appointment #Health
Rebalance 401k #Finances
```

Clicking a tag in the sidebar shows all tasks with that tag regardless of which project they're in, which is useful for checking on a life area without digging through individual projects. A reasonable rule of thumb: if a category consistently has fewer than 3-5 tasks, it's better as a tag than a project. You can always promote it later if it grows.

## Sync

Super Productivity's built-in WebDAV sync option is labeled as "experimental" and has reports of data loss from conflict resolution failures ([#3361](https://github.com/johannesjo/super-productivity/issues/3361), [#4737](https://github.com/johannesjo/super-productivity/issues/4737), [#5965](https://github.com/super-productivity/super-productivity/issues/5965)). I still think WebDAV is the best sync option. I'm using WebDAV sync with [Fastmail's WebDAV server](https://www.fastmail.help/hc/en-us/articles/1500000277882-Remote-file-access-WebDAV).

##### Fastmail WebDAV Setup

1. In Fastmail, go to **Settings → Privacy & Security → Integrations**.
2. Click **New App Password**, enter your password to verify, and give it a name (e.g. "Super Productivity").
3. Under data access, select **Files (WebDAV)** — not the default mail/contacts/calendars option.
4. Copy the generated password.
5. In Super Productivity, go to **Settings → Sync** and configure:
   - **Sync provider:** WebDAV
   - **Base URL:** `https://myfiles.fastmail.com/`
   - **Username:** your full Fastmail email address
   - **Password:** the app password from step 4
   - **Only sync manually:** enabled

Under the hood, sync uploads a single `sync-data.json` file to your WebDAV server, tagged with a revision number. Conflicts happen when two devices both write between syncs — the app makes you pick one side and throws the other away.

To keep this safe I enable **"only sync manually"** in the WebDAV settings, which turns sync into an explicit pull/push workflow:

:::warning
**Stop any running timers** — syncing while a task is being timed can corrupt the data. I learned this the hard way. The receiving device flagged the database as corrupt and "fixed" it by duplicating every task.
:::

1. Open the app on whatever device you want to use.
2. **Sync** to pull the latest data.
3. Work — add tasks, track time, whatever.
4. **Stop any running timers**, then **sync** to push your changes.
5. Switch devices and repeat.

This avoids background syncs racing between devices. It's the same mental model as `git pull` / `git push` — you're always in control of when data moves.

### App Updates

Be cautious when upgrading the app, especially if you’re using sync across multiple devices. To avoid sync issues or potential data loss:

- **Turn off auto-updates** on Android (F-Droid doesn't auto-update by default; for Google Play, disable auto-update for Super Productivity in your app settings).
- **Update all your devices at the same time.** Sync can break if versions get out of step, since new releases may change the sync file format. Make sure you upgrade desktop and mobile apps together, not one at a time.
- **Always export a backup before upgrading** (Settings → Sync & Backup → Import/Export → Export Data). This gives you a JSON file you can restore from if something goes wrong.

Staying in control of updates will help keep your data safe and your sync working smoothly.

## Calendar Integration

Super Productivity can overlay calendar events on your task timeline, which is helpful for planning your day around meetings. I have two calendars connected:

- **Fastmail** — my personal calendar via an ICS URL (using "iCal Other").
- **Outlook 365 (work)** — also via an ICS URL.

My work calendar only supports ICS URLs, which show busy/free times but not event titles. I use ICS for Fastmail too so both calendars are setup the same way — I'd rather set things up consistently than see titles from only one calendar.

The calendar overlay is read-only regardless of whether you use ICS or CalDAV — events appear alongside your tasks, but tasks don't sync back to the calendar.

## Due Dates

Super Productivity has a scheduled date (when the task appears in your planner) but no separate due date field. This has been [requested](https://github.com/johannesjo/super-productivity/issues/5643) [multiple](https://github.com/super-productivity/super-productivity/issues/6078) [times](https://github.com/super-productivity/super-productivity/issues/726) but hasn't been implemented. My workaround is to put the due date in the task title:

```
Submit expense report due 3/15
```

Then I schedule the task for when I actually want to work on it. It's not as clean as TickTick's separate due date field, but it's totally fine for me.

## Recurring Tasks

TODO: Document how to set up recurring tasks with a specific start date and repeat interval.

## Notes

Super Productivity has a notes feature separate from tasks. Notes don't show up in your Today view or project task lists, so they won't clutter your to-do list. I use them for things I want to remember but don't need to act on — the equivalent of TickTick's "convert task to note" feature.

Each project has its own notes, which is great for keeping reference info close to the relevant work (e.g. deploy steps on the Blog project). The Tags section also has notes, but they're shared across all tags in one bucket rather than per-tag.

## Idle Handling

If you have a timer running and step away from your computer, Super Productivity will detect the inactivity and prompt you with "you have been idle for..." when you come back. This is on by default. The prompt gives you three options:

- **Discard** — remove the idle time from tracking (you were away from work)
- **Keep** — count it toward the task (you were thinking or reading offline)
- **Split** — partially keep and partially discard

You can adjust the idle threshold or turn it off entirely in **Settings → Time & Tracking → Idle Handling**. I'm debating whether I want this on or not.

## Cross-Origin Restrictions

If you're interested in connecting calendars or syncing via WebDAV, then I would suggest using the desktop and mobile apps instead of the web app.

> Due to cross-origin restrictions **[connecting calendars] will likely NOT work with the web browser version of Super Productivity. Please download the desktop version to use this feature!**

> **Making [WebDAV sync] work in a web browser:** Allow Super Productivity to make CORS requests to your WebDAV server. This can have negative security implications! Use at your own risk!

## Keyboard Shortcuts

Super Produtivity supports a ton of keyboard shortcuts, here are some of my favorites:

##### Global (application-wide)

| Shortcut          | Action                            |
|-------------------|-----------------------------------|
| `Shift+A`         | Add new task                      |
| `n`               | Add new note                      |
| `Shift+N`         | Show/hide notes                   |
| `w`               | Focus on first task               |
| `f`               | Enter focus mode                  |

##### Task (applies to selected task)

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
