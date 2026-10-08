/* Tema sazonal: Halloween editorial, discreto e reversível. */
(() => {
  const STORAGE_KEY = "corpora-halloween-effects";
  const SETTING_KEY = "halloween";
  const body = document.body;
  const toggle = document.querySelector("[data-halloween-toggle]");
  let globalEnabled = true;

  function visitorEnabled() {
    return window.localStorage.getItem(STORAGE_KEY) !== "off";
  }

  function updateToggleLabel(enabled) {
    if (!toggle) return;
    toggle.hidden = !globalEnabled;
    toggle.textContent = enabled ? "Desativar efeitos" : "Ativar efeitos";
    toggle.setAttribute("aria-pressed", String(enabled));
    toggle.setAttribute(
      "aria-label",
      enabled ? "Desativar efeitos de Halloween" : "Ativar efeitos de Halloween"
    );
  }

  function createAtmosphere() {
    if (document.querySelector(".halloween-atmosphere")) return;
    const layer = document.createElement("div");
    layer.className = "halloween-atmosphere";
    layer.setAttribute("aria-hidden", "true");
    for (let index = 0; index < 20; index += 1) {
      const particle = document.createElement("i");
      particle.className = "halloween-particle";
      particle.style.setProperty("--x", `${Math.round(Math.random() * 100)}%`);
      particle.style.setProperty("--delay", `${(Math.random() * 3).toFixed(2)}s`);
      particle.style.setProperty("--duration", `${(8 + Math.random() * 7).toFixed(2)}s`);
      particle.style.setProperty("--drift", `${Math.round(-35 + Math.random() * 70)}px`);
      particle.style.setProperty("--size", `${(2 + Math.random() * 3).toFixed(1)}px`);
      layer.appendChild(particle);
    }
    body.appendChild(layer);
  }

  function applyTheme() {
    const active = globalEnabled && visitorEnabled();
    body.classList.toggle("halloween-active", active);
    updateToggleLabel(active);
    if (active) createAtmosphere();
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

  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    window.localStorage.setItem(STORAGE_KEY, "off");
  }

  loadGlobalSetting();
})();
