---
title: "Example Reveal.js Slideshow"
publishDate: "2025-12-19"
description: "A demonstration of Reveal.js slideshows in Astro using Islands architecture"
draft: false
theme: "black"
---

# Welcome to Reveal.js

This is an example slideshow built with Astro and Reveal.js!

Use arrow keys or swipe to navigate →

# What is Reveal.js?

Reveal.js is a powerful framework for creating beautiful presentations using HTML.

## Key Features

- Markdown support
- Code syntax highlighting  
- Speaker notes
- Export to PDF
- Touch and keyboard navigation

## Astro Islands

This slideshow demonstrates **Astro Islands**:

- 🏝️ Interactive component (Reveal.js) loads only on slide pages
- ⚡ Rest of your blog stays fast and static
- 📦 No JavaScript bloat on regular posts
- 🎯 Progressive enhancement

# Creating Slides

Use H1 headers for horizontal slides and H2 headers for vertical slides.

## Markdown Structure

Write your slides like this:

```markdown
# Horizontal Slide 1

Content here

# Horizontal Slide 2

## Vertical Slide 2.1

More content

## Vertical Slide 2.2

Even more content
```

## No Separators Needed

You don't need `---` anymore! Just use heading levels:
- **H1** = New horizontal slide →
- **H2** = New vertical slide ↓

# Code Highlighting

Reveal.js includes syntax highlighting out of the box.

## JavaScript Example

```javascript
function helloWorld() {
  console.log("Hello from a slideshow!");
  return "Awesome!";
}
```

## Python Example

```python
def greet(name):
    """Say hello in Python"""
    return f"Hello, {name}!"
```

# Tips & Tricks

**Keyboard shortcuts:**
- Arrow keys: Navigate
- F: Fullscreen
- S: Speaker notes
- ESC: Overview mode
- ?: Help

## Navigation

- Use **arrow keys** to move between slides
- **Right arrow** moves to next horizontal slide
- **Down arrow** moves to next vertical slide
- Press **ESC** for an overview of all slides

# Thank You!

Questions?

## Built With

- [Astro](https://astro.build)
- [Reveal.js](https://revealjs.com)  
- ❤️ and markdown
