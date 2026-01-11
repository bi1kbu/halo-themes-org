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
    const calGrid = scheduleSection.querySelector("[data-cal-grid]");
    const calPrev = scheduleSection.querySelector("[data-cal-prev]");
    const calNext = scheduleSection.querySelector("[data-cal-next]");
    const calToday = scheduleSection.querySelector("[data-cal-today]");
    const calReset = scheduleSection.querySelector("[data-cal-reset]");
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

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const maxDate = new Date(now);
    maxDate.setDate(maxDate.getDate() + 365);

    const events = dataItems
      .map((item) => {
        const startRaw = item.dataset.start;
        const endRaw = item.dataset.end;
        const start = parseDateValue(startRaw);
        if (!start) {
          return {
            title: item.dataset.title || "",
            author: item.dataset.author || "",
            summary: item.dataset.summary || "",
            link: item.dataset.link || "",
            start: null,
            end: null,
            startDay: null,
            endDay: null,
            timeLabel: "未定义",
            isUndated: true,
          };
        }
        const end = parseDateValue(endRaw) || start;
        const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
        if (endDay < startDay) {
          endDay.setTime(startDay.getTime());
        }
        const hasTime = /\d{2}:\d{2}/.test(startRaw || "");
        const timeLabel = hasTime ? `${pad(start.getHours())}:${pad(start.getMinutes())}` : "All day";
        return {
          title: item.dataset.title || "",
          author: item.dataset.author || "",
          summary: item.dataset.summary || "",
          link: item.dataset.link || "",
          start,
          end,
          startDay,
          endDay,
          timeLabel,
          isUndated: false,
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

    const upcomingEvents = events.filter((event) => {
      if (event.isUndated) {
        return true;
      }
      return event.endDay >= now && event.startDay <= maxDate;
    });

    const eventsByDate = new Map();
    events.filter((event) => !event.isUndated).forEach((event) => {
      const cursor = new Date(event.startDay);
      while (cursor <= event.endDay) {
        const key = toDateKey(cursor);
        if (!eventsByDate.has(key)) {
          eventsByDate.set(key, []);
        }
        eventsByDate.get(key).push(event);
        cursor.setDate(cursor.getDate() + 1);
      }
    });

    const formatDateLabel = (dateKey) => dateKey;

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

    const renderList = (selectedDateKey) => {
      if (!listBody) {
        return;
      }
      listBody.innerHTML = "";
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
        const timeEl = document.createElement("span");
        timeEl.textContent = event.timeLabel;
        metaEl.appendChild(timeEl);
        if (event.author) {
          const authorEl = document.createElement("span");
          authorEl.textContent = event.author;
          metaEl.appendChild(authorEl);
        }
        itemEl.appendChild(metaEl);

        if (selectedDateKey) {
          listBody.appendChild(itemEl);
        } else if (groupEl) {
          groupEl.appendChild(itemEl);
        }
      });
    };

    let selectedDateKey = null;
    let viewDate = new Date(now.getFullYear(), now.getMonth(), 1);

    const renderCalendar = () => {
      if (!calGrid || !calTitle) {
        return;
      }
      calGrid.innerHTML = "";
      calTitle.textContent = `${viewDate.getFullYear()}-${pad(viewDate.getMonth() + 1)}`;
      const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
      const startOffset = (firstDay.getDay() + 6) % 7;
      const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
      const prevMonthDays = new Date(viewDate.getFullYear(), viewDate.getMonth(), 0).getDate();
      const totalCells = 42;

      for (let index = 0; index < totalCells; index += 1) {
        const dayOffset = index - startOffset + 1;
        let cellDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), dayOffset);
        if (dayOffset <= 0) {
          cellDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, prevMonthDays + dayOffset);
        } else if (dayOffset > daysInMonth) {
          cellDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, dayOffset - daysInMonth);
        }

        const dayKey = toDateKey(cellDate);
        const button = document.createElement("button");
        button.type = "button";
        button.className = "schedule-day";
        button.textContent = String(cellDate.getDate());
        button.dataset.date = dayKey;
        if (cellDate.getMonth() !== viewDate.getMonth()) {
          button.classList.add("is-outside");
        }
        if (dayKey === toDateKey(now)) {
          button.classList.add("is-today");
        }
        if (eventsByDate.has(dayKey)) {
          button.classList.add("has-events");
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
        const selectedDate = new Date(selectedDateKey + "T00:00:00");
        viewDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        renderCalendar();
        renderList(selectedDateKey);
      });
    }

    if (calPrev) {
      calPrev.addEventListener("click", () => {
        viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
        renderCalendar();
      });
    }

    if (calNext) {
      calNext.addEventListener("click", () => {
        viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
        renderCalendar();
      });
    }

    if (calToday) {
      calToday.addEventListener("click", () => {
        selectedDateKey = toDateKey(now);
        viewDate = new Date(now.getFullYear(), now.getMonth(), 1);
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

    renderCalendar();
    renderList(null);
  }
})();
