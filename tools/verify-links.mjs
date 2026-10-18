import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const files = [
  ...fs.readdirSync(root).filter((f) => f.endsWith(".html")),
  ...fs.readdirSync(path.join(root, "magazine"))
    .filter((f) => f.endsWith(".html"))
    .map((f) => path.join("magazine", f)),
].filter((f) => !["header.html", "footer.html"].includes(f));

const missing = [];
const stats = { links: 0, pages: 0 };

for (const file of [...files, "header.html", "footer.html"]) {
  const abs = path.join(root, file);
  if (!fs.existsSync(abs)) continue;
  const html = fs.readFileSync(abs, "utf8");
  stats.pages++;
  for (const m of html.matchAll(/\b(?:href|src)="([^"]+)"/gi)) {
    const url = m[1].trim();
    if (!url || /^(?:[a-z][a-z0-9+.-]*:|\/\/|\/|#)/i.test(url)) continue;
    const clean = url.split("#")[0].split("?")[0];
    if (!clean) continue;
    stats.links++;
    const target = path.resolve(path.dirname(abs), decodeURIComponent(clean));
    const ok = fs.existsSync(target) || fs.existsSync(path.join(target, "index.html"));
    if (!ok) missing.push(`${file} -> ${url}`);
  }
}

console.log("pages:", stats.pages, "local links:", stats.links);
console.log("missing:", missing.length);
console.log(missing.join("\n"));
