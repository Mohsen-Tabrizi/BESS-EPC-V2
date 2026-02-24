/* app.js — language routing + manual override (GitHub Pages / custom domain safe) */
(() => {
  const PAGES = { en: "index.html", de: "de.html", zh: "zh.html" };

  function browserDefaultLang() {
    const l = (navigator.language || "en").toLowerCase();
    if (l.startsWith("de")) return "de";
    if (l.startsWith("zh")) return "zh";
    return "en";
  }

  function savedLang() {
    const v = localStorage.getItem("lang");
    return v && PAGES[v] ? v : null;
  }

  function setLang(lang) {
    if (PAGES[lang]) localStorage.setItem("lang", lang);
  }

  function pageLangFromPath() {
    const p = (location.pathname || "").toLowerCase();
    if (p.endsWith("/de.html") || p.endsWith("de.html")) return "de";
    if (p.endsWith("/zh.html") || p.endsWith("zh.html")) return "zh";
    return "en"; // default
  }

  function targetUrlFor(lang) {
    // Keep it simple: same origin, root file
    return `${location.origin}/${PAGES[lang]}`;
  }

  function go(lang) {
    const target = targetUrlFor(lang);
    if (location.href !== target) location.replace(target);
  }

  // 1) If user already chose a language before, ALWAYS respect it.
  const saved = savedLang();
  if (saved) {
    const current = pageLangFromPath();
    if (current !== saved) go(saved);
  } else {
    // 2) First visit: pick based on browser language and store it once.
    const first = browserDefaultLang();
    setLang(first);
    const current = pageLangFromPath();
    if (current !== first) go(first);
  }

  // 3) Manual language switch:
  // Add links like: <a href="index.html" data-lang="en">EN</a>
  //               <a href="de.html"    data-lang="de">DE</a>
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-lang]");
    if (!a) return;

    const lang = a.getAttribute("data-lang");
    if (!PAGES[lang]) return;

    e.preventDefault();
    setLang(lang);
    location.href = targetUrlFor(lang);
  });
})();
