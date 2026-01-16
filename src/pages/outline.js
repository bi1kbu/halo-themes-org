import "../styles/page-outline.css";

(() => {
  const outlinePage = document.querySelector("[data-outline-page]");
  if (!outlinePage) {
    return;
  }
  const outlineContent = outlinePage.querySelector("[data-outline-content]");
  const outlineList = outlinePage.querySelector("[data-outline-list]");
  const outlineNav = outlinePage.querySelector("[data-outline-nav]");

  if (!outlineContent) {
    return;
  }

  const nodes = Array.from(outlineContent.childNodes);
  const sections = [];
  let current = null;

  const isH1 = (node) => node.nodeType === Node.ELEMENT_NODE && node.tagName === "H1";

  nodes.forEach((node) => {
    if (isH1(node)) {
      current = {
        heading: node,
        nodes: [node],
      };
      sections.push(current);
      return;
    }
    if (current) {
      current.nodes.push(node);
    }
  });

  if (!sections.length) {
    if (outlineNav) {
      outlineNav.style.display = "none";
    }
    return;
  }

  const sectionsWrap = document.createElement("div");
  sectionsWrap.className = "outline-sections";
  const usedIds = new Set();
  const navButtons = [];

  const slugify = (text) =>
    text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\u4e00-\u9fffA-Za-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

  const ensureId = (heading, index) => {
    const rawText = heading.textContent.trim();
    let base = heading.id || slugify(rawText);
    if (!base) {
      base = `section-${index + 1}`;
    }
    let id = base;
    let i = 2;
    while (usedIds.has(id)) {
      id = `${base}-${i}`;
      i += 1;
    }
    usedIds.add(id);
    heading.id = id;
    return id;
  };

  sections.forEach((section, index) => {
    const id = ensureId(section.heading, index);
    const sectionEl = document.createElement("section");
    sectionEl.className = "outline-section";
    sectionEl.dataset.outlineSection = id;
    section.nodes.forEach((node) => {
      sectionEl.appendChild(node);
    });
    sectionsWrap.appendChild(sectionEl);

    if (outlineList) {
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "outline-nav-link";
      button.dataset.outlineTarget = id;
      button.textContent = section.heading.textContent.trim() || `Section ${index + 1}`;
      item.appendChild(button);
      outlineList.appendChild(item);
      navButtons.push(button);
    }
  });

  outlineContent.innerHTML = "";
  outlineContent.appendChild(sectionsWrap);

  const sectionEls = Array.from(sectionsWrap.querySelectorAll(".outline-section"));

  const setActive = (id, updateHash) => {
    let found = false;
    sectionEls.forEach((sectionEl) => {
      const active = sectionEl.dataset.outlineSection === id;
      sectionEl.classList.toggle("is-active", active);
      if (active) {
        found = true;
      }
    });
    navButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.outlineTarget === id);
    });
    if (found && updateHash) {
      history.replaceState(null, "", `#${id}`);
    }
    return found;
  };

  const initHash = decodeURIComponent(window.location.hash || "").replace(/^#/, "");
  if (!initHash || !setActive(initHash, false)) {
    const firstId = sectionEls[0] ? sectionEls[0].dataset.outlineSection : "";
    if (firstId) {
      setActive(firstId, false);
    }
  }

  if (outlineNav) {
    outlineNav.addEventListener("click", (event) => {
      const target = event.target;
      if (!target || !target.dataset || !target.dataset.outlineTarget) {
        return;
      }
      setActive(target.dataset.outlineTarget, true);
    });
  }

  window.addEventListener("hashchange", () => {
    const nextHash = decodeURIComponent(window.location.hash || "").replace(/^#/, "");
    if (nextHash) {
      setActive(nextHash, false);
    }
  });
})();
