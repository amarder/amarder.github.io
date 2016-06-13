---
title: Piwik vs. Google Analytics
description: "Why I'm Leaving Google Analytics for Piwik: Referral Spam"
date: 2016-02-01
---

This is a love story. In stage 1, I fall in love with [Google Analytics][google-analytics] because it gives me the positive reinforcement I'm looking for. In stage 2, I fall out of love with Google Analytics because its insights are distorted by unreliable data. In stage 3, I begin a long-term relationship with [Piwik][piwik] for its open and accurate feedback.

## The High of Web Analytics

The [Sales Acceleration Formula][sales-acceleration] by Mark Roberge piqued my interest in inbound marketing. So, I decided to experiment with my blog. I set up Google Analytics and started making content to drive traffic to the site. On November 11, 2015, I posted [How to Buy a Diamond][diamonds]. On November 23, Hadley Wickham and Edward Tufte retweeted a link to my post, and traffic to my blog spiked!

![plot of chunk pageviews](/images/analytics/pageviews-1.png) 

The high I felt when the site's pageviews peaked was great. The attraction to web analytics was clear.

## The Data from Google Analytics Needs Cleaning

Since January 14, 2016, I have collected pageview data using both Google Analytics and Piwik. A comparison of the two data sources illustrates my frustration with referral spam on Google Analytics.

![plot of chunk comparison](/images/analytics/comparison-1.png) 

According to Piwik, my blog has drawn at most 11 pageviews each day of the two and a half weeks under observation. Google Analytics, on the other hand, reports three days with almost 50 pageviews! These are extremely different stories about how much traffic is being generated. When I compare of proportion of sessions by referrer across platforms, the issue becomes clearer.


| Source                  |   Google |   Piwik |
|:------------------------|---------:|--------:|
| с.новым.годом.рф        |    39.2% |    0.0% |
| Google                  |    23.4% |   55.9% |
| social-widget.xyz       |    10.4% |    0.0% |
| free-social-buttons.xyz |     9.0% |    0.0% |
| traffic-cash.xyz        |     6.8% |    0.0% |
| ilikevitaly.com         |     5.9% |    0.0% |
| (direct)                |     4.5% |   40.7% |
| scholar.google.com.sg   |     0.5% |    1.7% |
| www.statalist.org       |     0.5% |    1.7% |

Google Analytics claims 71.2% of the traffic to my site came from с.новым.годом.рф, social-widget.xyz, free-social-buttons.xyz, traffic-cash.xyz, and ilikevitaly.com, which is unadulterated spam! The data coming out of Piwik isn't perfect. I am using a redirect on one of my posts so [some browsers are losing referrer information][piwik-faq] and inflating the direct traffic numbers. If I wanted to fix this issue with Piwik I could remove that redirect, but fixing Google Analytics is much harder.

## Removing Google Analytics Spam Should be Easier

The top result from a Google search for "google analytics spam" is the [Definitive Guide to Removing Google Analytics Spam][spam-guide]. The executive summary quoted from that guide:

> 1.  new website? Use a "-2" or higher property
> 2.  implement a Valid Hostname Filter to eliminate ghost visits
> 3.  implement Spam Crawler Filters to eliminate the targeted spam visits
> 4.  create a Custom Segment with these filters to use for reporting
> 5.  turn on Google's bot & spider filter option

I found tip #4 the most helpful. Creating a custom segment allows one to clean the data already collected by Google Analytics. The downside of this approach is it requires replacing the default "All Sessions" segment with the new custom segment in all reports of interest.

I am less concerned by spam when using Piwik because I have full access to the MySQL database containing the raw pageview data. If spam becomes an issue in the future, I can write my own data cleaning scripts to deal with it.

## I'm Not the Only One

A [Google Trends search][trends] shows the search volume for "google analytics spam" peaked in mid 2015 and is on the rise again.

![plot of chunk trends](/images/analytics/trends-1.png) 

If you're tired of spam on Google Analytics, or you like free open-source software and 100% data ownership, definitely check out [Piwik][piwik].

[piwik]: http://piwik.org/
[google-analytics]: http://www.google.com/analytics/
[sales-acceleration]: http://www.amazon.com/gp/product/B00T7Q9E2S
[diamonds]: http://amarder.github.io/diamonds
[piwik-faq]: http://piwik.org/faq/troubleshooting/faq\_51/
[spam-guide]: http://help.analyticsedge.com/spam-filter/definitive-guide-to-removing-google-analytics-spam/
[trends]: http://www.google.com/trends/explore#q=google%20analytics%20spam
[filter-referrals]: https://support.google.com/analytics/answer/1034842
[default-segment]: http://webmasters.stackexchange.com/questions/74724/set-a-default-segment-for-google-analytics
