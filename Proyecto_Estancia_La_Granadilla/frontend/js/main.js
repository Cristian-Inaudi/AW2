// Efecto de scroll en navbar
document.addEventListener("scroll", () => {
  const navbar = document.querySelector(".navbar");
  if (!navbar) return;

  if (window.scrollY > 80) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});
window.dispatchEvent(new Event("scroll"));

// Mostrar usuario logueado o botón de login
document.addEventListener("DOMContentLoaded", () => {
  const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));
  const nav = document.querySelector(".navbar-nav");

  if (!nav) return;

  const loginItem = document.getElementById("nav-login");
  if (loginItem) loginItem.remove();

  const userItem = document.createElement("li");
  userItem.className = "nav-item dropdown";

  if (usuarioActivo) {
    userItem.innerHTML = `
      <a class="nav-link dropdown-toggle fw-semibold text-success" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
        👋 ${usuarioActivo.nombre}
      </a>
      <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
        <li><a class="dropdown-item" href="misreservas.html">Mis reservas</a></li>
        <li><a class="dropdown-item" id="cerrarSesion" href="#">Cerrar sesión</a></li>
      </ul>
    `;
    nav.appendChild(userItem);

    document.getElementById("cerrarSesion").addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("usuarioActivo");
      localStorage.removeItem("token");
      mostrarToast("Sesión cerrada correctamente 👋", "info");
      setTimeout(() => (window.location.href = "login.html"), 1500);
    });

  } else {
    const loginLi = document.createElement("li");
    loginLi.className = "nav-item";
    loginLi.innerHTML = `<a id="nav-login" class="nav-link fw-semibold text-success" href="login.html">Iniciar sesión</a>`;
    nav.appendChild(loginLi);
  }

  const linkMiReserva = document.querySelector('a[href="carrito.html"]');
  if (linkMiReserva && !usuarioActivo) {
    linkMiReserva.parentElement.style.display = "none";
  }
});


// Toasts personalizados globales
window.mostrarToast = function (mensaje, tipo = "info") {
  const colores = {
    success: "bg-success text-white",
    warning: "bg-warning text-dark",
    error: "bg-danger text-white",
    info: "bg-olive text-white"
  };

  const iconos = {
    success: "✅",
    warning: "⚠️",
    error: "❌",
    info: "ℹ️"
  };

  // Crear contenedor si no existe
  let toastContainer = document.getElementById("toastContainer");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toastContainer";
    toastContainer.className = "toast-container position-fixed top-0 end-0 p-3";
    document.body.appendChild(toastContainer);
  }

  // Crear el toast
  const toastEl = document.createElement("div");
  toastEl.className = `toast align-items-center border-0 shadow-sm mb-2 show ${colores[tipo]}`;
  toastEl.role = "alert";
  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body fw-semibold">
        ${iconos[tipo] || ""} ${mensaje}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;

  toastContainer.appendChild(toastEl);

  const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
  toast.show();

  // Eliminar después de ocultarse
  toastEl.addEventListener("hidden.bs.toast", () => toastEl.remove());
};
