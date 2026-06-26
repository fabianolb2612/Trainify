/**
 * TrainiFy - profile.js
 * Static version: pre-fills form with mock trainer data.
 */

const MOCK_PROFILE = {
  name: 'João Dorea',
  email: 'joao@trainify.com.br',
  phone: '(51) 99111-2233',
  cref: '012345-G/RS',
  city: 'Porto Alegre, RS',
  specialty: 'Hipertrofia, Funcional',
  bio: 'Personal trainer com 8 anos de experiência, especializado em hipertrofia e treinamento funcional. Atendo presencialmente e online.',
  stats: { totalStudents: 24, totalWorkouts: 38, monthsActive: 18 }
};

document.addEventListener('DOMContentLoaded', () => {
  populateProfile();
  initProfileForm();
  initPasswordForm();
  initProfileActions();
});

function populateProfile() {
  const p = MOCK_PROFILE;
  setVal('profileName',      p.name);
  setVal('profileEmail',     p.email);
  setVal('profilePhone',     p.phone);
  setVal('profileCref',      p.cref);
  setVal('profileCity',      p.city);
  setVal('profileSpecialty', p.specialty);
  setVal('profileBio',       p.bio);
  setVal('statStudents',     p.stats.totalStudents);
  setVal('statWorkouts',     p.stats.totalWorkouts);
  setVal('statMonths',       p.stats.monthsActive);
  setAvatarInitials(p.name);

  // Also update sidebar from layout
  const sn = document.getElementById('sidebarUserName');
  if (sn) sn.textContent = p.name;
}

function setAvatarInitials(name = '') {
  const el = document.getElementById('profileAvatarInitials');
  if (!el) return;
  const parts = name.trim().split(' ');
  el.textContent = (parts.length > 1
    ? parts[0][0] + parts[parts.length - 1][0]
    : parts[0].slice(0, 2)).toUpperCase();
}

function initProfileForm() {
  const form = document.getElementById('profileForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    showToast('Perfil atualizado com sucesso!', 'success');
    setAvatarInitials(form.profileName?.value || MOCK_PROFILE.name);
  });
}

function initPasswordForm() {
  const form = document.getElementById('passwordForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const nw = form.newPassword.value;
    const cf = form.confirmPassword.value;
    if (nw !== cf)       { showToast('As senhas não coincidem.', 'error'); return; }
    if (nw.length < 8)   { showToast('A senha deve ter pelo menos 8 caracteres.', 'error'); return; }
    showToast('Senha alterada com sucesso!', 'success');
    form.reset();
  });
}

/* ── Helpers ── */
function setVal(id, val) {
  const el = document.getElementById(id);
  if (!el) return;
  if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
    el.value = val;
  } else {
    el.textContent = val;
  }
}

function showToast(msg, type = 'info') {
  const icons = { success:'✓', error:'✕', info:'ℹ' };
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span style="color:var(--clr-neon);font-weight:700;">${icons[type]||'•'}</span> ${msg}`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(40px)';
    toast.style.transition = '0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function initProfileActions() {
  const cancelBtn = document.getElementById('profileCancelBtn');
  const deleteBtn = document.getElementById('deleteAccountBtn');
  const form = document.getElementById('profileForm');

  cancelBtn?.addEventListener('click', () => {
    if (!form) return;
    form.reset();
    populateProfile();
    showToast('Alterações descartadas.', 'info');
  });

  deleteBtn?.addEventListener('click', () => {
    showToast('Funcionalidade disponível após integração com backend.', 'info');
  });
}
