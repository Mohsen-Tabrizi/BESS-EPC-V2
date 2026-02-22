// ===== BESS EPC: language routing + mobile menu =====

(function () {
  const saved = localStorage.getItem("bessepc_lang_choice");
  const path = window.location.pathname.toLowerCase();
  const isRootIndex = path.endsWith("/") || path.endsWith("/index.html") || path === "/";

  // Only auto-redirect when user has not chosen a language yet
  if (!saved && isRootIndex) {
    const lang = (navigator.language || navigator.userLanguage || "en").toLowerCase();

    // de -> German
    if (lang.startsWith("de")) {
      window.location.replace("/de.html");
      return;
    }

    // zh -> Chinese
    if (lang.startsWith("zh")) {
      window.location.replace("/zh.html");
      return;
    }

    // default: English stays on /
    localStorage.setItem("bessepc_lang_choice", "en");
  }

  // Mobile menu toggle
  const menuBtn = document.getElementById("menu-toggle");
  const nav = document.getElementById("nav");

  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      const open = nav.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });

    // Close menu when clicking a link (mobile)
    nav.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => nav.classList.remove("open"));
    });
  }

  // EN/DE switch (no Chinese shown)
  const langSwitchEn = document.getElementById("lang-en");
  const langSwitchDe = document.getElementById("lang-de");

  if (langSwitchEn) {
    langSwitchEn.addEventListener("click", function (e) {
      e.preventDefault();
      localStorage.setItem("bessepc_lang_choice", "en");
      window.location.href = "/index.html";
    });
  }

  if (langSwitchDe) {
    langSwitchDe.addEventListener("click", function (e) {
      e.preventDefault();
      localStorage.setItem("bessepc_lang_choice", "de");
      window.location.href = "/de.html";
    });
  }
})();
