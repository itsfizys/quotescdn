const data = require("./data");
const { cardOptions, generateSVG, themes } = require("./svg");

function json(res, status, value, extraHeaders = {}) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    ...extraHeaders
  });
  res.end(JSON.stringify(value));
}

function svg(res, value) {
  res.writeHead(200, {
    "Content-Type": "image/svg+xml; charset=utf-8",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*"
  });
  res.end(value);
}

function apiMeta() {
  return {
    name: "quotes-cdn",
    version: "1.0.0",
    description: "A no-key API for quotes, author bios, search, and embeddable SVG quote cards.",
    source: "authors.json + quotes.json",
    endpoints: {
      quote: "/api/quote",
      quotes: "/api/quotes",
      card: "/api/card",
      authors: "/api/authors",
      author: "/api/author",
      search: "/api/search",
      stats: "/api/stats",
      themes: "/api/themes",
      health: "/api/health"
    },
    docs: "/docs"
  };
}

function sendRoute(route, params, res) {
  const routeName = route.replace(/^\/+|\/+$/g, "");

  if (!routeName) return json(res, 200, apiMeta());
  if (routeName === "health") return json(res, 200, { ok: true, service: "quotes-cdn" });
  if (routeName === "quote" || routeName === "random") {
    const quote = data.getQuote(params);
    const isStable = routeName === "quote" && (
      params.id ||
      params.quote_id ||
      params.quoteId ||
      params.index !== undefined ||
      params.seed !== undefined
    );
    const cacheHeaders = isStable
      ? { "Cache-Control": "public, max-age=30, s-maxage=120" }
      : { "Cache-Control": "no-store" };
    return quote
      ? json(res, 200, quote, cacheHeaders)
      : json(res, 404, { error: "No quote found", hint: "Try another index, author, or search value." });
  }
  if (routeName === "quotes") {
    return json(res, 200, data.listQuotes(params), { "Cache-Control": "public, max-age=60, s-maxage=300" });
  }
  if (routeName === "authors") {
    return json(res, 200, data.listAuthors(params), { "Cache-Control": "public, max-age=300, s-maxage=3600" });
  }
  if (routeName === "author") {
    const author = data.getAuthor(params);
    return author ? json(res, 200, author) : json(res, 404, { error: "Author not found" });
  }
  if (routeName === "search") return json(res, 200, data.search(params));
  if (routeName === "stats") return json(res, 200, data.stats(), { "Cache-Control": "public, max-age=300, s-maxage=3600" });
  if (routeName === "letters") return json(res, 200, { data: data.getAuthorLetters() });
  if (routeName === "themes") return json(res, 200, { data: Object.keys(themes) });
  if (routeName === "card") {
    const quote = data.getQuote(params);
    const customQuote = typeof params.quote === "string" && params.quote.trim();
    const card = customQuote
      ? { quote: customQuote.trim(), author: params.author_name || params.author || "Anonymous" }
      : quote;
    if (!card) return json(res, 404, { error: "No quote found" });
    const options = cardOptions(params);
    const generated = generateSVG({ ...card, ...options });
    if (params.format === "json") return json(res, 200, { ...card, format: "svg", svg: generated });
    return svg(res, generated);
  }

  return json(res, 404, { error: "Unknown endpoint" });
}

module.exports = { json, sendRoute };