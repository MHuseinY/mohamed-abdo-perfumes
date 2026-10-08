# Maydi House website (review prototype)

Maydi House («مايدي هاوس») is a Somali fragrance house in Mogadishu, founded by the perfumer Mohamed Abdo.
This folder holds the prototype that is shared with the client for review. English is primary, with a full Arabic homepage.
It is built on the scroll-craft skill (`.claude/skills/scroll-craft`), using its engine unmodified.

## Layout

| Folder | What it is |
|---|---|
| `site/` | The source. Plain HTML, CSS and JS, served as is for local work. |
| `site/index.html`, `site/ar.html` | The English and Arabic homepages (scroll-driven, six acts). |
| `site/boutique.html`, `atelier.html`, `factory.html`, `botanicals.html`, `mohamed-abdo.html`, `contact.html`, `product.html` | The English inner pages. |
| `site/ar-boutique.html` ... `ar-product.html` | The same seven pages in Arabic (RTL). Same markup as the English ones; only the text differs. |
| `site/site.js` | The shared library (`MAYDI.*`): the header, menu and footer, the product cards and page, the boutique filters, the enquiry form, in English and Arabic. Standalone pages use file links; the review site sets `MAYDI_HASH_LINKS` and gets `#hash` links. |
| `site/products.js`, `site/products-ar.js` | The 23 products, and their Arabic text keyed by slug. |
| `site/glass.css`, `site/glass.js` | The liquid-glass navigation (phone dock, floating top bar). |
| `site/scrollcraft.js`, `site/scrollcraft.css` | The engine. **Never edit these.** Copy them again from the skill if the engine is updated. |
| `site/assets/` | Photos, the hero film (`hero-film.mp4`, `hero-film-m.mp4`, poster) and `gafur/` product packshots. |
| `brand/` | The logo files. `maydi-house-logo-trace.svg` (and `-lite`): the client's AI-made logo traced to a transparent colour SVG, for large and print use. `maydi-house-mark.svg`: the simplified mark (pointed arch, the M, a sprig, a drop of resin) used in the header and favicons. `source/` holds the original JPEG, `trace-scripts/` the one-off tracing scripts (hardcoded paths), `tools/make-brand-assets.cjs` rebuilds the mark, `site/favicon*`, `site/apple-touch-icon.png` and `site/og-image.png`. |
| `source-media/` | The original 1080p logo film from Higgsfield and the start frame it was made from, and the Instagram story photo that `site/assets/timbrose-pair.webp` is cropped from. |
| `review/` | Builds the single-document review site (see below): `make.py`, `build.py` (homepages), `build_single.py` (the shell), `spa.js` (router), `review.css`, `notes.js`. Output goes to `review/out/` (not tracked). |
| `tests/` | Browser checks (Playwright driving the installed Chrome). |

## Run it locally

The preview server is configured in `.claude/launch.json` as `maydi-preview` (port 4500, root = this folder):

- Site source: <http://localhost:4500/site/index.html> and `/site/ar.html`; inner pages e.g. `/site/boutique.html` and `/site/ar-boutique.html`
- Review build, in the same frame the artifact viewer uses: <http://localhost:4500/review/out/preview/sandbox.html>

## Build and publish the review link

```
python review/make.py
```

This writes `review/out/maydi-house-single.html` and `review/out/publish-files.json`. Publish the HTML as the artifact's main page,
and pass the files listed in `publish-files.json` beside it (`root` is `site/`). Remove files that are no longer used by passing `null`.
Client link: <https://claude.ai/artifact/6rNye7g8Z683gWBjViUoE1> (public: anyone with the link; v11 carries the Arabic inner pages). Private owner-only copy used for review before a client publish: <https://claude.ai/artifact/NRcDvE7hmX8gaDWvYtrLzE>.

The review build is ONE document: the inner pages (English `#boutique`, Arabic `#ar-boutique`) are hash views, and the two homepages (`#home`, `#ar`) are
full-screen iframes. Their links ask the parent to change its hash. The language switch keeps you on the same page. This avoids any link that loads a second document, which did not work reliably in the artifact viewer.
Review builds use Lora and Almarai from Google Fonts, never the Thmanyah files.

## Tests

```
cd tests && npm install
npm run nav:phone      # EN, AR and every section on a phone, inside the sandboxed frame (needs the server running)
npm run nav:desktop
npm run hero           # scrubs the hero film at several scroll positions
npm run taps           # checks that taps reach the hero button
node nav-arabic.cjs    # the Arabic inner pages: dock, filters, products, prefilled enquiry, language switch
node contact-whatsapp.cjs  # the enquiry form opens WhatsApp with the message; prices, Timbrose notes, Factory "under construction"
node pages.cjs         # every standalone page, both languages, two widths
node shell-sweep.cjs   # every route of the review site at five widths: no overflow, no broken images
node snapshot.cjs <tag>; node snapshot.cjs --diff <a> <b>   # records and compares what each route shows (use it around refactors)
```

## Rules to keep

- **Thmanyah font:** commercial web use is allowed only if the files are bundled unmodified. Never commit them, never offer them as
  downloads, never upload them as artifact files. They live in `site/fonts-local/`, which git ignores. The local pages use them; review links do not.
- **Never edit the scroll-craft engine.** Page code adapts around it (Arabic is mirrored in the page, no kinetic text on Arabic).
- **The `gafur/` packshots and the product texts come from gafur.ae** (Zakir Gafur). They are used for client review only.
  Do not publish the site publicly until the owner has given permission or they are replaced with our own photos.
- Do not publish the founder's phone number. The one number on the site is the house WhatsApp the client sent on 2026-10-07
  (`WA` in `site/site.js`, the two contact pages, both homepage footers). The user confirmed on 2026-10-08 that it is the house's number for customers, and it is on the client link (v12).

## Status

Done: both homepages, glass navigation, the logo film in the hero, the inner pages in English and Arabic, one review link.
From the client (2026-10-07), now on the site: the WhatsApp number (the enquiry form opens WhatsApp with the message ready), Timbrose II at $160 for 30 ml,
Timbrose I's notes as one list (the house gave no tiers), Maydi Factory marked "under construction".
The client has no source file for the logo (it was made with AI): the only copy is `Resources/Maydi House Logo.jpeg`. It is traced to SVG in `brand/`
(known flaws: light shadow fringes on the lower right, thinner lattice lines). The header and favicons use the simplified mark; the link preview
(`site/og-image.png`) uses the traced logo and points at `https://maydihouse.com/og-image.png`, which only works once the domain serves the site.
Open: a native review of every Arabic line, the other prices (only Timbrose II has one), factory content, Timbrose II accords check, clean product photos,
a vector logo, exact green colour values, permission for the gafur images, Safari and iPhone checks, performance and accessibility pass,
production project, domain (maydihouse.com, Porkbun, API access on) and hosting (not chosen yet).
