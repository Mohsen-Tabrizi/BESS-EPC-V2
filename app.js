/* app.js — auto language routing (browser default) + optional manual override + i18n text binding */
(() => {
  const PAGES = { en: "index.html", de: "de.html", zh: "zh.html" };

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

  function targetUrlFor(lang) {
    return `${location.origin}/${PAGES[lang]}`;
  }

  function go(lang) {
    const target = targetUrlFor(lang);
    if (location.href !== target) location.replace(target);
  }

  // 0) Decide target language:
  // Manual override wins. Otherwise always follow browser default.
  const desired = manualOverrideLang() || browserDefaultLang();
  const current = pageLangFromPath();
  if (current !== desired) go(desired);

  // 1) Manual language switch (only EN/DE links exist in HTML)
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-lang]");
    if (!a) return;

    const lang = a.getAttribute("data-lang");
    if (!PAGES[lang]) return;

    e.preventDefault();
    setManualLang(lang);
    location.href = targetUrlFor(lang);
  });

  // 2) Bind texts from data-en/data-de/data-zh so nothing becomes empty
  function bindI18nTexts() {
    const lang = pageLangFromPath(); // bind to the page you are on
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

  // 3) Mobile menu toggle (works on pages that have #menu-toggle + #nav)
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
