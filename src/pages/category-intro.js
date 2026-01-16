(() => {
  const renderCategoryIntro = () => {
    const blocks = document.querySelectorAll("[data-md-block]");
    if (!blocks.length) {
      return false;
    }

    const escapeHtml = (value) =>
      String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

    const applyInlineStrong = (value) => value.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

    blocks.forEach((block) => {
      if (block.dataset.mdRendered === "true") {
        return;
      }
      const rawEl = block.querySelector("[data-md-raw]");
      const raw = rawEl ? rawEl.textContent : block.textContent;
      if (!raw || !raw.trim()) {
        return;
      }
      const lines = raw.replace(/\r\n/g, "\n").split("\n");
      const htmlParts = [];
      lines.forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return;
        }
        if (trimmed.startsWith("# ")) {
          const heading = trimmed.slice(2).trim();
          if (heading) {
            const safeHeading = applyInlineStrong(escapeHtml(heading));
            htmlParts.push(`<strong class="project-card-desc-heading">${safeHeading}</strong>`);
          }
          return;
        }
        const safeText = applyInlineStrong(escapeHtml(trimmed));
        htmlParts.push(`<p>${safeText}</p>`);
      });
      block.innerHTML = htmlParts.join("");
      block.dataset.mdRendered = "true";
    });
    return true;
  };

  const initCategoryIntro = () => {
    if (document.querySelector("[data-md-block]")) {
      return renderCategoryIntro();
    }
    return false;
  };

  if (!initCategoryIntro()) {
    const observer = new MutationObserver(() => {
      if (initCategoryIntro()) {
        observer.disconnect();
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
})();
