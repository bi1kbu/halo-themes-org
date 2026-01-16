import "../styles/page-post.css";

(() => {
  const initPostToc = () => {
    const postContent = document.querySelector("[data-post-content]");
    const toc = document.querySelector("[data-post-toc]");
    const tocList = document.querySelector("[data-post-toc-list]");
    if (!postContent || !toc || !tocList) {
      return;
    }
    const headings = Array.from(postContent.querySelectorAll("h1, h2, h3"));
    if (!headings.length) {
      toc.style.display = "none";
      return;
    }
    tocList.innerHTML = "";
    const usedIds = new Set();

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
      const existing = document.getElementById(id);
      if (existing && existing !== heading) {
        while (document.getElementById(id)) {
          id = `${base}-${i}`;
          i += 1;
        }
      }
      usedIds.add(id);
      heading.id = id;
      return id;
    };

    headings.forEach((heading, index) => {
      const id = ensureId(heading, index);
      const item = document.createElement("li");
      const level = heading.tagName.toLowerCase();
      item.className = `post-toc-item level-${level}`;
      const link = document.createElement("a");
      link.className = "post-toc-link";
      link.href = `#${id}`;
      link.textContent = heading.textContent.trim() || `Section ${index + 1}`;
      item.appendChild(link);
      tocList.appendChild(item);
    });
  };

  const cleanupPostBody = () => {
    document.querySelectorAll(".post-body").forEach((body) => {
      const nodes = Array.from(body.childNodes);
      for (let i = nodes.length - 1; i >= 0; i -= 1) {
        const node = nodes[i];
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent ? node.textContent.trim() : "";
          if (!text) {
            node.remove();
            continue;
          }
          if (text === "null") {
            node.remove();
          }
        }
        break;
      }
    });
  };

  initPostToc();
  cleanupPostBody();
})();
