---
title: Finding Good and Short Books
publishDate: "2025-08-02"
updatedDate: "2025-08-09"
description: "NPR's Best Books + Amazon Data = Great way to find good (short) books"
tags:
  - d3js
---

I like good books. I like short books. But finding good short books can be challenging. For most needs, sorting Amazon search results by sales rank or average customer review works well, but there's no easy way to filter or sort by book length.

Given a book's ISBN, Amazon's Product Advertising API lets you retrieve information such as the number of pages, sales rank, price, title, and author. I downloaded this information for [NPR's Best Books](https://apps.npr.org/best-books/) from 2013 through 2024.

The visualization below shows each book as a point on a scatterplot, the x-axis displays the logarithm of the number of pages and the y-axis displays the logarithm of the sales rank. Click any point to see detailed information about the book, and use the filters below to explore books by year and topic. The plot supports zooming and panning to make clicking points a little easier.

<details class="filter-section">
  <summary class="font-semibold hover:marker:text-accent cursor-pointer">Filter by Year</summary>
  <div class="filter-content">
    <div class="filter-controls">
      <button class="filter-btn" onclick="selectAllYears()">Select All</button>
      <button class="filter-btn" onclick="clearAllYears()">Clear All</button>
    </div>
    <div id="year-filters" class="filter-checkboxes">
      <!-- Year checkboxes will be populated dynamically -->
    </div>
  </div>
</details>

<details class="filter-section">
  <summary class="font-semibold hover:marker:text-accent cursor-pointer">Filter by Topic</summary>
  <div class="filter-content">
    <div class="filter-controls">
      <button class="filter-btn" onclick="selectAllTags()">Select All</button>
      <button class="filter-btn" onclick="clearAllTags()">Clear All</button>
    </div>
    <div id="tag-filters" class="filter-checkboxes">
      <!-- Tag checkboxes will be populated dynamically -->
    </div>
  </div>
</details>

<div style="text-align: center; margin-top: 15px;">
  <div id="filter-count" style="font-size: 0.9rem; color: #6c757d;">
    <!-- Filter count will be populated dynamically -->
  </div>
</div>

<div id="books-container">
  <div id="loading">Loading...</div>
  <div id="book-info-panel">
    <button id="close-book-panel" title="Close">×</button>
    <div id="book-content">
      <div id="book-placeholder">Click a point to view book details</div>
    </div>
  </div>
</div>

<div id="books-table-container" style="margin-top: 30px;">  
  <div id="table-controls" style="margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
    <div class="table-sort">
      <label style="font-size: 0.9rem; color: #495057; margin-right: 10px;">Sort by:</label>
      <select id="sort-select" style="padding: 4px 8px; border: 1px solid #ccc; border-radius: 4px; font-size: 0.9rem;">
        <option value="title">Title</option>
        <option value="author">Author</option>
        <option value="pages">Pages</option>
        <option value="sales_rank" selected>Sales Rank</option>
      </select>
    </div>
    <div class="pagination-info">
      <span id="page-info" style="font-size: 0.9rem; color: #6c757d;"></span>
    </div>
  </div>
  
  <div class="table-wrapper">
    <table id="books-table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Author</th>
          <th>Pages</th>
          <th>Sales Rank</th>
          <th>Tags</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody id="books-table-body">
        <!-- Table rows will be populated dynamically -->
      </tbody>
    </table>
  </div>
  
  <div id="books-cards">
    <!-- Card layout will be populated dynamically for mobile -->
  </div>
  
  <div id="pagination-controls" style="margin-top: 15px; text-align: center;">
    <!-- Pagination buttons will be populated dynamically -->
  </div>
</div>

:::note{title=Notes}
Thanks to [Cory Zue](https://www.coryzue.com/) for his help using Amazon's Product Advertising API.

All Amazon links on this page use NPR's affiliate tag `npr-5-20`.
:::

<script src="https://d3js.org/d3.v7.min.js"></script>
<script src="/books/books.js"></script>

<link rel="stylesheet" href="/books/style.css">
