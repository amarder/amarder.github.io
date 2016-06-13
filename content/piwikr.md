---
title: "Custom Web Analytics"
date: "2016-02-17"
---



[Piwik][piwik] is the web analytics framework for hackers. By providing access to raw page view data, Piwik allows analysts to use general purpose tools for analysis. Piwik stores all of its data in a MySQL database. I've written an R library [piwikr][piwikr] to download and clean the tables stored in Piwik's database. To get started let's connect to the database:


```r
library(piwikr)

my_db <- src_mysql(host='host.com', user='root', password='pass', dbname='piwik')
```



Below I retrieve tables describing all visits to the site and all actions taken by visitors to the site.


```r
visits <- get_visits(my_db)
actions <- get_actions(my_db)
```

piwikr comes with functions to compute new tables from the primary tables. The four tables constructed below describe visitors to the site, days the site was actively collecting data, pages on the site, and sources of traffic to the site.


```r
visitors <- compute_visitors(actions)
days <- compute_days(actions)
pages <- compute_pages(actions)
sources <- compute_sources(visits)
```

# Traffic Over Time

piwikr also comes with functions for creating graphs. How much traffic has the site generated over time?


```r
graph_visitors_vs_date(days)
```

![plot of chunk traffic](/images/piwikr/traffic-1.png) 

```r
nvisitors <- nrow(visitors)
ndays <- as.numeric(max(actions$day) - min(actions$day))
arrival_rate <- round(nvisitors / ndays, 2)
```

The site has attracted 488 visitors over 86 days. The overall arrival rate was 5.67 visitors per day.

# Popular Content

What pages on the site have been viewed by the most visitors?


```r
library(dplyr)
library(pander)

pages %>%
    select(Page, Visitors) %>%
    mutate(Page=paste0('<a href="', Page, '">', Page, '</a>')) %>%
    head(10) %>%
    pandoc.table(style='rmarkdown', split.table=Inf, justify='ll')
```



| Page                                                                  | Visitors   |
|:----------------------------------------------------------------------|:-----------|
| <a href="/responsive-d3js/">/responsive-d3js/</a>                     | 204        |
| <a href="/clustered-standard-errors/">/clustered-standard-errors/</a> | 188        |
| <a href="/">/</a>                                                     | 46         |
| <a href="/analytics/">/analytics/</a>                                 | 23         |
| <a href="/piwikr/">/piwikr/</a>                                       | 23         |
| <a href="/diamonds/">/diamonds/</a>                                   | 22         |
| <a href="/books/">/books/</a>                                         | 16         |
| <a href="/ssh-key-bindings/">/ssh-key-bindings/</a>                   | 7          |
| <a href="/big-data/">/big-data/</a>                                   | 5          |
| <a href="/data-visualization/">/data-visualization/</a>               | 3          |

# Referrals

How are visitors finding the site?


```r
sources %>%
    select(Source, Visitors) %>%
    head(10) %>%
    pandoc.table(style='rmarkdown', justify='ll')
```



| Source                    | Visitors   |
|:--------------------------|:-----------|
| (direct)                  | 230        |
| Google                    | 186        |
| t.co                      | 52         |
| us6.campaign-archive2.com | 4          |
| www.statalist.org         | 4          |
| flipboard.com             | 3          |
| scholar.google.com        | 2          |
| Baidu                     | 1          |
| disq.us                   | 1          |
| mail.yandex.ru            | 1          |

# Browser Resolutions

How important is mobile / how large are the visitors' browser windows?


```r
graph_browser_resolutions(visits)
```

![plot of chunk resolutions](/images/piwikr/resolutions-1.png) 

# Graphing Site Structure

piwikr can also visualize how users navigate from page to page on the site. Each node in the graph below represents a page on the site, the size of a node is proportional to the number of visitors who have viewed the page. The width of each edge is proportional to the number of visitors that traveled from the source page to the destination page.


```r
actions_on_big_pages <- actions %>%
    group_by(url) %>%
    mutate(visitors = n_distinct(visitor_id)) %>%
    filter(visitors > 3) %>%
    ungroup()
graph_site_structure(actions_on_big_pages)
```

![plot of chunk structure](/images/piwikr/structure-1.png) 

[piwik]: http://piwik.org/
[piwikr]: https://github.com/amarder/piwikr
