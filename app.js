/* app.js — home-only auto language routing + optional manual override + i18n binding + mobile menu */
(() => {
  const PAGES = { en: "index.html", de: "de.html", zh: "zh.html" };
  const HOME_FILES = new Set(["", "/", "/index.html", "/de.html", "/zh.html"]);

  function browserDefaultLang() {
    const l = (navigator.language || "en").toLowerCase();
    if (l.startsWith("de")) return "de";
    if (l.startsWith("zh")) return "zh";
    return "en";
  }

  function manualOverrideLang() {
    const manual = localStorage.getItem("lang_manual") === "1";
    if (!manual) return null;
    const v = localStorage.getItem("lang");
    return v && PAGES[v] ? v : null;
  }

  function setManualLang(lang) {
    if (!PAGES[lang]) return;
    localStorage.setItem("lang", lang);
    localStorage.setItem("lang_manual", "1");
  }

  function pageLangFromPath() {
    const p = (location.pathname || "").toLowerCase();
    if (p.endsWith("/de.html") || p.endsWith("de.html")) return "de";
    if (p.endsWith("/zh.html") || p.endsWith("zh.html")) return "zh";
    return "en";
  }

  function isHomePage() {
    const p = (location.pathname || "").toLowerCase();
    // normalize: some servers return "/" only, some return "/index.html"
    if (p === "") return true;
    if (HOME_FILES.has(p)) return true;
    return false;
  }

  function targetUrlFor(lang) {
    return `${location.origin}/${PAGES[lang]}`;
  }

  function go(lang) {
    const target = targetUrlFor(lang);
    if (location.href !== target) location.replace(target);
  }

  // 1) Auto-route ONLY on home pages.
  // If someone visits municipalities.html etc, do NOT force them back to home.
  if (isHomePage()) {
    const desired = manualOverrideLang() || browserDefaultLang();
    const current = pageLangFromPath();

    // Important: if user is explicitly on de.html or zh.html, do NOT redirect away.
    // Auto-routing should mainly decide which home to land on.
    const p = (location.pathname || "").toLowerCase();
    const explicitlyOnDeOrZh = p.endsWith("de.html") || p.endsWith("zh.html");

    if (!explicitlyOnDeOrZh && current !== desired) go(desired);
    // If explicitly on de.html/zh.html, stay there.
  }

  // 2) Manual language switch (you can keep only EN/DE in HTML)
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-lang]");
    if (!a) return;

    const lang = a.getAttribute("data-lang");
    if (!PAGES[lang]) return;

    e.preventDefault();
    setManualLang(lang);
    location.href = targetUrlFor(lang);
  });

  // 3) Bind i18n texts (prevents empty labels/buttons)
  function bindI18nTexts() {
    const lang = pageLangFromPath();
    const key = `data-${lang}`;

    document.querySelectorAll(`[${key}]`).forEach((el) => {
      const val = el.getAttribute(key);
      if (val !== null && val !== "") el.textContent = val;
    });

    document.querySelectorAll(`[${key}-placeholder]`).forEach((el) => {
      const val = el.getAttribute(`${key}-placeholder`);
      if (val) el.setAttribute("placeholder", val);
    });

    document.querySelectorAll(`[${key}-aria]`).forEach((el) => {
      const val = el.getAttribute(`${key}-aria`);
      if (val) el.setAttribute("aria-label", val);
    });
  }

  // 4) Mobile menu toggle
  function initMobileMenu() {
    const btn = document.getElementById("menu-toggle");
    const nav = document.getElementById("nav");
    if (!btn || !nav) return;

    const close = () => {
      nav.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    };

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });

    nav.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (a) close();
    });

    document.addEventListener("click", (e) => {
      const inside = e.target.closest("#nav") || e.target.closest("#menu-toggle");
      if (!inside) close();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) close();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initMobileMenu();
      bindI18nTexts();
    });
  } else {
    initMobileMenu();
    bindI18nTexts();
  }
})();
