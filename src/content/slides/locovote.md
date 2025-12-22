---
title: "Locovote"
description: "Vote with your (data-driven) feet"
author: "Andrew Marder"
publishDate: "2025-12-21"
theme: "black"
---

# Objectives

- Describe Locovote
- Introduce cool tools
    - Observable Framework
    - Cloudflare Pages
    - marimo
- Inspire collaboration

# Locovote

- [locovote.com](https://locovote.com/)
- Dashboard to compare cities and towns
- Which towns have the best schools? (MCAS scores)
- Which towns have the lowest property tax rates?

# Features

- [Compare Municipalities](https://locovote.com/municipalities)
- [Compare School Districts](https://locovote.com/school-districts)

  Note: Municipalities ≠ School Districts
- [Race and Test Scores](https://locovote.com/school-metrics)
- [Data Sources Documented](https://locovote.com/)
- [Cambridge Schools Analysis](https://locovote.com/analysis/cambridge-public-schools)

# Architecture

- Source code: [github.com/amarder/locovote](https://github.com/amarder/locovote)
- Python scripts download and clean data
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

- [marimo](https://marimo.io/): Jupyter Notebooks, improved!

# Thanks!