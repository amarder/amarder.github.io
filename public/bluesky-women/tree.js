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
                .attr("r", 4)
                .attr("fill", d => d._children ? "#555" : "#fff")
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
let svg, g, tree, root;
let duration = 750;
let i = 0; // counter for unique IDs

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
        const response = await fetch('/bluesky-women/data.json');
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

// Collapse the node and all its children
function collapse(d) {
    if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
    }
}

// Handle node click for media display and toggle children
function click(event, d) {
    // Don't propagate the click to avoid conflicts
    event.stopPropagation();
    
    // Show media content for the clicked node
    showMedia(event, d);
    
    // Also toggle children visibility
    if (d.children) {
        // Collapse: hide all children
        d._children = d.children;
        d.children = null;
    } else if (d._children) {
        // Expand: show only immediate children, keep their children collapsed
        d.children = d._children;
        d._children = null;
        
        // Ensure all newly revealed children are collapsed
        if (d.children) {
            d.children.forEach(child => {
                if (child.children) {
                    child._children = child.children;
                    child.children = null;
                }
            });
        }
    }
    
    // Update the tree
    update(d);
}

// Handle node expansion/collapse with double-click
function expandCollapse(event, d) {
    // Don't propagate the click to avoid conflicts with media display
    event.stopPropagation();
    
    if (d.children) {
        // Collapse: hide all children
        d._children = d.children;
        d.children = null;
    } else if (d._children) {
        // Expand: show only immediate children, keep their children collapsed
        d.children = d._children;
        d._children = null;
        
        // Ensure all newly revealed children are collapsed
        if (d.children) {
            d.children.forEach(child => {
                if (child.children) {
                    child._children = child.children;
                    child.children = null;
                }
            });
        }
    }
    update(d);
}

// Handle node right-click or double-click for media display
function showMedia(event, d) {
    event.stopPropagation();
    
    // Reset all nodes to default state first
    d3.selectAll('#radial-tree-container circle')
        .transition()
        .duration(200)
        .attr("r", 4)
        .attr("fill", d => d._children ? "#555" : "#fff")
        .attr("stroke", "#000");
    
    // Highlight the selected node
    d3.select(event.target)
        .transition()
        .duration(200)
        .attr("r", 6)
        .attr("fill", "#ff6b6b")
        .attr("stroke", "#000");
    
    // Track this as the selected node
    selectedNode = d;
    lastViewedNode = d;
    
    // Show media content
    showMediaContent(d);
}

// Update function to redraw the tree
function update(source) {
    // Compute the new tree layout
    const treeData = tree(root);
    const nodes = treeData.descendants();
    const links = treeData.descendants().slice(1);

    // Normalize for fixed-depth
    nodes.forEach(d => { d.y = d.depth * 180; });

    // Update the nodes…
    const node = g.selectAll('g.node')
        .data(nodes, d => d.id || (d.id = ++i));

    // Enter any new nodes at the parent's previous position
    const nodeEnter = node.enter().append('g')
        .attr('class', 'node')
        .attr("transform", d => `translate(${source.y0},${source.x0})`)
        .on('click', click)
        .on('dblclick', expandCollapse)
        .on('contextmenu', function(event, d) {
            event.preventDefault();
            expandCollapse(event, d);
        });

    // Add Circle for the nodes
    nodeEnter.append('circle')
        .attr('class', 'node')
        .attr('r', 1e-6)
        .style("fill", d => d._children ? "#555" : "#fff")
        .style("stroke", "#000")
        .style("stroke-width", "1.5px")
        .style("cursor", "pointer");

    // Add labels for the nodes
    nodeEnter.append('text')
        .attr("dy", ".35em")
        .attr("x", 13)
        .attr("text-anchor", "start")
        .text(d => {
            const hasChildren = d.children || d._children;
            const childCount = hasChildren ? (d.children ? d.children.length : d._children.length) : 0;
            return hasChildren ? `${d.data.name} (${childCount})` : d.data.name;
        })
        .style("fill-opacity", 1e-6)
        .style("font", "10px sans-serif")
        .style("cursor", "pointer");

    // Update
    const nodeUpdate = nodeEnter.merge(node);

    // Transition to the proper position for the node
    nodeUpdate.transition()
        .duration(duration)
        .attr("transform", d => `translate(${d.y},${d.x})`);

    // Update the node attributes and style
    nodeUpdate.select('circle.node')
        .attr('r', 4)
        .style("fill", d => d._children ? "#555" : "#fff")
        .style("stroke", "#000")
        .style("stroke-width", "1.5px")
        .attr('cursor', 'pointer');

    nodeUpdate.select("text")
        .style("fill-opacity", 1)
        .attr("x", 13)
        .attr("text-anchor", "start")
        .text(d => {
            const hasChildren = d.children || d._children;
            const childCount = hasChildren ? (d.children ? d.children.length : d._children.length) : 0;
            return hasChildren ? `${d.data.name} (${childCount})` : d.data.name;
        });

    // Remove any exiting nodes
    const nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", d => `translate(${source.y},${source.x})`)
        .remove();

    // On exit reduce the node circles size to 0
    nodeExit.select('circle')
        .attr('r', 1e-6);

    // On exit reduce the opacity of text labels
    nodeExit.select('text')
        .style('fill-opacity', 1e-6);

    // Update the links…
    const link = g.selectAll('path.link')
        .data(links, d => d.id);

    // Enter any new links at the parent's previous position
    const linkEnter = link.enter().insert('path', "g")
        .attr("class", "link")
        .style("fill", "none")
        .style("stroke", "#ccc")
        .style("stroke-width", "1.5px")
        .attr('d', d => {
            const o = {x: source.x0, y: source.y0};
            return diagonal(o, o);
        });

    // Update
    const linkUpdate = linkEnter.merge(link);

    // Transition back to the parent element position
    linkUpdate.transition()
        .duration(duration)
        .attr('d', d => diagonal(d, d.parent));

    // Remove any exiting links
    link.exit().transition()
        .duration(duration)
        .attr('d', d => {
            const o = {x: source.x, y: source.y};
            return diagonal(o, o);
        })
        .remove();

    // Store the old positions for transition
    nodes.forEach(d => {
        d.x0 = d.x;
        d.y0 = d.y;
    });
}

// Creates a curved (diagonal) path from parent to the child nodes
function diagonal(s, d) {
    const path = `M ${s.y} ${s.x}
                  C ${(s.y + d.y) / 2} ${s.x},
                    ${(s.y + d.y) / 2} ${d.x},
                    ${d.y} ${d.x}`;
    return path;
}

// Create the chart using the collapsible tree pattern
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
    
    // Set the dimensions and margins of the diagram
    const margin = {top: 20, right: 90, bottom: 30, left: 90};
    const width = 1000 - margin.left - margin.right;
    const height = 800 - margin.bottom - margin.top;

    // Declares a tree layout and assigns the size
    tree = d3.tree()
        .size([height, width]);

    // Assigns parent, children, height, depth
    root = d3.hierarchy(data, d => d.children);
    root.x0 = height / 2;
    root.y0 = 0;

    // Start with only the root node visible - collapse all children
    if (root.children) {
        root._children = root.children;
        root.children = null;
    }

    // Creates the SVG container
    svg = d3.create("svg")
        .attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom)
        .attr("viewBox", [0, 0, width + margin.right + margin.left, height + margin.top + margin.bottom])
        .attr("style", "width: 100%; height: auto; font: 10px sans-serif;");

    // Create a group for all tree content
    g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up zoom behavior
    const zoom = d3.zoom()
        .scaleExtent([0.1, 4])
        .on("zoom", function(event) {
            g.attr("transform", `translate(${margin.left + event.transform.x},${margin.top + event.transform.y}) scale(${event.transform.k})`);
        });

    // Apply zoom behavior to SVG
    svg.call(zoom);

    // Set up zoom control buttons
    function setupZoomControls() {
        const zoomControls = document.getElementById('zoom-controls');
        const zoomInBtn = document.getElementById('zoom-in');
        const zoomOutBtn = document.getElementById('zoom-out');
        const zoomResetBtn = document.getElementById('zoom-reset');
        
        if (zoomControls && zoomInBtn && zoomOutBtn && zoomResetBtn) {
            // Show controls for easier navigation
            zoomControls.style.display = 'block';
            
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
    
    // Initialize zoom controls
    setupZoomControls();

    // Initialize the tree
    update(root);

    // Auto-click the root node to show its media and expand children
    setTimeout(() => {
        // Find the root node circle element
        const rootCircle = g.select('g.node circle');
        if (!rootCircle.empty()) {
            // Create a synthetic click event for the root node
            const rootNode = rootCircle.datum();
            const syntheticEvent = { 
                stopPropagation: () => {},
                target: rootCircle.node()
            };
            click(syntheticEvent, rootNode);
        }
    }, 100); // Small delay to ensure DOM is ready

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