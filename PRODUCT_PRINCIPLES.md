# Keepnoto Product Principles

## Core Principles

- The reason why something was saved is the most important part.
- Saved links should feel useful and valuable, not like a boring list.
- The product should reduce link chaos, not add more organization work.
- Saving should be simple.
- Returning to old saved links should be easy.
- The interface should help users quickly understand what each saved item is and why it matters.
- Right-side link preview cards should use real sharing metadata first: `og:image`, then `twitter:image`. In compact square preview surfaces, show that media image only when it is square-safe. If the media image is too wide/tall for the square crop, missing, or fails to load, show a large contained site/app logo asset in this order: `apple-touch-icon`, manifest icons, favicon. Logos should stay readable, so wordmarks use contained fit rather than cropped cover fit. If metadata and logo assets are missing or fail to load, show a calm fallback domain letter. Do not use generated website screenshots or hand-drawn marketing-like mockups as the default preview.
- YouTube links should preserve the saved entity: video links should show the real video thumbnail; channel links should show the channel/avatar image when metadata provides it.
- Avoid overcomplicating the MVP.

## Decision Rules

- If a feature does not improve saving, understanding, organizing, searching, or returning to links, question it.
- If a workflow makes users do heavy manual organization before saving, simplify it.
- Collection is useful metadata, but it should not become required work: show the collection when present and `No collection` when absent.
- If a screen makes saved links feel disposable or generic, improve hierarchy and context.
- If there is a conflict between a generic product assumption and Keepnoto's docs, Keepnoto's docs win.

## Link Preview Asset Rule

Do not render guessed favicon or preview URLs directly. Resolve saved-link media through the preview metadata pipeline, validate candidates when possible, then fall back in order: square-safe sharing image, large contained site/app icon, domain letter. Broken image icons should never appear in the UI.
