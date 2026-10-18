// script.js ــ همه جاوااسکریپت سایت تو یه فایل (هر بخش فقط یه بار نوشته شده)

/* ============================================================
   ۱) اسکرول: شیشه‌ای شدن ناوبار + دکمه بازگشت به بالا + حلقه پیشرفت
   ============================================================ */
(function () {
    // محیط دایره حلقه = 2 * π * 19 (باید با stroke-dasharray تو CSS برابر باشه)
    const RING_LENGTH = 119.4;

    // هدر، ناوبار و فوتر رو include.js میریزه تو صفحه و ممکنه دیرتر از این اسکریپت برسن.
    // برای همین هر بار که المنت پیدا نشد (یا از صفحه رفت) دوباره دنبالش میگردیم
    let nav = null, header = null, backBtn = null, ring = null;
    let ticking = false;

    const find = (current, selector) =>
        current && current.isConnected ? current : document.querySelector(selector);

    function update() {
        ticking = false;

        nav = find(nav, "#mainNav");
        header = find(header, ".siteHeader");
        backBtn = find(backBtn, ".backToTopBtn");
        ring = find(ring, ".progress-ring-fill");

        const y = window.scrollY;

        // ناوبار: وقتی هدر بالا رفت و ناوبار به بالای صفحه چسبید، شیشه‌اش تیره‌تر میشه
        if (nav) nav.classList.toggle("scrolled", y > (header ? header.offsetHeight : 8));

        // دکمه بازگشت به بالا: بعد از ۲۰۰ پیکسل اسکرول ظاهر میشه
        if (backBtn) backBtn.classList.toggle("visible", y > 200);

        // حلقه دور دکمه: هر چی بیشتر اسکرول کنی بیشتر پر میشه
        if (ring) {
            const max = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const progress = max > 0 ? Math.min(Math.max(y / max, 0), 1) : 0;
            ring.style.strokeDashoffset = RING_LENGTH * (1 - progress);
        }
    }

    // چند بار پشت سر هم اسکرول بشه هم، تو هر فریم فقط یه بار آپدیت میکنیم
    function onScroll() {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(update);
        }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("load", update);
    document.addEventListener("DOMContentLoaded", update);
})();

/* ============================================================
   ۲) پس‌زمینه زنده: هاله‌ها با موس جابه‌جا میشن و یه نور نرم دنبال نشانگر میاد
   (ظاهرشون تو style.css بخش «پس‌زمینه زنده» تنظیم شده)
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
    // هاله‌ها همیشه ساخته میشن (جای ثابتشون همون ظاهر قبلیه)،
    // ولی حرکت فقط روی دستگاه موس‌دار و وقتی کاربر «کاهش انیمیشن» رو روشن نکرده فعاله
    const fx = document.createElement("div");
    fx.className = "bgFx";
    fx.setAttribute("aria-hidden", "true");
    fx.innerHTML =
        '<span class="bgBlob blobA"></span>' +
        '<span class="bgBlob blobB"></span>' +
        '<span class="bgBlob blobC"></span>' +
        '<span class="bgGlow"></span>';
    document.body.appendChild(fx);

    const hasMouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!hasMouse || reduceMotion) return;

    let tx = 0, ty = 0, cx = 0, cy = 0;     // جابه‌جایی هاله‌ها: هدف / فعلی (بین -0.5 و 0.5)
    let tgx = 0, tgy = 0, gx = 0, gy = 0;   // مکان نور نرم به پیکسل: هدف / فعلی
    let started = false, raf = 0, last = 0;

    function frame(now) {
        // dt باعث میشه سرعت حرکت رو مانیتور ۶۰ و ۱۴۴ هرتز یکسان باشه
        const dt = Math.min(now - (last || now), 50);
        last = now;
        const slow = 1 - Math.pow(0.94, dt / 16.67);   // نرمی حرکت هاله‌ها (عدد بزرگ‌تر = کندتر)
        const fast = 1 - Math.pow(0.85, dt / 16.67);   // نرمی دنبال کردن نشانگر

        cx += (tx - cx) * slow;
        cy += (ty - cy) * slow;
        gx += (tgx - gx) * fast;
        gy += (tgy - gy) * fast;

        fx.style.setProperty("--cx", cx.toFixed(4));
        fx.style.setProperty("--cy", cy.toFixed(4));
        fx.style.setProperty("--gx", gx.toFixed(1) + "px");
        fx.style.setProperty("--gy", gy.toFixed(1) + "px");

        // وقتی همه چیز به هدف رسید، حلقه انیمیشن خاموش میشه (موس بی‌حرکت = مصرف صفر)
        const settled =
            Math.abs(tx - cx) < 0.0004 && Math.abs(ty - cy) < 0.0004 &&
            Math.abs(tgx - gx) < 0.3 && Math.abs(tgy - gy) < 0.3;
        if (settled) {
            raf = 0;
            last = 0;
        } else {
            raf = requestAnimationFrame(frame);
        }
    }

    window.addEventListener("mousemove", (e) => {
        tx = e.clientX / window.innerWidth - 0.5;
        ty = e.clientY / window.innerHeight - 0.5;
        tgx = e.clientX;
        tgy = e.clientY;

        // اولین حرکت: نور از همون‌جا شروع میشه، نه اینکه از گوشه صفحه بپره سمت موس
        if (!started) {
            gx = tgx;
            gy = tgy;
            started = true;
        }

        fx.classList.add("active");
        if (!raf) raf = requestAnimationFrame(frame);
    }, { passive: true });

    // موس از پنجره بیرون رفت: نور محو میشه
    document.documentElement.addEventListener("mouseleave", () => fx.classList.remove("active"));
});

/* ============================================================
   ۳) اسلایدر ساده و بدون کتابخونه برای اسلایدر بالا و لوگوها (جایگزین Blaze)

   ویژگی‌ها:
   - لوپ بی‌نهایت، با فلش، نقطه‌ها، کیبورد و کشیدن با موس/انگشت
   - درست برای صفحه راست‌به‌چپ (RTL)
   - autoplay که بعد از کشیدن و ول کردن موس دوباره ادامه پیدا میکنه
   - تعداد اسلاید همزمان (per-view) ریسپانسیو

   تنظیمات رو با data-attribute روی تگ .sl میدی:
     data-autoplay="2400"      فاصله بین اسلایدها (میلی‌ثانیه). ندی = autoplay خاموش
     data-duration="850"       مدت انیمیشن جابه‌جایی (میلی‌ثانیه)
     data-gap="12"             فاصله بین اسلایدها (پیکسل)
     data-per-view="1"         چند اسلاید همزمان دیده بشه (موبایل)
     data-per-view-700="2"     از عرض ۷۰۰ به بالا
     data-per-view-1000="3"    از عرض ۱۰۰۰ به بالا
     data-pause-on-hover="true"  (اختیاری) با رفتن موس روی اسلایدر، autoplay مکث کنه

   نکته: برای لوپ تمیز، تعداد اسلایدها باید حداقل ۳ تا و بیشتر از per-view باشه.
   ============================================================ */
(function () {
    "use strict";

    // باقیمانده‌ی درست حتی برای عددهای منفی
    const mod = (a, n) => ((a % n) + n) % n;

    class Slider {
        constructor(root) {
            this.root = root;
            this.viewport = root.querySelector(".sl-viewport");
            this.slides = Array.from(this.viewport.children).filter((el) =>
                el.classList.contains("sl-slide")
            );
            this.n = this.slides.length;

            // ----- تنظیمات از data-attribute -----
            const d = root.dataset;
            this.gap = Number(d.gap || 12);
            this.duration = Number(d.duration || 600);
            this.interval = Number(d.autoplay || 0);
            this.pauseOnHover = d.pauseOnHover === "true";
            this.pvBase = Number(d.perView || 1);
            // data-per-view-700 تو dataset اسم perView700 نمیگیره (خط تیره قبل از عدد میمونه)، پس مستقیم از attribute میخونیم
            this.pv700 = Number(root.getAttribute("data-per-view-700") || 0);
            this.pv1000 = Number(root.getAttribute("data-per-view-1000") || 0);

            // ----- جهت صفحه: تو RTL اسلاید بعدی از سمت چپ میاد -----
            const cssDir = getComputedStyle(root).direction;
            this.rtl = (cssDir || "ltr") === "rtl";
            this.dir = this.rtl ? -1 : 1;

            // ----- وضعیت -----
            this.index = 0;        // شماره اسلاید اول (بدون محدودیت، با mod استفاده میشه)
            this._prevIndex = 0;
            this.dx = 0;           // جابه‌جایی لحظه‌ای موقع کشیدن (پیکسل)
            this.queue = 0;        // قدم‌های منتظر (اگه چند بار پشت سر هم کلیک شد)
            this.busy = false;     // وسط انیمیشنیم؟
            this.dragging = false; // داریم میکشیم؟
            this.pressed = false;  // موس/انگشت پایینه؟
            this.hover = false;
            this.inView = true;    // اسلایدر تو صفحه دیده میشه؟
            this.timer = null;
            this.pv = 1;
            this.slideW = 0;
            this.step = 0;
            this.dots = [];

            // کاربری که «کاهش انیمیشن» رو تو سیستمش روشن کرده، autoplay نمیخواد
            if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                this.interval = 0;
            }

            this.loadAllImages();
            this.buildDots();
            this.bindButtons();
            this.bindKeys();
            this.bindDrag();
            this.bindGuards();

            this.ro = new ResizeObserver(() => this.layout());
            this.ro.observe(this.viewport);
            this.layout();

            root.classList.add("is-ready");
            this.scheduleAutoplay();
        }

        // ---------- عکس‌های loading="lazy" ----------
        // اسلایدهای بیرون از قاب هیچ‌وقت «دیده نمیشن» و مرورگر عکسشون رو لود نمیکنه، پس موقع اومدن یه لحظه خالی میمونن.
        // بعد از لود شدن صفحه، همه رو آروم و بدون اینکه صفحه کند بشه لود میکنیم
        loadAllImages() {
            const eager = () =>
                this.slides.forEach((s) =>
                    s.querySelectorAll('img[loading="lazy"]').forEach((img) => (img.loading = "eager"))
                );
            if (document.readyState === "complete") eager();
            else window.addEventListener("load", eager, { once: true });
        }

        // ---------- چند اسلاید همزمان؟ ----------
        perViewNow() {
            const w = window.innerWidth;
            let pv = this.pvBase;
            if (w >= 700 && this.pv700) pv = this.pv700;
            if (w >= 1000 && this.pv1000) pv = this.pv1000;
            // اسلایدها باید حداقل ۲ تا بیشتر از per-view باشن تا لوپ تمیز بمونه
            return Math.max(1, Math.min(pv, this.n - 2));
        }

        // ---------- محاسبه عرض اسلایدها ----------
        layout() {
            const w = this.viewport.clientWidth;
            if (!w) return;
            this.pv = this.perViewNow();
            this.slideW = (w - this.gap * (this.pv - 1)) / this.pv;
            this.step = this.slideW + this.gap;
            this.slides.forEach((s) => (s.style.width = this.slideW + "px"));
            this.render(false);
        }

        // ---------- چیدن اسلایدها ----------
        // هر اسلاید یه موقعیت نسبی (rel) داره: 0 = اولین اسلاید دیده‌شده، -1 = اونی که پشت صحنه سمت شروع منتظره
        render(animate, duration) {
            const dur = duration || this.duration;
            const cur = mod(this.index, this.n);
            const shift = this.index - this._prevIndex; // چند قدم جابه‌جا شدیم

            this.slides.forEach((slide, k) => {
                const rel = mod(k - this.index + 1, this.n) - 1;

                // اسلایدی که از یه سر به اون سر میپره (لوپ) نباید انیمیشن بگیره
                const wrapped =
                    slide._rel !== undefined && Math.abs(rel - slide._rel + shift) > 0.5;
                slide._rel = rel;

                const x = this.dir * rel * this.step + this.dx;
                slide.style.transition =
                    animate && !wrapped
                        ? "transform " + dur + "ms cubic-bezier(0.22, 0.61, 0.36, 1)"
                        : "none";
                slide.style.transform = "translate3d(" + x + "px, 0, 0)";

                const visible = rel >= 0 && rel < this.pv;
                slide.classList.toggle("is-active", visible);
                slide.setAttribute("aria-hidden", visible ? "false" : "true");
                slide.toggleAttribute("inert", !visible); // لینک‌های اسلایدهای مخفی با Tab فوکوس نشن
            });

            this._prevIndex = this.index;
            this.dots.forEach((dot, i) => {
                dot.classList.toggle("is-active", i === cur);
                if (i === cur) dot.setAttribute("aria-current", "true");
                else dot.removeAttribute("aria-current");
            });
        }

        // ---------- رفتن به اسلاید قبلی/بعدی (delta = ±۱ یا بیشتر) ----------
        go(delta) {
            if (!delta) return;
            clearTimeout(this.timer);
            this.queue += delta;
            if (!this.busy) this.run();
        }

        run() {
            if (this.queue === 0) {
                this.busy = false;
                this.scheduleAutoplay();
                return;
            }
            this.busy = true;
            const dir = Math.sign(this.queue);
            this.queue -= dir;
            // اگه چند قدم مونده، قدم‌های وسط سریع‌تر برن
            const dur = this.queue !== 0 ? Math.round(this.duration * 0.45) : this.duration;
            this.index += dir;
            this.render(true, dur);
            setTimeout(() => this.run(), dur);
        }

        // رفتن مستقیم به یه اسلاید (برای نقطه‌ها): کوتاه‌ترین مسیر
        goTo(k) {
            const cur = mod(this.index, this.n);
            let d = k - cur;
            if (d > this.n / 2) d -= this.n;
            if (d < -this.n / 2) d += this.n;
            this.go(d);
        }

        // ---------- autoplay ----------
        scheduleAutoplay() {
            clearTimeout(this.timer);
            if (!this.interval) return;
            this.timer = setTimeout(() => {
                const blocked =
                    this.pressed ||
                    this.dragging ||
                    this.busy ||
                    document.hidden ||
                    !this.inView ||
                    (this.pauseOnHover && this.hover);
                // اگه الان نمیشه، بعداً دوباره امتحان میکنه (برای همین بعد از ول کردن موس ادامه پیدا میکنه)
                if (blocked) this.scheduleAutoplay();
                else this.go(1);
            }, this.interval);
        }

        // ---------- نقطه‌های پایین ----------
        buildDots() {
            const wrap = this.root.querySelector(".sl-dots");
            if (!wrap) return;
            for (let i = 0; i < this.n; i++) {
                const b = document.createElement("button");
                b.type = "button";
                b.className = "sl-dot";
                b.setAttribute("aria-label", "اسلاید " + (i + 1));
                b.addEventListener("click", () => this.goTo(i));
                wrap.appendChild(b);
                this.dots.push(b);
            }
        }

        // ---------- فلش‌ها ----------
        bindButtons() {
            const prev = this.root.querySelector(".sl-prev");
            const next = this.root.querySelector(".sl-next");
            if (prev) prev.addEventListener("click", () => this.go(-1));
            if (next) next.addEventListener("click", () => this.go(1));
        }

        // ---------- کیبورد (وقتی روی اسلایدر فوکوسه) ----------
        bindKeys() {
            this.root.setAttribute("tabindex", "0");
            this.root.addEventListener("keydown", (e) => {
                if (e.key === "ArrowLeft") this.go(this.rtl ? 1 : -1);
                if (e.key === "ArrowRight") this.go(this.rtl ? -1 : 1);
            });
        }

        // ---------- کشیدن با موس و انگشت ----------
        bindDrag() {
            const vp = this.viewport;
            let startX = 0;
            let startY = 0;
            let pid = null;
            let moved = false;

            vp.addEventListener("pointerdown", (e) => {
                if (e.pointerType === "mouse" && e.button !== 0) return;
                if (this.busy) return;
                pid = e.pointerId;
                startX = e.clientX;
                startY = e.clientY;
                moved = false;
                this.pressed = true;
            });

            vp.addEventListener("pointermove", (e) => {
                if (pid !== e.pointerId) return;
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;

                if (!this.dragging) {
                    // تا وقتی حرکت افقی جدی نشده، کشیدن حساب نمیشه (کلیک روی لینک‌ها سالم می‌مونه)
                    if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(dy)) return;
                    this.dragging = true;
                    moved = true;
                    try { vp.setPointerCapture(pid); } catch (err) { /* مهم نیست */ }
                    vp.classList.add("is-dragging");
                }
                this.dx = Math.max(-this.step, Math.min(this.step, dx));
                this.render(false);
            });

            // ولش کردن رو از روی window میگیریم، نه فقط خود اسلایدر.
            // اگه موس رو نگه داشتی و بیرون از اسلایدر (یا بیرون پنجره) ول کردی هم autoplay قفل نمیشه
            const end = (e) => {
                if (pid !== e.pointerId) return;
                pid = null;
                this.pressed = false;

                if (this.dragging) {
                    const dx = this.dx;
                    this.dragging = false;
                    vp.classList.remove("is-dragging");
                    try { vp.releasePointerCapture(e.pointerId); } catch (err) { /* مهم نیست */ }
                    this.dx = 0;

                    const threshold = Math.min(80, this.step * 0.2);
                    if (dx * this.dir > threshold) this.go(-1);        // قبلی
                    else if (dx * this.dir < -threshold) this.go(1);   // بعدی
                    else this.render(true, 300);                       // برگرد سر جات
                }
                this.scheduleAutoplay(); // ← اینجا autoplay دوباره راه میفته
            };
            window.addEventListener("pointerup", end);
            window.addEventListener("pointercancel", end);

            // بعد از کشیدن، کلیک اتفاقی روی لینک نباید باز بشه
            vp.addEventListener(
                "click",
                (e) => {
                    if (moved) {
                        e.preventDefault();
                        e.stopPropagation();
                        moved = false;
                    }
                },
                true
            );
            vp.addEventListener("dragstart", (e) => e.preventDefault());
        }

        // ---------- شرط‌های مکث autoplay ----------
        bindGuards() {
            this.root.addEventListener("mouseenter", () => (this.hover = true));
            this.root.addEventListener("mouseleave", () => (this.hover = false));
            // وقتی اسلایدر از صفحه بیرونه (یا تب پنهانه) autoplay مکث میکنه تا CPU الکی خرج نشه
            if ("IntersectionObserver" in window) {
                new IntersectionObserver(
                    (entries) => (this.inView = entries[0].isIntersecting),
                    { threshold: 0.2 }
                ).observe(this.root);
            }
        }
    }

    function init() {
        document.querySelectorAll(".sl").forEach((root) => {
            if (root._slider) return;
            const vp = root.querySelector(".sl-viewport");
            if (!vp) return;
            const count = Array.from(vp.children).filter((el) => el.classList.contains("sl-slide")).length;
            if (count < 3) return; // برای لوپ حداقل ۳ اسلاید لازمه
            root._slider = new Slider(root);
        });
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
})();

/* ============================================================
   ۴) فرم «ارسال پیام سریع» صفحه تماس با ما
   مسیر اصلی واتساپ است؛ اگر باز نشد، تلگرام/ایتا/پیامک/کپی متن
   به‌عنوان جایگزین نمایش داده می‌شوند. بدون JS هم فرم action دارد.
   ============================================================ */
(function () {
    "use strict";

    // شماره واتساپ دفتر با کد کشور (بدون + و بدون صفر اول)
    const WHATSAPP_NUMBER = "989184449208";
    const PHONE = "+989184449208";

    function legacyCopy(text) {
        const area = document.createElement("textarea");
        area.value = text;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.top = "-1000px";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        let ok = false;
        try {
            ok = document.execCommand("copy");
        } catch (error) {
            ok = false;
        }
        area.remove();
        return ok;
    }

    function copyText(text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text).then(
                () => true,
                () => legacyCopy(text)
            );
        }
        return Promise.resolve(legacyCopy(text));
    }

    function initContactForm() {
        const form = document.getElementById("contactForm");
        if (!form || form.dataset.ready) return;
        form.dataset.ready = "1";

        const fallback = document.getElementById("contactFallback");
        const status = document.getElementById("contactStatus");
        const telegram = document.getElementById("contactTelegram");
        const sms = document.getElementById("contactSms");
        const copyBtn = document.getElementById("contactCopy");
        let lastMessage = "";

        function showFallback(text) {
            if (fallback) {
                fallback.hidden = false;
                const firstLink = fallback.querySelector("a, button");
                if (firstLink) firstLink.focus({ preventScroll: true });
            }

            if (telegram) {
                telegram.href =
                    "https://t.me/share/url?url=" +
                    encodeURIComponent(location.href) +
                    "&text=" +
                    encodeURIComponent(text);
            }
            if (sms) {
                sms.href = "sms:" + PHONE + "?body=" + encodeURIComponent(text);
            }
            if (status) {
                status.textContent =
                    "اگر واتساپ باز نشد، متن پیام را کپی کنید و در یکی از پیام‌رسان‌ها بفرستید:";
            }
        }

        form.addEventListener("submit", (event) => {
            event.preventDefault();

            // اعتبارسنجی خود مرورگر (فیلدهای required و نوع tel)
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const data = new FormData(form);
            const value = (name) => (data.get(name) || "").toString().trim();

            const lines = [
                "سلام، از صفحهٔ تماس سایت بیمه سینا پیام می‌فرستم:",
                "نام: " + value("name"),
                "شماره تماس: " + value("phone"),
            ];

            const subject = value("subject");
            if (subject) lines.push("موضوع: " + subject);

            lines.push("پیام: " + value("message"));
            lastMessage = lines.join("\n");

            const url =
                "https://wa.me/" + WHATSAPP_NUMBER +
                "?text=" + encodeURIComponent(lastMessage);

            // اگر مرورگر پنجرهٔ جدید را ببندد، کاربر همچنان جایگزین‌ها را می‌بیند
            window.open(url, "_blank", "noopener");
            showFallback(lastMessage);
        });

        if (copyBtn) {
            copyBtn.addEventListener("click", () => {
                if (!lastMessage) return;
                copyText(lastMessage).then((ok) => {
                    if (!status) return;
                    status.textContent = ok
                        ? "متن پیام کپی شد. حالا در پیام‌رسان موردنظر بچسبانید و ارسال کنید."
                        : "کپی خودکار انجام نشد؛ لطفاً متن را دستی انتخاب و کپی کنید.";
                });
            });
        }
    }

    // صفحه ممکنه هنوز لود نشده باشه؛ هر جا آماده بود فرم رو وصل می‌کنیم
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initContactForm);
    } else {
        initContactForm();
    }
})();

/* ============================================================
   ۵) منوی موبایل + باز و بسته شدن زیرمنوها با کلیک/لمس/کیبورد
   ============================================================ */
(function () {
    "use strict";

    const getNav = () => document.getElementById("mainNav");

    function closeMenu() {
        const nav = getNav();
        if (!nav) return;

        nav.classList.remove("menu-open");

        const toggle = nav.querySelector(".navToggle");
        if (toggle) toggle.setAttribute("aria-expanded", "false");

        nav.querySelectorAll(".navItem.sub-open").forEach((item) => {
            item.classList.remove("sub-open");
            const link = item.querySelector(":scope > .navLink[aria-haspopup]");
            if (link) link.setAttribute("aria-expanded", "false");
        });
    }

    document.addEventListener("click", (event) => {
        const nav = getNav();
        if (!nav || !event.target.closest) return;

        // دکمه همبرگری
        const toggle = event.target.closest(".navToggle");
        if (toggle && nav.contains(toggle)) {
            const open = nav.classList.toggle("menu-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
            return;
        }

        // لینک والدِ زیرمنو (href="#") با کلیک یا لمس باز/بسته می‌شود
        const parentLink = event.target.closest("#mainNav .navItem > .navLink[href='#']");
        if (parentLink && nav.contains(parentLink)) {
            event.preventDefault();
            const item = parentLink.parentElement;
            const open = item.classList.toggle("sub-open");
            parentLink.setAttribute("aria-expanded", open ? "true" : "false");
            return;
        }

        // بعد از انتخاب یک لینک واقعی، منوی موبایل بسته شود
        if (event.target.closest("#mainNav .navItems a:not([href='#'])")) {
            closeMenu();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 768) closeMenu();
    });
})();
