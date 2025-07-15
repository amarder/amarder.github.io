---
title: "D3 Radial Tree Visualization"
description: "An interactive radial tree visualization using D3.js, inspired by the Observable notebook example"
publishDate: "2025-07-15"
---

# D3 Radial Tree Visualization

This is a radial tree visualization implemented using D3.js, inspired by the [Observable D3 radial tree example](https://observablehq.com/@d3/radial-tree/2). The visualization shows hierarchical data arranged in a circular layout, with the root at the center and branches radiating outward.



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



<script src="https://d3js.org/d3.v7.min.js"></script>
<script>
// Initialize close button functionality
function initializeCloseButton() {
    const closeButton = document.getElementById('close-media-panel');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            const mediaPanel = document.getElementById('media-panel');
            const mediaContent = document.getElementById('media-content');
            const mediaPlaceholder = document.getElementById('media-placeholder');
            
            // Reset all nodes to default state
            d3.selectAll('#radial-tree-container circle')
                .transition()
                .duration(200)
                .attr("r", 2.5)
                .attr("fill", "#fff")
                .attr("stroke", "#000");
            
            // Clear selection state
            selectedNode = null;
            lastViewedNode = null;
            
            // Show placeholder
            mediaContent.innerHTML = '<div id="media-placeholder">Click a node to view media content</div>';
            mediaPanel.style.display = 'none';
        });
    }
}

// Global variables for tracking state
let selectedNode = null;
let lastViewedNode = null;

// Helper functions for media panel management
function showMediaContent(d) {
    // Get media panel elements
    const mediaPanel = document.getElementById('media-panel');
    const mediaContent = document.getElementById('media-content');
    
    if (!mediaPanel || !mediaContent) return;
    
    // Create media content
    let content = '';
    
    // Add user info
    if (d.data.displayName) {
        content += `<div class="user-info">`;
        if (d.data.postUrl && d.data.postUrl.startsWith('http')) {
            content += `<a href="${d.data.postUrl}" target="_blank" rel="noopener noreferrer" class="user-link">
                <div class="display-name">${d.data.displayName}</div>`;
            if (d.data.author && d.data.author !== 'unknown') {
                content += `<div class="handle">@${d.data.author}</div>`;
            }
            content += `</a>`;
        } else {
            content += `<div class="display-name">${d.data.displayName}</div>`;
            if (d.data.author && d.data.author !== 'unknown') {
                content += `<div class="handle">@${d.data.author}</div>`;
            }
        }
        content += `</div>`;
    }
    
    // Add media if available
    if (d.data.media && d.data.media.length > 0) {
        content += `<div class="media-grid">`;
        d.data.media.forEach(media => {
            if (media.type === 'image') {
                content += `<div class="media-item">
                    <img src="${media.url}" alt="Media content" onerror="this.style.display='none'"/>
                </div>`;
            } else if (media.type === 'video') {
                content += `<div class="media-item">
                    <video src="${media.url}" muted autoplay loop onerror="this.style.display='none'"></video>
                </div>`;
            } else if (media.type === 'external') {
                // Check if it's a YouTube URL
                const youtubeRegex = /(?:youtube\.com\/(?:shorts\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
                const youtubeMatch = media.url.match(youtubeRegex);

                if (youtubeMatch && youtubeMatch[1]) {
                    const videoId = youtubeMatch[1];
                    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
                    content += `<div class="media-item">
                        <iframe src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                    </div>`;
                } else {
                    // Fallback for other external content like GIFs
                    content += `<div class="media-item">
                        <img src="${media.url}" alt="External media" onerror="this.style.display='none'"/>
                    </div>`;
                }
            }
        });
        content += `</div>`;
    } else {
        // If no media, show a message
        content += `<div class="no-media">No media content available</div>`;
    }
    
    // Update media panel
    mediaContent.innerHTML = content;
    mediaPanel.style.display = 'block';
}

function showPlaceholder() {
    const mediaPanel = document.getElementById('media-panel');
    const mediaContent = document.getElementById('media-content');
    const mediaPlaceholder = document.getElementById('media-placeholder');
    
    if (!mediaPanel || !mediaContent || !mediaPlaceholder) return;
    
    mediaContent.innerHTML = '';
    mediaContent.appendChild(mediaPlaceholder);
    mediaPanel.style.display = 'block';
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
    // Transform ultra-slim data to D3 format
    function transformSlimData(node) {
        // Extract data from the ultra-slim format
        const displayName = node.display_name;
        const postUrl = node.post_url;
        const media = node.media_urls || [];
        
        // Extract author handle from post URL if available
        let author = 'unknown';
        if (postUrl && postUrl.startsWith('https://bsky.app/profile/')) {
            const urlParts = postUrl.split('/');
            if (urlParts.length >= 5) {
                author = urlParts[4]; // Extract handle from URL
            }
        }
        
        // Create display name for the node
        let name;
        if (displayName) {
            name = displayName;
        } else if (author && author !== 'unknown') {
            name = `@${author}`;
        } else {
            name = 'Unknown User';
        }
        
        const d3Node = {
            name: name,
            author: author,
            displayName: displayName,
            media: media,
            postUrl: postUrl
        };
        
        // Recursively transform children
        if (node.children && node.children.length > 0) {
            d3Node.children = node.children.map(child => transformSlimData(child));
        }
        
        return d3Node;
    }
    
    // Transform the slimmed-down data to D3 format
    const data = transformSlimData(rawData);
    
    // Specify the chart's dimensions.
    const width = 1200;
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

    // Create a group for all zoomable content
    const g = svg.append("g");

    // Append links.
    g.append("g")
        .attr("fill", "none")
        .attr("stroke", "#000")
        .attr("stroke-opacity", 0.4)
        .attr("stroke-width", 1)
      .selectAll()
      .data(root.links())
      .join("path")
        .attr("d", d3.linkRadial()
            .angle(d => d.x)
            .radius(d => d.y));

    // Helper functions for media panel management
    function showMedia(event, d) {
        // Highlight the node
        d3.select(event.target)
            .transition()
            .duration(200)
            .attr("r", 4)
            .attr("fill", "#ff6b6b");
        
        // Track this as the last viewed node
        lastViewedNode = d;
        
        // Show media content
        showMediaContent(d);
    }

    // Set up zoom behavior
    const zoom = d3.zoom()
        .scaleExtent([0.1, 4])
        .on("zoom", function(event) {
            g.attr("transform", event.transform);
        });

    // Apply zoom behavior to SVG
    svg.call(zoom);

    // Set up zoom control buttons (hidden)
    function setupZoomControls() {
        const zoomControls = document.getElementById('zoom-controls');
        const zoomInBtn = document.getElementById('zoom-in');
        const zoomOutBtn = document.getElementById('zoom-out');
        const zoomResetBtn = document.getElementById('zoom-reset');
        
        if (zoomControls && zoomInBtn && zoomOutBtn && zoomResetBtn) {
            // Keep controls hidden
            zoomControls.style.display = 'none';
            
            // Zoom in
            zoomInBtn.addEventListener('click', () => {
                svg.transition()
                    .duration(300)
                    .call(zoom.scaleBy, 1.5);
            });
            
            // Zoom out
            zoomOutBtn.addEventListener('click', () => {
                svg.transition()
                    .duration(300)
                    .call(zoom.scaleBy, 1 / 1.5);
            });
            
            // Reset zoom
            zoomResetBtn.addEventListener('click', () => {
                svg.transition()
                    .duration(500)
                    .call(zoom.transform, d3.zoomIdentity);
            });
        }
    }
    
    // Initialize zoom controls (hidden)
    setupZoomControls();

    // Append nodes.
    const nodes = g.append("g")
      .selectAll()
      .data(root.descendants())
      .join("circle")
        .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`)
        .attr("fill", "#fff")
        .attr("stroke", "#000")
        .attr("stroke-width", 1)
        .attr("r", 2.5)
        .style("cursor", "pointer")
        .on("click", function(event, d) {
            // Handle media panel toggling
            if (selectedNode === d) {
                // Clicking the same node again - hide media and show placeholder
                const mediaPanel = document.getElementById('media-panel');
                const mediaContent = document.getElementById('media-content');
                const mediaPlaceholder = document.getElementById('media-placeholder');
                
                // Reset the node styling
                d3.select(event.target)
                    .transition()
                    .duration(200)
                    .attr("r", 2.5)
                    .attr("fill", "#fff")
                    .attr("stroke", "#000");
                
                // Clear selection state
                selectedNode = null;
                lastViewedNode = null;
                
                // Show placeholder
                mediaContent.innerHTML = '<div id="media-placeholder">Click a node to view media content</div>';
                mediaPanel.style.display = 'none';
            } else {
                // Reset all nodes to default state
                d3.selectAll('#radial-tree-container circle')
                    .transition()
                    .duration(200)
                    .attr("r", 2.5)
                    .attr("fill", "#fff")
                    .attr("stroke", "#000");
                
                // Hide previous media panel
                const mediaPanel = document.getElementById('media-panel');
                const mediaContent = document.getElementById('media-content');
                mediaContent.innerHTML = '<div id="media-placeholder">Click a node to view media content</div>';
                mediaPanel.style.display = 'none';
                
                // Show new media after a brief delay
                setTimeout(() => {
                    showMedia(event, d);
                    selectedNode = d;
                    lastViewedNode = d;
                }, 150);
            }
        });

    return svg.node();
}

// Initialize the visualization
async function init() {
    // Initialize the close button
    initializeCloseButton();
    
    const data = await loadData();
    const chart = createChart(data);
    
    // Replace loading message with chart
    const container = document.getElementById('radial-tree-container');
    const loading = document.getElementById('loading');
    if (loading) {
        loading.remove();
    }
    
    // Clear any existing chart content
    const existingChart = container.querySelector('svg');
    if (existingChart) {
        existingChart.remove();
    }
    
    // Append the new chart
    if (chart && chart.nodeType) {
        container.appendChild(chart);
    } else if (chart) {
        console.error('Chart is not a valid DOM node:', chart);
    } else {
        console.error('Chart is null or undefined');
    }
    
    // Show placeholder in media panel by default
    showPlaceholder();
}

// Start the initialization when the page loads
init();

// Add some styling
const style = document.createElement('style');
style.textContent = `


    #radial-tree-container {
        text-align: center;
        margin: 2rem 0;
        border: 1px solid #ddd;
        border-radius: 8px;
        background-color: #fafafa;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        padding: 1rem;
        min-height: 200px;
        max-height: 90vh;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;
    }
    
    #media-panel {
        position: absolute;
        top: 1rem;
        right: 1rem;
        width: 50%;
        max-height: 81vh;
        background-color: rgba(248, 249, 250, 0.95);
        backdrop-filter: blur(10px);
        border: 1px solid #e9ecef;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        padding: 0.5rem;
        overflow-y: auto;
        display: none;
        z-index: 10;
    }
    
    #close-media-panel {
        position: absolute;
        top: 0.25rem;
        right: 0.25rem;
        width: 24px;
        height: 24px;
        border: none;
        background-color: rgba(255, 255, 255, 0.8);
        color: #6c757d;
        border-radius: 50%;
        font-size: 18px;
        font-weight: bold;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        z-index: 11;
    }
    
    #close-media-panel:hover {
        background-color: rgba(255, 255, 255, 1);
        color: #495057;
        transform: scale(1.1);
    }
    
    #close-media-panel:active {
        transform: scale(0.95);
    }
    
    #zoom-controls {
        position: absolute;
        top: 1rem;
        right: 1rem;
        display: none;
        flex-direction: column;
        gap: 0.5rem;
        z-index: 10;
    }
    
    #zoom-controls button {
        width: 40px;
        height: 40px;
        border: 2px solid #007bff;
        background-color: white;
        color: #007bff;
        border-radius: 6px;
        font-size: 18px;
        font-weight: bold;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
    }
    
    #zoom-controls button:hover {
        background-color: #007bff;
        color: white;
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }
    
    #zoom-controls button:active {
        transform: translateY(0);
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    #zoom-controls button:focus {
        outline: 2px solid #007bff;
        outline-offset: 2px;
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
    
    #media-panel.active {
        display: block;
    }
    
    #media-placeholder {
        text-align: center;
        color: #6c757d;
        font-style: italic;
        font-size: 0.9rem;
        padding: 1rem;
    }
    
    .user-info {
        margin-bottom: 0.5rem;
        text-align: left;
    }
    
    .display-name {
        font-size: 0.9rem;
        font-weight: bold;
        color: #495057;
        line-height: 1.2;
        margin-bottom: 0.25rem;
    }
    
    .handle {
        font-size: 0.7rem;
        color: #6c757d;
        font-family: monospace;
    }
    
    .user-link {
        text-decoration: none;
        transition: color 0.2s ease;
        display: block;
    }
    
    .user-link:hover {
        text-decoration: underline;
    }
    
    .user-link:hover .display-name {
        color: #007bff;
    }
    
    .user-link:hover .handle {
        color: #007bff;
    }
    
    .media-grid {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .media-item {
        background: white;
        border-radius: 6px;
        overflow: hidden;
        box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        transition: transform 0.2s ease;
        margin: 0;
    }
    

    
    .media-item img,
    .media-item video,
    .media-item iframe {
        width: 100%;
        height: auto;
        max-height: 72.9vh;
        object-fit: contain;
        display: block;
        margin: 0px;
    }
    
    .media-item iframe {
        aspect-ratio: 16/9;
        height: auto;
        max-height: 72.9vh;
    }
    
    .no-media {
        text-align: center;
        color: #6c757d;
        font-style: italic;
        padding: 1rem;
        font-size: 0.9rem;
    }
    
    @media (max-width: 768px) {
        #radial-tree-container {
            margin: 1rem 0;
            padding: 0.5rem;
        }
        
        #zoom-controls {
            top: 0.5rem;
            right: 0.5rem;
            gap: 0.25rem;
        }
        
        #zoom-controls button {
            width: 44px;
            height: 44px;
            font-size: 20px;
            border-width: 3px;
        }
        
        #media-panel {
            width: 50%;
            top: 0.5rem;
            right: 0.5rem;
            padding: 0.75rem;
        }
        
        .display-name {
            font-size: 0.6rem;
        }
        
        .handle {
            font-size: 0.5rem;
        }
        
        .media-item img,
        .media-item video,
        .media-item iframe {
            max-height: 72.9vh;
        }
        
        .media-item iframe {
            max-height: 72.9vh;
        }
    }
`;
document.head.appendChild(style);

</script>

## Features

- **Mobile-Friendly Interaction**: Toggle between "Click" and "Hover" modes for optimal experience on any device
- **Zoom and Pan**: Fully zoomable and pannable interface with dedicated controls for easy navigation
- **Clean Interface**: No text labels cluttering the visualization
- **Media-Rich Tooltips**: View Bluesky usernames and their posted media in interactive tooltips
- **Image & Video Support**: Displays images and GIFs/videos directly in tooltips
- **Raw API Data Processing**: Preserves all original Bluesky API data for complete information
- **Node Highlighting**: Nodes grow and change color when selected/hovered
- **Smooth Animations**: Transitions for hover effects, mode changes, and zoom operations
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

### Zoom and Pan Controls

**Mouse/Trackpad (Desktop)**:
- **Scroll wheel**: Zoom in and out
- **Click and drag**: Pan around the visualization
- **Pinch gesture**: Zoom on trackpads

**Touch (Mobile)**:
- **Pinch**: Zoom in and out
- **Drag**: Pan around the visualization
- **Zoom buttons**: Use the +/−/⌂ controls in the top-right corner

**Zoom Controls**:
- **+ button**: Zoom in by 1.5x
- **− button**: Zoom out by 1.5x  
- **⌂ button**: Reset to original view
- **Zoom range**: 10% to 400% of original size

## Data Structure

The visualization now processes ultra-slim Bluesky data in the following format:
```json
{
  "display_name": "User Display Name",
  "post_url": "https://bsky.app/profile/handle/post/id",
  "media_urls": [
    {
      "url": "https://media.example.com/image.jpg",
      "type": "image"
    }
  ],
  "children": [
    {
      "display_name": "Quote Author",
      "post_url": "https://bsky.app/profile/quotehandle/post/quoteid",
      "media_urls": [],
      "children": []
    }
  ]
}
```

This ultra-slim format includes only essential data:
- **Display names** for user identification
- **Post URLs** for navigation (author handles extracted from URLs)
- **Media URLs** for content display (no alt text to save space)
- **Hierarchical structure** for the conversation tree

## Technical Implementation

This implementation uses:
- **D3.js v7** for data visualization
- **Ultra-slim data format** for minimal file sizes and fast loading
- **URL-based author extraction** to avoid data duplication
- **Client-side transformation** from slim data to D3 format
- **Fetch API** for loading JSON data from the public folder
- **d3.tree()** layout for positioning nodes
- **d3.linkRadial()** for creating curved connections
- **d3.zoom()** behavior for smooth zoom and pan interactions
- **SVG** with viewBox for responsive scaling
- **Observable pattern** with `d3.create()` and `join()` methods
- **Rich media tooltips** with images and videos
- **Zoom controls** with dedicated UI buttons for mobile accessibility
- **Transform-aware positioning** for tooltips during zoom/pan operations

The visualization transforms ultra-slim Bluesky data into a hierarchical structure suitable for D3's radial tree layout, while maintaining all essential functionality with minimal data overhead.