---
title: "Introducing whispy: Easy Speech-to-Text on Mac"
description: "Introducing whispy, a Python wrapper around whisper.cpp that makes speech-to-text transcription effortless on Mac. Record, transcribe, and paste - perfect for writers who want to avoid over-editing their first drafts."
publishDate: "2025-07-08"
tags:
  - deprecated
---

:::warning{title=Deprecated}
I am no longer using whispy. [Cursor's](https://cursor.com/) voice input satisfies my needs. If you're interested in resurrecting this project, please let me know - I’d be happy to help out.
:::

If you're a writer who tends to over-edit while drafting (like me), or you simply want an easy way to convert speech to text on your Mac, I've built a tool that might help: **whispy**.

## What is whispy?

[whispy](https://github.com/amarder/whispy) is a Python wrapper around [whisper.cpp](https://github.com/ggerganov/whisper.cpp) that makes speech-to-text transcription incredibly simple. whispy does three things:

1. **Record** audio from your microphone
2. **Transcribe** that audio to text using OpenAI's Whisper models
3. **Automatically copy** the text to your clipboard to paste anywhere

## Motivation

I have a problem: I edit way too much while writing. It slows down my writing process because I constantly second-guess myself and revise sentences before I've even finished my thoughts. 

Speech-to-text lets me bypass this tendency entirely. I can just speak my ideas fluently without the temptation to edit, then clean up the transcription afterward. The result is faster first drafts and better flow.

## Technical Foundation

whispy is built on top of **whisper.cpp**, which is a highly optimized C++ implementation of OpenAI's Whisper speech recognition model. On Apple Silicon Macs, whisper.cpp leverages the Accelerate framework and Metal for incredible performance - often transcribing faster than real-time even with high-accuracy models.

The problem? whisper.cpp can be frustrating to install and set up. You need to clone repositories, run build scripts, download models manually, and figure out command-line arguments.

whispy solves this by handling all the setup automatically:

- **Auto-installation**: Clones and builds whisper.cpp for you
- **Model management**: Downloads models as needed
- **Simple interface**: Just run `whispy record` and start talking

## See It In Action

Here's a one-minute demo showing how whispy works:

<iframe width="560" height="315" src="https://www.youtube.com/embed/O6lGEreTbzg" title="whispy Demo" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Try It Out

Installation is straightforward:

```bash
pip install git+https://github.com/amarder/whispy.git
```

This automatically sets up everything you need, including building whisper.cpp with GPU acceleration.

Basic Usage:

```bash
# Record and transcribe in one command
whispy record
```

If you run into any issues, please [open an issue on GitHub](https://github.com/amarder/whispy/issues) - I'll help you get set up.

Whether you're a writer looking to improve your drafting process, a researcher conducting interviews, or anyone who needs reliable speech-to-text on Mac, whispy might be a great tool for you.