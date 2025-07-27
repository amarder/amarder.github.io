---
title: Book Recommendations
publishDate: "2016-03-01"
description: "A data-driven approach to finding great books."
draft: false
---

I like good books. I like short books. But, finding good short books isn't easy. For most needs, sorting Amazon search results by sales rank or average customer review works well. But, there's no easy way to filter or sort by book length.

Given a book's ISBN, Amazon's Product API allows one to download the following characteristics of a book: number of pages, sales rank, price, title, author, etc. I have downloaded this information for the books on NPR's list of Best Books for [2013](http://apps.npr.org/best-books-2013/), [2014](http://apps.npr.org/best-books-2014/), and [2015](http://apps.npr.org/best-books-2015/).

The visualization shows books as points on a scatter plot, where the x-axis represents the log number of pages and the y-axis represents the log sales rank. Each point is colored by the year the book was featured on NPR's list. Click on any point to see detailed information about the book.

<div id="books-container">
  <div id="loading">Loading...</div>
  <div id="book-info-panel">
    <button id="close-book-panel" title="Close">×</button>
    <div id="book-content">
      <div id="book-placeholder">Click a point to view book details</div>
    </div>
  </div>
</div>

<div style="margin-top: 40px; text-align: center;">
  <label>Select Years:</label>
  <div style="margin-top: 10px;">
    <label style="margin-right: 15px;">
      <input type="checkbox" id="year-2015" value="/books/npr-2015.json" checked> 2015
    </label>
    <label style="margin-right: 15px;">
      <input type="checkbox" id="year-2014" value="/books/npr-2014.json" checked> 2014
    </label>
    <label>
      <input type="checkbox" id="year-2013" value="/books/npr-2013.json" checked> 2013
    </label>
  </div>
</div>

PS I wish Amazon's Product API provided customer ratings for each book. This [Stack Overflow answer](http://stackoverflow.com/a/31329604/3756632) describes a potential work-around.

<script src="https://d3js.org/d3.v7.min.js"></script>
<script src="/books/books.js"></script>

<style>
  #books-container {
    text-align: center;
    margin: 2rem 0;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #fafafa;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    padding: 1rem;
    min-height: 500px;
    max-height: 90vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  #books-container svg {
    max-width: 100%;
    height: auto;
    cursor: grab;
  }

  #books-container svg:active {
    cursor: grabbing;
  }

  #loading {
    font-size: 1.2rem;
    color: #666;
    font-style: italic;
  }

  #book-info-panel {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 350px;
    max-height: 81vh;
    background-color: rgba(248, 249, 250, 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid #e9ecef;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    padding: 1rem;
    overflow-y: auto;
    display: none;
    z-index: 10;
  }

  #close-book-panel {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
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

  #close-book-panel:hover {
    background-color: rgba(255, 255, 255, 1);
    color: #495057;
    transform: scale(1.1);
  }

  #close-book-panel:active {
    transform: scale(0.95);
  }

  #book-placeholder {
    text-align: center;
    color: #6c757d;
    font-style: italic;
    font-size: 0.9rem;
    padding: 1rem;
  }

  .book-info {
    text-align: left;
  }

  .book-title {
    font-size: 1rem;
    font-weight: bold;
    color: #495057;
    line-height: 1.3;
    margin-bottom: 0.5rem;
  }

  .book-author {
    font-size: 0.9rem;
    color: #6c757d;
    margin-bottom: 0.75rem;
  }

  .book-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin-bottom: 0.75rem;
  }

  .book-detail {
    font-size: 0.8rem;
    color: #495057;
  }

  .book-actions {
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid rgba(108, 117, 125, 0.2);
  }

  .amazon-link {
    display: inline-block;
    background-color: #ff9900;
    color: white;
    padding: 0.5rem 1rem;
    text-decoration: none;
    border-radius: 4px;
    font-weight: bold;
    font-size: 0.8rem;
    transition: background-color 0.2s ease;
  }

  .amazon-link:hover {
    background-color: #e68900;
  }

  @media (max-width: 768px) {
    #books-container {
      margin: 1rem 0;
      padding: 0.5rem;
    }
    
    #book-info-panel {
      width: 280px;
      top: 0.5rem;
      right: 0.5rem;
      padding: 0.75rem;
    }
    
    .book-title {
      font-size: 0.9rem;
    }
    
    .book-author {
      font-size: 0.8rem;
    }
    
    .book-detail {
      font-size: 0.75rem;
    }
  }

  /* Dialog styles */
  .book-dialog {
    display: none;
    position: fixed;
    z-index: 10000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
  }

  .dialog-content {
    background-color: #fefefe;
    margin: 5% auto;
    padding: 20px;
    border: 1px solid #888;
    border-radius: 8px;
    width: 80%;
    max-width: 500px;
    position: relative;
  }

  .close {
    color: #aaa;
    float: right;
    font-size: 28px;
    font-weight: bold;
    cursor: pointer;
    position: absolute;
    right: 15px;
    top: 10px;
  }

  .close:hover,
  .close:focus {
    color: black;
    text-decoration: none;
  }

  .book-details {
    margin: 20px 0;
  }

  .book-details p {
    margin: 10px 0;
  }

  .dialog-actions {
    text-align: center;
    margin-top: 20px;
  }

  .amazon-link {
    display: inline-block;
    background-color: #ff9900;
    color: white;
    padding: 10px 20px;
    text-decoration: none;
    border-radius: 4px;
    font-weight: bold;
  }

  .amazon-link:hover {
    background-color: #e68900;
  }

  /* Responsive design */
  @media (max-width: 600px) {
    .dialog-content {
      width: 95%;
      margin: 10% auto;
    }
  }
</style>
