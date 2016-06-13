# My Website

I have used [Jekyll](https://jekyllrb.com/) and
[Octopress](http://octopress.org/) to build blogs. Unfortunately, I
have found them difficult to build on Mac OS X, and I've run into
issues with deploying to
[GitHub Pages](https://pages.github.com/). I've decided to switch over
to [Hugo](https://gohugo.io/) for building my static website. I found
the tips on this [page](https://gohugo.io/tutorials/github-pages-blog)
particularly useful for setting up Hugo with GitHub Pages.

## What went into my Hugo theme

[Skeleton](http://getskeleton.com/)

I need a mobile-friendly navigation bar:

https://codyhouse.co/gem/secondary-sliding-navigation/

# https vs http

It looks like my direct traffic numbers are inflated because browsers do not include referrer information when going from https to http. If I want to fix this, I need to set up an SSL certificate for my piwik server (running on dokku / nginx). It looks like [letsencrypt](https://letsencrypt.org/) is the easiest way to set this up, though they haven't fully supported nginx yet. I'm going to hold off on this. I've also noticed that disqus considers http://example.com to be a different page from https://example.com. Once I set up ssl certificates, I'll probably make https the default protocol using javascript, although this may create other problems (like local development).

# It would be nice to set up twitter cards.

# JavaScript Dependencies

raleway fonts
prettify.css
MathJax

highlight.js: R Stata bash
