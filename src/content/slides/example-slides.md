---
title: "Locovote"
publishDate: "2026-01-06"
author: "Andrew Marder"
description: "Massachusetts Schools and Taxes Dashboard"
draft: false
theme: "black"
---

# Objectives

- Describe Locovote
- Introduce cool tools
    - Observable Framework
    - Cloudflare Pages
    - marimo
- Recruit collaborators?

# Locovote

- [locovote.com](https://locovote.com/)
- Dashboard to compare cities and towns.
- What towns have the best schools? (MCAS scores)
- What towns have the lowest property tax rates?

# Features

- [Compare Municipalities](https://locovote.com/municipalities)
- [Compare School Districts](https://locovote.com/school-districts)

    Municipalities != School Districts
- [Race and Test Scores](https://locovote.com/school-metrics)
- [Data Sources Documented](https://locovote.com/)
- [Cambridge Schools](https://locovote.com/analysis/cambridge-public-schools)

# Architecture

- Source code: [github.com/amarder/locovote](https://github.com/amarder/locovote)
- Python code downloads and cleans data
- [Observable Framework](https://observablehq.com/framework/) creates dashboard
- [Cloudflare Pages](https://pages.cloudflare.com/) deploys website
    - Unlimited bandwidth
    - 25 MiB maximum file size (DuckDB-Wasm blocker)

# Observable Framework

- Static site generator for data apps
- Write Markdown - literate programming
- Great D3 support: [Sankey diagram](https://locovote.com/data/municipalities)
- Built on React

# Bonus Tool

- [marimo](https://marimo.io/): Jupyter Notebooks improved!

# Discuss