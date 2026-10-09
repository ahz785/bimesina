// nav-scroll.js
document.addEventListener("DOMContentLoaded", () => {
    const nav = document.getElementById("mainNav");
    const banner = document.querySelector(".topBanner");

    function checkScroll() {
        const threshold = banner
            ? Math.max(8, banner.offsetHeight - (nav ? nav.offsetHeight : 0))
            : 8;

        if (window.scrollY > threshold) {
            nav.classList.add("scrolled");
            
        } else {
            nav.classList.remove("scrolled");
        }
    }

    document.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    checkScroll();
});
// back-to-top.js
document.addEventListener("DOMContentLoaded", () => {
    const backToTopBtn = document.querySelector(".backToTopBtn");

    function checkScrollPosition() {
        if (window.scrollY > 200) {
            backToTopBtn.classList.add("visible");
        } else {
            backToTopBtn.classList.remove("visible");
        }
    }

    // اسکرول نرم به بالای صفحه
    backToTopBtn.addEventListener("click", (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

    window.addEventListener("scroll", checkScrollPosition, { passive: true });
    checkScrollPosition();
});
// script.js - consolidated and fixed
// Handles nav sticky blur and back-to-top visibility + smooth scroll

document.addEventListener("DOMContentLoaded", () => {
    // NAV / SCROLL
    const nav = document.getElementById("mainNav");
    const banner = document.querySelector(".topBanner");

    function checkScroll() {
        if (!nav) return;
        const threshold = banner
            ? Math.max(8, banner.offsetHeight - nav.offsetHeight)
            : 8;

        if (window.scrollY > threshold) {
            nav.classList.add("scrolled");
        } else {
            nav.classList.remove("scrolled");
        }
    }

    document.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    checkScroll();

    // BACK TO TOP
    function setupBackToTop(backToTopBtn) {
        if (!backToTopBtn) return;

        function checkScrollPosition() {
            if (window.scrollY > 200) {
                backToTopBtn.classList.add("visible");
            } else {
                backToTopBtn.classList.remove("visible");
            }
        }

        backToTopBtn.addEventListener("click", (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
        });

        window.addEventListener("scroll", checkScrollPosition, { passive: true });
        checkScrollPosition();
    }

    // Try immediate setup (if button already in DOM)
    const existingBtn = document.querySelector(".backToTopBtn");
    if (existingBtn) {
        setupBackToTop(existingBtn);
    } else {
        // If the button might be injected later (e.g. moved into footer), observe DOM and init once it appears
        const observer = new MutationObserver((mutations, obs) => {
            const btn = document.querySelector(".backToTopBtn");
            if (btn) {
                setupBackToTop(btn);
                obs.disconnect();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });

        // Safety: stop observing after 10s to avoid leaking observers
        setTimeout(() => observer.disconnect(), 10000);
    }
});
const CIRCUMFERENCE = 119.4; // 2 * Math.PI * 19

window.addEventListener('scroll', () => {
    const scrollTop = document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const percent = scrollTop / scrollHeight;
    const offset = CIRCUMFERENCE * (1 - percent);
    document.querySelector('.progress-ring-fill').style.strokeDashoffset = offset;
});
// ===== SMART HEADER: هدر میمونه، ناوبار با اسکرول پایین مخفی و با اسکرول بالا برمیگرده =====
document.addEventListener("DOMContentLoaded", () => {
    const root = document.documentElement;
    let lastY = window.scrollY;

    // ارتفاع هدر رو تو --header-h میریزه تا ناوبار درست زیرش بچسبه
    function syncHeaderHeight() {
        const header = document.querySelector(".siteHeader");
        if (header) root.style.setProperty("--header-h", header.offsetHeight + "px");
    }

    function onScroll() {
        const nav = document.getElementById("mainNav"); // هر بار میگیریم، چون include.js دیر میریزتش
        if (!nav) return;

        const y = window.scrollY;
        const delta = y - lastY;

        if (y <= 10) {
            nav.classList.remove("navHidden");                 // بالای صفحه: همیشه نشون بده
        } else if (delta > 4 && y > 120 && !nav.matches(":hover")) {
            nav.classList.add("navHidden");                    // اسکرول پایین: مخفی
        } else if (delta < -2) {
            nav.classList.remove("navHidden");                 // یه ذره اسکرول بالا: برگرده
        }
        lastY = y;
    }

    // صبر میکنیم هدر (که include.js میریزه) بیاد، بعد ارتفاعش رو میگیریم و تغییراتش رو زیر نظر داریم
    function watchHeader() {
        const header = document.querySelector(".siteHeader");
        if (!header) return false;
        syncHeaderHeight();
        new ResizeObserver(syncHeaderHeight).observe(header);
        return true;
    }
    if (!watchHeader()) {
        const mo = new MutationObserver(() => { if (watchHeader()) mo.disconnect(); });
        mo.observe(document.body, { childList: true, subtree: true });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
});