import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const layoutFiles = ["header.html", "footer.html"];
const skipDirs = new Set([".git", ".vs", ".idea", ".stfolder", "assets", "css", "fonts", "images", "js", "tools"]);

/* همهٔ فایل‌های HTML سایت را بازگشتی پیدا می‌کند */
function walk(dir = ".") {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (skipDirs.has(entry.name)) continue;
      files.push(...walk(path.join(dir, entry.name)));
    } else if (entry.name.endsWith(".html")) {
      files.push(path.relative(root, path.join(dir, entry.name)).split(path.sep).join("/"));
    }
  }
  return files;
}

const isLocal = (url) => Boolean(url) && !/^(?:[a-z][a-z0-9+.-]*:|\/\/|\/|#)/i.test(url);

const localTarget = (url) => {
  const clean = url.split("#")[0].split("?")[0];
  return clean ? decodeURIComponent(clean) : "";
};

const exists = (target) => fs.existsSync(target) || fs.existsSync(path.join(target, "index.html"));

const pages = walk().filter((f) => !layoutFiles.includes(f));
const problems = [];
const stats = { pages: 0, links: 0, layout: 0 };

/* ۱) لینک‌های داخل خودِ صفحات */
stats.pages += pages.length;
for (const file of pages) {
  const html = fs.readFileSync(file, "utf8");
  const expectedRoot = "../".repeat(file.split("/").length - 1);

  // لینک‌های نسبی صفحه
  for (const m of html.matchAll(/\b(?:href|src)="([^"]+)"/gi)) {
    const url = m[1].trim();
    if (!isLocal(url)) continue;
    const clean = localTarget(url);
    if (!clean) continue;
    stats.links++;
    const target = path.resolve(path.dirname(path.join(root, file)), clean);
    if (!exists(target)) problems.push(`${file} -> ${url}`);
  }

  // data-root باید با عمق صفحه هم‌خوان باشد
  for (const m of html.matchAll(/<div id="(header|footer)"([^>]*)>/g)) {
    const attr = (m[2].match(/data-root="([^"]*)"/) || [])[1] ?? "";
    if (attr !== expectedRoot) {
      problems.push(`${file} -> data-root="${attr}" (باید "${expectedRoot}" باشد)`);
    }
  }
}

/* ۲) لینک‌های هدر/فوتر، به‌ازای هر عمق صفحه */
const layouts = layoutFiles.map((file) => ({ file, html: fs.readFileSync(file, "utf8") }));
for (const { file, html } of layouts) {
  for (const m of html.matchAll(/\b(?:href|src)="([^"]+)"/gi)) {
    const url = m[1].trim();
    if (!isLocal(url)) continue;
    const clean = localTarget(url);
    if (!clean) continue;
    stats.layout++;
    if (!exists(path.resolve(root, clean))) problems.push(`${file} -> ${url}`);
  }
}

for (const page of pages) {
  const prefix = "../".repeat(page.split("/").length - 1);
  for (const { file, html } of layouts) {
    for (const m of html.matchAll(/\b(?:href|src)="([^"]+)"/gi)) {
      const url = m[1].trim();
      if (!isLocal(url)) continue;
      const clean = localTarget(url);
      if (!clean) continue;
      stats.layout++;
      // لینک‌های هدر/فوتر نسبت به ریشهٔ سایت نوشته می‌شوند و include.js
      // با data-root آن‌ها را نسبت به پوشهٔ صفحه اصلاح می‌کند.
      const target = path.resolve(path.dirname(path.join(root, page)), prefix + clean);
      if (!exists(target)) problems.push(`${page} (${file}) -> ${prefix}${url}`);
    }
  }
}

console.log("pages:", stats.pages, "local links:", stats.links, "layout links:", stats.layout);
console.log("problems:", problems.length);
console.log(problems.join("\n"));
process.exit(problems.length ? 1 : 0);

