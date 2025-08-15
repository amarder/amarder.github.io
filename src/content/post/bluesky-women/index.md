---
title: "Bluesky and Bad Women: A Data Visualization"
description: "An interactive collapsible tree visualization using D3.js, also lots and lots of bad ass women!"
publishDate: "2025-08-15"
toc: false
tags:
  - d3js
draft: true
# coverImage:
#   src: "robots.png"
#   alt: ""
# ogImage: "/bluesky-robots/robots.png"
---

I was recently entertained by a form of chain letter on Bluesky. It started with a post by Drew Dietsch:

> If you see this, post a bad woman you love

The post spread through the social network creating an epic crowd-sourced collection of bad ass women. I thought it would be fun to create a visualization to better explore both the women featured and the network structure. I hope you like it!

- Click on a node to view the corresponding media and toggle the visibility of its children
- Numbers in parentheses show how many quotes each post generated
- Use zoom and pan controls to explore the visualization in greater detail

<div id="radial-tree-container">
    <div id="loading">Loading...</div>
    <div id="media-panel">
        <button id="close-media-panel" title="Close">×</button>
        <div id="media-content">
            <div id="media-placeholder">Click a node to view media content</div>
        </div>
    </div>
</div>

<link rel="stylesheet" href="/bluesky-women/tree.css">
<script src="https://d3js.org/d3.v7.min.js"></script>
<script src="/bluesky-women/tree.js"></script>

:::note
I limited my download script to collect all nodes with depth less than or equal to 8. I wanted to find a good balance between having a lot of data but not too much (about 0.75 MB). There are even more posts to collect!
:::