---
title: "[OC] Interactive Radial Tree: Robots on Bluesky"
description: "A D3.js visualization showing how a robot-sharing chain letter went viral on Bluesky, with over 20,000+ posts and 21 levels deep"
publishDate: "2025-07-16T11:00:00-04:00"
---

![](/bluesky-robots/robots.png)

**Live Demo**: https://andrewmarder.net/bluesky-robots/

A viral chain letter on Bluesky asked users to "quote with a robot that isn’t from 'Star Wars,' 'Star Trek,' 'Dr. Who,' or 'Transformers.'" This interactive D3.js visualization shows how it spread across 2,000+ posts.

**Features**: Click nodes to see robot images/GIFs, zoom/pan to explore the network structure.

**Data**: Collected via Bluesky API using breadth-first search traversal, visualized as a radial tree.

**Source Code**:
- https://github.com/amarder/amarder.github.io/tree/source/public/bluesky-robots
- https://github.com/amarder/amarder.github.io/tree/source/src/content/post/bluesky-robots