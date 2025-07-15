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