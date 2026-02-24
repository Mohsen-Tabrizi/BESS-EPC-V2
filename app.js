/* BESS EPC site script
   Goals:
   1) Never lose nav labels (populate from data-en/data-de/data-zh)
   2) Robust language handling (en, de, zh) with optional auto-redirect
   3) Active nav highlighting
*/

(function () {
  const LANGS = ["en", "de", "zh"];

  function normalizeLang(raw) {
    if (!raw) return "en";
    const s = String(raw).toLowerCase();
    if (s.startsWith("de")) return "de";
    if (s.startsWith("zh")) return "zh";
    return "en";
  }

  function getPreferredLang() {
    const stored = localStorage.getItem("lang");
    if (stored && LANGS.includes(stored)) return stored;

    const nav = (navigator.languages && navigator.languages[0]) || navigator.language || "en";
    return normalizeLang(nav);
  }

  function setLang(lang) {
    const chosen = LANGS.includes(lang) ? lang : "en";
    localStorage.setItem("lang", chosen);
    document.documentElement.setAttribute("lang", chosen);
    applyTranslations(chosen);
    updateLangUI(chosen);
    highlightActiveNav();
  }

  function applyTranslations(lang) {
    const nodes = document.querySelectorAll("[data-en], [data-de], [data-zh]");
    nodes.forEach((el) => {
      const key = "data-" + lang;
      const val = el.getAttribute(key);

      // Only overwrite if a translation exists for that language.
      // This is important because some elements have only EN/DE.
      if (val !== null && val !== "") {
        // Preserve HTML entities already in attributes.
        el.innerHTML = val;
      }
    });
  }

  function updateLangUI(lang) {
    // Button toggle style (if you use #lang-toggle like before)
    const btn = document.getElementById("lang-toggle");
    if (btn) {
      // show the next option
      const next = lang === "en" ? "DE" : "EN";
      btn.textContent = next;
      btn.setAttribute("aria-label", "Switch language");
    }

    // Optional top-right language links (if present)
    const linkEN = document.querySelector('[data-lang-link="en"]');
    const linkDE = document.querySelector('[data-lang-link="de"]');

    if (linkEN) linkEN.classList.toggle("active", lang === "en");
    if (linkDE) linkDE.classList.toggle("active", lang === "de");
  }

  function highlightActiveNav() {
    const links = document.querySelectorAll("nav a");
    const here = location.pathname.split("/").pop() || "index.html";

    links.forEach((a) => {
      a.classList.remove("active");

      const href = a.getAttribute("href") || "";
      const target = href.split("#")[0].split("/").pop();

      // For hash links (index.html#projects), compare base file.
      if (target && target === here) a.classList.add("active");

      // Also highlight if link is only a hash and we're on same page
      if (href.startsWith("#")) a.classList.add("active");
    });
  }

  function maybeAutoRedirect(lang) {
    // Only redirect if user has not manually chosen a language.
    const stored = localStorage.getItem("lang");
    if (stored) return;

    const page = location.pathname.split("/").pop() || "index.html";

    // If user lands on index.html but browser is DE or ZH, redirect.
    // This keeps SEO simple while still giving "auto language" behavior.
    if (page === "" || page === "index.html") {
      if (lang === "de") {
        location.replace("de.html");
      } else if (lang === "zh") {
        location.replace("zh.html");
      }
    }
  }

  function wireLangControls() {
    // Button toggle (EN <-> DE). Chinese is auto only.
    const btn = document.getElementById("lang-toggle");
    if (btn) {
      btn.addEventListener("click", () => {
        const current = getPreferredLang();
        const next = current === "de" ? "en" : "de";
        setLang(next);
        // If you're using separate pages, switch pages too:
        const page = location.pathname.split("/").pop() || "index.html";
        if (next === "de" && page !== "de.html") location.href = "de.html";
        if (next === "en" && page !== "index.html") location.href = "index.html";
      });
    }

    // Optional language links (EN/DE) if you have them in header
    const linkEN = document.querySelector('[data-lang-link="en"]');
    const linkDE = document.querySelector('[data-lang-link="de"]');

    if (linkEN) {
      linkEN.addEventListener("click", (e) => {
        e.preventDefault();
        setLang("en");
        location.href = "index.html";
      });
    }
    if (linkDE) {
      linkDE.addEventListener("click", (e) => {
        e.preventDefault();
        setLang("de");
        location.href = "de.html";
      });
    }
  }

  function fixCommonPathMistakes() {
    // Defensive: ensure images/videos that start with "assets/" still work when a page is nested.
    // Your site is root-level pages, but this prevents future breakage.
    document.querySelectorAll("img[src], video source[src]").forEach((el) => {
      const attr = el.tagName.toLowerCase() === "source" ? "src" : "src";
      const v = el.getAttribute(attr);
      if (!v) return;
      // If someone used "assets/..." instead of "/assets/..."
      if (v.startsWith("assets/")) {
        el.setAttribute(attr, "/" + v);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const preferred = getPreferredLang();

    // Auto redirect first (only on index.html and only if no manual choice stored)
    maybeAutoRedirect(preferred);

    // Apply language to current page (works for en/de/zh pages too)
    setLang(preferred);

    wireLangControls();
    fixCommonPathMistakes();
  });
})();
