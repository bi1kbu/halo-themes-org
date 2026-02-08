import "./styles/base.css";

(() => {
  const root = document.documentElement;
  const storageKey = "theme-organization-color-scheme";
  const systemMedia = window.matchMedia("(prefers-color-scheme: dark)");
  const allowSwitch = root.dataset.allowScheme === "true";
  const configScheme = root.dataset.scheme || "system";
  const stored = allowSwitch ? localStorage.getItem(storageKey) : null;
  let currentScheme = stored || configScheme;
  const themeSwitches = Array.from(document.querySelectorAll("[data-theme-switch]"))
    .map((switchEl) => ({
      root: switchEl,
      toggle: switchEl.querySelector("[data-theme-toggle]"),
      menu: switchEl.querySelector("[data-theme-menu]"),
      options: Array.from(switchEl.querySelectorAll("[data-theme-option]")),
    }))
    .filter((entry) => entry.toggle && entry.menu);

  const updateThemeMenus = () => {
    if (!themeSwitches.length) {
      return;
    }
    const current = currentScheme || "system";
    themeSwitches.forEach((entry) => {
      entry.options.forEach((option) => {
        const value = option.dataset.themeOption;
        const active = value === current;
        option.classList.toggle("is-active", active);
        option.setAttribute("aria-selected", active ? "true" : "false");
      });
    });
  };

  const setThemeMenuOpen = (entry, open) => {
    if (!entry || !entry.menu || !entry.toggle) {
      return;
    }
    entry.menu.classList.toggle("is-open", open);
    entry.toggle.setAttribute("aria-expanded", open ? "true" : "false");
  };

  const closeAllThemeMenus = (except) => {
    themeSwitches.forEach((entry) => {
      if (except && entry === except) {
        return;
      }
      setThemeMenuOpen(entry, false);
    });
  };

  const applyScheme = (scheme) => {
    currentScheme = scheme;
    if (scheme === "system") {
      const resolved = systemMedia && systemMedia.matches ? "dark" : "light";
      root.setAttribute("data-theme", resolved);
      root.style.colorScheme = resolved;
      updateThemeMenus();
      return;
    }
    root.setAttribute("data-theme", scheme);
    root.style.colorScheme = scheme;
    updateThemeMenus();
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

  if (themeSwitches.length) {
    themeSwitches.forEach((entry) => {
      if (!allowSwitch) {
        entry.toggle.setAttribute("aria-disabled", "true");
        return;
      }
      entry.toggle.addEventListener("click", () => {
        if (!allowSwitch) {
          return;
        }
        const nextOpen = !entry.menu.classList.contains("is-open");
        closeAllThemeMenus(entry);
        setThemeMenuOpen(entry, nextOpen);
      });
      entry.options.forEach((option) => {
        option.addEventListener("click", () => {
          const next = option.dataset.themeOption || "system";
          api.setColorScheme(next, true);
          setThemeMenuOpen(entry, false);
        });
      });
    });
  }

  document.addEventListener("click", (event) => {
    if (!themeSwitches.length) {
      return;
    }
    themeSwitches.forEach((entry) => {
      if (!entry.menu.classList.contains("is-open")) {
        return;
      }
      if (!entry.root.contains(event.target)) {
        setThemeMenuOpen(entry, false);
      }
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAllThemeMenus();
    }
  });

  updateThemeMenus();
  closeAllThemeMenus();

  const navToggle = document.querySelector("[data-nav-toggle]");
  const navOverlay = document.querySelector("[data-nav-overlay]");
  const navClose = document.querySelector("[data-nav-close]");
  const navPanel = document.querySelector("[data-nav-panel]");
  const subnavToggles = Array.from(document.querySelectorAll("[data-subnav-toggle]"));
  const userSubnavToggles = Array.from(document.querySelectorAll("[data-user-subnav-toggle]"));

  const setSubnavOpen = (toggle, open, subnavSelector = "[data-subnav]") => {
    if (!toggle) {
      return;
    }
    const item = toggle.closest(".mobile-nav-item");
    const subnav = item ? item.querySelector(subnavSelector) : null;
    if (!subnav) {
      return;
    }
    subnav.classList.toggle("is-open", open);
    subnav.hidden = !open;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  };

  const collapseSubnavs = () => {
    subnavToggles.forEach((toggle) => {
      setSubnavOpen(toggle, false, "[data-subnav]");
    });
    userSubnavToggles.forEach((toggle) => {
      setSubnavOpen(toggle, false, "[data-user-subnav]");
    });
  };

  const setNavOpen = (open) => {
    root.classList.toggle("nav-open", open);
    if (navToggle) {
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    }
    collapseSubnavs();
    if (!open) {
      closeAllThemeMenus();
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

  subnavToggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const item = toggle.closest(".mobile-nav-item");
      const subnav = item ? item.querySelector("[data-subnav]") : null;
      if (!subnav) {
        return;
      }
      setSubnavOpen(toggle, !subnav.classList.contains("is-open"), "[data-subnav]");
    });
  });

  userSubnavToggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const item = toggle.closest(".mobile-nav-item");
      const subnav = item ? item.querySelector("[data-user-subnav]") : null;
      if (!subnav) {
        return;
      }
      setSubnavOpen(toggle, !subnav.classList.contains("is-open"), "[data-user-subnav]");
    });
  });

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

  const updateLoginLinks = () => {
    const links = Array.from(document.querySelectorAll("[data-login-link]"));
    if (!links.length) {
      return;
    }
    const pathname = window.location.pathname || "/";
    if (pathname.startsWith("/login")) {
      return;
    }
    const redirect = `${pathname}${window.location.search || ""}${window.location.hash || ""}`;
    const encoded = encodeURIComponent(redirect);
    links.forEach((link) => {
      const nextHref = `/login?redirect_uri=${encoded}`;
      link.setAttribute("href", nextHref);
      if (link.dataset.loginBound === "true") {
        return;
      }
      link.dataset.loginBound = "true";
      link.addEventListener("click", () => {
        const freshRedirect = `${window.location.pathname || "/"}${window.location.search || ""}${window.location.hash || ""}`;
        link.setAttribute("href", `/login?redirect_uri=${encodeURIComponent(freshRedirect)}`);
      });
    });
  };

  updateLoginLinks();
  window.addEventListener("load", updateLoginLinks);

  const openSearch = () => {
    if (window.SearchWidget && typeof window.SearchWidget.open === "function") {
      window.SearchWidget.open();
      return true;
    }
    return false;
  };

  const searchTriggers = Array.from(document.querySelectorAll("[data-search-trigger]"));
  if (searchTriggers.length) {
    searchTriggers.forEach((trigger) => {
      trigger.addEventListener("click", (event) => {
        event.preventDefault();
        if (openSearch() && root.classList.contains("nav-open")) {
          setNavOpen(false);
        }
      });
    });
  }

  const footerActions = Array.from(document.querySelectorAll("[data-footer-action]"));
  if (footerActions.length) {
    footerActions.forEach((action) => {
      action.addEventListener("click", (event) => {
        const type = action.dataset.footerAction || "";
        if (type === "search") {
          event.preventDefault();
          openSearch();
          return;
        }
        if (type === "top") {
          event.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
    });
  }

  const footerIcons = Array.from(document.querySelectorAll("[data-footer-icon]"));
  if (footerIcons.length) {
    footerIcons.forEach((icon) => {
      const src = icon.dataset.footerIcon || "";
      if (!src) {
        return;
      }
      icon.style.setProperty("--footer-menu-icon", `url('${src}')`);
    });
  }
})();
