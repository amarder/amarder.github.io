---
title: Responsive D3.js
date: 2016-04-02
---

Q: Is it possible to create a scatter plot that is a pleasure to navigate on both a phone and a computer?

A: Yes, with some caveats.

Using [D3.js](https://d3js.org/), [Zoom Behavior](https://github.com/mbostock/d3/wiki/Zoom-Behavior), and [D3-tip](http://labratrevenge.com/d3-tip/), I've created a graph that works reasonably well on both a phone and a computer. Each point in the graph is a book from [NPR's Best Books of 2015](http://apps.npr.org/best-books-2015/). Clicking a point brings up a tooltip describing the book. The tooltip lists the book's title, author, Amazon sales rank, number of pages, and provides a link to the book on Amazon. Clicking the point again closes the tooltip.

<div id="scatter"></div>

If I were designing this graph for use on a computer only, I would do things a bit differently. I would make the tooltips appear on mouseover events and disappear on mouseout events. Instead of having the link to the book's Amazon page in the tooltip, I would make the point itself the link. I would also make the radius of each point a bit smaller. These changes would make navigating the graph much faster on a computer, but the reliance on mouseover events would make the graph unfriendly to mobile users.

<script src="/js/d3.min.js" charset="utf-8"></script>
<script src="./d3.tip.v0.6.3.js"></script>
<script src="./scatter.js"></script>
<link rel="stylesheet" href="./scatter.css">
