# Shoah 1985 Polish Parts

Interactive bilingual edition of **Part Four: The Lost Voices**, containing scenes with Polish-speaking interviewees from Claude Lanzmann’s *Shoah*.

The site is designed for side-by-side reading of the Polish transcription and English translation, with French dialogue spanning both columns. Editorial and contextual notes are displayed interactively on hover or tap.

## Structure

- `index.md` - introduction and linked table of contents
- `chapters/` - one Markdown file per chapter
- `_layouts/default.html` - shared page layout
- `style.css` - site-wide styling
- `site.js` - interactive note handling
- `favicon.jpg` - site icon

## Chapter files

There are 41 chapter files in total.

- Chapters **1–3** have been populated with transcript content.
- Chapters **4–41 currently contain boilerplate only and still need to be populated** from the source document.

Each chapter uses the same basic structure:

```html
<div class="transcript">

<div class="speaker">Speaker name</div>

<div class="pl">Polish text</div>

<div class="en">English text</div>

<div class="fr">French text</div>

</div>
````

Polish appears in the left column, English in the right column, and French spans both columns.

## Notes

Interactive notes use this syntax:

```text
((note:note-id|Visible text))
```

with the corresponding definition later in the same file:

```text
((note:note-id))
Note text goes here.
```

The note text is hidden from the normal page flow and displayed when the marked text is hovered over, focused, or tapped.

## Navigation

Each chapter contains front matter defining the page title and the next chapter:

```yaml
---
layout: default
title: "3. Villagers (Residents of Chełmno)"
next_title: "4. Jan Piwoński"
next_url: "/chapters/04-jan-piwonski.html"
---
```

The shared layout also provides a persistent link back to the home page.

## Copyright

All rights reserved by the authors and respective rights holders.

Transcription and translation by Magda Heydel, Karolina Kwaśna, Roma Sendyka, and Joanna Sobesto, with Karolina Kamińska, Jessica Jensen Mitchell, and Natalia Roguz. Edited by Roma Sendyka and Magda Heydel.

Claude Lanzmann’s *Shoah* remains the property of its respective rights holders.


