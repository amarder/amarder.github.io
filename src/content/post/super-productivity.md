---
title: "Super Productivity: My Approach"
description: "How I organize work and personal tasks in Super Productivity with cross-device sync."
publishDate: "2026-03-07"
tags:
  - tools
---

I've used my fair share of todo list systems. When I used Emacs, I really enjoyed [Org Mode](https://orgmode.org/). More recently, I was using [Obsidian Tasks](https://publish.obsidian.md/tasks/Introduction). Obsidian Tasks is a great lightweight solution for keeping track of a todo list, but I wanted a more powerful tool that could also track my time. I spent a day playing around with [TickTick](https://ticktick.com/), but I've decided [Super Productivity](https://super-productivity.com/) is where it's at! Here are some of the features I really value:

- combined tasks with time tracking
- full control of my data
- great keyboard shortcuts
- apps for all the major platforms

This post will walk through how I'm using Super Productivity.

## Tasks

The core building block in Super Productivity is the task. A task is something I want to do. I create a new task by pressing the `+` button or using the keyboard shortcut `Shift+A`. When I create a task, it's helpful to add a time estimate of how long I think it might take. When I start working on a task, I track my time so I can see where I'm spending time. Generally, I like to break my work down into tasks that take an hour or less.

## Projects

I like to organize my tasks into projects. For instance, I have one project named "Blog" for all the tasks I want to do around blogging, and one project named "Home" for all the chores I "want" to do around the house. Each project is a list of tasks. I prioritize my tasks in a project by ordering that list; the tasks at the top of the list are higher priority.

I keep all my tasks — work and personal — on my personal machines so everything lives in one place. When I'm working on my work computer, I use my phone to track my time. To keep projects organized, I use two top-level project folders: **Work** and **Personal**.

I'm using the "Enable Project Backlog" feature on some projects where I have tasks I might do someday but don't need to see every day. Turning this on adds a backlog drawer at the bottom of the project page — it's a convenient way to stash "someday/maybe" tasks out of my daily view.

## Tags

Tags let you categorize and filter tasks across all your projects, making it easy to group related work or highlight priorities. Some common ways people use tags include:

- **Priority levels:** `#high-priority`, `#low-priority`
- **Contexts:** `#phone`, `#email`, `#errand` (useful for tasks you want to batch together)
- **People:** `#alice`, `#team-planning`
- **Task types:** `#bug`, `#feature`, `#research`
- **Status or workflow:** `#waiting`, `#review`, `#blocked`

For example:

```
Email project update to team #email #high-priority
Buy groceries #errand
Fix login bug #bug #alice
```

Clicking on a tag in the sidebar instantly shows you every task marked with that tag, regardless of which project it's part of. This makes it easy to, for example, see everything labeled `#high-priority`, or gather up all your `#errand` tasks for your next outing. Tags can also be organized in tag folders.

## Sync

Super Productivity's built-in WebDAV sync option is labeled "experimental" and there are reports of data loss from conflict resolution failures ([#3361](https://github.com/johannesjo/super-productivity/issues/3361), [#4737](https://github.com/johannesjo/super-productivity/issues/4737), [#5965](https://github.com/super-productivity/super-productivity/issues/5965)). I still think WebDAV is the best sync option for me. I'm using WebDAV sync with [Fastmail's WebDAV server](https://www.fastmail.help/hc/en-us/articles/1500000277882-Remote-file-access-WebDAV).

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

Under the hood, sync uploads a single `sync-data.json` file to your WebDAV server. Conflicts happen when two devices both write between syncs — the app makes you pick one side and throws the other away.

To keep things safe, I enable **"only sync manually"** in the WebDAV settings, which turns sync into an explicit pull/push workflow:

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

- **Outlook 365** — my work calendar via an ICS URL
- **iCal Other** — my personal Fastmail calendar via an ICS URL

My work calendar only supports ICS URLs that show busy/free times (no event titles). I use ICS for Fastmail too, so both calendars are set up the same way — keep it simple. The calendar overlay is read-only regardless of whether you use ICS or CalDAV — events appear alongside your tasks, but tasks don't sync back to the calendar.

## Due Dates

Super Productivity has a scheduled date (when the task appears in your planner) but no separate due date field. This has been [requested](https://github.com/johannesjo/super-productivity/issues/5643) [multiple](https://github.com/super-productivity/super-productivity/issues/6078) [times](https://github.com/super-productivity/super-productivity/issues/726) but hasn't been implemented. My workaround is to put the due date in the task title:

```
Submit expense report due 3/15
```

Then I schedule the task for when I actually want to work on it. It's not as clean as TickTick's separate due date field, but it's totally fine for me.

## Recurring Tasks

To set up a recurring task, open the task's additional info panel and click "Recur." Use "Custom recurring config" for flexible intervals. For example, to schedule something every 4 weeks on a Wednesday:

- **Recur every:** 4
- **Recur cycle:** Week
- **Schedule type:** Fixed schedule (every 4 weeks from start date)
- **Start date:** your desired start date
- **Days:** Wednesday only

There's a bug where the first occurrence ignores the start date and schedules for the next matching day instead ([#5281](https://github.com/super-productivity/super-productivity/issues/5281)). On Friday 3/6/2026, I tried to set up a recurring task to happen every fourth Wednesday starting 3/18/2026, but Super Productivity scheduled the first task for 3/11 (the next Wednesday) rather than 3/18.

## Notes

Super Productivity has a notes feature separate from tasks. Notes don't show up in your Today view or project task lists, so they won't clutter your to-do list. I use them for things I want to remember but don't need to act on — the equivalent of TickTick's "convert task to note" feature.

Each project has its own notes, which is great for keeping reference info close to the relevant work (e.g. deploy steps on the Blog project). The Tags section also has notes, but they're shared across all tags in one bucket rather than per-tag.

## Idle Handling

If you have a timer running and step away from your computer, Super Productivity will detect the inactivity and prompt you with "you have been idle for..." when you come back. This is on by default. The prompt gives you three options:

- **Discard** — remove the idle time from tracking (you were away from work)
- **Keep** — count it toward the task (you were thinking or reading offline)
- **Split** — partially keep and partially discard

You can adjust the idle threshold or turn it off entirely in **Settings → Time & Tracking → Idle Handling**. I've chosen to turn this feature off.

## Cross-Origin Restrictions

If you're interested in connecting calendars or syncing via WebDAV, I'd suggest using the desktop and mobile apps instead of the web app. Here are some warnings I've copied from the web app:

> Due to cross-origin restrictions **[connecting calendars] will likely NOT work with the web browser version of Super Productivity. Please download the desktop version to use this feature!**

> **Making [WebDAV sync] work in a web browser:** Allow Super Productivity to make CORS requests to your WebDAV server. This can have negative security implications! Use at your own risk!

## Keyboard Shortcuts

Super Productivity supports a ton of keyboard shortcuts. Here are some of my favorites (all keyboard shortcuts can be customized in the settings):

##### Global (application-wide)

| Shortcut          | Action                            |
|-------------------|-----------------------------------|
| `Shift+A`         | Add new task                      |
| `n`               | Add new note                      |
| `Shift+N`         | Show/hide notes                   |
| `w`               | Focus on first task               |

##### Task (applies to the selected task)

| Shortcut              | Action                        |
|-----------------------|-------------------------------|
| `Enter`               | Edit title                    |
| `d`                   | Toggle completed state        |
| `y`                   | Start/stop task               |
| `a`                   | Add subtask                   |
| `t`                   | Edit estimate / time spent    |
| `s`                   | Schedule task                 |
| `Shift+T`             | Move to Today's task list     |
| `Ctrl+Shift+↑/↓`      | Move task up/down in the list |
| `Delete`              | Delete task                   |

## Conclusion

Super Productivity is an excellent piece of Free Open Source Software (FOSS). As with Org Mode, I think the killer feature is combining task management with time tracking. Also like Org Mode, Super Productivity is not great for collaboration. If you need to coordinate with multiple people, Super Productivity probably isn't the right tool. In general, I think Super Productivity will be a great tool for me.
