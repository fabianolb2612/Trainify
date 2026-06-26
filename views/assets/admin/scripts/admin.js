/**
 * TrainiFy - admin.js
 * Static version: no Auth guard, no API calls.
 */

const STATIC_ADMIN = { name: 'Admin TrainiFy' };

document.addEventListener('DOMContentLoaded', () => {
  setActiveAdminNav();
  initAdminSidebar();
  populateAdminUser();
});

function setActiveAdminNav() {
  const page = window.location.pathname.split('/').pop();
  document.querySelectorAll('.admin-nav-item[data-href]').forEach(item => {
    item.classList.toggle('active', page.includes(item.dataset.href));
  });
}

function initAdminSidebar() {
  const sidebar = document.getElementById('adminSidebar');
  const openBtn = document.getElementById('adminMenuBtn');
  const overlay = document.getElementById('adminOverlay');
  if (!sidebar) return;
  openBtn?.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay?.classList.toggle('show');
  });
  overlay?.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay?.classList.remove('show');
  });
}

function populateAdminUser() {
  const el = document.getElementById('adminUserName');
  if (el) el.textContent = STATIC_ADMIN.name.split(' ')[0];
  const av = document.getElementById('adminAvatarInitials');
  if (av) {
    const p = STATIC_ADMIN.name.split(' ');
    av.textContent = (p.length > 1 ? p[0][0] + p[p.length-1][0] : p[0].slice(0,2)).toUpperCase();
  }
}

// Logout handler
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-action="logout"]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      window.location.href = '../public/login.html';
    });
  });
});
