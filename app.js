/* app.js — Option A: homepage routing only + per-page i18n binding (EN/DE + hidden ZH) */
(() => {
  const HOME_PAGES = { en: "index.html", de: "de.html", zh: "zh.html" };

  function browserDefaultLang() {
    const l = (navigator.language || "en").toLowerCase();
    if (l.startsWith("de")) return "de";
    if (l.startsWith("zh")) return "zh";
    return "en";
  }

  function getLang() {
    const manual = localStorage.getItem("lang_manual") === "1";
    const saved = localStorage.getItem("lang");
    if (manual && saved && HOME_PAGES[saved]) return saved;
    return browserDefaultLang();
  }

  function setLang(lang, manual) {
    if (!HOME_PAGES[lang]) return;
    localStorage.setItem("lang", lang);
    localStorage.setItem("lang_manual", manual ? "1" : "0");
  }

  function currentFile() {
    const p = (location.pathname || "");
    const last = p.split("/").pop() || "";
    return last.toLowerCase() || "index.html";
  }

  function isHomepage() {
    const f = currentFile();
    return f === "index.html" || f === "de.html" || f === "zh.html" || f === "";
  }

  function homepageLangFromFile() {
    const f = currentFile();
    if (f === "de.html") return "de";
    if (f === "zh.html") return "zh";
    return "en";
  }

  function homepageUrlFor(lang) {
    return `${location.origin}/${HOME_PAGES[lang]}`;
  }

  // A) Homepage routing ONLY
  const desired = getLang();

  if (isHomepage()) {
    // keep localStorage in sync with what we want (not manual unless user clicked)
    if (localStorage.getItem("lang_manual") !== "1") setLang(desired, false);

    const currentHomeLang = homepageLangFromFile();
    if (currentHomeLang !== desired) {
      location.replace(homepageUrlFor(desired));
      return;
    }
  } else {
    // On subpages: never redirect. Just remember desired (unless user manually chose).
    if (localStorage.getItem("lang_manual") !== "1") setLang(desired, false);
  }

  // B) Language switch clicks (EN/DE links in your header)
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-lang]");
    if (!a) return;

    const lang = a.getAttribute("data-lang");
    if (!HOME_PAGES[lang]) return;

    e.preventDefault();
    setLang(lang, true);

    if (isHomepage()) {
      location.href = homepageUrlFor(lang);
    } else {
      // stay on same subpage, just re-bind text
      bindI18nTexts(lang);
    }
  });

  // C) Bind texts so nothing becomes empty
  function bindI18nTexts(forceLang) {
    const lang = forceLang || getLang();
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

  // D) Mobile menu toggle (if present)
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
      const link = e.target.closest("a");
      if (link) close();
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
