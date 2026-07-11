(function () {
  "use strict";

  const STORAGE_KEY = "portfolio-theme";
  const navToggle = document.getElementById("nav-toggle");
  const themeToggle = document.getElementById("theme-toggle");
  const yearEl = document.getElementById("year");
  const clockEl = document.getElementById("taskbar-clock");
  const easterEgg = document.getElementById("easter-egg");
  const easterEggClose = document.getElementById("easter-egg-close");
  const menubarLogo = document.querySelector(".menubar-logo");
  let logoClickCount = 0;

  function getStoredTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }

  function setStoredTheme(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
  }

  function getPreferredTheme() {
    if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      return "light";
    }
    return "dark";
  }

  function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === "light") {
      root.setAttribute("data-theme", "light");
    } else {
      root.removeAttribute("data-theme");
    }
    if (themeToggle) {
      themeToggle.setAttribute(
        "aria-label",
        theme === "light" ? "切換為深色主題" : "切換為淺色主題"
      );
    }
  }

  function initTheme() {
    const stored = getStoredTheme();
    const theme =
      stored === "light" || stored === "dark" ? stored : getPreferredTheme();
    applyTheme(theme);
  }

  function toggleTheme() {
    const isLight =
      document.documentElement.getAttribute("data-theme") === "light";
    const next = isLight ? "dark" : "light";
    applyTheme(next);
    setStoredTheme(next);
  }

  function closeNav() {
    document.body.classList.remove("is-nav-open");
    if (navToggle) {
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "開啟選單");
    }
  }

  function openNav() {
    document.body.classList.add("is-nav-open");
    if (navToggle) {
      navToggle.setAttribute("aria-expanded", "true");
      navToggle.setAttribute("aria-label", "關閉選單");
    }
  }

  function toggleNav() {
    if (document.body.classList.contains("is-nav-open")) {
      closeNav();
    } else {
      openNav();
    }
  }

  function initNavToggle() {
    if (!navToggle) return;
    navToggle.addEventListener("click", toggleNav);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeNav();
        hideEasterEgg();
      }
    });

    window.addEventListener("resize", function () {
      if (window.matchMedia("(min-width: 768px)").matches) {
        closeNav();
      }
    });
  }

  function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]:not(.skip-link)');
    links.forEach(function (anchor) {
      anchor.addEventListener("click", function (e) {
        const id = anchor.getAttribute("href");
        if (!id || id === "#") return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        closeNav();
        if (history.replaceState) {
          history.replaceState(null, "", id);
        }
      });
    });

    document.querySelectorAll(".desktop-icon").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const target = document.querySelector(btn.dataset.target);
        if (!target) return;
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  function initReveal() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.querySelectorAll(".reveal").forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    const elements = document.querySelectorAll(".reveal");
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    elements.forEach(function (el) {
      observer.observe(el);
    });
  }

  function initYear() {
    if (yearEl) {
      yearEl.textContent = String(new Date().getFullYear());
    }
  }

  function updateClock() {
    if (!clockEl) return;
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    clockEl.textContent = hours + ":" + minutes;
  }

  function initClock() {
    updateClock();
    setInterval(updateClock, 30000);
  }

  function focusWindow(windowEl) {
    document.querySelectorAll(".window").forEach(function (w) {
      w.classList.remove("is-focused");
    });
    windowEl.classList.add("is-focused");
  }

  function initWindowFocus() {
    const windows = document.querySelectorAll(".window[data-window]");
    if (!windows.length) return;

    windows[0].classList.add("is-focused");

    windows.forEach(function (windowEl) {
      windowEl.addEventListener("mousedown", function () {
        focusWindow(windowEl);
      });
    });
  }

  function initDraggableWindows() {
    if (window.matchMedia("(max-width: 767px)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    document.querySelectorAll(".window[data-window]").forEach(function (windowEl) {
      windowEl.classList.add("is-draggable");
      const handle = windowEl.querySelector("[data-drag-handle]");
      if (!handle) return;

      let startX = 0;
      let startY = 0;
      let posX = 0;
      let posY = 0;
      let dragging = false;

      function onPointerDown(e) {
        if (e.button !== 0) return;
        dragging = true;
        windowEl.classList.add("is-dragging");
        focusWindow(windowEl);
        startX = e.clientX;
        startY = e.clientY;
        windowEl.style.position = "relative";
        windowEl.style.zIndex = "10";
        handle.setPointerCapture(e.pointerId);
        e.preventDefault();
      }

      function onPointerMove(e) {
        if (!dragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        windowEl.style.transform =
          "translate(" + (posX + dx) + "px, " + (posY + dy) + "px)";
      }

      function onPointerUp(e) {
        if (!dragging) return;
        dragging = false;
        posX += e.clientX - startX;
        posY += e.clientY - startY;
        windowEl.classList.remove("is-dragging");
        windowEl.style.transform =
          "translate(" + posX + "px, " + posY + "px)";
        handle.releasePointerCapture(e.pointerId);
      }

      handle.addEventListener("pointerdown", onPointerDown);
      handle.addEventListener("pointermove", onPointerMove);
      handle.addEventListener("pointerup", onPointerUp);
      handle.addEventListener("pointercancel", onPointerUp);
    });
  }

  function showEasterEgg() {
    if (!easterEgg) return;
    easterEgg.hidden = false;
    focusWindow(easterEgg);
  }

  function hideEasterEgg() {
    if (!easterEgg) return;
    easterEgg.hidden = true;
  }

  function initEasterEgg() {
    if (menubarLogo) {
      menubarLogo.addEventListener("click", function (e) {
        logoClickCount += 1;
        if (logoClickCount >= 5) {
          e.preventDefault();
          showEasterEgg();
          logoClickCount = 0;
        }
      });
    }

    if (easterEggClose) {
      easterEggClose.addEventListener("click", hideEasterEgg);
    }

    document.addEventListener("keydown", function (e) {
      if (e.key === "?" && e.shiftKey) {
        showEasterEgg();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initTheme();
    if (themeToggle) {
      themeToggle.addEventListener("click", toggleTheme);
    }
    initNavToggle();
    initSmoothScroll();
    initReveal();
    initYear();
    initClock();
    initWindowFocus();
    initDraggableWindows();
    initEasterEgg();
  });
})();
