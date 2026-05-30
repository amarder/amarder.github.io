---
title: "eufree: Smart Scale Data Freedom"
description: ""
publishDate: "2026-05-30"
---

I bought a eufy Smart Scale back in 2017, and it's still working great almost ten years later! But, I don't like having to set up an account with eufy to record my weight history. Here's an unedited note I put in my password manager that cracks me up:

> I think this is the password I used to set up my scale on my phone. I have no idea why I need this password, but it probably makes sense to hold onto it.

I created [eufree](https://github.com/amarder/eufree) so I would have an easy way to record my data without getting sucked into the eufy ecosystem. I also set up a [TRMNL plugin](https://github.com/amarder/trmnl-webhook-graph) so I could display my weight on my TRMNL. Here's how I use the system:

1.  Start `eufree` at the command line:

    ```bash
    eufree --trmnl-url "https://trmnl.com/api/custom_plugins/asdfqwerty1234"
    ```
    
2.  Step on the scale to weigh myself.
3.  When the scale settles and sends its final reading, `eufree` logs that data to a file and sends my weight to my TRMNL plugin for plotting.

It feels great to be in full control of my data!
