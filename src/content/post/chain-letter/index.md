---
title: "D3 Radial Tree Visualization"
description: "An interactive radial tree visualization using D3.js, inspired by the Observable notebook example"
publishDate: "2025-07-13"
draft: true
---

# D3 Radial Tree Visualization

This is a radial tree visualization implemented using D3.js, inspired by the [Observable D3 radial tree example](https://observablehq.com/@d3/radial-tree/2). The visualization shows hierarchical data arranged in a circular layout, with the root at the center and branches radiating outward.

<div id="interaction-controls">
    <label for="interaction-mode">Interaction Mode:</label>
    <div class="toggle-group">
        <input type="radio" id="click-mode" name="interaction-mode" value="click" checked>
        <label for="click-mode">Click</label>
        <input type="radio" id="hover-mode" name="interaction-mode" value="hover">
        <label for="hover-mode">Hover</label>
    </div>
</div>

<div id="radial-tree-container">
    <div id="loading">Loading...</div>
</div>

<script src="https://d3js.org/d3.v7.min.js"></script>
<script>
// Global state for interaction mode
let interactionMode = 'click'; // default to click for mobile-friendliness

// Update interaction mode when toggle changes
function initializeControls() {
    const clickRadio = document.getElementById('click-mode');
    const hoverRadio = document.getElementById('hover-mode');
    
    clickRadio.addEventListener('change', () => {
        if (clickRadio.checked) {
            interactionMode = 'click';
        }
    });
    
    hoverRadio.addEventListener('change', () => {
        if (hoverRadio.checked) {
            interactionMode = 'hover';
        }
    });
}

// Load data from the public folder
async function loadData() {
    try {
        const response = await fetch('/robots.json');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to sample data
        return {
            "name": "Root",
            "children": [
                {
                    "name": "Branch A",
                    "children": [
                        {"name": "Leaf A1"},
                        {"name": "Leaf A2"},
                        {
                            "name": "Sub-branch A3",
                            "children": [
                                {"name": "Leaf A3a"},
                                {"name": "Leaf A3b"}
                            ]
                        }
                    ]
                },
                {
                    "name": "Branch B",
                    "children": [
                        {"name": "Leaf B1"},
                        {"name": "Leaf B2"},
                        {"name": "Leaf B3"}
                    ]
                }
            ]
        };
    }
}

// Create the chart using the Observable pattern
function createChart(rawData) {
    // Transform raw API data to D3 format
    function transformRawData(node) {
        const post = node.post;
        let name, author, media = [], text = '';
        
        // Handle different API response formats
        if (post.value) {
            // This is from the repo API (original post)
            const value = post.value;
            text = value.text || '';
            name = `Original Post`;
            
            if (node.source_url) {
                // e.g. "https://bsky.app/profile/mithrilmist.bsky.social/post/3lt6hdhi7gk2k"
                const handleMatch = node.source_url.match(/bsky\.app\/profile\/([^/]+)/);
                if (handleMatch && handleMatch[1]) {
                    author = handleMatch[1];
                } else {
                    author = 'original';
                }
            } else {
                 author = 'original';
            }
            
            // Extract media from repo API format
            const embed = value.embed || {};
            if (embed.$type === 'app.bsky.embed.external') {
                // Handle external embeds (GIFs, images, etc.)
                if (embed.external && embed.external.uri) {
                    media.push({
                        url: embed.external.uri,
                        alt: embed.external.description || '',
                        type: 'external'
                    });
                }
            } else if (embed.$type === 'app.bsky.embed.images') {
                if (embed.images && embed.images.length > 0) {
                    const image = embed.images[0];
                    if (image.image && image.image.ref) {
                        const ref = image.image.ref.$link;
                        const did = post.uri ? post.uri.split('/')[2] : null;
                        if (did) {
                            media.push({
                                url: `https://bsky.social/xrpc/com.atproto.sync.getBlob?did=${did}&cid=${ref}`,
                                alt: image.alt || '',
                                type: 'image'
                            });
                        }
                    }
                }
            }
        } else if (post.record) {
            // This is from the feed API (quote posts)
            const record = post.record;
            const authorData = post.author || {};
            text = record.text || '';
            author = authorData.handle || 'unknown';
            name = `@${author}`;
            
                    // Extract media from feed API format
            const embed = record.embed || {};
            if (embed.$type === 'app.bsky.embed.recordWithMedia') {
                const mediaEmbed = embed.media;
                if (mediaEmbed && mediaEmbed.$type === 'app.bsky.embed.external') {
                     if (mediaEmbed.external && mediaEmbed.external.uri) {
                        media.push({
                            url: mediaEmbed.external.uri,
                            alt: mediaEmbed.external.description || '',
                            type: 'external'
                        });
                    }
                } else if (mediaEmbed && mediaEmbed.$type === 'app.bsky.embed.images') {
                    const authorDid = authorData.did;
                    if (authorDid && mediaEmbed.images && mediaEmbed.images.length > 0) {
                        const image = mediaEmbed.images[0];
                        if (image.image && image.image.ref) {
                            const ref = image.image.ref.$link;
                            media.push({
                                url: `https://bsky.social/xrpc/com.atproto.sync.getBlob?did=${authorDid}&cid=${ref}`,
                                alt: image.alt || '',
                                type: 'image'
                            });
                        }
                    }
                }
            } else if (embed.$type === 'app.bsky.embed.images') {
                const authorDid = authorData.did;
                if (authorDid && embed.images && embed.images.length > 0) {
                    const image = embed.images[0];
                    if (image.image && image.image.ref) {
                        const ref = image.image.ref.$link;
                        media.push({
                            url: `https://bsky.social/xrpc/com.atproto.sync.getBlob?did=${authorDid}&cid=${ref}`,
                            alt: image.alt || '',
                            type: 'image'
                        });
                    }
                }
            } else if (embed.$type === 'app.bsky.embed.video') {
                const video = embed.video || {};
                if (video.ref) {
                    const ref = video.ref.$link;
                    const authorDid = authorData.did;
                    if (authorDid) {
                        media.push({
                            url: `https://bsky.social/xrpc/com.atproto.sync.getBlob?did=${authorDid}&cid=${ref}`,
                            alt: video.alt || '',
                            type: 'video'
                        });
                    }
                }
            } else if (embed.$type === 'app.bsky.embed.external') {
                // Handle external embeds (GIFs, images, etc.)
                if (embed.external && embed.external.uri) {
                    media.push({
                        url: embed.external.uri,
                        alt: embed.external.description || '',
                        type: 'external'
                    });
                }
            }
        }
        
        const d3Node = {
            name: name,
            author: author,
            media: media,
            text: text,
            uri: post.uri,
            depth: node.depth || 0
        };
        
        // Recursively transform children
        if (node.children && node.children.length > 0) {
            d3Node.children = node.children.map(child => transformRawData(child));
        }
        
        return d3Node;
    }
    
    // Transform the raw data to D3 format
    const data = transformRawData(rawData);
    
    // Specify the chart's dimensions.
    const width = 670;
    const height = width;
    const cx = width * 0.5; // adjust as needed to fit
    const cy = height * 0.5; // adjust as needed to fit
    const radius = Math.min(width, height) / 2 - 30;

    // Create a radial tree layout. The layout's first dimension (x)
    // is the angle, while the second (y) is the radius.
    const tree = d3.tree()
        .size([2 * Math.PI, radius])
        .separation((a, b) => (a.parent == b.parent ? 1 : 2) / a.depth);

    // Sort the tree and apply the layout.
    const root = tree(d3.hierarchy(data)
        .sort((a, b) => d3.ascending(a.data.name, b.data.name)));

    // Creates the SVG container.
    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-cx, -cy, width, height])
        .attr("style", "width: 100%; height: auto; font: 10px sans-serif;");

    // Append links.
    svg.append("g")
        .attr("fill", "none")
        .attr("stroke", "#555")
        .attr("stroke-opacity", 0.4)
        .attr("stroke-width", 1.5)
      .selectAll()
      .data(root.links())
      .join("path")
        .attr("d", d3.linkRadial()
            .angle(d => d.x)
            .radius(d => d.y));

    // Create tooltip element
    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background", "rgba(0, 0, 0, 0.9)")
        .style("color", "white")
        .style("padding", "12px")
        .style("border-radius", "8px")
        .style("font-size", "14px")
        .style("pointer-events", "none")
        .style("z-index", "1000")
        .style("max-width", "300px")
        .style("box-shadow", "0 4px 8px rgba(0,0,0,0.3)");

    // Track currently selected node for click mode
    let selectedNode = null;

    // Helper functions for tooltip management
    function showTooltip(event, d) {
        // Highlight the node
        d3.select(event.target)
            .transition()
            .duration(200)
            .attr("r", 4)
            .attr("fill", "#ff6b6b");
        
        // Show tooltip
        tooltip.transition()
            .duration(200)
            .style("opacity", .9);
        
        // Create tooltip content
        let tooltipContent = '';
        
        // Add username
        if (d.data.author) {
            tooltipContent += `<div style="font-weight: bold; margin-bottom: 8px; color: #4A9EFF;">@${d.data.author}</div>`;
        }
        
        // Add media if available
        if (d.data.media && d.data.media.length > 0) {
            d.data.media.forEach(media => {
                if (media.type === 'image') {
                    tooltipContent += `<img src="${media.url}" alt="${media.alt}" style="max-width: 250px; max-height: 200px; border-radius: 4px; display: block; margin: 4px 0;" onerror="this.style.display='none'"/>`;
                } else if (media.type === 'video') {
                    tooltipContent += `<video src="${media.url}" style="max-width: 250px; max-height: 200px; border-radius: 4px; display: block; margin: 4px 0;" muted autoplay loop onerror="this.style.display='none'"></video>`;
                } else if (media.type === 'external') {
                    // Check if it's a YouTube URL
                    const youtubeRegex = /(?:youtube\.com\/(?:shorts\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
                    const youtubeMatch = media.url.match(youtubeRegex);

                    if (youtubeMatch && youtubeMatch[1]) {
                        const videoId = youtubeMatch[1];
                        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
                        tooltipContent += `<iframe width="250" height="140" src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="border-radius: 4px;"></iframe>`;
                    } else {
                        // Fallback for other external content like GIFs
                        tooltipContent += `<img src="${media.url}" alt="${media.alt}" style="max-width: 250px; max-height: 200px; border-radius: 4px; display: block; margin: 4px 0;" onerror="this.style.display='none'"/>`;
                    }
                }
            });
        } else {
            // Fallback: show text preview if no media
            if (d.data.text && d.data.text.trim()) {
                const textPreview = d.data.text.length > 150 ?
                    d.data.text.substring(0, 147) + "..." :
                    d.data.text;
                tooltipContent += `<div style="font-style: italic; color: #ccc;">"${textPreview}"</div>`;
            } else {
                // If no media and no text, show a generic message
                tooltipContent += `<div style="font-style: italic; color: #ccc;">No content available</div>`;
            }
        }
        
        tooltip.html(tooltipContent)
            .style("left", (event.pageX + 15) + "px")
            .style("top", (event.pageY - 15) + "px");
    }

    function hideTooltip(event, d) {
        // Reset the node (unless it's selected in click mode)
        if (interactionMode === 'hover' || selectedNode !== d) {
            d3.select(event.target)
                .transition()
                .duration(200)
                .attr("r", 2.5)
                .attr("fill", d.children ? "#555" : "#999");
        }
        
        // Hide tooltip (unless we're in click mode and this is the selected node)
        if (interactionMode === 'hover' || selectedNode !== d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", 0);
        }
    }

    // Append nodes.
    const nodes = svg.append("g")
      .selectAll()
      .data(root.descendants())
      .join("circle")
        .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`)
        .attr("fill", d => d.children ? "#555" : "#999")
        .attr("r", 2.5)
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) {
            // Only show tooltip on hover if in hover mode
            if (interactionMode === 'hover') {
                showTooltip(event, d);
            }
        })
        .on("mouseout", function(event, d) {
            // Only hide tooltip on mouseout if in hover mode
            if (interactionMode === 'hover') {
                hideTooltip(event, d);
            }
        })
        .on("click", function(event, d) {
            if (interactionMode === 'click') {
                // Handle tooltip toggling in click mode
                if (selectedNode === d) {
                    // Clicking the same node again - hide tooltip
                    hideTooltip(event, d);
                    selectedNode = null;
                } else {
                    // Hide any currently shown tooltip
                    if (selectedNode) {
                        // Find and reset the previously selected node
                        nodes.filter(node => node === selectedNode)
                            .transition()
                            .duration(200)
                            .attr("r", 2.5)
                            .attr("fill", selectedNode.children ? "#555" : "#999");
                    }
                    
                    // Hide previous tooltip
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", 0);
                    
                    // Show new tooltip after a brief delay
                    setTimeout(() => {
                        showTooltip(event, d);
                        selectedNode = d;
                    }, 150);
                }
            } else {
                // In hover mode, clicking navigates to Bluesky
                if (d.data.uri && d.data.author && d.data.author !== 'original' && d.data.author !== 'unknown') {
                    const rkey = d.data.uri.split('/').pop();
                    const url = `https://bsky.app/profile/${d.data.author}/post/${rkey}`;
                    window.open(url, '_blank');
                }
            }
        });

    return svg.node();
}

// Initialize the visualization
async function init() {
    // Initialize the interaction controls
    initializeControls();
    
    const data = await loadData();
    const chart = createChart(data);
    
    // Replace loading message with chart
    const container = document.getElementById('radial-tree-container');
    container.innerHTML = '';
    container.appendChild(chart);
}

// Start the initialization when the page loads
init();

// Add some styling
const style = document.createElement('style');
style.textContent = `
    #interaction-controls {
        text-align: center;
        margin: 1rem 0 2rem 0;
        padding: 1rem;
        background-color: #f8f9fa;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    #interaction-controls label[for="interaction-mode"] {
        display: block;
        font-weight: 600;
        color: #495057;
        margin-bottom: 0.5rem;
        font-size: 1rem;
    }
    
    .toggle-group {
        display: inline-flex;
        background-color: white;
        border: 2px solid #dee2e6;
        border-radius: 6px;
        overflow: hidden;
        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }
    
    .toggle-group input[type="radio"] {
        position: absolute;
        opacity: 0;
        pointer-events: none;
    }
    
    .toggle-group label {
        padding: 0.5rem 1rem;
        cursor: pointer;
        background-color: white;
        color: #6c757d;
        font-weight: 500;
        transition: all 0.2s ease;
        border: none;
        margin: 0;
        min-width: 80px;
        text-align: center;
    }
    
    .toggle-group label:first-of-type {
        border-right: 1px solid #dee2e6;
    }
    
    .toggle-group input[type="radio"]:checked + label {
        background-color: #007bff;
        color: white;
        box-shadow: inset 0 1px 2px rgba(0,0,0,0.1);
    }
    
    .toggle-group label:hover {
        background-color: #f8f9fa;
    }
    
    .toggle-group input[type="radio"]:checked + label:hover {
        background-color: #0056b3;
    }

    #radial-tree-container {
        text-align: center;
        margin: 2rem 0;
        border: 1px solid #ddd;
        border-radius: 8px;
        background-color: #fafafa;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        padding: 1rem;
        min-height: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    #loading {
        font-size: 1.2rem;
        color: #666;
        font-style: italic;
    }
    
    #radial-tree-container svg {
        max-width: 100%;
        height: auto;
    }
    
    .tooltip {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        box-shadow: 0 8px 16px rgba(0,0,0,0.3);
        max-width: 320px;
        word-wrap: break-word;
        border: 1px solid rgba(255,255,255,0.1);
    }
    
    .tooltip img {
        border-radius: 6px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    
    .tooltip video {
        border-radius: 6px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    
    @media (max-width: 768px) {
        #interaction-controls {
            margin: 0.5rem 0 1rem 0;
            padding: 0.75rem;
        }
        
        #radial-tree-container {
            margin: 1rem 0;
            padding: 0.5rem;
        }
        
        .toggle-group label {
            padding: 0.75rem 1rem;
            font-size: 0.9rem;
        }
    }
`;
document.head.appendChild(style);

</script>

## Features

- **Mobile-Friendly Interaction**: Toggle between "Click" and "Hover" modes for optimal experience on any device
- **Clean Interface**: No text labels cluttering the visualization
- **Media-Rich Tooltips**: View Bluesky usernames and their posted media in interactive tooltips
- **Image & Video Support**: Displays images and GIFs/videos directly in tooltips
- **Raw API Data Processing**: Preserves all original Bluesky API data for complete information
- **Node Highlighting**: Nodes grow and change color when selected/hovered
- **Smooth Animations**: Transitions for hover effects and mode changes
- **Dynamic Data Loading**: Loads data from Bluesky conversation trees
- **Clean Observable Pattern**: Uses the exact code structure from the Observable example
- **Hierarchical Layout**: Data is arranged in a radial tree structure with sorted nodes
- **Responsive**: The visualization adapts to different screen sizes using viewBox

### Interaction Modes

**Click Mode (Default)**: Perfect for mobile devices and touch screens
- Tap a node to view its content and media
- Tap the same node again to hide the tooltip
- Tap a different node to switch between tooltips
- Navigation to Bluesky posts is disabled in click mode to prevent conflicts

**Hover Mode**: Ideal for desktop users with mice
- Hover over nodes to instantly preview content
- Move mouse away to hide tooltips
- Click nodes to navigate directly to Bluesky posts

## Data Structure

The visualization now processes raw Bluesky API data in the following format:
```json
{
  "post": { /* Complete Bluesky API response */ },
  "source_url": "https://bsky.app/profile/...",
  "depth": 0,
  "children": [
    {
      "post": { /* Complete quote post API response */ },
      "depth": 1,
      "children": []
    }
  ]
}
```

This preserves all original API data including:
- **Complete user profiles** with handles, DIDs, and display names
- **Full media metadata** including CIDs, alt text, and aspect ratios
- **Embed information** for images, videos, and external links
- **Post metadata** like creation timestamps and language tags

## Technical Implementation

This implementation uses:
- **D3.js v7** for data visualization
- **Bluesky AT Protocol API** for fetching conversation data and media
- **Raw API preservation** to maintain all original data integrity
- **Client-side transformation** from raw API data to D3 format
- **Fetch API** for loading JSON data from the public folder
- **d3.tree()** layout for positioning nodes
- **d3.linkRadial()** for creating curved connections
- **SVG** with viewBox for responsive scaling
- **Observable pattern** with `d3.create()` and `join()` methods
- **Rich media tooltips** with images and videos
- **Hover effects** with node highlighting

The visualization transforms raw Bluesky API responses into a hierarchical structure suitable for D3's radial tree layout, while preserving access to all original metadata for rich interactive experiences.