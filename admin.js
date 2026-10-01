/* =========================
   CONFIGURAÇÃO DO SUPABASE
========================= */

const SUPABASE_URL =
  "https://zgfnfulcsebqfcnkmijf.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_A0rFdnpY_8DmQWM5raDQeA_JWFOf89T";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
 );


/* =========================
   ELEMENTOS DO PAINEL
========================= */

const uploadForm = document.querySelector("#upload-form");
const uploadMessage = document.querySelector("#upload-message");


/* =========================
   UPLOAD DA IMAGEM
========================= */

if (uploadForm) {
  uploadForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const fileInput = document.querySelector("#image-file");
    const titleInput = document.querySelector("#image-title");
    const altInput = document.querySelector("#image-alt");
    const categoryInput = document.querySelector("#image-category");

    const file = fileInput.files[0];
    const title = titleInput.value.trim();
    const altText = altInput.value.trim();
    const category = categoryInput.value;

    if (!file) {
      uploadMessage.textContent = "Escolha uma imagem.";
      return;
    }

    uploadMessage.textContent = "Enviando imagem...";

    /*
      O nome do arquivo recebe um número para evitar
      que uma imagem substitua outra com o mesmo nome.
    */
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `${category}/${fileName}`;

    const { error: uploadError } =
      await supabaseClient.storage
        .from("gallery")
        .upload(filePath, file);

    if (uploadError) {
      console.error(uploadError);

      uploadMessage.textContent =
        "Não foi possível enviar a imagem.";

      return;
    }

    const { data: publicUrlData } =
      supabaseClient.storage
        .from("gallery")
        .getPublicUrl(filePath);

    const imageUrl = publicUrlData.publicUrl;

    const { error: databaseError } =
      await supabaseClient
        .from("gallery_images")
        .insert({
          title: title,
          alt_text: altText,
          category: category,
          image_path: filePath,
          image_url: imageUrl
        });

    if (databaseError) {
      console.error(databaseError);

      uploadMessage.textContent =
        "A imagem foi enviada, mas não foi cadastrada.";

      return;
    }

    uploadMessage.textContent =
      "Imagem adicionada com sucesso.";

    uploadForm.reset();
  });
}
