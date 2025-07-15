---
title: "Bluesky and Robots: A Data Visualization"
description: "An interactive radial tree visualization using D3.js"
publishDate: "2025-07-15"
toc: false
tags:
  - d3js
# coverImage:
#   src: "robots.png"
#   alt: ""
ogImage: "/chain-letter/robots.png"
---

I was recently entertained by a form of chain letter on Bluesky. It all started with a post by Mithrilmist:

> If you see this, quote with a robot that isn’t from “Star Wars,” “Star Trek,” “Dr. Who,” or “Transformers.”

This post spread through the social network like wildfire, creating an epic crowd-sourced collection of awesome robots. I thought it would be fun to create a visualization to get a better view of the robots (and the network). I hope you like it!

- Click on a node in the graph below to see the corresponding robot
- You can zoom and pan in the visualization to see more details

<div id="radial-tree-container">
    <div id="loading">Loading...</div>
    <div id="media-panel">
        <button id="close-media-panel" title="Close">×</button>
        <div id="media-content">
            <div id="media-placeholder">Click a node to view media content</div>
        </div>
    </div>
    <div id="zoom-controls" style="display: none;">
        <button id="zoom-in" title="Zoom In">+</button>
        <button id="zoom-out" title="Zoom Out">−</button>
        <button id="zoom-reset" title="Reset Zoom">⌂</button>
    </div>
</div>

<link rel="stylesheet" href="/chain-letter/radial-tree.css">
<script src="https://d3js.org/d3.v7.min.js"></script>
<script src="/chain-letter/radial-tree.js"></script>

:::note
I limited my download script to collect all nodes with depth less than or equal to 21. I wanted to find a good balance between having a lot of data but not too much (about 2 MB). There are even more robots to collect!
:::