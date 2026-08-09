# Drawings gallery

Static gallery site: masonry grid, monochrome thumbnails, keyboard-navigable overlay, tag/year archive.

## Setup

```
npm install
npx @11ty/eleventy --serve
```

Visit `http://localhost:8080`.

## Adding a new piece

1. Do your scan → crop → color-correct pass as usual.
2. Create a folder under `src/artworks/`, named however you like (date-prefixing keeps
   them sortable in a file browser — e.g. `2024-06-new-piece`).
3. Put the processed image(s) in an `img/` subfolder inside it: `source.jpg` for a
   single piece, or `source-01.jpg`, `source-02.jpg`, ... for a multi-image collection
   (sorted alphabetically, so zero-pad the numbers).
4. Add a `meta.yaml` next to `img/`:

   ```yaml
   title: "Untitled figure study"
   date: 2024-06-10
   tags: [figures, ink]
   medium: "Ink on paper"
   cover: source-02.jpg   # optional — omit to default to the first image
   ```

5. Rebuild. Thumbnails, full-size images, dimensions, the collection badge, and the
   archive's tag/year chips are all derived automatically — nothing else to update by hand.

## Notes

- `src/_data/artworks.js` is the only place that reads the `artworks/` folder. Everything
  else (templates, filters, collections) consumes its output.
- Grid layout uses CSS-columns masonry today, with a `@supports (display: grid-lanes)`
  block ready for when native CSS masonry lands in stable browsers — check
  caniuse.com before relying on it in production. No JS layout library either way.
- Keyboard nav (`src/js/main.js`) computes adjacency from actual on-screen positions
  (`getBoundingClientRect`), so it's correct regardless of which of the two grid
  layouts above is active.
- `@11ty/eleventy-img` is pinned to v5 — v7 rewrote its API (class-based, no more
  default export) and isn't a drop-in swap. Worth revisiting once that API stabilizes
  and its docs catch up.
- The three sample artwork folders included are solid-color placeholders so you have
  something to look at immediately — swap them for real scans and delete the sample
  `meta.yaml` files you don't need.
