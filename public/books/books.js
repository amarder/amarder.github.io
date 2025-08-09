// Global variables for tracking state
let selectedBook = null;
let lastViewedBook = null;
let allBooks = [];
let filteredBooks = [];
let availableYears = [];
let availableTags = [];

// Table state variables
let currentPage = 1;
let itemsPerPage = 15;
let currentSort = 'sales_rank';
let sortDirection = 'asc';

// Initialize close button functionality
function initializeCloseButton() {
    const closeButton = document.getElementById('close-book-panel');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            const bookPanel = document.getElementById('book-info-panel');
            const bookContent = document.getElementById('book-content');
            
            // Reset all points to default state
            d3.selectAll('#books-container circle')
                .transition()
                .duration(200)
                .attr("r", 4)
                .attr("fill", getPointColor())
                .attr("fill-opacity", 0.5)
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

// Single color for all points
function getPointColor() {
    return '#1f77b4'; // Single blue color for all points
}

// Native number formatting
function formatNumber(value, options = {}) {
    if (value === null || value === undefined || isNaN(value)) {
        return 'N/A';
    }
    return new Intl.NumberFormat('en-US', options).format(value);
}

// Clean book data from CSV format
function clean(book) {
    return {
        title: book.title,
        authors: book.author, // CSV has single author field
        sales_rank: book.SalesRank ? Number(book.SalesRank) : null,
        pages: book.pages ? Number(book.pages) : null,
        price: null, // Not available in CSV data
        url: book.ASIN ? `https://www.amazon.com/dp/${book.ASIN}?tag=npr-5-20` : null,
        year: book.year,
        tags: book.tags ? book.tags.split(';') : [],
        asin: book.ASIN
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
                ${d.tags && d.tags.length > 0 ? `<div class="book-detail"><strong>Tags:</strong> ${d.tags.join(', ')}</div>` : ''}
            </div>
            <div class="book-actions">
                ${d.url ? `<a href="${d.url}" target="_blank" rel="noopener noreferrer" class="amazon-link">View on Amazon</a>` : ''}
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

// Load data from CSV file
async function loadBooksFromCSV() {
    try {
        // Load CSV data using D3
        const data = await d3.csv('/books/books.csv');
        
        // Convert string fields to appropriate types and clean data, keeping only books with valid ASINs
        allBooks = data
            .filter(book => book.ASIN && book.ASIN.trim() !== '') // Only keep books with non-empty ASIN
            .map(book => {
                // Convert string fields to numbers where needed
                const processedBook = {
                    ...book,
                    pages: book.pages ? +book.pages : null,
                    SalesRank: book.SalesRank ? +book.SalesRank : null,
                    year: book.year
                };
                return clean(processedBook);
            });
        
        // Extract unique years and tags
        extractUniqueFilters();
        
        // Create filter controls
        createFilterControls();
        
        // Apply initial filtering
        applyFilters();
        
        return filteredBooks;
    } catch (error) {
        console.error('Error loading books:', error);
        return [];
    }
}

// Extract unique years and tags from the data
function extractUniqueFilters() {
    // Get unique years
    availableYears = [...new Set(allBooks.map(book => book.year))].sort();
    
    // Get unique tags
    const allTagsFlat = allBooks.flatMap(book => book.tags || []);
    availableTags = [...new Set(allTagsFlat)].sort();
}

// Create dynamic filter controls with initial data
function createFilterControls() {
    // Create initial year controls (all years selected)
    updateYearControls(allBooks, availableYears);
    
    // Create initial tag controls (no tags selected)
    updateTagControls(allBooks, []);
}



// Apply filters based on selected years and tags
function applyFilters() {
    const selectedYears = Array.from(document.querySelectorAll('.year-filter:checked')).map(cb => cb.value);
    const selectedTags = Array.from(document.querySelectorAll('.tag-filter:checked')).map(cb => cb.value);
    
    filteredBooks = allBooks.filter(book => {
        // Filter by year
        const yearMatch = selectedYears.length === 0 || selectedYears.includes(book.year);
        
        // Filter by tags (if any tags are selected, book must have at least one matching tag)
        const tagMatch = selectedTags.length === 0 || 
                        (book.tags && book.tags.some(tag => selectedTags.includes(tag)));
        
        return yearMatch && tagMatch;
    });
}

// Update visualization when filters change
function updateVisualization() {
    const selectedYears = Array.from(document.querySelectorAll('.year-filter:checked')).map(cb => cb.value);
    const selectedTags = Array.from(document.querySelectorAll('.tag-filter:checked')).map(cb => cb.value);
    
    // Apply current filters
    applyFilters();
    
    // Update filter controls based on interdependent filtering
    updateInterdependentFilters(selectedYears, selectedTags);
    
    // Clear existing chart
    const container = document.getElementById('books-container');
    const existingChart = container.querySelector('svg');
    if (existingChart) {
        existingChart.remove();
    }
    
    if (filteredBooks.length === 0) {
        container.innerHTML = '<div style="color: #666; font-style: italic;">No books match the selected filters.</div>';
        return;
    }
    
    // Create new chart with filtered data
    const chart = createChart(filteredBooks);
    if (chart && chart.nodeType) {
        container.appendChild(chart);
    } else {
        container.innerHTML = '<div style="color: #666; font-style: italic;">Error creating visualization.</div>';
    }
    
    // Update filter count
    updateFilterCount();
    
    // Render books table
    renderBooksTable();
}

// Update filter controls with interdependent behavior
function updateInterdependentFilters(selectedYears, selectedTags) {
    // Determine which books to use for updating filter counts
    let booksForYearCounts, booksForTagCounts;
    
    if (selectedTags.length === 0 && selectedYears.length === 0) {
        // No filters selected - show all books
        booksForYearCounts = allBooks;
        booksForTagCounts = allBooks;
    } else if (selectedTags.length === 0) {
        // Only years selected - tag counts should reflect books from selected years
        booksForTagCounts = allBooks.filter(book => selectedYears.includes(book.year));
        booksForYearCounts = allBooks; // Year counts show all books
    } else if (selectedYears.length === 0) {
        // Only tags selected - year counts should reflect books with selected tags
        booksForYearCounts = allBooks.filter(book => 
            book.tags && book.tags.some(tag => selectedTags.includes(tag))
        );
        booksForTagCounts = allBooks; // Tag counts show all books
    } else {
        // Both filters selected - each should show counts from the other's filter
        booksForTagCounts = allBooks.filter(book => selectedYears.includes(book.year));
        booksForYearCounts = allBooks.filter(book => 
            book.tags && book.tags.some(tag => selectedTags.includes(tag))
        );
    }
    
    // Update year controls with counts from tag-filtered books
    updateYearControls(booksForYearCounts, selectedYears);
    
    // Update tag controls with counts from year-filtered books  
    updateTagControls(booksForTagCounts, selectedTags);
}

// Update only year controls
function updateYearControls(booksToAnalyze, selectedYears) {
    const yearContainer = document.getElementById('year-filters');
    if (!yearContainer) return;
    
    // Count books per year in the current dataset
    const yearCounts = {};
    booksToAnalyze.forEach(book => {
        yearCounts[book.year] = (yearCounts[book.year] || 0) + 1;
    });
    
    // Create checkboxes for all available years, showing counts for current filter
    yearContainer.innerHTML = availableYears.map(year => {
        const count = yearCounts[year] || 0;
        const isChecked = selectedYears.includes(year);
        const isDisabled = count === 0;
        
        return `
            <label style="margin-right: 15px; ${isDisabled ? 'opacity: 0.5;' : ''}">
                <input type="checkbox" class="year-filter" value="${year}" 
                       ${isChecked ? 'checked' : ''} ${isDisabled ? 'disabled' : ''}> 
                ${year} (${count})
            </label>
        `;
    }).join('');
}

// Update only tag controls
function updateTagControls(booksToAnalyze, selectedTags) {
    const tagContainer = document.getElementById('tag-filters');
    if (!tagContainer) return;
    
    // Count tag frequency in the current dataset
    const tagCounts = {};
    booksToAnalyze.forEach(book => {
        (book.tags || []).forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
    });
    
    // Sort tags by frequency (most common first), but only show tags that exist in current data
    const sortedTags = Object.entries(tagCounts)
        .filter(([tag, count]) => count > 0)
        .sort(([,a], [,b]) => b - a);
    
    tagContainer.innerHTML = sortedTags.map(([tag, count]) => {
        const isChecked = selectedTags.includes(tag);
        
        return `
            <label style="margin-right: 15px; margin-bottom: 5px; display: inline-block;">
                <input type="checkbox" class="tag-filter" value="${tag}" ${isChecked ? 'checked' : ''}> 
                ${tag} (${count})
            </label>
        `;
    }).join('');
}

// Update the count of filtered books
function updateFilterCount() {
    const countElement = document.getElementById('filter-count');
    if (countElement) {
        const totalBooks = allBooks.length;
        const visibleBooks = filteredBooks.length;
        countElement.textContent = `Showing ${visibleBooks} of ${totalBooks} books`;
    }
}

// Sort books based on current sort criteria
function sortBooks(books) {
    const sorted = [...books].sort((a, b) => {
        let aVal = a[currentSort];
        let bVal = b[currentSort];
        
        // Handle null/undefined values
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        
        // Convert to string for comparison if needed
        if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
        }
        
        let comparison = 0;
        if (aVal < bVal) comparison = -1;
        else if (aVal > bVal) comparison = 1;
        
        return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
}

// Render the books table
function renderBooksTable() {
    const tableBody = document.getElementById('books-table-body');
    const pageInfo = document.getElementById('page-info');
    const paginationControls = document.getElementById('pagination-controls');
    
    if (!tableBody) return;
    
    // Sort the filtered books
    const sortedBooks = sortBooks(filteredBooks);
    
    // Calculate pagination
    const totalPages = Math.ceil(sortedBooks.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, sortedBooks.length);
    const currentBooks = sortedBooks.slice(startIndex, endIndex);
    
    // Update page info
    if (pageInfo) {
        if (sortedBooks.length === 0) {
            pageInfo.textContent = 'No books to display';
        } else {
            pageInfo.textContent = `${startIndex + 1}-${endIndex} of ${sortedBooks.length} books`;
        }
    }
    
    // Render table rows
    tableBody.innerHTML = currentBooks.map(book => {
        const tagsHtml = book.tags && book.tags.length > 0 
            ? book.tags.map(tag => `<span class="tag">${tag}</span>`).join('')
            : '<span style="color: #adb5bd; font-style: italic;">None</span>';
        
        const amazonLink = book.url 
            ? `<a href="${book.url}" target="_blank" rel="noopener noreferrer" class="amazon-btn">View</a>`
            : '<span style="color: #adb5bd; font-style: italic;">N/A</span>';
        
        return `
            <tr>
                <td class="book-title-cell" title="${book.title}">${book.title}</td>
                <td class="book-author-cell" title="${book.authors}">${book.authors}</td>
                <td class="book-number-cell">${formatNumber(book.pages)}</td>
                <td class="book-number-cell">${formatNumber(book.sales_rank)}</td>
                <td class="book-tags-cell">${tagsHtml}</td>
                <td style="text-align: center;">${amazonLink}</td>
            </tr>
        `;
    }).join('');
    
    // Render pagination controls
    renderPaginationControls(totalPages);
}

// Render pagination controls
function renderPaginationControls(totalPages) {
    const paginationControls = document.getElementById('pagination-controls');
    if (!paginationControls) return;
    
    if (totalPages <= 1) {
        paginationControls.innerHTML = '';
        return;
    }
    
    let controls = [];
    
    // Previous button
    controls.push(`
        <button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} 
                onclick="changePage(${currentPage - 1})">
            ← Prev
        </button>
    `);
    
    // Page numbers
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    // Adjust if we're near the end
    if (endPage - startPage + 1 < maxVisible) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    // First page + ellipsis if needed
    if (startPage > 1) {
        controls.push(`<button class="pagination-btn" onclick="changePage(1)">1</button>`);
        if (startPage > 2) {
            controls.push(`<span style="padding: 0 5px; color: #6c757d;">...</span>`);
        }
    }
    
    // Page number buttons
    for (let i = startPage; i <= endPage; i++) {
        controls.push(`
            <button class="pagination-btn ${i === currentPage ? 'active' : ''}" 
                    onclick="changePage(${i})">
                ${i}
            </button>
        `);
    }
    
    // Ellipsis + last page if needed
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            controls.push(`<span style="padding: 0 5px; color: #6c757d;">...</span>`);
        }
        controls.push(`<button class="pagination-btn" onclick="changePage(${totalPages})">${totalPages}</button>`);
    }
    
    // Next button
    controls.push(`
        <button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} 
                onclick="changePage(${currentPage + 1})">
            Next →
        </button>
    `);
    
    paginationControls.innerHTML = controls.join('');
}

// Change page function (called from pagination buttons)
function changePage(page) {
    currentPage = page;
    renderBooksTable();
}

// Change sort function (called from sort dropdown)
function changeSort() {
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        const newSort = sortSelect.value;
        if (newSort === currentSort) {
            // Toggle direction if same field
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            // New field, default to ascending
            currentSort = newSort;
            sortDirection = 'asc';
        }
        currentPage = 1; // Reset to first page
        renderBooksTable();
    }
}

// Initialize table event listeners
function initializeTableListeners() {
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', changeSort);
    }
}

// Make functions globally available
window.changePage = changePage;
window.changeSort = changeSort;

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

    // Style axes to be black for better readability and set font sizes
    xAxisGroup.selectAll("path, line").style("stroke", "black");
    xAxisGroup.selectAll("text")
        .style("fill", "black")
        .style("font-size", window.innerWidth <= 768 ? "14px" : "12px");
    yAxisGroup.selectAll("path, line").style("stroke", "black");
    yAxisGroup.selectAll("text")
        .style("fill", "black")
        .style("font-size", window.innerWidth <= 768 ? "14px" : "12px");

    // Add axis labels with responsive font sizes
    g.append("text")
        .attr("x", plotWidth / 2)
        .attr("y", plotHeight + margin.bottom - 10)
        .attr("text-anchor", "middle")
        .style("font-size", window.innerWidth <= 768 ? "16px" : "14px")
        .style("font-weight", "500")
        .text("Number of Pages (log scale)");

    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -plotHeight / 2)
        .attr("text-anchor", "middle")
        .style("font-size", window.innerWidth <= 768 ? "16px" : "14px")
        .style("font-weight", "500")
        .text("Sales Rank (log scale, higher = less popular)");

    // Add title with responsive font size
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 25)
        .attr("text-anchor", "middle")
        .style("font-size", window.innerWidth <= 768 ? "20px" : "18px")
        .style("font-weight", "bold")
        .text("Book Popularity vs. Length");

    // Helper function for showing book info
    function showBook(event, d) {
        // Highlight the point
        d3.select(event.target)
            .transition()
            .duration(200)
            .attr("r", 6)
            .attr("fill", "#ff6b6b")
            .attr("fill-opacity", 0.9)
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
        .attr('fill', getPointColor())
        .attr('fill-opacity', 0.7)
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
                    .attr("fill", getPointColor())
                    .attr("fill-opacity", 0.7)
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
                d3.selectAll('#books-container circle')
                    .transition()
                    .duration(200)
                    .attr("r", 4)
                    .attr("fill", getPointColor())
                    .attr("fill-opacity", 0.7)
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
            
            // Reapply black styling to axes after zoom update
            xAxisGroup.selectAll("path, line").style("stroke", "black");
            xAxisGroup.selectAll("text")
                .style("fill", "black")
                .style("font-size", window.innerWidth <= 768 ? "14px" : "12px");
            yAxisGroup.selectAll("path, line").style("stroke", "black");
            yAxisGroup.selectAll("text")
                .style("fill", "black")
                .style("font-size", window.innerWidth <= 768 ? "14px" : "12px");
            
            // Update points
            circles
                .attr('cx', d => newXScale(d.pages))
                .attr('cy', d => newYScale(d.sales_rank));
        });

    // Apply zoom behavior to SVG
    svg.call(zoom);



    return svg.node();
}

// Initialize event listeners
function initializeEventListeners() {
    // Window resize event
    window.addEventListener('resize', () => {
        // D3 charts are responsive by default with viewBox
    });
}

// Initialize filter event listeners (called after controls are created)
function initializeFilterListeners() {
    // Year filter changes
    document.addEventListener('change', (event) => {
        if (event.target.classList.contains('year-filter') || 
            event.target.classList.contains('tag-filter')) {
            updateVisualization();
        }
    });
}

// Filter control functions (called from HTML buttons)
function selectAllYears() {
    document.querySelectorAll('.year-filter:not(:disabled)').forEach(cb => cb.checked = true);
    updateVisualization();
}

function clearAllYears() {
    document.querySelectorAll('.year-filter').forEach(cb => cb.checked = false);
    updateVisualization();
}

function selectAllTags() {
    document.querySelectorAll('.tag-filter').forEach(cb => cb.checked = true);
    updateVisualization();
}

function clearAllTags() {
    document.querySelectorAll('.tag-filter').forEach(cb => cb.checked = false);
    updateVisualization();
}

// Make these functions globally available
window.selectAllYears = selectAllYears;
window.clearAllYears = clearAllYears;
window.selectAllTags = selectAllTags;
window.clearAllTags = clearAllTags;

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
    
    // Load data (this will also create filter controls and apply initial filtering)
    const books = await loadBooksFromCSV();
    
    // Initialize filter event listeners
    initializeFilterListeners();
    
    // Initialize table event listeners
    initializeTableListeners();
    
    // Hide loading
    if (loading) {
        loading.style.display = 'none';
    }
    
    if (books.length === 0) {
        container.innerHTML = '<div style="color: #666; font-style: italic;">No book data available.</div>';
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
    
    // Hide book panel by default
    const bookPanel = document.getElementById('book-info-panel');
    if (bookPanel) {
        bookPanel.style.display = 'none';
    }
    
    // Update filter count
    updateFilterCount();
    
    // Reset pagination and render table
    currentPage = 1;
    renderBooksTable();
}

// Initialize event listeners
initializeEventListeners();

// Start the initialization when the page loads
document.addEventListener('DOMContentLoaded', () => {
    init();
});
