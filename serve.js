const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const PORT = 4178;
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
  ".webm": "video/webm"
};

/* Video is listed alongside stills because a few pieces of the work are
   recordings rather than pictures. The plates skip them, since a plate
   erodes a still into the china; the dossier plays them. */
const IMAGES = /\.(jpe?g|png|webp|gif|avif|mp4|webm)$/i;

/* Lists whatever is sitting in assets/<name>/ so new artwork appears on
   the site the moment the file lands in the folder. For a static deploy
   this gets baked into a manifest at build time instead. */
function listing(dir) {
  try {
    return fs.readdirSync(path.join(ROOT, "assets", dir))
      .filter(f => IMAGES.test(f) && !f.startsWith("."))
      .sort();
  } catch { return []; }
}

http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split("?")[0]);

  const api = url.match(/^\/api\/([a-z0-9-]+)$/i);
  if (api) {
    res.writeHead(200, { "content-type": "application/json", "cache-control": "no-store" })
       .end(JSON.stringify(listing(api[1])));
    return;
  }

  let file = path.join(ROOT, url === "/" ? "index.html" : url);

  if (!file.startsWith(ROOT)) {
    res.writeHead(403).end("forbidden");
    return;
  }
  fs.readFile(file, (err, body) => {
    if (err) {
      res.writeHead(404, { "content-type": "text/plain" }).end("not found");
      return;
    }
    res.writeHead(200, {
      "content-type": TYPES[path.extname(file)] || "application/octet-stream",
      "cache-control": "no-store"
    }).end(body);
  });
}).listen(PORT, () => console.log("portfolio on http://localhost:" + PORT));
