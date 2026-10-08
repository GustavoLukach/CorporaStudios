/* Tema sazonal: noite Corpora, paleta escura e morcegos discretos. */
(() => {
  const STORAGE_KEY = "corpora-halloween-theme-v3";
  const SETTING_KEY = "halloween";
  const body = document.body;
  const toggle = document.querySelector("[data-halloween-toggle]");
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

  function updateToggleLabel(active) {
    if (!toggle) return;
    toggle.hidden = !globalEnabled;
    toggle.textContent = active ? "Desativar tema" : "Ativar tema";
    toggle.setAttribute("aria-pressed", String(active));
    toggle.setAttribute(
      "aria-label",
      active ? "Desativar tema de Halloween" : "Ativar tema de Halloween"
    );
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
      .querySelectorAll(".gallery-item:nth-child(7n + 1), .gallery-item:nth-child(7n + 4)")
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
    updateToggleLabel(active);
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

  loadGlobalSetting();
})();
