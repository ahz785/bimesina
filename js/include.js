document.addEventListener("DOMContentLoaded", () => {
    // لود هدر
    fetch("/partials/header.html")
        .then(res => res.text())
        .then(html => document.getElementById("header").innerHTML = html)
        .catch(err => console.error("خطا در بارگذاری header:", err));

    // لود فوتر
    fetch("/partials/footer.html")
        .then(res => res.text())
        .then(html => document.getElementById("footer").innerHTML = html)
        .catch(err => console.error("خطا در بارگذاری footer:", err));
});