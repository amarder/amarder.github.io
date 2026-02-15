---
title: "Immich: Photo Portability"
description: "How to set up Immich so migrating to another tool in the future will be easy."
publishDate: "2026-02-14"
tags:
  - tools
posse:
  - "[Reddit](https://www.reddit.com/r/immich/comments/1r4j9fr/photo_portability/)"
---

I really appreciate this approach from Obsidian:

> Obsidian uses open file formats, so you're never locked in. You own your data for the long term.

This post describes the techniques I use to avoid lock-in with Immich. To prepare for a migration from Immich, I want two things:

1. **My original files** organized in a sensible folder structure on disk.
2. **My metadata** (descriptions, ratings, tags, dates, GPS coordinates) stored alongside those files in a standard format that other tools can read.

If I achieve both of these, I can point any future photo management tool at my library and pick up roughly where I left off.

## Storage Template

By default, Immich stores uploaded files using its own internal naming scheme. This is fine for Immich, but if you ever browse your library folder directly, it's not great. The [Storage Template](https://immich.app/docs/administration/storage-template/) feature lets you control how files are organized on disk.

Go to **Administration > Settings > Storage Template** and enable it. I use the default template:

```
{{y}}/{{y}}-{{MM}}-{{dd}}/{{filename}}
```

This organizes photos into `YYYY/YYYY-MM-DD/OriginalFilename.ext`, which gives me a clean date-based folder structure that any tool (or human) can navigate. The `{{filename}}` variable preserves the original filename from my phone or camera. If multiple files would end up with the same name, Immich automatically appends a sequence number to prevent overwrites.

After changing the template, run the **Storage Template Migration** job to reorganize your existing files.

## XMP Sidecars

Immich stores metadata (descriptions, ratings, tags, etc.) in its PostgreSQL database. If you stop running Immich, that database will be difficult to migrate to most other tools. The solution is [XMP sidecar files](https://docs.immich.app/features/xmp-sidecars/), small XML files that sit next to your photos and store metadata in a standard format that tools like Lightroom, Darktable, and digiKam can read.

Immich automatically writes to XMP sidecars whenever you edit the following fields:

1. Description
2. Rating
3. DateTime
4. Location
5. Tags

After editing any of these in the Immich UI, a Sidecar Write job is queued, and the `.xmp` file next to your photo is updated. No extra configuration needed.

## Tags Over Albums

Here's the most important habit change: **use tags instead of albums when you can.** I had to enable tags in my account settings (**Account Settings > Features > Tags**).

Albums in Immich are stored only in the database. If you leave Immich, your album organization is gone. Tags, on the other hand, are written to XMP sidecars (specifically to the `digiKam:TagsList` field). This means your organizational work survives a migration.

Tags in Immich are hierarchical, so you can create structures like:

- `Events/Wedding`
- `Events/Vacation/Italy 2025`
- `People/Family`

This gives you album-like organization that's portable. Other tools that read XMP sidecars (digiKam, Lightroom, etc.) will pick up these tags automatically.

Albums are still important for sharing, but for my primary organizational structure, I use tags.

## Summary

| Setting | What to do | Why |
|---|---|---|
| Storage Template | Choose a storage template you like and run a migration job | Files are organized sensibly on disk |
| XMP Sidecars | Edit metadata in the UI | Metadata is automatically written to standard `.xmp` files |
| Tags | Use tags for organization | Tags are written to XMP, albums are not |

The core idea is simple: anything stored only in Immich's database is at risk if you leave Immich. The storage template keeps your files organized on the filesystem, and XMP sidecars keep your metadata in a standard format alongside those files. Prefer tags over albums so your organizational work is portable.

## References

Useful pages from the Immich docs:

- [Storage Template](https://docs.immich.app/administration/storage-template)
- [XMP Sidecars](https://docs.immich.app/features/xmp-sidecars)
- [Tags](https://docs.immich.app/features/tags)