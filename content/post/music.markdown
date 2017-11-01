---
title: Visualizing Sound
date: 2017-11-01
tags: [R]
twitter:
  card: summary_large_image
  site: "@andrewmarder"
  creator: "@andrewmarder"
  title: Visualizing Sound
  description: Using R to see the data beneath the music.
  image: "/post/music_files/figure-html/graph-1.png"
---

My sister's boyfriend's band, [Vertigo Drift](https://www.vertigodrift.com/), recently came out with a new EP called _Phase 3_. It seemed like the perfect excuse for me to play around with [gganimate](https://github.com/dgrtwo/gganimate) to create a music video.


## Reading Audio Files

The [tuneR](https://cran.r-project.org/web/packages/tuneR/) package provides excellent functions for reading audio files.

Let's download an example wave file.


```r
url <- "http://freewavesamples.com/files/Alesis-Fusion-Acoustic-Bass-C2.wav"
command <- paste("wget", url)
system(command)
```

Let's use tuneR to read the file.


```r
library(tuneR)

wave <- readWave("Alesis-Fusion-Acoustic-Bass-C2.wav")
wave
```

```
## 
## Wave Object
## 	Number of Samples:      127782
## 	Duration (seconds):     2.9
## 	Samplingrate (Hertz):   44100
## 	Channels (Mono/Stereo): Stereo
## 	PCM (integer format):   TRUE
## 	Bit (8/16/24/32/64):    16
```

This particular file is 2.9 seconds long. It is recorded in stereo (it has a left and right channel). There are 44,100 samples per second. In total there are 127,782 samples. I found Wikipedia's page on [digital audio](https://en.wikipedia.org/wiki/Digital_audio) to be pretty helpful in understanding this data.


## Plotting Audio Files

Let's put the audio data into a data frame.


```r
library(tidyverse)

data <- data.frame(
    Left = wave@left,
    Right = wave@right
)
data$second <- (1:nrow(data)) / wave@samp.rate
head(data)
```

```
##   Left Right       second
## 1 -127  -145 2.267574e-05
## 2 -126  -135 4.535147e-05
## 3 -149  -176 6.802721e-05
## 4 -175  -213 9.070295e-05
## 5 -165  -200 1.133787e-04
## 6 -143  -161 1.360544e-04
```

Typical video contains 24 frames per second. Let's focus on the first 24th of a second of this audio file.


```r
data <- data %>%
    filter(second <= 1 / 24)
nrow(data)
```

```
## [1] 1837
```

Now let's plot this 24th of a second.


```r
data %>%
    gather(key = "Channel", value = "y", Left, Right) %>%
    mutate(y = y / max(abs(y))) %>%
    ggplot(aes(x = second, y = y)) +
    geom_point(size = 0.1) +
    ylab("Relative Amplitude") +
    xlab("Time (Seconds)") +
    ylim(-1, 1) +
    facet_grid(Channel ~ .) +
    theme_bw()
```

<img src="/post/music_files/figure-html/graph-1.png" width="672" />


## Animating Plots

I used gganimate to create the following music video. The song is 2 minutes and 46 seconds long so the video stitches together (2 * 60 + 46) * 24 = 3984 plots. If I watch it for too long it starts to hurt my eyes.

<iframe width="640" height="360" src="https://www.youtube.com/embed/YACyTCegGG8?rel=0" frameborder="0" allowfullscreen></iframe>

Let me know if you're interested in the code. I haven't posted it on GitHub yet, but I'd be happy to.

<!-- video to checkout: http://csh.bz/highticket/ -->
