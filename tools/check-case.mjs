// check-case.mjs ــ بررسی میکنه همه عکس/فونت/فایل‌هایی که تو کد صدا زده شدن، با «همون حروف بزرگ و کوچک» تو گیت ثبت شدن.
// ویندوز به حروف بزرگ/کوچک اهمیت نمیده ولی GitHub Pages اهمیت میده؛ این فایل همون خطاها رو قبل از انتشار پیدا میکنه.
// اجرا:  node check-case.mjs   (باید تو پوشه اصلی پروژه باشی، و پروژه git باشه)

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

// ۱) لیست فایل‌های ثبت‌شده تو گیت (دقیقاً با همون حروفی که گیت یادش مونده)
const tracked = execSync("git ls-files", { encoding: "utf8" })
  .split("\n").map((s) => s.trim()).filter(Boolean);
const exact = new Set(tracked);
const lower = new Map(tracked.map((f) => [f.toLowerCase(), f]));

// ۲) همه فایل‌هایی که باید بررسی بشن: HTML، CSS، JS (بدون node_modules)
const sources = tracked.filter((f) => /\.(html|css|js|mjs)$/i.test(f) && !f.startsWith("node_modules/"));
const pattern = /(?:images|fonts|assets|css|js)\/[A-Za-z0-9_\-./]+\.[A-Za-z0-9]+/g;

let bad = 0, checked = 0;
for (const file of sources) {
  const text = fs.readFileSync(file, "utf8");
  const dir = path.posix.dirname(file);
  for (const m of text.matchAll(pattern)) {
    // مسیر نسبی (مثل ../images/x.png) رو نسبت به ریشه حساب میکنیم؛ ../ های اول رو برمیداریم
    const ref = m[0];
    const candidates = [ref, path.posix.normalize(path.posix.join(dir, ref))];
    checked++;
    if (candidates.some((c) => exact.has(c))) continue;
    const hint = candidates.map((c) => lower.get(c.toLowerCase())).find(Boolean);
    if (hint) {
      bad++;
      console.log(`❌ حروف اشتباه: ${file}\n     نوشته: ${ref}\n     تو گیت:  ${hint}`);
    }
  }
}
console.log(`\nبررسی شد: ${checked} مسیر، مشکل حروف: ${bad}`);
process.exit(bad ? 1 : 0);
