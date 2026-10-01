/* =========================
   FILTROS E LIGHTBOX
========================= */
function inicializarGaleria() {
  const categoryButtons = Array.from(
    document.querySelectorAll(".category-button")
  );

  const todosGalleryItems = Array.from(
    document.querySelectorAll(".gallery-item")
  );

  const lightbox =
    document.querySelector("#lightbox");

  const lightboxImage =
    document.querySelector("#lightbox-image");

  const lightboxTitle =
    document.querySelector("#lightbox-title");

  const lightboxCategory =
    document.querySelector("#lightbox-category");

  const lightboxCounter =
    document.querySelector("#lightbox-counter");

  const lightboxClose =
    document.querySelector("#lightbox-close");

  const lightboxPrev =
    document.querySelector("#lightbox-prev");

  const lightboxNext =
    document.querySelector("#lightbox-next");

  if (
    todosGalleryItems.length === 0 ||
    !lightbox
  ) {
    return;
  }

  let galleryItemsVisiveis =
    [...todosGalleryItems];

  let imagemAtual = 0;

  function atualizarFiltro(filtro) {
    const filtroNormalizado = filtro.trim().toLowerCase();

    galleryItemsVisiveis =
      todosGalleryItems.filter((item) => {
        const categoria =
          (item.dataset.category || "").trim().toLowerCase();

        return (
          filtroNormalizado === "todos" ||
          categoria === filtroNormalizado
        );
      });

    todosGalleryItems.forEach((item) => {
      item.classList.toggle(
        "hidden",
        !galleryItemsVisiveis.includes(item)
      );
    });
  }

  categoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      categoryButtons.forEach((item) => {
        item.classList.remove("active");
      });

      button.classList.add("active");

      atualizarFiltro(
        button.dataset.filter
      );
    });
  });

  function atualizarLightbox(index) {
    if (
      galleryItemsVisiveis.length === 0
    ) {
      return;
    }

    if (index < 0) {
      imagemAtual =
        galleryItemsVisiveis.length - 1;
    } else if (
      index >= galleryItemsVisiveis.length
    ) {
      imagemAtual = 0;
    } else {
      imagemAtual = index;
    }

    const item =
      galleryItemsVisiveis[imagemAtual];

    const image =
      item.querySelector("img");

    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt;

    lightboxTitle.textContent =
      item.dataset.title || image.alt;

    lightboxCategory.textContent =
      item.dataset.category || "Galeria";

    lightboxCounter.textContent =
      `${imagemAtual + 1} / ${galleryItemsVisiveis.length}`;
  }

  function abrirLightbox(index) {
    atualizarLightbox(index);

    lightbox.classList.add("active");
    lightbox.setAttribute(
      "aria-hidden",
      "false"
    );

    document.body.classList.add(
      "lightbox-aberto"
    );
  }

  function fecharLightbox() {
    lightbox.classList.remove("active");
    lightbox.setAttribute(
      "aria-hidden",
      "true"
    );

    document.body.classList.remove(
      "lightbox-aberto"
    );
  }

  todosGalleryItems.forEach((item) => {
    item.addEventListener("click", () => {
      const index =
        galleryItemsVisiveis.indexOf(item);

      if (index !== -1) {
        abrirLightbox(index);
      }
    });
  });

  lightboxClose.addEventListener(
    "click",
    fecharLightbox
  );

  lightboxPrev.addEventListener("click", () => {
    atualizarLightbox(imagemAtual - 1);
  });

  lightboxNext.addEventListener("click", () => {
    atualizarLightbox(imagemAtual + 1);
  });

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      fecharLightbox();
    }
  });
}

document.addEventListener(
  "gallery:loaded",
  inicializarGaleria
);
