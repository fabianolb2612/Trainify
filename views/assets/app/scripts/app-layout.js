import SessionStorage from "../../_common/scripts/storage.js";
import AuthGuard from "../../_common/scripts/auth-guard.js";

const guard = new AuthGuard(
    "../public/login.html",
    "user",
    2
);

guard.protect();

document.addEventListener("DOMContentLoaded", () => {
    populateUserWidget();
    initSidebar();
    setActiveNavItem();
    initLogout();
    initTopbarSearch();
});



function populateUserWidget() {
    const storage = new SessionStorage();
    const user = storage.getUser();

    const nameEl = document.getElementById("sidebarUserName");
    const initEl = document.getElementById("sidebarUserInitials");
    const topbarEl = document.getElementById("topbarUserName");
    const welcomeEl = document.getElementById("welcomeName");

    const name = user?.name || "Personal Trainer";

    const parts = name.trim().split(" ");

    const initials = (
        parts.length > 1
            ? parts[0][0] + parts[parts.length - 1][0]
            : parts[0].slice(0, 2)
    ).toUpperCase();

    if (nameEl) {
        nameEl.textContent = name;
    }

    if (topbarEl) {
        topbarEl.textContent = parts[0];
    }

    if (initEl) {
        initEl.textContent = initials;
    }

    if (welcomeEl) {
        welcomeEl.textContent = parts[0];
    }
}
function setActiveNavItem() {
  const page = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-item[data-href]').forEach(item => {
    item.classList.toggle('active', page.includes(item.dataset.href));
  });
}

function initSidebar() {
  const sidebar = document.getElementById('appSidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const openBtn = document.getElementById('sidebarOpenBtn');
  if (!sidebar) return;
  openBtn?.addEventListener('click', () => {
    sidebar.classList.add('open');
    overlay?.classList.add('show');
  });
  overlay?.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay?.classList.remove('show');
  });
}

function initLogout() {
    document.querySelectorAll('[data-action="logout"]').forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();

            const storage = new SessionStorage();

            storage.clearSession();

            window.location.href = '../public/login.html';
        });
    });
}

function initTopbarSearch() {
  const input = document.getElementById('topbarSearch');
  if (!input) return;
  let timer;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (typeof onTopbarSearch === 'function') onTopbarSearch(input.value.trim());
    }, 300);
  });
}
