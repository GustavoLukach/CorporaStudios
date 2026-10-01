/* =====================================================
   ELEMENTOS DO HTML
===================================================== */

const loginForm = document.querySelector("#login-form");
const loginSection = document.querySelector("#login-section");
const adminSection = document.querySelector("#admin-section");
const loginMessage = document.querySelector("#login-message");

const logoutButton = document.querySelector("#logout-button");

const uploadForm = document.querySelector("#upload-form");
const uploadMessage = document.querySelector("#upload-message");

const imagePage = document.querySelector("#image-page");
const imageSlot = document.querySelector("#image-slot");
const imageCategory = document.querySelector("#image-category");
const imageFile = document.querySelector("#image-file");
const imageTitle = document.querySelector("#image-title");
const imageAlt = document.querySelector("#image-alt");

const adminGallery = document.querySelector("#admin-gallery");
const galleryAdminMessage = document.querySelector(
  "#gallery-admin-message"
);
const deleteSelectedButton = document.querySelector(
  "#delete-selected-button"
);
const selectedImagesCount = document.querySelector(
  "#selected-images-count"
);
const imagensSelecionadas = new Map();


/* =====================================================
   CATEGORIAS PERMITIDAS
===================================================== */

const categoriasPermitidas = [
  "corporativo",
  "comercial",
  "gestante",
  "pessoal"
];


/* =====================================================
   MENSAGENS E INTERFACE
===================================================== */

function mostrarLogin(mensagem = "", tipo = "") {
  if (loginSection) {
    loginSection.hidden = false;
  }

  if (adminSection) {
    adminSection.hidden = true;
  }

  if (loginMessage) {
    loginMessage.textContent = mensagem;
    loginMessage.className = `admin-message ${tipo}`;
  }
}

function mostrarPainel() {
  if (loginSection) {
    loginSection.hidden = true;
  }

  if (adminSection) {
    adminSection.hidden = false;
  }

  if (loginMessage) {
    loginMessage.textContent = "";
  }
}

function mostrarMensagemUpload(
  mensagem,
  tipo = ""
) {
  if (!uploadMessage) {
    return;
  }

  uploadMessage.textContent = mensagem;
  uploadMessage.className = `admin-message ${tipo}`;
}

function mostrarMensagemGaleria(
  mensagem,
  tipo = ""
) {
  if (!galleryAdminMessage) {
    return;
  }

  galleryAdminMessage.textContent = mensagem;
  galleryAdminMessage.className = `admin-message ${tipo}`;
}

function bloquearUpload(bloquear) {
  const submitButton = uploadForm?.querySelector(
    'button[type="submit"]'
  );

  if (!submitButton) {
    return;
  }

  submitButton.disabled = bloquear;
  submitButton.textContent = bloquear
    ? "Enviando..."
    : "Enviar imagem";
}


/* =====================================================
   VERIFICAÇÃO DA SESSÃO E DO ADMINISTRADOR
===================================================== */

async function verificarSessao() {
  const {
    data: { session },
    error: sessionError
  } = await supabaseClient.auth.getSession();

  if (sessionError) {
    console.error(
      "Erro ao verificar sessão:",
      sessionError
    );

    mostrarLogin(
      "Não foi possível verificar sua sessão.",
      "error"
    );

    return;
  }

  if (!session) {
    mostrarLogin();
    return;
  }

  const {
    data: adminUser,
    error: adminError
  } = await supabaseClient
    .from("admin_users")
    .select("user_id")
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (adminError) {
    console.error(
      "Erro ao verificar administrador:",
      adminError
    );

    mostrarLogin(
      "Não foi possível verificar seu acesso.",
      "error"
    );

    return;
  }

  if (!adminUser) {
    await supabaseClient.auth.signOut();

    mostrarLogin(
      "Sua conta não tem permissão de administrador.",
      "error"
    );

    return;
  }

  mostrarPainel();
  carregarImagensDaGaleria();
}


/* =====================================================
   LOGIN
===================================================== */

if (loginForm) {
  loginForm.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();

      const emailInput =
        document.querySelector("#admin-email");

      const passwordInput =
        document.querySelector("#admin-password");

      const email = emailInput.value.trim();
      const password = passwordInput.value;

      loginMessage.textContent = "Entrando...";
      loginMessage.className = "admin-message";

      const { error } =
        await supabaseClient.auth.signInWithPassword({
          email,
          password
        });

      if (error) {
        console.error("Erro no login:", error);

        mostrarLogin(
          "E-mail ou senha incorretos.",
          "error"
        );

        return;
      }

      await verificarSessao();
    }
  );
}


/* =====================================================
   LOGOUT
===================================================== */

if (logoutButton) {
  logoutButton.addEventListener(
    "click",
    async (event) => {
      event.preventDefault();

      logoutButton.disabled = true;
      logoutButton.textContent = "Saindo...";

      const { error } =
        await supabaseClient.auth.signOut();

      if (error) {
        console.error("Erro ao sair:", error);

        logoutButton.disabled = false;
        logoutButton.textContent = "Sair";

        return;
      }

      window.location.reload();
    }
  );
}


/* =====================================================
   VALIDAÇÃO DO FORMULÁRIO
===================================================== */

function validarFormulario() {
  const files = Array.from(imageFile?.files || []);
  const title = imageTitle?.value.trim() || "";
  const altText = imageAlt?.value.trim() || "";

  const page = imagePage?.value || "";
  const slot = imageSlot?.value || "";
  const category = imageCategory?.value || "";

  if (files.length === 0) {
    return {
      valido: false,
      mensagem: "Escolha pelo menos uma imagem."
    };
  }

  if (files.some((file) => !file.type.startsWith("image/"))) {
    return {
      valido: false,
      mensagem: "Todos os arquivos selecionados precisam ser imagens válidas."
    };
  }

  if (!title) {
    return {
      valido: false,
      mensagem: "Preencha o título da imagem."
    };
  }

  if (!altText) {
    return {
      valido: false,
      mensagem: "Preencha a descrição da imagem."
    };
  }

  /*
    Página e área precisam ser preenchidas juntas.
  */
  const escolheuApenasPaginaOuArea =
    (page && !slot) ||
    (!page && slot);

  if (escolheuApenasPaginaOuArea) {
    return {
      valido: false,
      mensagem: "Escolha a página e a área da imagem."
    };
  }

  const imagemEspecifica = Boolean(page && slot);

  if (imagemEspecifica && files.length > 1) {
    return {
      valido: false,
      mensagem: "Áreas específicas do site aceitam apenas uma imagem por vez."
    };
  }

  /*
    Se for imagem da galeria, a categoria é obrigatória.
  */
  if (!imagemEspecifica && !category) {
    return {
      valido: false,
      mensagem: "Escolha uma categoria para a galeria."
    };
  }

  /*
    Se for imagem específica, não deve haver categoria.
  */
  if (imagemEspecifica && category) {
    return {
      valido: false,
      mensagem:
        "Para trocar uma imagem específica, deixe a categoria vazia."
    };
  }

  /*
    Garante que nenhuma categoria antiga seja usada.
  */
  if (
    !imagemEspecifica &&
    !categoriasPermitidas.includes(category)
  ) {
    return {
      valido: false,
      mensagem:
        "Escolha uma categoria válida: Corporativo, Comercial, Gestante ou Pessoal."
    };
  }

  return {
    valido: true,
    dados: {
      files,
      title,
      altText,
      page,
      slot,
      category,
      imagemEspecifica
    }
  };
}


/* =====================================================
   GERAR NOME ÚNICO
===================================================== */

function gerarNomeArquivo(file) {
  const partes = file.name.split(".");

  const extensao =
    partes.length > 1
      ? partes.pop().toLowerCase()
      : "jpg";

  const identificador =
    window.crypto?.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;

  return `imagem-${identificador}.${extensao}`;
}


/* =====================================================
   ENVIAR IMAGEM PARA O STORAGE
===================================================== */

async function enviarArquivo(file, pasta) {
  const nomeArquivo = gerarNomeArquivo(file);
  const caminhoArquivo = `${pasta}/${nomeArquivo}`;

  const { error: uploadError } =
    await supabaseClient.storage
      .from("gallery")
      .upload(caminhoArquivo, file, {
        cacheControl: "3600",
        upsert: false
      });

  if (uploadError) {
    throw uploadError;
  }

  const { data } =
    supabaseClient.storage
      .from("gallery")
      .getPublicUrl(caminhoArquivo);

  return {
    caminhoArquivo,
    urlArquivo: data.publicUrl
  };
}


/* =====================================================
   SALVAR IMAGEM DA GALERIA
===================================================== */

async function salvarImagemGaleria({
  title,
  altText,
  category,
  caminhoArquivo,
  urlArquivo
}) {
  const { error } =
    await supabaseClient
      .from("gallery_images")
      .insert({
        title,
        alt_text: altText,
        category,
        image_path: caminhoArquivo,
        image_url: urlArquivo
      });

  if (error) {
    throw error;
  }
}


/* =====================================================
   SALVAR OU ATUALIZAR IMAGEM ESPECÍFICA DO SITE
===================================================== */

async function salvarImagemSite({
  page,
  slot,
  title,
  altText,
  caminhoArquivo,
  urlArquivo
}) {
  const { error } =
    await supabaseClient
      .from("site_images")
      .upsert(
        {
          page_name: page,
          slot_name: slot,
          title,
          alt_text: altText,
          image_path: caminhoArquivo,
          image_url: urlArquivo,
          updated_at: new Date().toISOString()
        },
        {
          onConflict: "page_name,slot_name"
        }
      );

  if (error) {
    throw error;
  }
}


/* =====================================================
   ENVIO PRINCIPAL DO FORMULÁRIO
===================================================== */

if (uploadForm) {
  uploadForm.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();

      const validacao = validarFormulario();

      if (!validacao.valido) {
        mostrarMensagemUpload(
          validacao.mensagem,
          "error"
        );

        return;
      }

      const {
        files,
        title,
        altText,
        page,
        slot,
        category,
        imagemEspecifica
      } = validacao.dados;

      let imagensAdicionadas = 0;
      let envioConcluido = false;

      try {
        bloquearUpload(true);

        if (imagemEspecifica) {
          mostrarMensagemUpload("Enviando imagem...");

          const { caminhoArquivo, urlArquivo } =
            await enviarArquivo(files[0], `site/${page}`);

          await salvarImagemSite({
            page,
            slot,
            title,
            altText,
            caminhoArquivo,
            urlArquivo
          });

          mostrarMensagemUpload(
            "Imagem da área atualizada com sucesso.",
            "success"
          );
        } else {
          for (const [index, file] of files.entries()) {
            mostrarMensagemUpload(
              files.length > 1
                ? `Enviando imagem ${index + 1} de ${files.length}...`
                : "Enviando imagem..."
            );

            const { caminhoArquivo, urlArquivo } =
              await enviarArquivo(file, category);

            await salvarImagemGaleria({
              title,
              altText,
              category,
              caminhoArquivo,
              urlArquivo
            });

            imagensAdicionadas += 1;
          }

          mostrarMensagemUpload(
            files.length === 1
              ? "Imagem adicionada à galeria com sucesso."
              : `${imagensAdicionadas} imagens adicionadas à galeria com sucesso.`,
            "success"
          );
        }
        envioConcluido = true;
      } catch (error) {
        console.error(
          "Erro completo no upload:",
          error
        );

        if (imagensAdicionadas > 0) {
          mostrarMensagemUpload(
            `${imagensAdicionadas} de ${files.length} imagens foram adicionadas. O envio foi interrompido por uma falha.`,
            "error"
          );
        } else {
          mostrarMensagemUpload(
            error.message ||
              "Não foi possível enviar a imagem.",
            "error"
          );
        }
      } finally {
        bloquearUpload(false);
      }

      if (envioConcluido) {
        uploadForm.reset();
        carregarImagensDaGaleria();
      } else if (imagensAdicionadas > 0) {
        carregarImagensDaGaleria();
      }
    }
  );
}


/* =====================================================
   ESCAPAR TEXTO ANTES DE INSERIR NO HTML
===================================================== */

function escaparHtml(texto) {
  const elemento =
    document.createElement("div");

  elemento.textContent = texto || "";

  return elemento.innerHTML;
}


/* =====================================================
   LISTAR IMAGENS DA GALERIA
===================================================== */

async function carregarImagensDaGaleria() {
  if (!adminGallery) {
    return;
  }

  imagensSelecionadas.clear();
  atualizarContagemSelecao();
  adminGallery.innerHTML = "";

  mostrarMensagemGaleria(
    "Carregando imagens..."
  );

  const {
    data: images,
    error
  } = await supabaseClient
    .from("gallery_images")
    .select("*")
    .order("created_at", {
      ascending: false
    });

  if (error) {
    console.error(
      "Erro ao carregar galeria:",
      error
    );

    mostrarMensagemGaleria(
      "Não foi possível carregar as imagens.",
      "error"
    );

    return;
  }

  if (!images || images.length === 0) {
    mostrarMensagemGaleria(
      "Nenhuma imagem foi cadastrada ainda."
    );

    return;
  }

  mostrarMensagemGaleria("");

  images.forEach((image) => {
    const card =
      document.createElement("article");

    card.className =
      "admin-gallery-item";

    const imageElement =
      document.createElement("img");

    imageElement.src = image.image_url;
    imageElement.alt = image.alt_text;

    const info =
      document.createElement("div");

    info.className =
      "admin-gallery-info";

    const title =
      document.createElement("strong");

    title.textContent = image.title;

    const category =
      document.createElement("small");

    category.textContent =
      formatarCategoria(image.category);

    const deleteButton =
      document.createElement("button");

    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.textContent = "Excluir";

    deleteButton.addEventListener(
      "click",
      () => excluirImagem(image)
    );

    info.appendChild(title);
    info.appendChild(category);

    const selectionButton =
      document.createElement("button");

    selectionButton.type = "button";
    selectionButton.className = "select-image-button";
    selectionButton.textContent = "Selecionar";
    selectionButton.setAttribute("aria-pressed", "false");
    selectionButton.setAttribute(
      "aria-label",
      `Selecionar imagem ${image.title}`
    );

    selectionButton.addEventListener("click", () => {
      const imageId = String(image.id);
      const estaSelecionada =
        selectionButton.getAttribute("aria-pressed") === "true";

      if (estaSelecionada) {
        imagensSelecionadas.delete(imageId);
        selectionButton.textContent = "Selecionar";
        selectionButton.setAttribute("aria-pressed", "false");
        selectionButton.removeAttribute("aria-label");
      } else {
        imagensSelecionadas.set(imageId, image);
        selectionButton.textContent = "Desmarcar";
        selectionButton.setAttribute("aria-pressed", "true");
        selectionButton.setAttribute(
          "aria-label",
          `Desmarcar imagem ${image.title}`
        );
      }

      selectionButton.classList.toggle("selected", !estaSelecionada);
      atualizarContagemSelecao();
    });

    info.appendChild(selectionButton);
    info.appendChild(deleteButton);

    card.appendChild(imageElement);
    card.appendChild(info);

    adminGallery.appendChild(card);
  });
}

function formatarCategoria(category) {
  const categorias = {
    corporativo: "Corporativo",
    comercial: "Comercial",
    gestante: "Gestante",
    pessoal: "Pessoal"
  };

  return categorias[category] || category;
}

function atualizarContagemSelecao() {
  const quantidade = imagensSelecionadas.size;

  if (selectedImagesCount) {
    selectedImagesCount.textContent =
      quantidade === 1
        ? "1 imagem selecionada"
        : quantidade === 0
          ? "Nenhuma imagem selecionada"
          : `${quantidade} imagens selecionadas`;
  }

  if (deleteSelectedButton) {
    deleteSelectedButton.disabled = quantidade === 0;
  }
}


/* =====================================================
   EXCLUIR IMAGEM
===================================================== */

async function excluirImagem(image) {
  const confirmou = window.confirm(
    `Excluir a imagem "${image.title}"?`
  );

  if (!confirmou) {
    return;
  }

  mostrarMensagemGaleria(
    "Excluindo imagem..."
  );

  try {
    await removerImagem(image);
  } catch (error) {
    console.error("Erro ao excluir imagem:", error);
    mostrarMensagemGaleria(
      error.message || "Não foi possível excluir a imagem.",
      "error"
    );
    return;
  }

  await carregarImagensDaGaleria();
  mostrarMensagemGaleria(
    "Imagem excluída com sucesso.",
    "success"
  );
}

async function removerImagem(image) {
  const {
    error: storageError
  } = await supabaseClient.storage
    .from("gallery")
    .remove([image.image_path]);

  if (storageError) {
    throw storageError;
  }

  const {
    error: databaseError
  } = await supabaseClient
    .from("gallery_images")
    .delete()
    .eq("id", image.id);

  if (databaseError) {
    throw databaseError;
  }
}

if (deleteSelectedButton) {
  deleteSelectedButton.addEventListener("click", async () => {
    const images = [...imagensSelecionadas.values()];

    if (images.length === 0) {
      return;
    }

    const confirmou = window.confirm(
      `Excluir ${images.length} imagens selecionadas? Essa ação não pode ser desfeita.`
    );

    if (!confirmou) {
      return;
    }

    deleteSelectedButton.disabled = true;
    let imagensExcluidas = 0;
    let mensagemFinal = "";
    let tipoMensagem = "success";

    for (const image of images) {
      try {
        await removerImagem(image);
        imagensExcluidas += 1;
      } catch (error) {
        console.error("Erro ao excluir imagem:", error);
        tipoMensagem = "error";
        mensagemFinal = imagensExcluidas > 0
          ? `${imagensExcluidas} de ${images.length} imagens foram excluídas. O processo parou por uma falha.`
          : error.message || "Não foi possível excluir as imagens selecionadas.";
        break;
      }
    }

    if (!mensagemFinal) {
      mensagemFinal = `${imagensExcluidas} imagens excluídas com sucesso.`;
    }

    await carregarImagensDaGaleria();
    mostrarMensagemGaleria(mensagemFinal, tipoMensagem);
  });
}


/* =====================================================
   INICIAR O PAINEL
===================================================== */

verificarSessao();
