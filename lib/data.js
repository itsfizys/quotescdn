const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
let cache;

function loadData() {
  if (cache) return cache;

  const quotes = JSON.parse(fs.readFileSync(path.join(root, "quotes.json"), "utf8"));
  const authors = JSON.parse(fs.readFileSync(path.join(root, "authors.json"), "utf8"));
  const authorMap = new Map(authors.map((author) => [author._id, author]));
  const quoteById = new Map(quotes.map((quote) => [String(quote._id).toLowerCase(), quote]));
  const quoteByIndex = new Map(quotes.map((quote) => [String(quote.index), quote]));

  cache = { quotes, authors, authorMap, quoteById, quoteByIndex };
  return cache;
}

function text(value) {
  return String(value ?? "").trim();
}

function normalized(value) {
  return text(value).toLocaleLowerCase();
}

function positiveInt(value, fallback = null) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
}

function withAuthor(quote, authorMap) {
  const author = authorMap.get(quote.author_id);
  return {
    ...quote,
    author_info: author
      ? {
          _id: author._id,
          name: author.name,
          quote_count: author.quote_count,
          wikipedia_title: author.wikipedia_title,
          wikipedia_url: author.wikipedia_url
        }
      : null
  };
}

function matchesFilters(quote, params) {
  const search = normalized(params.search || params.q);
  const author = normalized(params.author);
  const authorId = normalized(params.author_id || params.authorId);

  if (authorId && normalized(quote.author_id) !== authorId) return false;
  if (author && !normalized(quote.author).includes(author)) return false;
  if (
    search &&
    ![quote.quote, quote.author, quote._id, quote.index]
      .map(normalized)
      .some((value) => value.includes(search))
  ) {
    return false;
  }
  return true;
}

function filteredQuotes(params = {}) {
  return loadData().quotes.filter((quote) => matchesFilters(quote, params));
}

function getQuote(params = {}) {
  const { quoteById, quoteByIndex, authorMap } = loadData();
  const id = text(params.id || params.quote_id || params.quoteId).toLowerCase();
  const index = params.index !== undefined ? positiveInt(params.index) : null;

  if (id) return quoteById.has(id) ? withAuthor(quoteById.get(id), authorMap) : null;
  if (index !== null) {
    return quoteByIndex.has(String(index))
      ? withAuthor(quoteByIndex.get(String(index)), authorMap)
      : null;
  }

  const pool = filteredQuotes(params);
  if (!pool.length) return null;
  const seed = positiveInt(params.seed);
  const position = seed === null ? Math.floor(Math.random() * pool.length) : seed % pool.length;
  return withAuthor(pool[position], authorMap);
}

function listQuotes(params = {}) {
  const { authorMap } = loadData();
  const pool = filteredQuotes(params);
  const limit = Math.min(Math.max(positiveInt(params.limit, 20), 1), 100);
  const offset = positiveInt(params.offset, 0);
  return {
    total: pool.length,
    limit,
    offset,
    data: pool.slice(offset, offset + limit).map((quote) => withAuthor(quote, authorMap))
  };
}

function listAuthors(params = {}) {
  const { authors } = loadData();
  const search = normalized(params.search || params.q);
  const sort = normalized(params.sort || "name");
  const limit = Math.min(Math.max(positiveInt(params.limit, 20), 1), 100);
  const offset = positiveInt(params.offset, 0);
  let pool = authors.filter((author) => {
    if (!search) return true;
    return [author.name, author._id, author.bio].map(normalized).some((value) => value.includes(search));
  });

  pool = [...pool].sort((a, b) => {
    if (sort === "quotes" || sort === "count") return b.quote_count - a.quote_count || a.name.localeCompare(b.name);
    return a.name.localeCompare(b.name);
  });

  return {
    total: pool.length,
    limit,
    offset,
    data: pool.slice(offset, offset + limit)
  };
}

function getAuthor(params = {}) {
  const { authors, authorMap } = loadData();
  const requested = text(params.id || params.author_id || params.authorId || params.name);
  const needle = normalized(requested);
  let author = requested ? authorMap.get(requested) : null;

  if (!author && needle) {
    author = authors.find((candidate) =>
      normalized(candidate.name) === needle || normalized(candidate._id) === needle
    );
  }
  if (!author && needle) {
    author = authors.find((candidate) => normalized(candidate.name).includes(needle));
  }
  if (!author) return null;

  const includeQuotes = ["1", "true", "yes"].includes(normalized(params.include || params.quotes));
  const result = { ...author };
  if (includeQuotes) {
    result.quotes = loadData().quotes
      .filter((quote) => quote.author_id === author._id)
      .map((quote) => withAuthor(quote, authorMap));
  }
  return result;
}

function stats() {
  const { quotes, authors } = loadData();
  const characterCount = new Set(quotes.map((quote) => quote.author_id)).size;
  const longestQuote = quotes.reduce(
    (longest, quote) => (quote.quote.length > longest.quote.length ? quote : longest),
    quotes[0]
  );
  return {
    quotes: quotes.length,
    authors: authors.length,
    average_quote_length: Math.round(quotes.reduce((sum, quote) => sum + quote.quote.length, 0) / quotes.length),
    longest_quote: longestQuote ? { index: longestQuote.index, length: longestQuote.quote.length } : null,
    source: "authors.json + quotes.json"
  };
}

function search(params = {}) {
  const limit = Math.min(Math.max(positiveInt(params.limit, 5), 1), 20);
  const query = text(params.search || params.q);
  return {
    query,
    quotes: listQuotes({ ...params, search: query, limit, offset: 0 }).data,
    authors: listAuthors({ search: query, limit, offset: 0 }).data
  };
}

function getAuthorLetters() {
  const letters = new Set(loadData().authors.map((author) => author.name[0].toUpperCase()));
  return [...letters].sort();
}

module.exports = {
  loadData,
  getQuote,
  listQuotes,
  listAuthors,
  getAuthor,
  getAuthorLetters,
  search,
  stats
};