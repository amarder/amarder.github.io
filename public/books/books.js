// Global variables for tracking state
let selectedBook = null;
let lastViewedBook = null;
let allBooks = [];

// Initialize close button functionality
function initializeCloseButton() {
    const closeButton = document.getElementById('close-book-panel');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            const bookPanel = document.getElementById('book-info-panel');
            const bookContent = document.getElementById('book-content');
            
            // Reset all points to default state
            d3.selectAll('#books-container circle:not(.legend-circle)')
                .transition()
                .duration(200)
                .attr("r", 4)
                .attr("fill", function(d) { return getYearColor(d.year); })
                .attr("stroke", "#333")
                .attr("stroke-width", 0.5);
            
            // Clear selection state
            selectedBook = null;
            lastViewedBook = null;
            
            // Show placeholder
            bookContent.innerHTML = '<div id="book-placeholder">Click a point to view book details</div>';
            bookPanel.style.display = 'none';
        });
    }
}

// Year color mapping
function getYearColor(year) {
    const colors = {
        '2013': '#1f77b4',
        '2014': '#ff7f0e', 
        '2015': '#2ca02c'
    };
    return colors[year] || '#7f7f7f';
}

// Native number formatting
function formatNumber(value, options = {}) {
    if (value === null || value === undefined || isNaN(value)) {
        return 'N/A';
    }
    return new Intl.NumberFormat('en-US', options).format(value);
}

// Clean book data
function clean(book, year) {
    return {
        title: book.title,
        authors: book.authors.join(', '),
        sales_rank: Number(book.sales_rank),
        pages: Number(book.pages),
        price: book.price / 100,
        url: book.url,
        year: year
    };
}

// Helper functions for book panel management
function showBookContent(d) {
    // Get book panel elements
    const bookPanel = document.getElementById('book-info-panel');
    const bookContent = document.getElementById('book-content');
    
    if (!bookPanel || !bookContent) return;
    
    // Create book content
    let content = `
        <div class="book-info">
            <div class="book-title">${d.title}</div>
            <div class="book-author">${d.authors}</div>
            <div class="book-details">
                <div class="book-detail"><strong>Year:</strong> ${d.year}</div>
                <div class="book-detail"><strong>Pages:</strong> ${formatNumber(d.pages)}</div>
                <div class="book-detail"><strong>Sales Rank:</strong> ${formatNumber(d.sales_rank)}</div>
                <div class="book-detail"><strong>Price:</strong> ${formatNumber(d.price, { style: 'currency', currency: 'USD' })}</div>
            </div>
            <div class="book-actions">
                <a href="${d.url}" target="_blank" rel="noopener noreferrer" class="amazon-link">
                    View on Amazon
                </a>
            </div>
        </div>
    `;
    
    // Update book panel
    bookContent.innerHTML = content;
    bookPanel.style.display = 'block';
}

function showPlaceholder() {
    const bookPanel = document.getElementById('book-info-panel');
    const bookContent = document.getElementById('book-content');
    const bookPlaceholder = document.getElementById('book-placeholder');
    
    if (!bookPanel || !bookContent || !bookPlaceholder) return;
    
    bookContent.innerHTML = '';
    bookContent.appendChild(bookPlaceholder);
    bookPanel.style.display = 'block';
}

// Load data from selected years
async function loadSelectedYears() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    const urls = Array.from(checkboxes).map(cb => cb.value);
    
    if (urls.length === 0) {
        return [];
    }

    try {
        allBooks = [];
        
        // Load data from all selected years
        for (const url of urls) {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            // Extract year from URL
            const year = url.match(/npr-(\d{4})/)[1];
            
            // Add year to each book and clean the data
            const yearBooks = data.map(book => clean(book, year));
            allBooks.push(...yearBooks);
        }
        
        return allBooks;
    } catch (error) {
        console.error('Error loading books:', error);
        return [];
    }
}

// Create the chart using D3
function createChart(books) {
    // Filter out books with invalid data
    const validBooks = books.filter(book => 
        book.pages > 0 && book.sales_rank > 0 && !isNaN(book.pages) && !isNaN(book.sales_rank)
    );

    if (validBooks.length === 0) {
        return null;
    }

    // Specify the chart's dimensions
    const width = 800;
    const height = 600;
    const margin = { top: 40, right: 40, bottom: 60, left: 80 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    // Create scales
    const xScale = d3.scaleLog()
        .domain(d3.extent(validBooks, d => d.pages))
        .range([0, plotWidth])
        .nice();

    const yScale = d3.scaleLog()
        .domain(d3.extent(validBooks, d => d.sales_rank))
        .range([plotHeight, 0])
        .nice();

    // Create SVG container
    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "width: 100%; height: auto;");

    // Create a group for all zoomable content
    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create clip path for the plot area
    svg.append("defs")
        .append("clipPath")
        .attr("id", "plot-clip")
        .append("rect")
        .attr("width", plotWidth)
        .attr("height", plotHeight);

    // Apply clip path to data container
    const dataContainer = g.append("g")
        .attr("clip-path", "url(#plot-clip)");

    // Add axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    const xAxisGroup = g.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${plotHeight})`)
        .call(xAxis);

    const yAxisGroup = g.append("g")
        .attr("class", "y-axis")
        .call(yAxis);

    // Add axis labels
    g.append("text")
        .attr("x", plotWidth / 2)
        .attr("y", plotHeight + margin.bottom - 10)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Number of Pages (log scale)");

    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -plotHeight / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Sales Rank (log scale, higher = less popular)");

    // Add title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 25)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .text("Book Length vs. Popularity by Year");

    // Helper function for showing book info
    function showBook(event, d) {
        // Highlight the point
        d3.select(event.target)
            .transition()
            .duration(200)
            .attr("r", 6)
            .attr("fill", "#ff6b6b")
            .attr("stroke", "#333")
            .attr("stroke-width", 1);
        
        // Track this as the last viewed book
        lastViewedBook = d;
        
        // Show book content
        showBookContent(d);
    }

    // Add points
    const circles = dataContainer.selectAll('circle')
        .data(validBooks)
        .enter()
        .append('circle')
        .attr('cx', d => xScale(d.pages))
        .attr('cy', d => yScale(d.sales_rank))
        .attr('r', 4)
        .attr('fill', function(d) { return getYearColor(d.year); })
        .attr('stroke', '#333')
        .attr('stroke-width', 0.5)
        .style('cursor', 'pointer')
        .on('click', function(event, d) {
            // Handle book panel toggling
            if (selectedBook === d) {
                // Clicking the same book again - hide panel
                const bookPanel = document.getElementById('book-info-panel');
                const bookContent = document.getElementById('book-content');
                
                // Reset the point styling
                d3.select(event.target)
                    .transition()
                    .duration(200)
                    .attr("r", 4)
                    .attr("fill", function(d) { return getYearColor(d.year); })
                    .attr("stroke", "#333")
                    .attr("stroke-width", 0.5);
                
                // Clear selection state
                selectedBook = null;
                lastViewedBook = null;
                
                // Show placeholder
                bookContent.innerHTML = '<div id="book-placeholder">Click a point to view book details</div>';
                bookPanel.style.display = 'none';
            } else {
                // Reset all points to default state
                d3.selectAll('#books-container circle:not(.legend-circle)')
                    .transition()
                    .duration(200)
                    .attr("r", 4)
                    .attr("fill", function(d) { return getYearColor(d.year); })
                    .attr("stroke", "#333")
                    .attr("stroke-width", 0.5);
                
                // Hide previous panel
                const bookPanel = document.getElementById('book-info-panel');
                const bookContent = document.getElementById('book-content');
                bookContent.innerHTML = '<div id="book-placeholder">Click a point to view book details</div>';
                bookPanel.style.display = 'none';
                
                // Show new book after a brief delay
                setTimeout(() => {
                    showBook(event, d);
                    selectedBook = d;
                    lastViewedBook = d;
                }, 150);
            }
        });

    // Set up zoom behavior
    const zoom = d3.zoom()
        .scaleExtent([0.1, 10])
        .on("zoom", function(event) {
            const transform = event.transform;
            
            // Update scales
            const newXScale = transform.rescaleX(xScale);
            const newYScale = transform.rescaleY(yScale);
            
            // Update axes
            xAxisGroup.call(d3.axisBottom(newXScale));
            yAxisGroup.call(d3.axisLeft(newYScale));
            
            // Update points
            circles
                .attr('cx', d => newXScale(d.pages))
                .attr('cy', d => newYScale(d.sales_rank));
        });

    // Apply zoom behavior to SVG
    svg.call(zoom);

    // Add legend
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width - 120}, 50)`);

    const years = ['2013', '2014', '2015'];
    const legendItems = legend.selectAll('.legend-item')
        .data(years)
        .enter()
        .append('g')
        .attr('class', 'legend-item')
        .attr('transform', (d, i) => `translate(0, ${i * 20})`);

    legendItems.append('circle')
        .attr('class', 'legend-circle')
        .attr('r', 4)
        .attr('fill', d => getYearColor(d))
        .attr('stroke', '#333')
        .attr('stroke-width', 0.5);

    legendItems.append('text')
        .attr('x', 10)
        .attr('y', 4)
        .style('font-size', '12px')
        .text(d => d);

    // Add legend title
    legend.append('text')
        .attr('x', 0)
        .attr('y', -10)
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .text('Year');

    return svg.node();
}

// Initialize event listeners
function initializeEventListeners() {
    // Checkbox change events
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            init();
        });
    });

    // Window resize event
    window.addEventListener('resize', () => {
        // D3 charts are responsive by default with viewBox
    });
}

// Initialize the visualization
async function init() {
    // Initialize the close button
    initializeCloseButton();
    
    // Show loading
    const container = document.getElementById('books-container');
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'block';
    }
    
    // Load data
    const books = await loadSelectedYears();
    
    // Hide loading
    if (loading) {
        loading.style.display = 'none';
    }
    
    if (books.length === 0) {
        container.innerHTML = '<div style="color: #666; font-style: italic;">Please select at least one year.</div>';
        return;
    }
    
    // Create chart
    const chart = createChart(books);
    
    // Clear any existing chart content
    const existingChart = container.querySelector('svg');
    if (existingChart) {
        existingChart.remove();
    }
    
    // Append the new chart
    if (chart && chart.nodeType) {
        container.appendChild(chart);
    } else {
        console.error('Chart creation failed');
        container.innerHTML = '<div style="color: #666; font-style: italic;">Error creating visualization.</div>';
        return;
    }
    
    // Show placeholder in panel by default
    showPlaceholder();
}

// Initialize event listeners
initializeEventListeners();

// Start the initialization when the page loads
document.addEventListener('DOMContentLoaded', () => {
    init();
});
