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

  const scheduleSection = document.querySelector("[data-schedule-section]");
  if (scheduleSection) {
    const scheduleTag = scheduleSection.dataset.scheduleTag || "";
    const dataRoot = scheduleSection.querySelector("[data-schedule-items]");
    const listBody = scheduleSection.querySelector("[data-schedule-body]");
    const emptyState = scheduleSection.querySelector("[data-schedule-empty]");
    const listTitle = scheduleSection.querySelector("[data-schedule-title]");
    const listSubtitle = scheduleSection.querySelector("[data-schedule-subtitle]");
    const calTitle = scheduleSection.querySelector("[data-cal-title]");
    const calPicker = scheduleSection.querySelector("[data-cal-picker]");
    const calYear = scheduleSection.querySelector("[data-cal-year]");
    const calMonth = scheduleSection.querySelector("[data-cal-month]");
    const calApply = scheduleSection.querySelector("[data-cal-apply]");
    const calGrid = scheduleSection.querySelector("[data-cal-grid]");
    const calPrev = scheduleSection.querySelector("[data-cal-prev]");
    const calNext = scheduleSection.querySelector("[data-cal-next]");
    const calToday = scheduleSection.querySelector("[data-cal-today]");
    const calReset = scheduleSection.querySelector("[data-cal-reset]");
    const scheduleCalendar = scheduleSection.querySelector("[data-schedule-calendar]");
    const scheduleList = scheduleSection.querySelector(".schedule-list");
    const dataItems = dataRoot
      ? Array.from(dataRoot.querySelectorAll("[data-schedule-item]"))
      : [];

    const pad = (value) => String(value).padStart(2, "0");
    const toDateKey = (date) =>
      `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    const parseDateValue = (value) => {
      if (!value) {
        return null;
      }
      const trimmed = String(value).trim();
      if (!trimmed) {
        return null;
      }
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        return new Date(`${trimmed}T00:00:00`);
      }
      const parsed = new Date(trimmed);
      if (Number.isNaN(parsed.getTime())) {
        return null;
      }
      return parsed;
    };
    const startOfWeek = (date) => {
      const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const offset = (copy.getDay() + 6) % 7;
      copy.setDate(copy.getDate() - offset);
      copy.setHours(0, 0, 0, 0);
      return copy;
    };
    const addDays = (date, days) => {
      const copy = new Date(date);
      copy.setDate(copy.getDate() + days);
      return copy;
    };

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const maxDate = new Date(now);
    maxDate.setDate(maxDate.getDate() + 365);

    const decodeHtml = (value) => {
      if (!value) {
        return "";
      }
      const textarea = document.createElement("textarea");
      textarea.innerHTML = value;
      return textarea.value || "";
    };

    const normalizeText = (value) => value.replace(/\s+/g, " ").trim();

    const stripHtmlText = (content) => {
      if (!content) {
        return "";
      }
      const holder = document.createElement("div");
      holder.innerHTML = decodeHtml(content);
      holder.querySelectorAll("script, style, noscript, template").forEach((node) => {
        node.remove();
      });
      const text = normalizeText(holder.textContent || "");
      if (!text || text === "null") {
        return "";
      }
      return text;
    };

    const stripMarkdownText = (raw) => {
      if (!raw) {
        return "";
      }
      let text = raw;
      text = text.replace(/```[\s\S]*?```/g, " ");
      text = text.replace(/`[^`]*`/g, " ");
      text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1");
      text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
      text = text.replace(/^\s{0,3}#{1,6}\s*/gm, "");
      text = text.replace(/^\s*>\s?/gm, "");
      text = text.replace(/^\s*[-*+]\s+/gm, "");
      text = text.replace(/^\s*\d+\.\s+/gm, "");
      text = normalizeText(text);
      if (!text || text === "null") {
        return "";
      }
      return text;
    };

    const buildSummary = (summary, content, raw, limit = 200) => {
      if (summary) {
        return summary;
      }
      const htmlText = stripHtmlText(content) || stripHtmlText(raw);
      const text = htmlText || stripMarkdownText(raw);
      if (!text) {
        return "";
      }
      return text.length > limit ? `${text.slice(0, limit)}...` : text;
    };

    const events = dataItems
      .map((item) => {
        const startRaw = item.dataset.start;
        const endRaw = item.dataset.end;
        const start = parseDateValue(startRaw);
        const pinned = item.dataset.pinned === "true";
        const summary = buildSummary(
          item.dataset.summary || "",
          item.dataset.content || "",
          item.dataset.raw || "",
          200
        );
        if (!start) {
          return {
            title: item.dataset.title || "",
            author: item.dataset.author || "",
            summary,
            link: item.dataset.link || "",
            start: null,
            end: null,
            startDay: null,
            endDay: null,
            timeLabel: "未定义",
            isUndated: true,
            pinned,
          };
        }
        const end = parseDateValue(endRaw) || start;
        const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
        if (endDay < startDay) {
          endDay.setTime(startDay.getTime());
        }
        const hasTime = /\d{2}:\d{2}/.test(startRaw || "");
        const timeLabel = hasTime ? `${pad(start.getHours())}:${pad(start.getMinutes())}` : "";
        return {
          title: item.dataset.title || "",
          author: item.dataset.author || "",
          summary,
          link: item.dataset.link || "",
          start,
          end,
          startDay,
          endDay,
          timeLabel,
          isUndated: false,
          pinned,
        };
      })
      .sort((a, b) => {
        if (a.isUndated && b.isUndated) {
          return 0;
        }
        if (a.isUndated) {
          return 1;
        }
        if (b.isUndated) {
          return -1;
        }
        return a.start - b.start;
      });

    const nowYear = now.getFullYear();
    let minYear = nowYear - 5;
    let maxYear = nowYear + 5;
    events.forEach((event) => {
      if (event.isUndated || !event.start) {
        return;
      }
      const startYear = event.start.getFullYear();
      const endYear = event.end ? event.end.getFullYear() : startYear;
      minYear = Math.min(minYear, startYear, endYear);
      maxYear = Math.max(maxYear, startYear, endYear);
    });

    const upcomingEvents = events.filter((event) => {
      if (event.isUndated) {
        return true;
      }
      return event.endDay >= now && event.startDay <= maxDate;
    });

    const eventsByDate = new Map();
    const pinnedDates = new Set();
    events.filter((event) => !event.isUndated).forEach((event) => {
      const cursor = new Date(event.startDay);
      while (cursor <= event.endDay) {
        const key = toDateKey(cursor);
        if (!eventsByDate.has(key)) {
          eventsByDate.set(key, []);
        }
        eventsByDate.get(key).push(event);
        if (event.pinned) {
          pinnedDates.add(key);
        }
        cursor.setDate(cursor.getDate() + 1);
      }
    });

    const formatDateLabel = (dateKey) => dateKey;

    const setPickerOpen = (open) => {
      if (!calPicker || !calTitle) {
        return;
      }
      calPicker.classList.toggle("is-open", open);
      calTitle.setAttribute("aria-expanded", open ? "true" : "false");
    };

    const updatePickerOptions = () => {
      if (!calYear || !calMonth) {
        return;
      }
      if (!calYear.options.length) {
        for (let year = minYear; year <= maxYear; year += 1) {
          const option = document.createElement("option");
          option.value = String(year);
          option.textContent = String(year);
          calYear.appendChild(option);
        }
      }
      if (!calMonth.options.length) {
        for (let month = 1; month <= 12; month += 1) {
          const option = document.createElement("option");
          option.value = pad(month);
          option.textContent = pad(month);
          calMonth.appendChild(option);
        }
      }
      calYear.value = String(viewDate.getFullYear());
      calMonth.value = pad(viewDate.getMonth() + 1);
    };

    const setEmpty = (text) => {
      if (!emptyState) {
        return;
      }
      emptyState.textContent = text;
      emptyState.style.display = "block";
      if (listBody) {
        listBody.innerHTML = "";
      }
    };

    const clearEmpty = () => {
      if (emptyState) {
        emptyState.style.display = "none";
      }
    };

    const syncScheduleHeight = () => {
      if (!scheduleCalendar || !scheduleList) {
        return;
      }
      if (!window.matchMedia("(min-width: 901px)").matches) {
        scheduleList.style.height = "";
        scheduleList.style.maxHeight = "";
        return;
      }
      const height = scheduleCalendar.offsetHeight;
      if (!height) {
        requestAnimationFrame(syncScheduleHeight);
        return;
      }
      scheduleList.style.height = `${height}px`;
      scheduleList.style.maxHeight = `${height}px`;
      scheduleList.style.setProperty("--schedule-list-height", `${height}px`);
    };

    const renderList = (selectedDateKey) => {
      if (!listBody) {
        return;
      }
      listBody.innerHTML = "";
      if (scheduleList) {
        scheduleList.setAttribute("data-list-mode", selectedDateKey ? "day" : "upcoming");
      }
      let items = [];
      if (selectedDateKey) {
        items = events.filter(
          (event) =>
            !event.isUndated &&
            selectedDateKey >= toDateKey(event.startDay) &&
            selectedDateKey <= toDateKey(event.endDay)
        );
        if (listTitle) {
          listTitle.textContent = `Schedule: ${selectedDateKey}`;
        }
        if (listSubtitle) {
          listSubtitle.textContent = "";
        }
      } else {
        items = upcomingEvents;
        if (listTitle) {
          listTitle.textContent = "Upcoming";
        }
        if (listSubtitle) {
          listSubtitle.textContent = `From ${toDateKey(now)} to ${toDateKey(maxDate)}`;
        }
      }

      if (!items.length) {
        if (!scheduleTag) {
          setEmpty("Schedule tag not set");
        } else {
          setEmpty("No schedule");
        }
        return;
      }

      clearEmpty();
      let currentGroup = "";
      let groupEl = null;
      items.forEach((event) => {
        const groupKey = event.isUndated
          ? "undated"
          : selectedDateKey || event.startDay >= now
            ? toDateKey(event.startDay)
            : toDateKey(now);
        if (!selectedDateKey && groupKey !== currentGroup) {
          currentGroup = groupKey;
          groupEl = document.createElement("li");
          groupEl.className = "schedule-group";
          const dateLabel = document.createElement("div");
          dateLabel.className = "schedule-date";
          dateLabel.textContent = groupKey === "undated" ? "未定义" : formatDateLabel(groupKey);
          groupEl.appendChild(dateLabel);
          listBody.appendChild(groupEl);
        }

        const itemEl = document.createElement("a");
        itemEl.className = "schedule-item";
        if (event.pinned) {
          itemEl.classList.add("is-pinned");
        }
        if (event.link) {
          itemEl.href = event.link;
        } else {
          itemEl.href = "javascript:void(0)";
        }
        if (event.summary) {
          itemEl.title = event.summary;
        }

        const titleEl = document.createElement("div");
        titleEl.className = "schedule-item-title";
        titleEl.textContent = event.title || "Untitled";
        itemEl.appendChild(titleEl);

        const metaEl = document.createElement("div");
        metaEl.className = "schedule-item-meta";
        if (event.timeLabel) {
          const timeEl = document.createElement("span");
          timeEl.textContent = event.timeLabel;
          metaEl.appendChild(timeEl);
        }
        if (event.author) {
          const authorEl = document.createElement("span");
          authorEl.textContent = event.author;
          metaEl.appendChild(authorEl);
        }
        itemEl.appendChild(metaEl);

        if (selectedDateKey && event.summary) {
          const summaryEl = document.createElement("div");
          summaryEl.className = "schedule-item-summary";
          summaryEl.textContent = event.summary;
          itemEl.appendChild(summaryEl);
        }

        if (selectedDateKey) {
          listBody.appendChild(itemEl);
        } else if (groupEl) {
          groupEl.appendChild(itemEl);
        }
      });
    };

    let selectedDateKey = null;
    let viewDate = new Date(now.getFullYear(), now.getMonth(), 1);
    let viewStartDate = startOfWeek(viewDate);

    const renderCalendar = () => {
      if (!calGrid || !calTitle) {
        return;
      }
      calGrid.innerHTML = "";
      calTitle.textContent = `${viewDate.getFullYear()}-${pad(viewDate.getMonth() + 1)}`;
      updatePickerOptions();
      const totalCells = 42;
      const focusMonth = viewDate.getMonth();
      const focusYear = viewDate.getFullYear();

      for (let index = 0; index < totalCells; index += 1) {
        const cellDate = addDays(viewStartDate, index);

        const dayKey = toDateKey(cellDate);
        const button = document.createElement("button");
        button.type = "button";
        button.className = "schedule-day";
        button.textContent = String(cellDate.getDate());
        button.dataset.date = dayKey;
        if (cellDate.getMonth() !== focusMonth || cellDate.getFullYear() !== focusYear) {
          button.classList.add("is-outside");
        }
        if (dayKey === toDateKey(now)) {
          button.classList.add("is-today");
        }
        if (eventsByDate.has(dayKey)) {
          button.classList.add("has-events");
        }
        if (pinnedDates.has(dayKey)) {
          button.classList.add("is-pinned");
        }
        if (selectedDateKey && dayKey === selectedDateKey) {
          button.classList.add("is-selected");
        }
        calGrid.appendChild(button);
      }
    };

    if (calGrid) {
      calGrid.addEventListener("click", (event) => {
        const target = event.target;
        if (!target || !target.dataset || !target.dataset.date) {
          return;
        }
        selectedDateKey = target.dataset.date;
        renderCalendar();
        renderList(selectedDateKey);
      });
    }

    if (scheduleCalendar) {
      let pendingWeekShift = 0;
      let wheelFrame = null;
      scheduleCalendar.addEventListener(
        "wheel",
        (event) => {
          if (event.deltaY === 0) {
            return;
          }
          event.preventDefault();
          pendingWeekShift += event.deltaY > 0 ? 1 : -1;
          if (wheelFrame) {
            return;
          }
          wheelFrame = requestAnimationFrame(() => {
            const step = pendingWeekShift;
            pendingWeekShift = 0;
            viewStartDate = addDays(viewStartDate, step * 7);
            viewDate = new Date(viewStartDate.getFullYear(), viewStartDate.getMonth(), 1);
            renderCalendar();
            wheelFrame = null;
          });
        },
        { passive: false }
      );
    }

    if (calTitle) {
      calTitle.addEventListener("click", (event) => {
        event.preventDefault();
        if (!calPicker) {
          return;
        }
        setPickerOpen(!calPicker.classList.contains("is-open"));
      });
    }

    if (calApply) {
      calApply.addEventListener("click", () => {
        if (!calYear || !calMonth) {
          return;
        }
        const nextYear = Number.parseInt(calYear.value, 10);
        const nextMonth = Number.parseInt(calMonth.value, 10) - 1;
        if (!Number.isNaN(nextYear) && !Number.isNaN(nextMonth)) {
          viewDate = new Date(nextYear, nextMonth, 1);
          viewStartDate = startOfWeek(viewDate);
          if (selectedDateKey) {
            const [selectedYear, selectedMonth] = selectedDateKey.split("-").map(Number);
            if (selectedYear !== nextYear || selectedMonth !== nextMonth + 1) {
              selectedDateKey = null;
              renderList(null);
            }
          }
          renderCalendar();
        }
        setPickerOpen(false);
      });
    }

    document.addEventListener("click", (event) => {
      if (!calPicker || !calTitle) {
        return;
      }
      if (
        calPicker.classList.contains("is-open") &&
        !calPicker.contains(event.target) &&
        !calTitle.contains(event.target)
      ) {
        setPickerOpen(false);
      }
    });

    if (calPrev) {
      calPrev.addEventListener("click", () => {
        viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
        viewStartDate = startOfWeek(viewDate);
        renderCalendar();
      });
    }

    if (calNext) {
      calNext.addEventListener("click", () => {
        viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
        viewStartDate = startOfWeek(viewDate);
        renderCalendar();
      });
    }

    if (calToday) {
      calToday.addEventListener("click", () => {
        selectedDateKey = toDateKey(now);
        viewDate = new Date(now.getFullYear(), now.getMonth(), 1);
        viewStartDate = startOfWeek(viewDate);
        renderCalendar();
        renderList(selectedDateKey);
      });
    }

    if (calReset) {
      calReset.addEventListener("click", () => {
        selectedDateKey = null;
        renderCalendar();
        renderList(null);
      });
    }

    if (scheduleCalendar && scheduleList && "ResizeObserver" in window) {
      const observer = new ResizeObserver(() => {
        syncScheduleHeight();
      });
      observer.observe(scheduleCalendar);
    }

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setPickerOpen(false);
      }
    });

    renderCalendar();
    renderList(null);
    requestAnimationFrame(syncScheduleHeight);

    window.addEventListener("resize", () => {
      requestAnimationFrame(syncScheduleHeight);
    });
  }

  const outlinePage = document.querySelector("[data-outline-page]");
  if (outlinePage) {
    const outlineContent = outlinePage.querySelector("[data-outline-content]");
    const outlineList = outlinePage.querySelector("[data-outline-list]");
    const outlineNav = outlinePage.querySelector("[data-outline-nav]");

    if (outlineContent) {
      const nodes = Array.from(outlineContent.childNodes);
      const sections = [];
      let current = null;

      const isH1 = (node) =>
        node.nodeType === Node.ELEMENT_NODE && node.tagName === "H1";

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

      if (sections.length) {
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
      } else if (outlineNav) {
        outlineNav.style.display = "none";
      }
    }
  }

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

    const applyInlineStrong = (value) =>
      value.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

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
