/* BESS EPC - app.js
   - Populates all labels from data-en / data-de so nav never appears blank
   - EN/DE toggle for all pages
   - Auto-redirect to de.html / zh.html for homepage visitors based on browser language
*/

(function () {
  const SUPPORTED_UI_LANGS = ["en", "de"]; // UI toggle shows only EN/DE
  const STORAGE_KEY = "bess_lang";

  function normalizeLang(raw) {
    if (!raw) return "en";
    const s = String(raw).toLowerCase();
    if (s.startsWith("de")) return "de";
    if (s.startsWith("zh")) return "zh";
    return "en";
  }

  function getBrowserLang() {
    const langs = Array.isArray(navigator.languages) ? navigator.languages : [];
    if (langs.length) return normalizeLang(langs[0]);
    return normalizeLang(navigator.language || navigator.userLanguage);
  }

  function getSavedLang() {
    try {
      return normalizeLang(localStorage.getItem(STORAGE_KEY));
    } catch (e) {
      return null;
    }
  }

  function saveLang(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {}
  }

  // Redirect logic only for homepage entry
  function maybeRedirectHomepage() {
    const path = window.location.pathname || "";
    const file = path.split("/").pop() || "";
    const isHome =
      file === "" ||
      file === "index.html" ||
      file === "de.html" ||
      file === "zh.html";

    if (!isHome) return;

    // If user explicitly saved a UI language, respect it
    const saved = getSavedLang();
    const preferred = saved || getBrowserLang();

    // Only redirect if we are on the wrong homepage file
    if ((file === "" || file === "index.html") && preferred === "de") {
      window.location.replace("de.html");
      return;
    }
    if ((file === "" || file === "index.html") && preferred === "zh") {
      window.location.replace("zh.html");
      return;
    }

    // If user is on de.html but prefers EN, go to index.html
    if (file === "de.html" && preferred === "en") {
      window.location.replace("index.html");
      return;
    }

    // If user is on zh.html and prefers EN/DE, redirect accordingly
    if (file === "zh.html" && preferred === "de") {
      window.location.replace("de.html");
      return;
    }
    if (file === "zh.html" && preferred === "en") {
      window.location.replace("index.html");
      return;
    }
  }

  function applyLanguage(lang) {
    // We only apply UI strings for EN/DE across shared pages.
    // zh.html is its own fully Chinese homepage.
    const uiLang = SUPPORTED_UI_LANGS.includes(lang) ? lang : "en";

    document.documentElement.setAttribute("lang", uiLang);

    // Populate any element that uses data-en/data-de
    const nodes = document.querySelectorAll("[data-en], [data-de]");
    nodes.forEach((el) => {
      const value = el.getAttribute("data-" + uiLang);
      if (value !== null && value !== undefined) {
        // Only overwrite if there is a value for the selected language
        el.textContent = value;
      }
    });

    // Update toggle button text (shows the OTHER language)
    const btn = document.getElementById("lang-toggle");
    if (btn) {
      const next = uiLang === "de" ? "EN" : "DE";
      btn.textContent = next;
      btn.setAttribute("aria-label", "Switch language to " + next);
    }

    return uiLang;
  }

  function wireLanguageToggle(currentLang) {
    const btn = document.getElementById("lang-toggle");
    if (!btn) return;

    btn.addEventListener("click", function () {
      const nextLang = currentLang === "de" ? "en" : "de";
      saveLang(nextLang);

      // If on a special homepage file, switch the file too
      const path = window.location.pathname || "";
      const file = path.split("/").pop() || "";

      if (file === "de.html" && nextLang === "en") {
        window.location.href = "index.html";
        return;
      }
      if (file === "index.html" && nextLang === "de") {
        window.location.href = "de.html";
        return;
      }
      if (file === "zh.html") {
        // From zh homepage, toggling goes to EN/DE homepage
        window.location.href = nextLang === "de" ? "de.html" : "index.html";
        return;
      }

      // Normal pages: just switch labels in-place
      currentLang = applyLanguage(nextLang);
    });
  }

  // Run
  maybeRedirectHomepage();

  const initial = getSavedLang() || getBrowserLang();
  const uiLang = applyLanguage(initial);
  wireLanguageToggle(uiLang);
})();
