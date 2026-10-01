/* =========================
   MENU HAMBÚRGUER
========================= */

const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

function fecharMenu() {
  if (!menuToggle || !navLinks) {
    return;
  }

  navLinks.classList.remove("active");

  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Abrir menu");

  document.body.classList.remove("menu-aberto");
}

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const menuAberto = navLinks.classList.toggle("active");

    menuToggle.setAttribute("aria-expanded", String(menuAberto));
    menuToggle.setAttribute(
      "aria-label",
      menuAberto ? "Fechar menu" : "Abrir menu"
    );

    document.body.classList.toggle("menu-aberto", menuAberto);
  });

  const linksDoMenu = navLinks.querySelectorAll("a");

  linksDoMenu.forEach((link) => {
    link.addEventListener("click", fecharMenu);
  });
}


/* =========================
   FILTROS DA GALERIA
========================= */

const categoryButtons = Array.from(
  document.querySelectorAll(".category-button")
);

const todosGalleryItems = Array.from(
  document.querySelectorAll(".gallery-item")
);

// Lista usada pelo lightbox.
// Começa contendo todas as imagens.
let galleryItemsVisiveis = [...todosGalleryItems];

function atualizarFiltro(filtroSelecionado) {
  galleryItemsVisiveis = todosGalleryItems.filter((item) => {
    const categoriaDaImagem = item.dataset.category;

    return (
      filtroSelecionado === "todos" ||
      categoriaDaImagem === filtroSelecionado
    );
  });

  todosGalleryItems.forEach((item) => {
    const deveMostrar = galleryItemsVisiveis.includes(item);

    item.classList.toggle("hidden", !deveMostrar);
  });
}

categoryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filtroSelecionado = button.dataset.filter;

    // Atualiza o botão ativo
    categoryButtons.forEach((item) => {
      item.classList.remove("active");
    });

    button.classList.add("active");

    // Atualiza as imagens visíveis
    atualizarFiltro(filtroSelecionado);

    // Fecha o lightbox se o usuário trocar de categoria
    // enquanto uma imagem estiver aberta.
    if (lightbox && lightbox.classList.contains("active")) {
      fecharLightbox();
    }
  });
});


/* =========================
   LIGHTBOX
========================= */

const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightbox-image");
const lightboxTitle = document.querySelector("#lightbox-title");
const lightboxCategory = document.querySelector("#lightbox-category");
const lightboxCounter = document.querySelector("#lightbox-counter");

const lightboxClose = document.querySelector("#lightbox-close");
const lightboxPrev = document.querySelector("#lightbox-prev");
const lightboxNext = document.querySelector("#lightbox-next");

let imagemAtual = 0;

function formatarCategoria(categoria) {
  const categorias = {
    Corporativo: "Corporativo",
    gestante: "Gestante",
    Comercial: "Comercial     ",
    pessoal: "Pessoal"
  };

  return categorias[categoria] || categoria || "Galeria";
}

function atualizarLightbox(index) {
  if (
    !lightboxImage ||
    !lightboxTitle ||
    !lightboxCategory ||
    !lightboxCounter ||
    galleryItemsVisiveis.length === 0
  ) {
    return;
  }

  // Navegação circular:
  // depois da última imagem, volta para a primeira;
  // antes da primeira, vai para a última.
  if (index < 0) {
    imagemAtual = galleryItemsVisiveis.length - 1;
  } else if (index >= galleryItemsVisiveis.length) {
    imagemAtual = 0;
  } else {
    imagemAtual = index;
  }

  const itemAtual = galleryItemsVisiveis[imagemAtual];
  const imagem = itemAtual.querySelector("img");

  if (!imagem) {
    return;
  }

  const titulo =
    itemAtual.dataset.title ||
    imagem.alt ||
    "Fotografia";

  const categoria =
    itemAtual.dataset.category ||
    "Galeria";

  lightboxImage.src = imagem.src;
  lightboxImage.alt = imagem.alt;

  lightboxTitle.textContent = titulo;
  lightboxCategory.textContent = formatarCategoria(categoria);

  lightboxCounter.textContent =
    `${imagemAtual + 1} / ${galleryItemsVisiveis.length}`;
}

function abrirLightbox(index) {
  if (
    !lightbox ||
    galleryItemsVisiveis.length === 0
  ) {
    return;
  }

  atualizarLightbox(index);

  lightbox.classList.add("active");
  lightbox.setAttribute("aria-hidden", "false");

  document.body.classList.add("lightbox-aberto");

  if (lightboxClose) {
    lightboxClose.focus();
  }
}

function fecharLightbox() {
  if (!lightbox) {
    return;
  }

  lightbox.classList.remove("active");
  lightbox.setAttribute("aria-hidden", "true");

  document.body.classList.remove("lightbox-aberto");

  if (lightboxImage) {
    lightboxImage.src = "";
  }
}


// Abre a imagem clicada
todosGalleryItems.forEach((item) => {
  item.addEventListener("click", () => {
    const index = galleryItemsVisiveis.indexOf(item);

    // Só abre se a imagem estiver visível no filtro atual
    if (index !== -1) {
      abrirLightbox(index);
    }
  });

  // Permite abrir com Enter ou Espaço
  item.setAttribute("tabindex", "0");

  item.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const index = galleryItemsVisiveis.indexOf(item);
      abrirLightbox(index);
    }
  });
});

if (lightboxClose) {
  lightboxClose.addEventListener("click", fecharLightbox);
}

if (lightboxPrev) {
  lightboxPrev.addEventListener("click", () => {
    if (galleryItemsVisiveis.length === 0) {
      return;
    }

    const indexAnterior =
      (imagemAtual - 1 + galleryItemsVisiveis.length) %
      galleryItemsVisiveis.length;

    atualizarLightbox(indexAnterior);
  });
}

if (lightboxNext) {
  lightboxNext.addEventListener("click", () => {
    if (galleryItemsVisiveis.length === 0) {
      return;
    }

    const indexProximo = (imagemAtual + 1) % galleryItemsVisiveis.length;
    atualizarLightbox(indexProximo);
  });
}

document.addEventListener("keydown", (event) => {
  if (!lightbox || !lightbox.classList.contains("active")) {
    return;
  }

  if (event.key === "Escape") {
    fecharLightbox();
  } else if (event.key === "ArrowLeft") {
    const indexAnterior =
      (imagemAtual - 1 + galleryItemsVisiveis.length) %
      galleryItemsVisiveis.length;

    atualizarLightbox(indexAnterior);
  } else if (event.key === "ArrowRight") {
    const indexProximo = (imagemAtual + 1) % galleryItemsVisiveis.length;
    atualizarLightbox(indexProximo);
  }
});

const contactForm = document.querySelector(".contact-form");
const formStatus = document.querySelector("#form-status");
const formSubmit = document.querySelector(".form-submit");

if (contactForm && formStatus && formSubmit) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    formStatus.textContent = "Enviando mensagem...";
    formStatus.className = "form-status loading";
    formSubmit.disabled = true;
    formSubmit.textContent = "Enviando...";

    const formData = new FormData(contactForm);

    try {
      const response = await fetch(contactForm.action, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json"
        }
      });

      if (response.ok) {
        formStatus.textContent = "Sua mensagem foi enviada.";
        formStatus.className = "form-status success";

        contactForm.reset();

        formSubmit.disabled = false;
        formSubmit.textContent = "Mensagem enviada";
      } else {
        formStatus.textContent =
          "Não foi possível enviar sua mensagem. Tente novamente.";
        formStatus.className = "form-status error";

        formSubmit.disabled = false;
        formSubmit.textContent = "Enviar mensagem";
      }
    } catch (error) {
      formStatus.textContent =
        "Ocorreu um erro de conexão. Tente novamente.";
      formStatus.className = "form-status error";

      formSubmit.disabled = false;
      formSubmit.textContent = "Enviar mensagem";
    }
  });
}

