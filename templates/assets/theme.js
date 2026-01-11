(() => {
  const root = document.documentElement;
  const storageKey = "theme-organization-color-scheme";
  const systemMedia = window.matchMedia("(prefers-color-scheme: dark)");
  const allowSwitch = root.dataset.allowScheme === "true";
  const configScheme = root.dataset.scheme || "system";
  const stored = allowSwitch ? localStorage.getItem(storageKey) : null;
  let currentScheme = stored || configScheme;
  const colorToggle = document.querySelector("[data-color-toggle]");

  const applyScheme = (scheme) => {
    currentScheme = scheme;
    if (scheme === "system") {
      root.removeAttribute("data-theme");
      root.style.colorScheme = "";
      return;
    }
    root.setAttribute("data-theme", scheme);
    root.style.colorScheme = scheme;
  };

  applyScheme(currentScheme);

  if (systemMedia && systemMedia.addEventListener) {
    systemMedia.addEventListener("change", () => {
      if (currentScheme === "system") {
        applyScheme("system");
      }
    });
  }

  const api = {
    getColorScheme() {
      return currentScheme || "system";
    },
    setColorScheme(scheme, persist = true) {
      if (!scheme) {
        return;
      }
      applyScheme(scheme);
      if (allowSwitch && persist) {
        localStorage.setItem(storageKey, scheme);
      }
    },
    clearColorScheme() {
      if (allowSwitch) {
        localStorage.removeItem(storageKey);
      }
      applyScheme(configScheme);
    },
  };

  window.themeOrganization = Object.assign(window.themeOrganization || {}, api);

  if (colorToggle && allowSwitch) {
    const labels = {
      system: "Auto",
      light: "Light",
      dark: "Dark",
    };
    const updateLabel = () => {
      const label = labels[currentScheme] || "Auto";
      colorToggle.textContent = `Theme:${label}`;
      colorToggle.setAttribute("aria-pressed", currentScheme !== "system" ? "true" : "false");
      colorToggle.setAttribute("aria-disabled", "false");
    };
    updateLabel();
    colorToggle.addEventListener("click", () => {
      const order = ["system", "light", "dark"];
      const index = order.indexOf(currentScheme);
      const next = order[(index + 1) % order.length];
      api.setColorScheme(next, true);
      updateLabel();
    });
  }

  const navToggle = document.querySelector("[data-nav-toggle]");
  const navOverlay = document.querySelector("[data-nav-overlay]");
  const navClose = document.querySelector("[data-nav-close]");
  const navPanel = document.querySelector("[data-nav-panel]");

  const setNavOpen = (open) => {
    root.classList.toggle("nav-open", open);
    if (navToggle) {
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    }
  };

  if (navToggle) {
    navToggle.addEventListener("click", () => {
      setNavOpen(!root.classList.contains("nav-open"));
    });
  }

  if (navOverlay) {
    navOverlay.addEventListener("click", () => {
      setNavOpen(false);
    });
  }

  if (navClose) {
    navClose.addEventListener("click", () => {
      setNavOpen(false);
    });
  }

  if (navPanel) {
    navPanel.addEventListener("click", (event) => {
      const target = event.target;
      if (target && target.closest && target.closest("a")) {
        setNavOpen(false);
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setNavOpen(false);
    }
  });

  const highlightNav = () => {
    const currentPath = window.location.pathname || "/";
    document.querySelectorAll("[data-nav-link]").forEach((link) => {
      const href = link.getAttribute("href");
      if (!href || href.startsWith("http")) {
        return;
      }
      if (href === "/") {
        if (currentPath === "/") {
          link.classList.add("is-active");
        }
        return;
      }
      if (currentPath.startsWith(href)) {
        link.classList.add("is-active");
      }
    });
  };

  highlightNav();
})();
