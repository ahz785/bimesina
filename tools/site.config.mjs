/*
 * تنها منبع تنظیمات مشترک سایت (آدرس پایه، اطلاعات تماس، تصاویر و تگ‌های مشترک <head>).
 * بعد از هر تغییر، این دستور را اجرا کنید تا همهٔ صفحات هم‌زمان به‌روز شوند:
 *     node tools/seo-enhance.mjs
 */

/* آدرس نهایی سایت (GitHub Pages). اگر دامنهٔ اختصاصی وصل شد، فقط همین مقدار را عوض کنید. */
export const BASE = "https://ahz785.github.io/bimesina/";

export const SITE_NAME = "بیمه سینا ۶۵۶۹";
export const AGENCY_NAME = "بیمه سینا — نمایندگی ۶۵۶۹ همدان";
export const PHONE = "+989184449208";
export const PHONE2 = "+988132530154";
export const THEME_COLOR = "#0a1224";

export const OG_IMAGE = `${BASE}images/mainslider/14.jpg`;
export const LOGO = `${BASE}images/favicon.svg`;
export const OG_WIDTH = 1263;
export const OG_HEIGHT = 512;

export const SOCIAL = [
  "https://t.me/bimeh_torabi",
  "https://www.instagram.com/bimesina_torabi/",
  "https://eitaa.com/bimesina_torabi",
  "https://ble.ir/join/3gy2TGpF9F",
  "https://www.linkedin.com/in/sodabe-torabi-8057b22b3/",
];

/*
 * تگ‌های مشترک همهٔ صفحات. فقط اینجا ویرایش شود؛ seo-enhance.mjs این بلوک را
 * در همهٔ فایل‌های HTML جایگزین می‌کند (prefix برای صفحات زیرپوشه‌ای «../» است).
 */
export function commonHead(prefix = "") {
  return `<!-- common-head:start | generated from site.config.mjs -->
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="theme-color" content="${THEME_COLOR}" />
<link rel="preload" href="${prefix}fonts/estedad.woff2" as="font" type="font/woff2" crossorigin />
<link rel="icon" type="image/x-icon" href="${prefix}images/favicon.ico" />
<link rel="stylesheet" href="${prefix}assets/fontawesome-free-7.2.0-web/css/all.min.css" />
<link rel="stylesheet" href="${prefix}css/reset.css" />
<link rel="stylesheet" href="${prefix}css/bootstrap/bootstrap.min.css" />
<link rel="stylesheet" media="screen and (max-width: 576px)" href="${prefix}css/col.css" />
<link rel="stylesheet" href="${prefix}style.css" />
<script src="${prefix}js/include.js"></script>
<script src="${prefix}script.js" defer></script>
<!-- common-head:end -->`;
}
