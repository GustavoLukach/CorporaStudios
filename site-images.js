async function buscarImagemDoSite(pageName, slotName) {
  const { data, error } =
    await supabaseClient
      .from("site_images")
      .select("*")
      .eq("page_name", pageName)
      .eq("slot_name", slotName)
      .maybeSingle();

  if (error) {
    console.error("Erro ao buscar imagem:", error);
    return null;
  }

  return data;
}

async function aplicarImagem(pageName, slotName, selector) {
  const imageData =
    await buscarImagemDoSite(pageName, slotName);

  if (!imageData || !imageData.image_url) {
    return;
  }

  const element =
    document.querySelector(selector);

  if (!element) {
    return;
  }

  if (element.tagName === "IMG") {
    element.src = imageData.image_url;
    element.alt = imageData.alt_text;
  } else {
    element.style.backgroundImage =
      `url("${imageData.image_url}")`;
  }
}

/* Imagens da página inicial */
if (document.body.dataset.page === "home") {
  aplicarImagem(
    "home",
    "hero_principal",
    "#image-home-hero"
  );
}

/* Imagens da página Sobre */
if (document.body.dataset.page === "sobre") {
  aplicarImagem(
    "sobre",
    "hero_sobre",
    "#image-sobre-hero"
  );

  aplicarImagem(
    "sobre",
    "olhar_1",
    "#image-sobre-olhar-1"
  );

  aplicarImagem(
    "sobre",
    "olhar_2",
    "#image-sobre-olhar-2"
  );
}

/* Imagem da página de contato */
if (document.body.dataset.page === "contato") {
  aplicarImagem(
    "contato",
    "hero_contato",
    "#image-contato-hero"
  );
}
