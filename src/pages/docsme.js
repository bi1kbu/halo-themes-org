import "../styles/page-docsme.css";

(() => {
  const moveDocsmeHeader = () => {
    if (!document.body || !document.body.classList.contains("page-docsme")) {
      return;
    }
    const header = document.querySelector(".dm-header");
    const sidebarContent = document.querySelector(".dm-sidebar__content");
    if (!header || !sidebarContent) {
      return;
    }
    const logo = header.querySelector(".dm-header__logo");
    const nav = header.querySelector(".dm-header__nav");
    const versionSwitcher =
      header.querySelector('.dm-header__switcher[dm-id*="version-switcher"]') ||
      header.querySelector(".dm-header__switcher");
    if (logo && !sidebarContent.contains(logo)) {
      sidebarContent.insertBefore(logo, sidebarContent.firstChild);
    }
    if (versionSwitcher) {
      const existing = document.querySelector(".dm-toc__switcher");
      if (existing) {
        existing.remove();
      }
      let switcherWrap = sidebarContent.querySelector(".dm-sidebar__switcher");
      if (!switcherWrap) {
        switcherWrap = document.createElement("div");
        switcherWrap.className = "dm-sidebar__switcher";
        const switcherLabel = document.createElement("div");
        switcherLabel.className = "dm-sidebar__switcher-label";
        switcherLabel.textContent = "版本";
        switcherWrap.appendChild(switcherLabel);
      }
      if (!switcherWrap.contains(versionSwitcher)) {
        switcherWrap.appendChild(versionSwitcher);
      }
      if (!sidebarContent.contains(switcherWrap)) {
        sidebarContent.insertBefore(switcherWrap, sidebarContent.firstChild);
      }
      if (logo && logo.parentElement === sidebarContent) {
        sidebarContent.insertBefore(switcherWrap, logo.nextSibling);
      }
    }
    if (nav) {
      nav.remove();
    }
    header.remove();
  };

  const replaceDocsmeMenuLabel = () => {
    if (!document.body || !document.body.classList.contains("page-docsme")) {
      return;
    }
    const selector = 'button[dm-on\\:click*="sidebar.open"], button[dm-on\\:click*="$store.sidebar.open"]';
    const button =
      document.querySelector(selector) ||
      Array.from(document.querySelectorAll("button")).find((item) => {
        const text = item.textContent ? item.textContent.trim() : "";
        return text === "文档列表";
      });
    if (!button) {
      return;
    }
    const icon = document.createElement("span");
    icon.className = "icon-[mingcute--book-2-line]";
    button.replaceChildren(icon, document.createTextNode("文档列表"));
  };

  const initDocsmeTocToggle = () => {
    if (!document.body || !document.body.classList.contains("page-docsme")) {
      return;
    }
    if (!window.matchMedia("(max-width: 900px)").matches) {
      return;
    }
    const button = Array.from(document.querySelectorAll("button")).find((item) => {
      const text = item.textContent ? item.textContent.trim() : "";
      return text === "本页目录";
    });
    const toc = document.querySelector(".dm-toc");
    if (!button || !toc) {
      return;
    }
    const update = () => {
      const hasItems =
        toc.querySelectorAll("a, li, [data-toc], [dm-data='toc'], .dm-toc__item").length > 0;
      button.style.display = hasItems ? "" : "none";
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(toc, { childList: true, subtree: true });
  };

  const syncDocsmeInlineColors = () => {
    if (!document.body || !document.body.classList.contains("page-docsme")) {
      return;
    }
    const container = document.querySelector(".dm-content__body");
    if (!container) {
      return;
    }
    const root = document.documentElement;
    const scheme = root.getAttribute("data-theme");
    const prefersDark =
      window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = scheme === "dark" || (scheme !== "light" && prefersDark);
    const nodes = container.querySelectorAll('[style*="color:"]');
    nodes.forEach((el) => {
      if (!el.dataset.inlineColorRaw) {
        const value = el.style.getPropertyValue("color");
        if (value) {
          el.dataset.inlineColorRaw = value;
          const priority = el.style.getPropertyPriority("color");
          if (priority) {
            el.dataset.inlineColorPriority = priority;
          }
        }
      }
      if (isDark) {
        el.style.setProperty("color", "var(--text)", "important");
        return;
      }
      if (el.dataset.inlineColorRaw) {
        el.style.setProperty(
          "color",
          el.dataset.inlineColorRaw,
          el.dataset.inlineColorPriority || ""
        );
      }
    });
  };

  const initDocsmeInlineColorSync = () => {
    if (!document.body || !document.body.classList.contains("page-docsme")) {
      return;
    }
    const container = document.querySelector(".dm-content__body");
    if (!container) {
      return;
    }
    syncDocsmeInlineColors();
    const observer = new MutationObserver(() => {
      syncDocsmeInlineColors();
    });
    observer.observe(container, { childList: true, subtree: true, attributes: true });
    const rootObserver = new MutationObserver(() => {
      syncDocsmeInlineColors();
    });
    rootObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    if (window.matchMedia) {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      if (media && media.addEventListener) {
        media.addEventListener("change", syncDocsmeInlineColors);
      }
    }
  };

  const initDocsmeArticleIdLookup = async () => {
    if (!document.body || !document.body.classList.contains("page-docsme")) {
      return;
    }
    const crumb = document.getElementById("article-id-crumb");
    if (!crumb) {
      return;
    }
    try {
      const path = window.location.pathname || "";
      if (!path) {
        return;
      }
      const url = `/apis/api.article-id-management.halo.run/v1alpha1/lookup?link=${encodeURIComponent(path)}`;
      const res = await fetch(url, { credentials: "same-origin" });
      if (!res.ok) {
        return;
      }
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        return;
      }
      const data = await res.json();
      const fullCode = typeof data?.fullCode === "string" ? data.fullCode.trim() : "";
      if (!fullCode) {
        return;
      }
      const statusDisplay =
        typeof data?.statusDisplay === "string" ? data.statusDisplay.trim() : "";
      if (crumb) {
        crumb.textContent = statusDisplay ? `[${statusDisplay}]${fullCode}` : fullCode;
        crumb.style.display = "";
      }
    } catch (_e) {
      // 静默降级，不影响正文渲染
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", moveDocsmeHeader);
    document.addEventListener("DOMContentLoaded", replaceDocsmeMenuLabel);
    document.addEventListener("DOMContentLoaded", initDocsmeTocToggle);
    document.addEventListener("DOMContentLoaded", initDocsmeInlineColorSync);
    document.addEventListener("DOMContentLoaded", () => {
      initDocsmeArticleIdLookup();
    });
  } else {
    moveDocsmeHeader();
    replaceDocsmeMenuLabel();
    initDocsmeTocToggle();
    initDocsmeInlineColorSync();
    initDocsmeArticleIdLookup();
  }
})();
