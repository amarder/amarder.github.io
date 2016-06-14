---
title: Book Recommendations
date: 2016-03-01
---

I like good books. I like short books. But, finding good short books isn't easy. For most needs, sorting Amazon search results by sales rank or average customer review works well. But, there's no easy way to filter or sort by book length.

Given a book's ISBN, Amazon's Product API allows one to download the following characteristics of a book: number of pages, sales rank, price, title, author, etc. I have downloaded this information for the books on NPR's list of Best Books for [2013](http://apps.npr.org/best-books-2013/), [2014](http://apps.npr.org/best-books-2014/), and [2015](http://apps.npr.org/best-books-2015/). The table below is designed to accommodate custom sort orders. Each book is assigned a score, which is a weighted sum of [normalized][normalization] book attributes:

$$
\text{Score} = \sum\_{k} w\_k \frac{x\_{k} - \bar{x}\_{k}}{s\_{k}}
$$

The table is sorted with the ten highest scores at the top. As a
default sort order, I have set $w = (-1, 0, 0)$ so the table shows the
books with the lowest sales rank (bestsellers) first. Setting
$w = (0, -1, 0)$ and updating the table will present the shortest books first.

<table id="books" class="tablesaw" data-tablesaw-mode="swipe" data-tablesaw-minimap>
  <thead>
    <tr>
      <th data-tablesaw-priority="persist">Title</th>
      <th>Author</th>
      <th>Sales Rank</th>
      <th># Pages</th>
      <th>List Price</th>
      <th>Score</th>
    </tr>
  </thead>
  <tbody id="data">
  </tbody>
</table>

<form id="form" style="margin-top: 40px;">

  <div class="row">
    <div class="three columns">
      <label for="select">List</label>
      <select id="select" onchange="init($('#select').val());">
        <option value="/books/npr-2015.json">NPR 2015</option>
        <option value="/books/npr-2014.json">NPR 2014</option>
        <option value="/books/npr-2013.json">NPR 2013</option>
      </select>
    </div>
  </div>

  <div class="row">
    <div class="three columns">
      <label for="sale_rank">Sales Rank</label>
      <input id="sales_rank" name="sales_rank" value="-1" size="8"></input>
    </div>
    <div class="three columns">
      <label for="pages"># Pages</label>
      <input id="pages" name="pages" value="0" size="8"></input>
    </div>
    <div class="three columns">
      <label for="price">List Price</label>
      <input id="price" name="price" value="0" size="8"></input>
    </div>
    <div class="three columns">
      <label for="price">Table</label>
      <button type="button" onclick="populate();">Update</button>
    </div>
  </div>

</form>

PS I wish Amazon's Product API provided customer ratings for each book. This [Stack Overflow answer](http://stackoverflow.com/a/31329604/3756632) describes a potential work-around.

[normalization]: https://en.wikipedia.org/wiki/Normalization_(statistics)

<script src="/books/alasql.min.js"></script> 
<script src="/books/math.js"></script>
<script src="/books/numeral.min.js"></script>
<script src="/books/books.js"></script>
<script>
  var url = $('#select').val();
  init(url);
</script>

<!-- TableSaw -->
<link rel="stylesheet" href="/books/tablesaw.css">

<!--[if lt IE 9]><script src="/books/respond.js"></script><!--<![endif]-->
<script src="/books/tablesaw.js"></script>
<script src="/books/tablesaw-init.js"></script>

<style>
  #books * {
    font-size: 0.95em;
  }
  td:nth-last-child(-n+4), th:nth-last-child(-n+4) {
    text-align: right;
    max-width: 75px;
  }
  td:nth-child(-n+2), th:nth-child(-n+2) {
    max-width: 150px;
  }
  #form select, input, button {
    border-width: 1px;
    padding: 0px 5px 0px 5px;
    width: 100%;
    box-sizing: border-box;
    height: 38px;
  }
</style>
