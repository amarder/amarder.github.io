---
title: "Introducing Peloterm"
description: "An open-source indoor cycling training app built with Python that connects to smart trainers, tracks metrics, and uploads to Strava"
publishDate: "2025-05-30"
draft: false
---

Sometimes I enjoy riding my bike indoors. For years, I used Wahoo SYSTM (formerly known as the Sufferfest) and was quite happy with their platform. However, since I wasn't using it frequently enough to justify the $15/month subscription, I decided to cancel. When I discovered the SYSTM app was essentially useless without a paid subscription, I started exploring alternatives.

A quick Google search for "python bluetooth devices" led me to Bleak (Bluetooth Low Energy platform Agnostic Klient), which sparked an idea: why not build my own open-source training app? And so [Peloterm](https://github.com/amarder/peloterm) was born!

![Peloterm Screenshot](https://github.com/amarder/peloterm/releases/download/v0.1.4/peloterm.png)

Here are the features that make Peloterm particularly appealing to me:

- **Multi-device connectivity**: "Seamlessly" connects to my smart trainer, cadence monitor, and heart rate monitor
- **Clean metrics display**: Shows the data I care about (power, speed, cadence, heart rate) in large, easy-to-read numbers
- **Progress tracking**: Displays current time and a visual progress bar for each ride
- **Real-time graphing**: Charts all four key metrics as you ride
- **Data export and sharing**: Records rides to FIT files and uploads directly to Strava
- **Minimal screen footprint**: Leaves plenty of room for entertainment (today I watched Giro d'Italia highlights while training)
- **Developer-friendly setup**: Designed to be simple for Python users to install and run

    ```bash
    pip install peloterm
    peloterm start
    ```

If you're interested in trying Peloterm, I'd love to help you get started. Feel free to reach out or check out the project on [GitHub](https://github.com/amarder/peloterm).

Ride on!