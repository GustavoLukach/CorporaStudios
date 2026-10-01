const SUPABASE_URL =
  "https://zgfnfulcsebqfcnkmijf.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_A0rFdnpY_8DmQWM5raDQeA_JWFOf89T";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
 );

const gallery = document.querySelector("#gallery");
const galleryMessage = document.querySelector("#gallery-message");

async function carregarGaleria() {
  const { data: images, error } =
    await supabaseClient
      .from("gallery_images")
      .select("*")
      .order("created_at", {
        ascending: false
      });

  if (error) {
    console.error("Erro ao carregar imagens:", error);

    if (galleryMessage) {
      galleryMessage.textContent =
        "Não foi possível carregar a galeria.";
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
    const galleryItem = document.createElement("div");

    galleryItem.className = "gallery-item";
    galleryItem.dataset.category = image.category;
    galleryItem.dataset.title = image.title;
    galleryItem.dataset.id = image.id;

    const imageElement = document.createElement("img");

    imageElement.src = image.image_url;
    imageElement.alt = image.alt_text;
    imageElement.loading = "lazy";

    galleryItem.appendChild(imageElement);
    gallery.appendChild(galleryItem);
  });

  /*
    Avisa o script.js que as imagens já foram criadas.
    Isso é importante para os filtros e o lightbox funcionarem.
  */
  document.dispatchEvent(
    new CustomEvent("gallery:loaded")
  );
}

carregarGaleria();

document.dispatchEvent(
  new CustomEvent("gallery:loaded" )
);
