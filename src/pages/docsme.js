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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", moveDocsmeHeader);
    document.addEventListener("DOMContentLoaded", replaceDocsmeMenuLabel);
    document.addEventListener("DOMContentLoaded", initDocsmeTocToggle);
  } else {
    moveDocsmeHeader();
    replaceDocsmeMenuLabel();
    initDocsmeTocToggle();
  }
})();
