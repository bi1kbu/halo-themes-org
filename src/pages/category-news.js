import "../styles/page-category-news.css";

(() => {
  const formatDate = (value) => {
    if (!value) {
      return "";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "";
    }
    return date.toISOString().slice(0, 10);
  };

  const buildNewsCarousel = async (carousel) => {
    const dataNodes = Array.from(carousel.querySelectorAll(".news-carousel-data"));
    if (!dataNodes.length) {
      return;
    }
    const ids = dataNodes.map((node) => node.dataset.id).filter(Boolean);
    if (!ids.length) {
      return;
    }
    const track = carousel.querySelector("[data-carousel-track]");
    const dotsWrap = carousel.querySelector("[data-carousel-dots]");
    if (!track || !dotsWrap) {
      return;
    }
    const posts = await Promise.all(
      ids.map(async (id) => {
        try {
          const res = await fetch(
            `/apis/content.halo.run/v1alpha1/posts?fieldSelector=metadata.name=${encodeURIComponent(id)}`
          );
          if (!res.ok) {
            return null;
          }
          const data = await res.json();
          return data?.items?.[0] || null;
        } catch (error) {
          return null;
        }
      })
    );
    const validPosts = posts.filter(Boolean);
    if (!validPosts.length) {
      return;
    }
    track.innerHTML = "";
    dotsWrap.innerHTML = "";
    validPosts.forEach((post, index) => {
      const slide = document.createElement("a");
      slide.className = `news-carousel-slide${index === 0 ? " is-active" : ""}`;
      slide.setAttribute("data-carousel-slide", "");
      slide.href = post?.status?.permalink || "#";

      const cover = document.createElement("div");
      if (post?.spec?.cover) {
        cover.className = "news-carousel-media";
        cover.style.backgroundImage = `url('${post.spec.cover}')`;
      } else {
        cover.className = "news-carousel-media is-empty";
      }

      const info = document.createElement("div");
      info.className = "news-carousel-info";

      const title = document.createElement("div");
      title.className = "news-carousel-title";
      title.textContent = post?.spec?.title || "";

      const meta = document.createElement("div");
      meta.className = "news-carousel-meta";
      const dateText = formatDate(post?.spec?.publishTime);
      if (dateText) {
        const dateSpan = document.createElement("span");
        dateSpan.textContent = dateText;
        meta.appendChild(dateSpan);
      }

      info.appendChild(title);
      info.appendChild(meta);
      slide.appendChild(cover);
      slide.appendChild(info);
      track.appendChild(slide);

      const dot = document.createElement("button");
      dot.className = `news-carousel-dot${index === 0 ? " is-active" : ""}`;
      dot.type = "button";
      dot.setAttribute("data-carousel-dot", "");
      dot.setAttribute("data-carousel-index", `${index}`);
      dot.setAttribute("aria-label", "Slide");
      dotsWrap.appendChild(dot);
    });
  };

  const initNewsCarousel = async () => {
    const carousels = document.querySelectorAll("[data-news-carousel]");
    if (!carousels.length) {
      return;
    }
    for (const carousel of carousels) {
      const existingSlides = carousel.querySelectorAll("[data-carousel-slide]");
      if (!existingSlides.length) {
        await buildNewsCarousel(carousel);
      }
      const slides = Array.from(carousel.querySelectorAll("[data-carousel-slide]"));
      const dots = Array.from(carousel.querySelectorAll("[data-carousel-dot]"));
      const prevBtn = carousel.querySelector("[data-carousel-prev]");
      const nextBtn = carousel.querySelector("[data-carousel-next]");
      if (!slides.length) {
        continue;
      }
      let index = 0;
      let timer = null;

      const setActive = (nextIndex) => {
        const total = slides.length;
        index = ((nextIndex % total) + total) % total;
        slides.forEach((slide, i) => {
          slide.classList.toggle("is-active", i === index);
        });
        dots.forEach((dot, i) => {
          dot.classList.toggle("is-active", i === index);
        });
      };

      const stop = () => {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
      };

      const start = () => {
        if (slides.length < 2) {
          return;
        }
        stop();
        timer = setInterval(() => {
          setActive(index + 1);
        }, 5000);
      };

      if (prevBtn) {
        prevBtn.addEventListener("click", () => {
          setActive(index - 1);
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          setActive(index + 1);
        });
      }

      dots.forEach((dot) => {
        dot.addEventListener("click", () => {
          const next = Number.parseInt(dot.dataset.carouselIndex || "0", 10);
          if (!Number.isNaN(next)) {
            setActive(next);
          }
        });
      });

      carousel.addEventListener("mouseenter", stop);
      carousel.addEventListener("mouseleave", start);
      carousel.addEventListener("focusin", stop);
      carousel.addEventListener("focusout", start);

      setActive(0);
      start();
    }
  };

  const initNewsAccordion = () => {
    const columns = Array.from(document.querySelectorAll(".category-news [data-news-collapsible]"));
    if (!columns.length) {
      return;
    }
    const entries = columns
      .map((column) => ({
        column,
        toggle: column.querySelector("[data-news-toggle]"),
        text: column.querySelector(".news-column-toggle-text"),
      }))
      .filter((entry) => entry.toggle);

    const setOpen = (entry, open) => {
      entry.column.classList.toggle("is-open", open);
      entry.toggle.setAttribute("aria-expanded", open ? "true" : "false");
      if (entry.text) {
        entry.text.textContent = open ? "收起" : "展开";
      }
    };

    entries.forEach((entry) => {
      setOpen(entry, false);
      entry.toggle.addEventListener("click", (event) => {
        event.preventDefault();
        const nextOpen = !entry.column.classList.contains("is-open");
        setOpen(entry, nextOpen);
      });
    });
  };

  const syncNewsLayout1Height = () => {
    const modules = document.querySelectorAll(".news-module.layout-1");
    const allowSync = window.matchMedia("(min-width: 901px)").matches;
    modules.forEach((module) => {
      const list = module.querySelector(".news-list");
      const carousel = module.querySelector(".news-carousel");
      if (!list || !carousel) {
        return;
      }
      if (!allowSync) {
        module.style.removeProperty("--news-carousel-h");
        carousel.classList.remove("is-synced");
        return;
      }
      const height = list.getBoundingClientRect().height;
      if (height <= 0) {
        module.style.removeProperty("--news-carousel-h");
        carousel.classList.remove("is-synced");
        return;
      }
      module.style.setProperty("--news-carousel-h", `${Math.round(height)}px`);
      carousel.classList.add("is-synced");
    });
  };

  const syncNewsLayout2Height = () => {
    const modules = document.querySelectorAll(".news-module.layout-3");
    modules.forEach((module) => {
      const rightItem = module.querySelector(".news-right-item");
      if (!rightItem) {
        return;
      }
      const height = rightItem.getBoundingClientRect().height;
      const rightList = module.querySelector(".news-right-list");
      const gapValue = rightList
        ? getComputedStyle(rightList).rowGap || getComputedStyle(rightList).gap
        : "0px";
      const gap = Number.parseFloat(gapValue) || 0;
      const blockHeight = height + gap;
      if (blockHeight > 0) {
        module.style.setProperty("--news-right-block-h", `${Math.round(blockHeight)}px`);
      }
    });
  };

  const syncNewsLayoutEqualHeight = () => {
    const modules = document.querySelectorAll(".news-module.layout-2");
    modules.forEach((module) => {
      const column = module.querySelector(".news-column--equal");
      const list = module.querySelector(".news-eq-list");
      if (!column || !list) {
        return;
      }
      if (!window.matchMedia("(min-width: 901px)").matches) {
        module.style.removeProperty("--news-eq-unit");
        return;
      }
      const width = column.getBoundingClientRect().width;
      if (!width) {
        return;
      }
      const styles = getComputedStyle(list);
      const gapValue = styles.rowGap || styles.gap || "0px";
      const gap = Number.parseFloat(gapValue) || 0;
      const unit = width / 6 - gap;
      if (unit > 0) {
        module.style.setProperty("--news-eq-unit", `${Math.round(unit)}px`);
        module.style.setProperty("--news-eq-gap", `${Math.round(gap)}px`);
      }
    });
  };

  const syncNewsLayouts = () => {
    syncNewsLayout1Height();
    syncNewsLayoutEqualHeight();
    syncNewsLayout2Height();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initNewsAccordion();
      initNewsCarousel().then(syncNewsLayouts);
    });
  } else {
    initNewsAccordion();
    initNewsCarousel().then(syncNewsLayouts);
  }
  window.addEventListener("resize", () => {
    syncNewsLayouts();
  });
})();
