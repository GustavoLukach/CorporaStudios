const menuToggle =
  document.querySelector(".menu-toggle");

const navLinks =
  document.querySelector(".nav-links");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const menuAberto =
      navLinks.classList.toggle("active");

    menuToggle.classList.toggle("active", menuAberto);
    menuToggle.setAttribute("aria-expanded", String(menuAberto));
    menuToggle.setAttribute(
      "aria-label",
      menuAberto ? "Fechar menu" : "Abrir menu"
    );
    document.body.classList.toggle("menu-aberto", menuAberto);
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("active");
      menuToggle.classList.remove("active");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Abrir menu");
      document.body.classList.remove("menu-aberto");
    });
  });
}