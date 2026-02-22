---
title: "Ghost: My New Newsletter Platform"
publishDate: "2026-02-21"
updatedDate: "2026-02-22"
description: "Ghost is my top pick for a self-hosted newsletter."
toc: false
posse:
  - "[r/Ghost](https://www.reddit.com/r/Ghost/comments/1ratihx/im_selfhosting_ghost_for_my_email_newsletter_its/)"
  - "[r/selfhosted](https://www.reddit.com/r/selfhosted/comments/1rasaap/why_i_chose_ghost_for_selfhosting_an_email/)"
---

I'm hopeful that I've finally landed on a newsletter platform that I can stick with. Here's a timeline of the tools I've used:

- 2025-12-08: [listmonk](https://listmonk.app/)
- 2026-02-10: [Keila](https://www.keila.io/)
- 2026-02-20: [Ghost](https://ghost.org/)

Here are some thoughts on why I prefer Ghost.

##### listmonk

listmonk is solid free open source software created by [Kailash Nadh](https://nadh.in/). However, I found the double opt-in process a little clunky. Here's how the subscription flow went:

1. Submit form with email address
2. Receive email with link to confirm
3. Clicking link opens website
4. On that site, another form must be submitted to confirm the subscription

If I could change one thing about listmonk, it would be streamlining the double opt-in process. I wish clicking the link in the email would immediately confirm the subscription. Other than that, listmonk is excellent.

##### Keila

Keila is also solid. My main complaint is that I didn't love how the emails looked, and there was no easy way to change their appearance. Keila is more opinionated than listmonk. Some opinions I liked, others I found pretty frustrating.

##### Ghost

Ghost markets itself as "the best open source blog & newsletter platform" and I agree. I had been avoiding Ghost because I like having complete control over my blog content. I hadn't considered that I could use Ghost solely as a newsletter platform. I'm currently self-hosting Ghost on a VPS (virtual private server).

A slight downside of Ghost is that I cannot customize my emails for each recipient. This was a feature I was using in both listmonk and Keila — it reminded me that each email I sent was going to a real person! On reflection, I think Ghost has made a smart choice: this way it's easy to send emails and publish an exact copy to the web. In general, I'm really loving Ghost. There are so many places where they've made great decisions (like not customizing emails).

Another great feature is their signup forms. I had put together a custom signup form that I was using for both listmonk and Keila. It worked but it wasn't awesome. Ghost's signup forms are awesome and easy to embed. That has been a really nice upgrade.

Ghost is opinionated about the signup flow - all subscribers must complete a double opt-in. That adds a small hurdle, but the whole process with Ghost is very smooth. It doesn't have a clunky signup process like listmonk. That makes sense since over "$100 million in revenue is earned each year by publications running on Ghost."

There was one place where I didn't love their decision. To use Ghost’s built-in newsletter delivery feature you must use [Mailgun](https://docs.ghost.org/faq/mailgun-newsletters). Luckily, I was already using Mailgun for my newsletter. The one downside of Mailgun is it can get "expensive" quickly. If I get over 100 subscribers, I'll need to upgrade to their basic subscription at $15/month.[^1] I think Ghost's perspective is refreshing:

> We’re a small team with limited resources, and supporting multiple bulk-mail APIs is too much overhead for us to manage. We build and support Ghost on one clear stack that we know works reliably. We would rather have a product that can only be configured one way and works reliably, than being configured lots of different ways but is unreliable.

I think this is another example of an opinionated decision that I'll be happy with in the long run.

Like Keila, Ghost doesn't make it easy to fully customize the look of emails. But, I really like how Ghost emails look. Overall, moving my newsletter has been a big upgrade:

- Signup form improved
- Signup process smoothed out
- Email styling improved

Ghost is more opinionated than listmonk and Keila, but my experience so far is that Ghost has really good opinions and I appreciate the decisions they made. Let's Ghost!!

[^1]: I got a great tip on the Ghost subreddit: "You don't need \$15/month Mailgun. You need to sign up for a trial of their foundation plan, then when you cancel it (before it bills), they'll offer you the flex plan, which is much cheaper for small newsletters." Here are some more [details](https://jonathanmh.com/p/cheap-email-api-mailgun-flex-plan/). As of 2025-12-01, the flex plan cost \$2.00/1000 emails, which will be totally fine by me.