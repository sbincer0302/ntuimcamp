(function () {
  "use strict";

  const STORAGE_KEY = "portfolio-theme";
  const header = document.querySelector(".site-header");
  const navToggle = document.getElementById("nav-toggle");
  const siteNav = document.getElementById("site-nav");
  const themeToggle = document.getElementById("theme-toggle");
  const yearEl = document.getElementById("year");

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
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  }

  function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
    } else {
      root.removeAttribute("data-theme");
    }
    if (themeToggle) {
      themeToggle.setAttribute(
        "aria-label",
        theme === "dark" ? "切換為淺色主題" : "切換為深色主題"
      );
    }
  }

  function initTheme() {
    const stored = getStoredTheme();
    const theme = stored === "light" || stored === "dark" ? stored : getPreferredTheme();
    applyTheme(theme);
  }

  function toggleTheme() {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const next = isDark ? "light" : "dark";
    applyTheme(next);
    setStoredTheme(next);
  }

  function closeNav() {
    if (!header || !navToggle) return;
    header.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "開啟選單");
  }

  function openNav() {
    if (!header || !navToggle) return;
    header.classList.add("is-open");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "關閉選單");
  }

  function toggleNav() {
    if (!header || !navToggle) return;
    if (header.classList.contains("is-open")) {
      closeNav();
    } else {
      openNav();
    }
  }

  function initNavToggle() {
    if (!navToggle || !header) return;
    navToggle.addEventListener("click", toggleNav);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });

    window.addEventListener("resize", function () {
      if (window.matchMedia("(min-width: 768px)").matches) {
        closeNav();
      }
    });
  }

  function scrollToSection(id) {
    if (!id || id === "#") return;
    const target = document.querySelector(id);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    closeNav();
    if (history.replaceState) {
      history.replaceState(null, "", id);
    }
  }

  function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(function (anchor) {
      anchor.addEventListener("click", function (e) {
        const id = anchor.getAttribute("href");
        if (!id || id === "#") return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        scrollToSection(id);
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
      { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.1 }
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

  const DOG_API = "https://dog.ceo/api/breeds/image/random";

  function initRandomDog() {
    const btn = document.getElementById("dog-btn");
    const viewer = document.getElementById("dog-viewer");
    const loading = document.getElementById("dog-loading");
    const img = document.getElementById("dog-image");
    const placeholder = document.getElementById("dog-placeholder");
    const errorEl = document.getElementById("dog-error");

    if (!btn || !viewer || !img) return;

    function setLoading(isLoading) {
      viewer.classList.toggle("is-loading", isLoading);
      viewer.setAttribute("aria-busy", String(isLoading));
      btn.disabled = isLoading;
      if (loading) loading.hidden = !isLoading;
    }

    function showError(message) {
      if (!errorEl) return;
      errorEl.textContent = message;
      errorEl.hidden = false;
    }

    function clearError() {
      if (errorEl) errorEl.hidden = true;
    }

    function loadImage(url) {
      return new Promise(function (resolve, reject) {
        const preload = new Image();
        preload.onload = function () {
          resolve(url);
        };
        preload.onerror = function () {
          reject(new Error("圖片載入失敗，請再試一次"));
        };
        preload.src = url;
      });
    }

    async function fetchRandomDog() {
      clearError();
      setLoading(true);
      img.classList.remove("is-loaded");

      if (placeholder) placeholder.hidden = true;

      try {
        const response = await fetch(DOG_API);
        if (!response.ok) {
          throw new Error("無法連線至狗狗 API，請稍後再試");
        }

        const data = await response.json();
        if (data.status !== "success" || !data.message) {
          throw new Error("API 回傳資料異常");
        }

        const imageUrl = await loadImage(data.message);
        img.src = imageUrl;
        img.alt = "隨機狗狗照片";
        img.hidden = false;
        img.classList.add("is-loaded");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "載入失敗，請稍後再試";
        showError(message);
        if (!img.src && placeholder) {
          placeholder.hidden = false;
        }
      } finally {
        setLoading(false);
      }
    }

    btn.addEventListener("click", fetchRandomDog);
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
    initRandomDog();
  });
})();
