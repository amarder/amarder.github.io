---
title: "[OC] Boston 2024: The Flow of Money Through City Govenment"
description: "Interactive visualization showing Boston's municipal revenue sources and expenditure categories for 2024"
publishDate: "2025-07-18T11:00:00-04:00"
---

![](/boston-2024.png)

A Sankey diagram showing Boston's municipal finances for 2024. The visualization tracks how money flows from revenue sources (left) to different expenditure categories (right).

View the interactive version: https://locovote.com/data/municipalities?name=Boston&year=2024

Built with Observable Framework and D3:
- https://observablehq.com/framework/
- https://d3js.org/

Source code: https://github.com/amarder/locovote

Data sources:
- General Fund: https://dls-gw.dor.state.ma.us/reports/rdPage.aspx?rdReport=ScheduleA.GeneralFund
- Tax Levies by Class: https://dls-gw.dor.state.ma.us/reports/rdPage.aspx?rdReport=PropertyTaxInformation.TaxLevies.LeviesByClass&rdSubReport=True&rdResizeFrame=True
