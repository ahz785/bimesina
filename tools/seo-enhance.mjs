import fs from "node:fs";
import {
  BASE,
  SITE_NAME,
  AGENCY_NAME,
  PHONE,
  PHONE2,
  OG_IMAGE,
  LOGO,
  OG_WIDTH,
  OG_HEIGHT,
  SOCIAL,
  commonHead,
} from "./site.config.mjs";

const TODAY = "2026-10-18";

const ADDRESS = {
  "@type": "PostalAddress",
  streetAddress: "خیابان شریعتی، ابتدای چهارراه کبابیان",
  addressLocality: "همدان",
  addressRegion: "همدان",
  addressCountry: "IR",
};
const GEO = { "@type": "GeoCoordinates", latitude: 34.796, longitude: 48.511 };
const DAYS = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
const HOURS = [
  { "@type": "OpeningHoursSpecification", dayOfWeek: DAYS, opens: "09:00", closes: "12:00" },
  { "@type": "OpeningHoursSpecification", dayOfWeek: DAYS, opens: "15:00", closes: "19:00" },
];

/* تاریخ انتشار/منبع مقالات مجله (از فهرست مجله) */
const ARTICLES = {
  "magazine/third-party-renewal-notice.html": { type: "اطلاعیه", fa: "۲۶ مهر ۱۴۰۵", iso: "2026-10-18" },
  "magazine/fire-insurance-checklist.html": { type: "اطلاعیه", fa: "۲۶ مهر ۱۴۰۵", iso: "2026-10-18" },
  "magazine/claim-documents.html": { type: "اطلاعیه", fa: "۲۶ مهر ۱۴۰۵", iso: "2026-10-18" },
  "magazine/student-accident-insurance.html": { type: "خبر", fa: "۱ شهریور ۱۴۰۵", iso: "2026-08-23", source: "خبرگزاری مهر" },
  "magazine/taxi-drivers-insurance.html": { type: "خبر", fa: "۲۵ شهریور ۱۴۰۵", iso: "2026-09-16", source: "خبرگزاری مهر" },
  "magazine/artists-supplementary-insurance.html": { type: "خبر", fa: "۱۶ شهریور ۱۴۰۵", iso: "2026-09-07", source: "خبرگزاری مهر" },
  "magazine/carpet-weavers-social-insurance.html": { type: "خبر", fa: "۲۱ شهریور ۱۴۰۵", iso: "2026-09-12", source: "خبرگزاری مهر" },
};

const skip = new Set(["header.html", "footer.html", "404.html"]);
const pages = fs
  .readdirSync(".")
  .filter((f) => f.endsWith(".html") && !f.startsWith("_") && !skip.has(f));
pages.push(
  ...fs.readdirSync("magazine").filter((f) => f.endsWith(".html") && !f.startsWith("_")).map((f) => `magazine/${f}`)
);

const plain = (s = "") =>
  s
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

const attr = (s = "") => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
const abs = (p = "") => (/^https?:\/\//i.test(p) ? p : BASE + p.replace(/^(\.\.\/|\.\/)+/, "").replace(/^\//, ""));

function setMeta(html, key, value, attrName = "property") {
  const tag = `<meta ${attrName}="${key}" content="${attr(value)}" />`;
  const safe = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`<meta\\s+[^>]*?${attrName}=["']${safe}["'][^>]*?>`, "i");
  return re.test(html) ? html.replace(re, tag) : html.replace("</head>", `${tag}\n</head>`);
}

function setLink(html, rel, href) {
  const tag = `<link rel="${rel}" href="${attr(href)}" />`;
  const re = new RegExp(`<link\\s+[^>]*?rel=["']${rel}["'][^>]*?>`, "i");
  return re.test(html) ? html.replace(re, tag) : html.replace("</head>", `${tag}\n</head>`);
}

/*
 * بلوک مشترک head را از site.config.mjs می‌سازد و تگ‌های تکراری/قدیمی را حذف می‌کند.
 * این کار «۳۰ بار ویرایش هد» را به «یک ویرایش + یک اجرای اسکریپت» تبدیل می‌کند.
 */
function syncCommonHead(html, prefix, { atEnd = false } = {}) {
  // بلوک قبلی (اگر وجود دارد) حذف شود تا از تکرار جلوگیری شود
  html = html.replace(/\s*<!-- common-head:start[\s\S]*?<!-- common-head:end -->\s*/gi, "\n");

  // فایل‌های CSS/JS مشترک، حتی اگر در صفحات قدیمی با مسیرهای مختلف باشند
  const commonAsset =
    "(?:assets/fontawesome-free-7\\.2\\.0-web/css/all\\.min\\.css|css/reset\\.css|css/bootstrap/bootstrap\\.min\\.css|css/col\\.css|css/(?:sm|md|lg|xl)\\.css|style\\.css)";
  html = html.replace(new RegExp(`\\s*<link\\b[^>]*\\bhref=["'][^"']*${commonAsset}["'][^>]*>\\s*`, "gi"), "\n");
  html = html.replace(/\s*<link\b[^>]*fonts\/estedad\.(?:woff2|ttf)[^>]*>\s*/gi, "\n");
  html = html.replace(/\s*<link\b[^>]*rel=["']icon["'][^>]*>\s*/gi, "\n");
  html = html.replace(/\s*<meta\b[^>]*name=["']viewport["'][^>]*>\s*/gi, "\n");
  html = html.replace(/\s*<meta\b[^>]*name=["']theme-color["'][^>]*>\s*/gi, "\n");
  html = html.replace(
    /\s*<script\b[^>]*\bsrc=["'][^"']*(?:js\/include\.js|script\.js)["'][^>]*>\s*<\/script>\s*/gi,
    "\n"
  );

  const block = commonHead(prefix);
  if (atEnd) return html.replace(/<\/head>/i, `${block}\n</head>`);
  if (/<meta\s+charset=["'][^"']+["'][^>]*>/i.test(html)) {
    return html.replace(/(<meta\s+charset=["'][^"']+["'][^>]*>)/i, `$1\n${block}`);
  }
  return html.replace(/<head([^>]*)>/i, `<head$1>\n${block}`);
}

/* main باید با لینک «پرش به محتوا» قابل فوکوس شود (برای صفحه‌خوان و کیبورد) */
function ensureMainFocus(html) {
  return html.replace(/<main\b([^>]*\bid=["']mainContent["'][^>]*)>/i, (tag, attrs) =>
    /\btabindex=/i.test(attrs) ? tag : `<main${attrs} tabindex="-1">`
  );
}

function injectSchema(html, graph) {
  html = html.replace(/\s*<!-- schema-jsonld -->[\s\S]*?<\/script>/g, "");
  html = html.replace(/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/g, "");
  const block = `\n<!-- schema-jsonld -->\n<script type="application/ld+json">\n${JSON.stringify(
    { "@context": "https://schema.org", "@graph": graph },
    null,
    2
  )}\n</script>`;
  return html.replace("</head>", `${block}\n</head>`);
}

function breadcrumb(html, url) {
  const nav = html.match(/<nav class="breadcrumbs"[\s\S]*?<\/nav>/);
  if (!nav) return null;
  const items = [];
  const re = /<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>|<span(?:\s[^>]*)?>([\s\S]*?)<\/span>/g;
  let m;
  while ((m = re.exec(nav[0]))) {
    const text = plain(m[2] ?? m[3] ?? "");
    if (!text || text === "›" || text === ">") continue;
    const item = { "@type": "ListItem", position: items.length + 1, name: text };
    if (m[1]) item.item = new URL(m[1], url).href;
    items.push(item);
  }
  if (items.length < 2) return null;
  return { "@type": "BreadcrumbList", "@id": `${url}#breadcrumb`, itemListElement: items };
}

const articleNames = {};
for (const rel of Object.keys(ARTICLES)) {
  const t = fs.readFileSync(rel, "utf8");
  articleNames[rel] = plain((t.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || "");
}

const ORG_INLINE = {
  "@type": "InsuranceAgency",
  "@id": `${BASE}#agency`,
  name: AGENCY_NAME,
  url: BASE,
  telephone: PHONE,
};

const AGENCY = {
  "@type": "InsuranceAgency",
  "@id": `${BASE}#agency`,
  name: AGENCY_NAME,
  alternateName: "بیمه سینا ۶۵۶۹",
  description:
    "نمایندگی ۶۵۶۹ بیمه سینا در همدان؛ مشاوره و صدور بیمهٔ خودرو، آتش‌سوزی، مسئولیت، مهندسی، عمر، حوادث و باربری.",
  url: BASE,
  logo: { "@type": "ImageObject", url: LOGO },
  image: [OG_IMAGE],
  telephone: PHONE,
  priceRange: "$$",
  currenciesAccepted: "IRR",
  address: ADDRESS,
  geo: GEO,
  areaServed: { "@type": "City", name: "همدان" },
  openingHoursSpecification: HOURS,
  sameAs: SOCIAL,
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: PHONE,
      contactType: "customer service",
      areaServed: "IR",
      availableLanguage: ["fa"],
    },
    {
      "@type": "ContactPoint",
      telephone: PHONE2,
      contactType: "sales",
      areaServed: "IR",
      availableLanguage: ["fa"],
    },
  ],
};

const REPORT = [];

for (const rel of pages) {
  let html = fs.readFileSync(rel, "utf8");
  const isIndex = rel === "index.html";
  const isMagIndex = rel === "magazine/index.html";
  const isOurInfo = rel === "ourinfo.html";
  const article = ARTICLES[rel];
  const url = isIndex ? BASE : isMagIndex ? `${BASE}magazine/` : `${BASE}${rel}`;
  const prefix = rel.startsWith("magazine/") ? "../" : "";

  // تگ‌های مشترک (فونت، فاویکون، CSS، JS و viewport) فقط از site.config.mjs می‌آیند
  html = syncCommonHead(html, prefix);
  html = ensureMainFocus(html);

  const title = plain((html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || "");
  const desc = plain((html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"/i) || [])[1] || "");
  const h1 = plain((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || title.split("|")[0]);

  /* --- متاتگ‌های اصلی و اشتراک‌گذاری --- */
  html = setLink(html, "canonical", url);
  html = setMeta(html, "og:type", article ? "article" : "website");
  html = setMeta(html, "og:locale", "fa_IR");
  html = setMeta(html, "og:site_name", SITE_NAME);
  html = setMeta(html, "og:url", url);
  html = setMeta(html, "og:title", title);
  html = setMeta(html, "og:description", desc);
  html = setMeta(html, "og:image", OG_IMAGE);
  html = setMeta(html, "og:image:type", "image/jpeg");
  html = setMeta(html, "og:image:width", OG_WIDTH);
  html = setMeta(html, "og:image:height", OG_HEIGHT);
  html = setMeta(html, "og:image:alt", h1);
  html = setMeta(html, "twitter:card", "summary_large_image", "name");
  html = setMeta(html, "twitter:title", title, "name");
  html = setMeta(html, "twitter:description", desc, "name");
  html = setMeta(html, "twitter:image", OG_IMAGE, "name");
  html = setMeta(html, "twitter:image:alt", h1, "name");
  html = setMeta(html, "author", AGENCY_NAME, "name");
  html = setMeta(
    html,
    "robots",
    "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
    "name"
  );

  if (article) {
    html = setMeta(html, "article:published_time", `${article.iso}T10:00:00+03:30`);
    html = setMeta(html, "article:modified_time", `${TODAY}T10:00:00+03:30`);
    html = setMeta(html, "article:author", AGENCY_NAME);
    html = setMeta(html, "article:section", "مجله بیمه");
  }

  /* --- تاریخ/منبع قابل مشاهده در مقالات --- */
  if (article && !html.includes('class="articleMeta"')) {
    const source = article.source ? ` · منبع: ${article.source}` : ` · ${AGENCY_NAME}`;
    const meta = `<p class="articleMeta"><time datetime="${article.iso}">${article.fa}</time> · ${article.type}${source} · آخرین به‌روزرسانی: <time datetime="${TODAY}">۲۶ مهر ۱۴۰۵</time></p>`;
    html = html.replace(/(<p class="pageLead">[\s\S]*?<\/p>)/, `$1\n  ${meta}`);
  }

  /* --- داده‌های ساخت‌یافته --- */
  const graph = [];
  if (isIndex) {
    graph.push({
      "@type": "WebSite",
      "@id": `${BASE}#website`,
      url: BASE,
      name: "بیمه سینا ۶۵۶۹ — نمایندگی همدان",
      inLanguage: "fa-IR",
      publisher: { "@id": `${BASE}#agency` },
    });
    graph.push(AGENCY);
  } else {
    graph.push({
      "@type": isMagIndex ? "CollectionPage" : isOurInfo ? "ContactPage" : "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: title,
      description: desc,
      inLanguage: "fa-IR",
      isPartOf: { "@id": `${BASE}#website` },
      about: ORG_INLINE,
    });
    if (isOurInfo) graph.push(AGENCY);
  }

  const bc = breadcrumb(html, url);
  if (bc) graph.push(bc);

  if (article) {
    graph.push({
      "@type": "Article",
      "@id": `${url}#article`,
      headline: h1,
      description: desc,
      datePublished: article.iso,
      dateModified: TODAY,
      author: { "@type": "Organization", name: AGENCY_NAME, url: BASE },
      publisher: {
        "@type": "Organization",
        name: AGENCY_NAME,
        url: BASE,
        logo: { "@type": "ImageObject", url: LOGO },
      },
      image: { "@type": "ImageObject", url: OG_IMAGE, width: OG_WIDTH, height: OG_HEIGHT },
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      isPartOf: { "@type": "Blog", name: "مجله بیمه سینا", url: `${BASE}magazine/` },
      articleSection: "مجله بیمه",
      inLanguage: "fa-IR",
    });
  } else if (!isIndex && !isMagIndex && !isOurInfo) {
    graph.push({
      "@type": "Service",
      "@id": `${url}#service`,
      name: h1,
      description: desc,
      serviceType: h1,
      provider: ORG_INLINE,
      areaServed: { "@type": "City", name: "همدان" },
      url,
      inLanguage: "fa-IR",
    });
  }

  if (isMagIndex) {
    graph.push({
      "@type": "ItemList",
      "@id": `${BASE}magazine/#articles`,
      name: "مقالات مجله بیمه سینا",
      numberOfItems: Object.keys(ARTICLES).length,
      itemListElement: Object.keys(ARTICLES).map((key, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${BASE}${key}`,
        name: articleNames[key],
      })),
    });
  }

  html = injectSchema(html, graph);
  fs.writeFileSync(rel, html, "utf8");
  REPORT.push({ rel, url, article: Boolean(article), graph: graph.length });
}

/* 404 صفحهٔ ایندکس‌نشدنی است، ولی همان head مشترک را می‌گیرد (بدون canonical/JSON-LD) */
let notFound = fs.readFileSync("404.html", "utf8");
notFound = syncCommonHead(notFound, "", { atEnd: true });
notFound = ensureMainFocus(notFound);
fs.writeFileSync("404.html", notFound, "utf8");

/* --- sitemap.xml --- */
const sitemapUrls = pages.map((rel) => {
  const url = rel === "index.html" ? BASE : rel === "magazine/index.html" ? `${BASE}magazine/` : `${BASE}${rel}`;
  const article = ARTICLES[rel];
  const lastmod = article ? article.iso : TODAY;
  const priority = rel === "index.html" ? "1.0" : rel === "magazine/index.html" ? "0.9" : article ? "0.7" : "0.8";
  const changefreq = rel === "index.html" || rel === "magazine/index.html" ? "weekly" : "monthly";
  return `  <url>\n    <loc>${url}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
});
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<!-- آدرس پایه: ${BASE} -->\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls.join(
  "\n"
)}\n</urlset>\n`;
fs.writeFileSync("sitemap.xml", sitemap, "utf8");

fs.writeFileSync(
  "robots.txt",
  `User-agent: *\nAllow: /\nDisallow: /404.html\n\nSitemap: ${BASE}sitemap.xml\n`,
  "utf8"
);

console.log(`pages: ${REPORT.length}`);
for (const r of REPORT) {
  console.log(`${r.rel.padEnd(44)} graph=${r.graph} article=${r.article ? "yes" : "no"}  ${r.url}`);
}
