import SessionStorage from "../../_common/scripts/storage.js";
import AuthGuard from "../../_common/scripts/auth-guard.js";

const storage = new SessionStorage();

// =========================================
// PROTEÇÃO DO PAINEL ADMIN
// =========================================

const guard = new AuthGuard(
  "../public/login.html",
  "user",
  1
);

if (!guard.protect()) {
  // Usuário não autenticado ou não é admin.
  // O AuthGuard já faz o redirecionamento.
}

// =========================================
// INICIALIZAÇÃO
// =========================================

document.addEventListener("DOMContentLoaded", () => {
  setActiveAdminNav();
  initAdminSidebar();
  populateAdminUser();
  initAdminLogout();
});

// =========================================
// MENU ATIVO
// =========================================

function setActiveAdminNav() {
  const page = window.location.pathname.split("/").pop();

  document
    .querySelectorAll(".admin-nav-item[data-href]")
    .forEach(item => {
      item.classList.toggle(
        "active",
        page.includes(item.dataset.href)
      );
    });
}

// =========================================
// SIDEBAR MOBILE
// =========================================

function initAdminSidebar() {
  const sidebar = document.getElementById("adminSidebar");
  const openBtn = document.getElementById("adminMenuBtn");
  const overlay = document.getElementById("adminOverlay");

  if (!sidebar) {
    return;
  }

  openBtn?.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    overlay?.classList.toggle("show");
  });

  overlay?.addEventListener("click", () => {
    sidebar.classList.remove("open");
    overlay?.classList.remove("show");
  });
}

// =========================================
// DADOS DO ADMIN LOGADO
// =========================================

function populateAdminUser() {
  const user = storage.getUser();

  if (!user) {
    return;
  }

  const name = user.name || "Admin";

  const parts = name.trim().split(" ");

  // Nome no topo
  const el = document.getElementById("adminUserName");

  if (el) {
    el.textContent = parts[0];
  }

  // Iniciais
  const av = document.getElementById("adminAvatarInitials");

  if (av) {
    const initials =
      parts.length > 1
        ? parts[0][0] + parts[parts.length - 1][0]
        : parts[0].slice(0, 2);

    av.textContent = initials.toUpperCase();
  }
}

// =========================================
// LOGOUT
// =========================================

function initAdminLogout() {
  document
    .querySelectorAll('[data-action="logout"]')
    .forEach(btn => {

      btn.addEventListener("click", event => {
        event.preventDefault();

        // Apaga token + usuário
        storage.clearSession();

        // Volta para login
        window.location.href = "../public/login.html";
      });

    });
}
