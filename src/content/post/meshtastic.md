---
title: "Meshtastic: Off-Grid Messaging"
description: "A beginner's guide to Meshtastic with tips for getting started."
publishDate: "2025-12-12"
updatedDate: "2025-12-30"
tags:
  - deprecated
---

:::warning{title=Deprecated}
I'm taking a break from Meshtastic. If you're looking to expand the mesh into Wayland, MA, please let me know - I’d be happy to help out.
:::

I blame [Jeff Geerling](https://www.youtube.com/c/JeffGeerling) for getting me into [Meshtastic](https://meshtastic.org/) - not really, but kind of. Jeff has an impressive ability to make tech look fun. Unfortunately, my experience with Meshtastic has been more disappointment than fun. This post aims to:

1. Introduce Meshtastic
2. Describe my experience
3. Give some tips for new users

## What is Meshtastic?

> Meshtastic® is a project that enables you to use inexpensive LoRa radios as a long range off-grid communication platform in areas without existing or reliable communications infrastructure. This project is 100% community driven and open source!

There are a couple of things I really appreciate about Meshtastic:

1. Messages are encrypted. I value privacy, so being able to encrypt messages is extremely valuable.

2. You don't need a license to use Meshtastic.

When using amateur radio frequencies, messages cannot be encrypted, and you need a license.

## My Experience

Cell phone coverage in my town is impressively weak, and I was curious to see if anyone nearby had set up Meshtastic nodes. In August 2024, I bought a [Heltec v3](https://heltec.org/project/wifi-lora-32-v3/) for $26 and took it out on a few bike rides, but I didn't detect any other nodes. The Heltec v3 on its own was inconvenient because I had to plug it into my phone to use it. So I decided I needed:

1. [Battery](https://www.amazon.com/dp/B0DMCXJMGF?tag=andrewmarder-20) for $24
2. 3D-printed case from [PacificNorthWest3D](https://www.etsy.com/shop/PacificNorthWest3D) for $20
3. [Antenna](https://www.amazon.com/dp/B086ZG5WBR?tag=andrewmarder-20) for $12

For both the battery and the antenna, the cheapest option at the time was a four-pack of each. All in, I ended up spending $82. I now had a Meshtastic radio I could bring anywhere. I brought it on a few more bike rides and car rides, and left it on in my house. Unfortunately, I still haven't communicated directly with anyone via the mesh.

I've connected my node to the public [MQTT](https://meshtastic.org/docs/software/integrations/mqtt/) server `mqtt.meshtastic.org` (via WiFi). I named my node `https://andrewmarder.net/meshtastic/` so people can find this post from the [MeshMap](https://meshmap.net/#1127930852). I'm hopeful that advertising my location on the MeshMap will encourage nearby Meshtastic enthusiasts to contact me via on-grid messaging so we can build our off-grid mesh. If you're a Meshtastic user near Wayland, Massachusetts, please reach out - I'd love to connect!

## Tips for New Users

As a first step, I would suggest checking out some node maps to see if there are nodes near you.

| Map Link | Data Source | # Nodes |
|----------|-------------|--------:|
| [meshmap.net](https://meshmap.net/) | mqtt.meshtastic.org | 10,529 |
| [meshtastic.liamcottle.net](https://meshtastic.liamcottle.net/) | mqtt.meshtastic.liamcottle.net | 26,411 |
| [meshsense.affirmatech.com](https://meshsense.affirmatech.com/) | [MeshSense](https://github.com/Affirmatech/MeshSense) | 6,594 |

The regional maps for [New Hampshire](https://nhmesh.live/) and the [Bay Area](https://meshview.bayme.sh/map) are particularly impressive.

Second, I would suggest looking for user groups near you. Here are some groups near me:

| Platform | Group Link | # Members |
|----------|------------|----------:|
| Facebook | [New England Meshtastic Users (Unofficial)](https://www.facebook.com/groups/956183615402630) | 613  |
| Discord  | [Greater Boston Mesh](https://discord.gg/MUVASVEEES) | 457 |
| Facebook | [Boston Meshnet (Meshtastic/Meshcore)](https://www.facebook.com/groups/376287875353461/) | 366   |
| Discord | [New England Mesh & Outdoors](https://discord.gg/hsb9zFqNe) | 46 |

If you're interested in Meshtastic, [Meshtastic's Official Subreddit](https://www.reddit.com/r/meshtastic/) is an excellent resource. It has great information and really helpful people.

## Thanks

I want to thank the folks on the Meshtastic Subreddit for their helpful feedback. I posted a first draft of this post and learned a lot from their [comments](https://www.reddit.com/r/meshtastic/comments/1pl12u6/questions_from_an_ineffectual_meshtastic_user/). Then I asked about node maps and learned about a ton of useful [maps](https://www.reddit.com/r/meshtastic/comments/1plla0t/any_other_node_maps_to_check_out/).
