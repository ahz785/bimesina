document.addEventListener("DOMContentLoaded", () => {
    const headerEl = document.getElementById("header");
    const footerEl = document.getElementById("footer");
    // در صفحات زیرپوشه‌ای، data-root مقدار بازگشت به ریشهٔ سایت است
    // (مثلاً برای pages/fire/x.html می‌شود "../../")؛
    // لینک‌های نسبی داخل header.html و footer.html همیشه نسبت به ریشهٔ سایت نوشته می‌شوند.
    const root = (headerEl && headerEl.dataset.root) || (footerEl && footerEl.dataset.root) || "";

    // مسیرهای نسبی داخل هدر/فوتر تزریق‌شده را نسبت به ریشهٔ سایت اصلاح می‌کند
    const fixPaths = (container) => {
        if (!root) return;
        container.querySelectorAll("[href], [src]").forEach((el) => {
            ["href", "src"].forEach((attr) => {
                const value = el.getAttribute(attr);
                if (!value || /^(?:[a-z][a-z0-9+.-]*:|\/\/|\/|#)/i.test(value)) return;
                el.setAttribute(attr, root + value);
            });
        });
    };

    const loadPart = (target, file) => {
        if (!target) return;
        fetch(root + file)
            .then((res) => res.text())
            .then((html) => {
                target.innerHTML = html;
                fixPaths(target);
            })
            .catch((err) => console.error("خطا در بارگذاری " + file + ":", err));
    };

    loadPart(headerEl, "header.html");
    loadPart(footerEl, "footer.html");
});
