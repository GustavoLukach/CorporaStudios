/* Tema sazonal: noite Corpora, paleta escura e morcegos discretos. */
(() => {
  const STORAGE_KEY = "corpora-halloween-theme-v3";
  const SETTING_KEY = "halloween";
  const body = document.body;
  const toggle = document.querySelector("[data-halloween-toggle]");
  const darkToggle = document.querySelector("[data-dark-toggle]");
  const DARK_MODE_KEY = "corpora-dark-mode";
  let globalEnabled = true;

  const batSvg = `
    <svg viewBox="0 0 100 60" aria-hidden="true" focusable="false">
      <path d="M50 35C44 25 40 18 31 14L25 22 12 17 17 29 5 25 17 39C22 48 32 51 42 48L50 58 58 48C68 51 78 48 83 39L95 25 83 29 88 17 75 22 69 14C60 18 56 25 50 35Z"></path>
      <circle cx="44" cy="38" r="2"></circle>
      <circle cx="56" cy="38" r="2"></circle>
    </svg>`;

  function visitorEnabled() {
    return window.localStorage.getItem(STORAGE_KEY) !== "off";
  }

  function darkModeEnabled() {
    return window.localStorage.getItem(DARK_MODE_KEY) === "on";
  }

  function updateDarkToggle() {
    if (!darkToggle) return;
    const active = darkModeEnabled();
    darkToggle.setAttribute("aria-pressed", String(active));
    darkToggle.setAttribute(
      "aria-label",
      active ? "Desativar modo escuro" : "Ativar modo escuro"
    );
    darkToggle.title = active ? "Desativar modo escuro" : "Ativar modo escuro";
    const icon = darkToggle.querySelector("span");
    if (icon) icon.textContent = active ? "☀" : "☾";
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function setFloatingPosition(left, top) {
    if (!toggle) return;
    const margin = 10;
    const maxLeft = Math.max(margin, window.innerWidth - toggle.offsetWidth - margin);
    const maxTop = Math.max(margin, window.innerHeight - toggle.offsetHeight - margin);
    toggle.style.setProperty("left", `${clamp(left, margin, maxLeft)}px`, "important");
    toggle.style.setProperty("top", `${clamp(top, margin, maxTop)}px`, "important");
    toggle.style.setProperty("right", "auto", "important");
    toggle.style.setProperty("bottom", "auto", "important");
    positionDarkToggle();
  }

  function positionDarkToggle() {
    if (!toggle || !darkToggle || toggle.hidden) return;
    const eventRect = toggle.getBoundingClientRect();
    const darkRect = darkToggle.getBoundingClientRect();
    const left = eventRect.right - darkRect.width;
    const top = eventRect.top - darkRect.height - 8;
    const margin = 10;
    darkToggle.style.setProperty(
      "left",
      `${clamp(left, margin, window.innerWidth - darkRect.width - margin)}px`,
      "important"
    );
    darkToggle.style.setProperty(
      "top",
      `${clamp(top, margin, window.innerHeight - darkRect.height - margin)}px`,
      "important"
    );
    darkToggle.style.setProperty("right", "auto", "important");
    darkToggle.style.setProperty("bottom", "auto", "important");
  }

  function restoreFloatingPosition() {
    if (!toggle) return;
    try {
      const saved = JSON.parse(window.localStorage.getItem("corpora-halloween-toggle-position") || "null");
      if (saved && Number.isFinite(saved.left) && Number.isFinite(saved.top)) {
        setFloatingPosition(saved.left, saved.top);
      }
    } catch (error) {
      console.warn("Não foi possível restaurar a posição do tema:", error);
    }
  }

  function enableDragging(control, storageKey, onMove) {
    if (!control) return;
    let pointerId = null;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;
    let moved = false;

    control.addEventListener("pointerdown", (event) => {
      if (event.button !== undefined && event.button !== 0) return;
      const rect = control.getBoundingClientRect();
      pointerId = event.pointerId;
      startX = event.clientX;
      startY = event.clientY;
      startLeft = rect.left;
      startTop = rect.top;
      moved = false;
      control.setPointerCapture?.(pointerId);
    });

    control.addEventListener("pointermove", (event) => {
      if (pointerId !== event.pointerId) return;
      const deltaX = event.clientX - startX;
      const deltaY = event.clientY - startY;
      if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) moved = true;
      if (!moved) return;

      event.preventDefault();
      if (control === toggle) {
        setFloatingPosition(startLeft + deltaX, startTop + deltaY);
      } else {
        const margin = 10;
        control.style.setProperty("left", `${clamp(startLeft + deltaX, margin, window.innerWidth - control.offsetWidth - margin)}px`, "important");
        control.style.setProperty("top", `${clamp(startTop + deltaY, margin, window.innerHeight - control.offsetHeight - margin)}px`, "important");
        control.style.setProperty("right", "auto", "important");
        control.style.setProperty("bottom", "auto", "important");
      }
      onMove?.();
    });

    const finishDrag = (event) => {
      if (pointerId !== event.pointerId) return;
      if (moved) {
        const rect = control.getBoundingClientRect();
        window.localStorage.setItem(
          storageKey,
          JSON.stringify({ left: rect.left, top: rect.top })
        );
        control.dataset.dragged = "true";
      }
      pointerId = null;
    };

    control.addEventListener("pointerup", finishDrag);
    control.addEventListener("pointercancel", finishDrag);
    control.addEventListener("click", (event) => {
      if (control.dataset.dragged === "true") {
        event.preventDefault();
        event.stopImmediatePropagation();
        delete control.dataset.dragged;
      }
    }, true);

    window.addEventListener("resize", () => {
      const rect = control.getBoundingClientRect();
      if (control === toggle) {
        setFloatingPosition(rect.left, rect.top);
      } else {
        const margin = 10;
        control.style.setProperty("left", `${clamp(rect.left, margin, window.innerWidth - control.offsetWidth - margin)}px`, "important");
        control.style.setProperty("top", `${clamp(rect.top, margin, window.innerHeight - control.offsetHeight - margin)}px`, "important");
      }
      onMove?.();
    });
  }

  function restoreControlPosition(control, storageKey, onMove) {
    if (!control) return;
    try {
      const saved = JSON.parse(window.localStorage.getItem(storageKey) || "null");
      if (!saved || !Number.isFinite(saved.left) || !Number.isFinite(saved.top)) return;
      const margin = 10;
      control.style.setProperty("left", `${clamp(saved.left, margin, window.innerWidth - control.offsetWidth - margin)}px`, "important");
      control.style.setProperty("top", `${clamp(saved.top, margin, window.innerHeight - control.offsetHeight - margin)}px`, "important");
      control.style.setProperty("right", "auto", "important");
      control.style.setProperty("bottom", "auto", "important");
      onMove?.();
    } catch (error) {
      console.warn("Não foi possível restaurar a posição do controle:", error);
    }
  }

  function updateToggleLabel(active) {
    if (!toggle) return;
    toggle.hidden = !globalEnabled;
    toggle.textContent = active ? "Desativar tema" : "Ativar tema";
    toggle.setAttribute("aria-pressed", String(active));
    toggle.setAttribute(
      "aria-label",
      active ? "Desativar tema de Halloween" : "Ativar tema de Halloween"
    );
    positionDarkToggle();
  }

  function addBat(element, className) {
    if (!element || element.querySelector(":scope > [data-halloween-bat]")) return;
    element.style.position = "relative";
    const bat = document.createElement("span");
    bat.className = className;
    bat.dataset.halloweenBat = "true";
    bat.setAttribute("aria-hidden", "true");
    bat.innerHTML = batSvg;
    element.appendChild(bat);
  }

  function createBats() {
    document
      .querySelectorAll(".gallery-item")
      .forEach((card) => addBat(card, "halloween-bat"));

    document
      .querySelectorAll(".hero, .look-section, .process-section, .final-section, .contact-form-section")
      .forEach((section, index) => {
        if (index % 2 === 0) addBat(section, "halloween-corner-bat");
      });
  }

  function removeBats() {
    document.querySelectorAll("[data-halloween-bat]").forEach((bat) => bat.remove());
  }

  function applyTheme() {
    const active = globalEnabled && visitorEnabled();
    body.classList.toggle("halloween-active", active);
    body.classList.toggle("dark-mode", darkModeEnabled() || active);
    updateToggleLabel(active);
    updateDarkToggle();
    if (active) createBats();
    else removeBats();
  }

  async function loadGlobalSetting() {
    if (typeof supabaseClient === "undefined") {
      applyTheme();
      return;
    }

    try {
      const { data, error } = await supabaseClient
        .from("site_settings")
        .select("setting_value")
        .eq("setting_key", SETTING_KEY)
        .maybeSingle();

      if (!error && data?.setting_value) {
        globalEnabled = data.setting_value.enabled !== false;
      }
    } catch (error) {
      console.warn("Tema sazonal usando configuração padrão:", error);
    }

    applyTheme();
  }

  toggle?.addEventListener("click", () => {
    const nextEnabled = !visitorEnabled();
    window.localStorage.setItem(STORAGE_KEY, nextEnabled ? "on" : "off");
    applyTheme();
  });

  darkToggle?.addEventListener("click", () => {
    window.localStorage.setItem(
      DARK_MODE_KEY,
      darkModeEnabled() ? "off" : "on"
    );
    applyTheme();
  });

  enableDragging(
    toggle,
    "corpora-halloween-toggle-position",
    positionDarkToggle
  );
  enableDragging(darkToggle, "corpora-dark-toggle-position");
  restoreControlPosition(
    toggle,
    "corpora-halloween-toggle-position",
    positionDarkToggle
  );
  restoreControlPosition(darkToggle, "corpora-dark-toggle-position");

  document.addEventListener("gallery:loaded", () => {
    if (globalEnabled && visitorEnabled()) createBats();
  });

  loadGlobalSetting();
})();
