---
title: Big Data Tips for Social Science
date: 2015-10-23
description: "Some thoughts on working with big data in the social sciences."
---

> "The real problem is that programmers have spent far too much time
> worrying about efficiency in the wrong places and at the wrong
> times; premature optimization is the root of all evil (or at least
> most of it) in programming." - [Donald Knuth (1974)][knuth]

> "At Google, for example, I have found that random samples on the
> order of 0.1 percent work fine for analysis of business data."
> - [Hal Varian (2014)][varian]

You have data. You want to analyze that data. But, this is the largest
data you've worked with and you're having problems because it's so
big. This post has some actionable advice to help you analyze your
data. First, let me describe how I classify data by size:

1.  Small data is easy to work with. You can hold all the data in
    memory and do all your analysis in memory. The size of the data
    isn't getting in your way.
2.  Medium data is hard to work with. You cannot hold all the data in
    memory, but you can hold all the data on one machine's hard
    drive. You would benefit from a database to store and query your
    data.
3.  Large data is hardest to work with. You need multiple machines to
    store all your data. To deal with this you need a distributed file
    system like the Hadoop Distributed File System.

I have a few suggestions for working with medium data.

# Use a database

SQL databases (PostgreSQL, MySQL, MariaDB, SQLite) are extremely
helpful for working with data on disk rather than in memory. The
different flavors of SQL databases have different advantages. The main
advantage to SQLite is it does not rely on a server-client setup. On
machines where you don't have root access to set up a database server
you can still use SQLite to work with data on disk. If you are working
in `R` the library [dplyr][dplyr] is amazing for working with tables
stored in SQL databases.

# Use random samples

By taking a small enough random sample of your data you can work with
the data in memory and get results quickly. This approach speeds up
each iteration of the (edit code)-(run code)-(evaluate results)
loop. Data where observations are independent and identically
distributed (IID) are perfectly suited for random sampling. When
working with large panel data sets, individuals should be sampled
keeping all observations for a selected individual in the resulting
data set.

When observations are not IID then random sampling may not work for
you. For instance, sampling data from an online data site where each
observation is a potential date between two users is more
complicated. [Hitsch, Hortaçsu and Ariely (2010)][hha] address this
issue by focusing on one connected subgraph at a time (they looked at
one subgraph of users based in Boston and another subgraph based in
San Diego).

# Don't optimize prematurely

If you start out of the gates designing your code around MapReduce
when your research question doesn't require it, you'll end up wasting
a lot of time programming. If you can answer your research question
using a random sample, do it, it will save you a lot of time. If a
random sample won't work with your data is there another method you
could use to shrink the data and answer the question of interest?
Finally, if you're certain you need to use a large data set, can you
use [SQL on Hadoop][sql-hadoop]?

[knuth]: http://dx.doi.org/10.1145/361604.361612
[varian]: http://www.jstor.org/stable/23723482
[dplyr]: https://cran.rstudio.com/web/packages/dplyr/vignettes/introduction.html
[hha]: http://www.jstor.org/stable/27804924
[sql-hadoop]: https://www.mapr.com/why-hadoop/sql-hadoop/sql-hadoop-details
