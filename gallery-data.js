const gallery = document.querySelector("#gallery");
const galleryMessage = document.querySelector("#gallery-message");

async function carregarGaleria() {
  if (!gallery) {
    return;
  }

  const { data: images, error } =
    await supabaseClient
      .from("gallery_images")
      .select("*")
      .order("created_at", {
        ascending: false
      });

  if (error) {
    console.error("Erro ao carregar galeria:", error);

    if (galleryMessage) {
      galleryMessage.textContent =
        "Não foi possível carregar as imagens.";
    }

    return;
  }

  if (!images || images.length === 0) {
    if (galleryMessage) {
      galleryMessage.textContent =
        "Nenhuma imagem foi adicionada ainda.";
    }

    return;
  }

  gallery.innerHTML = "";

  images.forEach((image) => {
    const item = document.createElement("div");

    item.className = "gallery-item";
    item.dataset.category = image.category;
    item.dataset.title = image.title;
    item.dataset.id = image.id;

    const imageElement = document.createElement("img");

    imageElement.src = image.image_url;
    imageElement.alt = image.alt_text;
    imageElement.loading = "lazy";

    item.appendChild(imageElement);
    gallery.appendChild(item);
  });

  document.dispatchEvent(
    new CustomEvent("gallery:loaded")
  );
}

carregarGaleria();
