# Quotes CDN

> **Words worth keeping.**
>
> A fast, no-key quote API with author metadata, searchable JSON, and
> embeddable SVG quote cards.

<p align="center">
  <a href="#quick-start">Quick start</a>
  ·
  <a href="#api-reference">API reference</a>
  ·
  <a href="#svg-card-generator">SVG cards</a>
  ·
  <a href="#data-and-attribution">Data and attribution</a>
</p>

<p align="center">
  <img alt="Node.js 22+" src="https://img.shields.io/badge/Node.js-22%2B-171717?style=flat-square" />
  <img alt="No dependencies" src="https://img.shields.io/badge/dependencies-0-e85d3f?style=flat-square" />
  <img alt="Vercel ready" src="https://img.shields.io/badge/Vercel-ready-d9ff4a?style=flat-square&labelColor=171717" />
  <img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-bc6c4a?style=flat-square" />
</p>

Quotes CDN is a deliberately small normal-quotes equivalent of a quote CDN:
one plain Node server, static JSON data, serverless-compatible API handlers,
and a browser interface for exploring the archive and generating SVG cards.

No database is required. No API key is required. No build step is required.

---

## What this project gives you

- 25,000 quote records
- 2,340 author records
- Random, indexed, filtered, and searchable quote endpoints
- Author metadata, biographies, quote counts, and stable author IDs
- Pagination for quotes and authors
- Archive statistics and author letter indexes
- Five SVG card themes
- Custom SVG card colors, borders, and radius values
- A warm visual explorer at `/`
- A complete API reference at `/docs`
- Local Node hosting and Vercel-compatible route handlers
- CORS headers on JSON and SVG API responses

The project is intentionally dependency-free. It is small enough to understand
in one sitting and useful enough to drop into a README, bot, landing page,
randomizer, or small web experiment.

---

## Quick start

### Requirements

- Node.js 22 or newer
- npm

### Install and run

```bash
npm install
npm start
```

Open the local explorer:

```text
http://localhost:5000
```

Open the local API documentation:

```text
http://localhost:5000/docs
```

The project has no runtime package dependencies. `npm install` is still safe
to run because it creates the normal npm project metadata and lockfile
workflow if you choose to add tooling later.

### Development mode

The development script uses the same simple server:

```bash
npm run dev
```

There is no separate bundler, compiler, or frontend development server.

---

## First request

```bash
curl http://localhost:5000/api/quote
```

Example response:

```json
{
  "_id": "Q00001",
  "index": 1,
  "author_id": "A00001",
  "author": "A. A. Milne",
  "quote": "Almost anyone can be an author; the business is to collect money and fame from this state of being.",
  "author_info": {
    "_id": "A00001",
    "name": "A. A. Milne",
    "quote_count": 18,
    "wikipedia_title": "a. a. milne",
    "wikipedia_url": "https://en.wikipedia.org/wiki/a._a._milne"
  }
}
```

All API responses are JSON except `/api/card`, which returns SVG by default.
Every API request is a `GET` request.

---

## API reference

Set a base URL once in your shell:

```bash
export BASE_URL="http://localhost:5000"
```

For a deployed app, replace it with your public Vercel URL:

```bash
export BASE_URL="https://your-project.vercel.app"
```

### Endpoint map

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api` | Machine-readable API index |
| `GET` | `/api/quote` | Return one quote |
| `GET` | `/api/random` | Return a random quote |
| `GET` | `/api/quotes` | Return a paginated quote collection |
| `GET` | `/api/authors` | Return a searchable author collection |
| `GET` | `/api/author` | Return one author by ID, name, or query |
| `GET` | `/api/author/:id` | Return one author by path ID |
| `GET` | `/api/search` | Search quotes and authors together |
| `GET` | `/api/stats` | Return archive statistics |
| `GET` | `/api/themes` | List SVG card themes |
| `GET` | `/api/letters` | Return available author directory letters |
| `GET` | `/api/health` | Return service health |
| `GET` | `/api/card` | Generate an SVG quote card |

### `GET /api`

Returns the API name, version, data source summary, endpoint map, and docs URL.

```bash
curl "$BASE_URL/api"
```

### `GET /api/quote`

Returns one quote. With no filters, the endpoint selects a random record.

```bash
curl "$BASE_URL/api/quote"
```

#### Query parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `index` | integer | Return the quote with this one-based index |
| `id` | string | Return a quote by `_id`, such as `Q00001` |
| `quote_id` | string | Alias for `id` |
| `quoteId` | string | Alias for `id` |
| `author_id` | string | Limit selection to one author ID |
| `authorId` | string | Alias for `author_id` |
| `author` | string | Match an author name |
| `search` | string | Search quote, author, ID, and index text |
| `q` | string | Alias for `search` |
| `seed` | integer | Select a repeatable result from the filtered pool |

Examples:

```bash
# Get quote number 42
curl "$BASE_URL/api/quote?index=42"

# Get a quote by stable quote ID
curl "$BASE_URL/api/quote?id=Q00001"

# Get a quote by author ID
curl "$BASE_URL/api/quote?author_id=A00001"

# Search for a phrase
curl "$BASE_URL/api/quote?search=courage"

# Repeat the same filtered result
curl "$BASE_URL/api/quote?search=courage&seed=0"
```

Indexed, ID-based, and seeded requests are stable and cacheable. Unseeded
random requests are returned with `Cache-Control: no-store` so a randomizer
does not accidentally serve the same browser-cached response forever.

### `GET /api/random`

Returns a random quote. This route is a direct alias for random quote
selection and is always marked as non-cacheable.

```bash
curl "$BASE_URL/api/random"
```

### `GET /api/quotes`

Returns a paginated collection:

```json
{
  "total": 25000,
  "limit": 20,
  "offset": 0,
  "data": []
}
```

#### Query parameters

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `limit` | integer | `20` | Number of records, capped at `100` |
| `offset` | integer | `0` | Number of records to skip |
| `search` | string | — | Search quote and author text |
| `q` | string | — | Alias for `search` |
| `author` | string | — | Match an author name |
| `author_id` | string | — | Match an author ID |

```bash
curl "$BASE_URL/api/quotes?limit=10&offset=20"
curl "$BASE_URL/api/quotes?author=Virginia%20Woolf&limit=10"
```

### `GET /api/authors`

Returns a paginated author collection:

```json
{
  "total": 2340,
  "limit": 20,
  "offset": 0,
  "data": []
}
```

#### Query parameters

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `limit` | integer | `20` | Number of records, capped at `100` |
| `offset` | integer | `0` | Number of records to skip |
| `search` | string | — | Search name, ID, or biography |
| `q` | string | — | Alias for `search` |
| `sort` | string | `name` | Use `name`, `quotes`, or `count` |

```bash
curl "$BASE_URL/api/authors?sort=quotes&limit=20"
curl "$BASE_URL/api/authors?search=milne"
```

### `GET /api/author`

Returns one author. It accepts an ID, name, or partial name:

```bash
curl "$BASE_URL/api/author?id=A00001"
curl "$BASE_URL/api/author?name=A.%20A.%20Milne"
curl "$BASE_URL/api/author?search=milne"
```

To include the author's quote records:

```bash
curl "$BASE_URL/api/author?id=A00001&include=quotes"
```

`include=quotes`, `quotes=true`, and `include=true` are accepted.

### `GET /api/author/:id`

The path form is useful for links and simple REST clients:

```bash
curl "$BASE_URL/api/author/A00001"
```

Author records contain:

```json
{
  "_id": "A00001",
  "name": "A. A. Milne",
  "quote_count": 18,
  "wikipedia_title": "a. a. milne",
  "wikipedia_url": "https://en.wikipedia.org/wiki/a._a._milne",
  "bio": "..."
}
```

### `GET /api/search`

Searches quotes and authors together:

```bash
curl "$BASE_URL/api/search?q=hope&limit=10"
```

Response shape:

```json
{
  "query": "hope",
  "quotes": [],
  "authors": []
}
```

The result limit is capped at `20`.

### `GET /api/stats`

Returns archive-level statistics:

```bash
curl "$BASE_URL/api/stats"
```

Typical fields include:

```json
{
  "quotes": 25000,
  "authors": 2340,
  "average_quote_length": 98,
  "longest_quote": {
    "index": 127,
    "length": 175
  },
  "source": "authors.json + quotes.json"
}
```

### `GET /api/themes`

Returns the supported SVG card theme names:

```bash
curl "$BASE_URL/api/themes"
```

Current themes:

```text
dark
light
midnight
nord
mono
```

### `GET /api/letters`

Returns the sorted set of first letters used by author names:

```bash
curl "$BASE_URL/api/letters"
```

### `GET /api/health`

Returns a minimal service status response:

```bash
curl "$BASE_URL/api/health"
```

Response:

```json
{
  "ok": true,
  "service": "quotes-cdn"
}
```

---

## SVG card generator

The card endpoint returns an SVG image directly. It is designed for GitHub
READMEs, profile pages, documentation sites, bots, and any place that accepts
an image URL.

### Basic card

```text
https://your-project.vercel.app/api/card?index=1
```

Markdown embed:

```md
![Quote card](https://your-project.vercel.app/api/card?index=1&theme=midnight)
```

HTML embed:

```html
<img
  src="https://your-project.vercel.app/api/card?index=1&theme=midnight"
  alt="Generated quote card"
/>
```

### Card parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `index` | integer | Quote index to render |
| `id` | string | Quote ID to render |
| `theme` | string | `dark`, `light`, `midnight`, `nord`, or `mono` |
| `quote` | string | Render custom quote text instead of a dataset quote |
| `author_name` | string | Author label for a custom quote |
| `author` | string | Alias for `author_name` |
| `border_radius` | integer | Rounded corners from `0` to `40` |
| `border_width` | integer | Border width from `0` to `5` |
| `bg_color` | hex | Custom background color |
| `quote_color` | hex | Custom quote text color |
| `author_color` | hex | Custom author text color |
| `accent_color` | hex | Custom accent color |
| `border_color` | hex | Custom border color |
| `format` | string | Use `json` to return SVG inside JSON |

Colors can be passed with or without the leading `#`.

Examples:

```text
/api/card?index=42&theme=nord
/api/card?index=42&theme=mono&border_radius=18
/api/card?index=42&bg_color=f7f0df&accent_color=e85d3f
/api/card?quote=Stay%20curious&author_name=Your%20name&theme=light
```

To receive the generated SVG inside a JSON response:

```bash
curl "$BASE_URL/api/card?index=1&theme=midnight&format=json"
```

The SVG generator wraps quote text, calculates the card height from the
rendered lines, escapes XML-sensitive content, and guards long custom inputs
so text stays inside the card.

---

## Browser interface

The public interface is intentionally built with only:

- HTML
- CSS
- Browser JavaScript

The home page includes:

- A live quote explorer
- Search by author, phrase, or quote index
- Random quote controls
- Archive statistics
- A live SVG card preview
- Quote index loading
- Theme switching
- Copyable quote and card URL actions

The docs page includes:

- Quick-start request examples
- Endpoint explanations
- Parameter tables
- Open-in-new-tab route buttons
- SVG card documentation
- Mobile-friendly layout

---

## Project structure

```text
.
├── api/
│   ├── author.js
│   ├── author/[id].js
│   ├── authors.js
│   ├── card.js
│   ├── health.js
│   ├── index.js
│   ├── letters.js
│   ├── quote.js
│   ├── quotes.js
│   ├── random.js
│   ├── search.js
│   ├── stats.js
│   └── themes.js
├── lib/
│   ├── api.js
│   ├── data.js
│   └── svg.js
├── public/
│   ├── app.js
│   ├── docs.html
│   ├── docs.js
│   ├── favicon.svg
│   ├── index.html
│   └── styles.css
├── authors.json
├── quotes.json
├── server.js
├── vercel.json
└── package.json
```

### How the server works

`server.js` serves the static browser files and forwards `/api/*` requests to
the shared router in `lib/api.js`.

The Vercel files in `api/` are thin handlers that call the same shared router.
This keeps local development and Vercel responses aligned without introducing
a framework or a separate application server.

### How the data layer works

`lib/data.js` loads `quotes.json` and `authors.json` into memory on first use.
It builds maps for quote IDs, quote indexes, and author IDs, then provides the
filtering, sorting, pagination, search, and statistics functions used by both
local and Vercel requests.

---

## Data and attribution

### Quote data provenance

The quote and author records bundled in this repository were scraped and
compiled from public websites into `quotes.json` and `authors.json`.

This project is a data/API demonstration and redistribution layer. It does not
claim ownership of the original quotations, biographies, names, or linked
source material. If you redistribute the dataset or use it in a public
product, verify the source websites, attribution requirements, copyright
status, and any applicable terms of use yourself.

The included author records may contain source links such as Wikipedia URLs.
Those links are metadata from the imported records; they are not an
endorsement of any single source.

### SVG card attribution

The SVG quote-card approach is adapted from:

**OpenUwU/anime-readme-quotes**

<https://github.com/OpenUwU/anime-readme-quotes.git>

The adaptation preserves the core card-generation ideas around SVG layout,
themes, text wrapping, gradients, and XML escaping, while changing the data
model to work with normal quote and author records.

---

## Deploy to Vercel

This project is designed to deploy without a build command.

### From the Vercel dashboard

1. Import the repository.
2. Keep the project as a Node project.
3. Leave the build command empty.
4. Use `npm start` for local development only.
5. Deploy.

`vercel.json` enables clean URLs. The `api/` directory supplies the
serverless-compatible route handlers.

### From the Vercel CLI

```bash
npm install -g vercel
vercel
```

For a production deployment:

```bash
vercel --prod
```

After deployment, test:

```bash
curl https://your-project.vercel.app/api/health
curl https://your-project.vercel.app/api/quote
```

---

## Replacing the dataset

The data files are intentionally kept at the project root:

```text
authors.json
quotes.json
```

The expected quote fields are:

```json
{
  "_id": "Q00001",
  "index": 1,
  "author_id": "A00001",
  "author": "Author name",
  "quote": "Quote text"
}
```

The expected author fields are:

```json
{
  "_id": "A00001",
  "name": "Author name",
  "quote_count": 1,
  "wikipedia_title": "author",
  "wikipedia_url": "https://example.com",
  "bio": "Author biography."
}
```

If you replace the files, keep quote indexes unique and one-based, keep quote
IDs unique, and make sure every `author_id` points to an author record. The
server reads the files lazily and caches the parsed data for the lifetime of
the process.

---

## Design principles

Quotes CDN stays intentionally opinionated:

1. **Plain web technologies first.** The interface does not require React,
   Vue, a bundler, or a component runtime.
2. **One shared API implementation.** Local requests and Vercel functions use
   the same router and data layer.
3. **Useful defaults.** A request to `/api/quote` or `/api/card` should produce
   something useful without a long configuration object.
4. **Stable records.** Quote indexes, quote IDs, and author IDs are designed
   for links and repeatable integrations.
5. **SVG over screenshots.** Cards stay sharp, lightweight, and easy to embed.
6. **Readable source.** The project favors small files and explicit behavior
   over hidden framework conventions.

---

## License and usage note

The original application code in this repository is licensed under the MIT
License. See [`LICENSE`](LICENSE) for the complete text.

This repository also contains imported data and adapted SVG-card code. Treat
the application code, imported dataset, and adapted upstream implementation as
separate attribution surfaces.

Before publishing a fork or commercial product:

- Review the license of the upstream SVG-card project.
- Review the license and terms of the sites used for scraped data.
- Preserve required attribution.
- Confirm that redistribution of quote text and biographies is permitted.
- Add your own rate limiting, caching policy, and abuse controls if you expose
  the API publicly at scale.

---

## Status

The project is ready for local use and Vercel hosting.

The fastest path is:

```bash
npm start
```

Then open:

```text
http://localhost:5000
```
