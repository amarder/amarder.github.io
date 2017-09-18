---
layout: post
title: Anatomy of a Python Package
date: 2012-09-19
aliases:
  - /post/2012-09-19-anatomy-of-a-python-package/
description: "Using network graphs to better understand how software is constructed."
---

> If all subsystems can communicate with all other subsystems, you
> lose the benefit of separating them at all.  Make each subsystem
> meaningful by restricting communications.
>
> [Steve McConnell][code-complete]

Below is a tool for examining how modules in a Python package
communicate with each other.

<select id="module">
  <option value="">Select a Python Package</option>
  <option value="flask">flask</option>
  <option value="git">git</option>
  <option value="jinja2">jinja2</option>
  <option value="numpy">numpy</option>
</select>

<div class="row" style="margin-bottom: 20px;">
  <div class="six columns">
    <svg id="module-graph" height=340 width=340 />
  </div>
  <div class="six columns">
  <h3>Module Graph</h3>
  <p>
    Each node in this graph is a module in the selected package.
    Edges indicate imports.  Placing the mouse over a node
    selects that module and all of its dependencies.
  </p>
  </div>
</div>

<div class="row" style="margin-bottom: 20px;">
  <div class="six columns">
    <svg id="adjacency-matrix" height=340 width=340 />
  </div>
  <div class="six columns">
  <h3>Adjacency Matrix</h3>
  <p>
    This is another way to represent the graph above.  In the
    adjacency matrix if cell <i>(i, j)</i> is black this means
    module <i>i</i> directly imports module <i>j</i>.  If the
    cell is dark gray this means module <i>i</i> indirectly
    imports module <i>j</i>.
  </p>
  </div>
</div>

<div class="row">
  <div class="six columns">
    <svg id="propagation-cost" height=200 width=340 />
  </div>
  <div class="six columns">
  <h3>Propagation Cost</h3>
  <p>
    This value is the total number of direct and indirect
    dependencies in a project divided by the total number of
    modules.  This is a measure of how difficult it can be to
    modify a module in this package.
  </p>
  </div>
</div>

<script type="text/javascript" src="http://module-graph.herokuapp.com/static/d3/d3.v2.js"></script>
<script type="text/javascript" src="http://module-graph.herokuapp.com/static/d3/lib/jquery/jquery.min.js"></script>
<script type="text/javascript" src="http://module-graph.herokuapp.com/static/module-graph.js"></script>
<link rel="stylesheet" type="text/css" href="http://module-graph.herokuapp.com/static/module-graph.css" />
<link rel="stylesheet" type="text/css" href="http://module-graph.herokuapp.com/static/adjacency-matrix.css" />

<script type="text/javascript">
  function load(module) {
    var root = "http://module-graph.herokuapp.com/";

    var url = root + module + "-to_list.json";
    module_graph("#module-graph", url);

    var url = root + module + "-adjacency_matrix.json"
    adjacencyMatrix("#adjacency-matrix", url);

    var url = root + module + "-propagation_cost.json";
    propogation_cost("#propagation-cost", url);
  }

  var start = window.location.hash.replace('#', '');
  if(start) {
    load(start);
  }

  $("#module").change(function() {
    var module = $(this).val();
    window.location.hash = '#' + module;
    load(module);
  });
</script>

The source code for this project is available on
[github][source-code].  This project uses Python's
[inspect](http://docs.python.org/2/library/inspect.html) module,
[flask](http://flask.pocoo.org/), and [d3](http://d3js.org/), all of
which are awesome.  Thanks to [Alan MacCormack][MacCormack] for
highlighting the usefulness of examining a package's adjacency matrix
and using propagation cost to measure modularity.

[code-complete]: http://www.amazon.com/Code-Complete-Practical-Handbook-Construction/dp/0735619670
[source-code]: https://github.com/amarder/module-graph
[MacCormack]: http://www.people.hbs.edu/cbaldwin/DR2/MRBDesignStructure10-1-05.pdf
