const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");
const { sendRoute, json } = require("./lib/api");

const port = Number(process.env.PORT || 5000);
const publicDir = path.join(__dirname, "public");
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
  ".ico": "image/x-icon"
};

function serveStatic(req, res, url) {
  let requested = url.pathname === "/" ? "/index.html" : url.pathname;
  if (requested === "/docs" || requested === "/docs/") requested = "/docs.html";
  const filePath = path.normalize(path.join(publicDir, requested));
  if (!filePath.startsWith(publicDir)) return res.writeHead(403).end();
  fs.readFile(filePath, (error, body) => {
    if (error) return res.writeHead(404).end("Not found");
    res.writeHead(200, {
      "Content-Type": mime[path.extname(filePath)] || "text/plain; charset=utf-8",
      "Cache-Control": "no-cache"
    });
    res.end(body);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  if (url.pathname === "/api" || url.pathname.startsWith("/api/")) {
    const route = url.pathname.replace(/^\/api\/?/, "");
    const params = Object.fromEntries(url.searchParams);
    const authorPath = route.match(/^author\/([^/]+)$/);
    if (authorPath) {
      params.id = decodeURIComponent(authorPath[1]);
      return sendRoute("author", params, res);
    }
    return sendRoute(route, params, res);
  }
  return serveStatic(req, res, url);
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Quotes CDN running at http://0.0.0.0:${port}`);
});