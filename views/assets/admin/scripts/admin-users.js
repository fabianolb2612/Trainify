/**
 * TrainiFy - admin-users.js
 * Static version: hardcoded mock users list.
 */

const MOCK_USERS = [
  { id:'1', name:'João Dorea',    email:'joao@email.com',    phone:'(51)99111-0001', role:'trainer', status:'active',   createdAt:'10/01/2025' },
  { id:'2', name:'Maria Santos',  email:'maria@email.com',   phone:'(51)99111-0002', role:'trainer', status:'active',   createdAt:'15/01/2025' },
  { id:'3', name:'Carlos Rocha',  email:'carlos@email.com',  phone:'(51)99111-0003', role:'trainer', status:'active',   createdAt:'22/01/2025' },
  { id:'4', name:'Ana Pereira',   email:'ana@email.com',     phone:'(51)99111-0004', role:'trainer', status:'active',   createdAt:'03/02/2025' },
  { id:'5', name:'Lucas Dias',    email:'lucas@email.com',   phone:'(51)99111-0005', role:'trainer', status:'inactive', createdAt:'10/02/2025' },
  { id:'6', name:'Admin TrainiFy',email:'admin@trainify.com',phone:'(51)99000-0000', role:'admin',   status:'active',   createdAt:'01/01/2025' }
];

let filteredUsers = [...MOCK_USERS];

document.addEventListener('DOMContentLoaded', () => {
  setEl('adminStatUsers',  MOCK_USERS.length);
  setEl('adminStatActive', MOCK_USERS.filter(u => u.status === 'active').length);
  setEl('adminStatNew',    2);
  renderUsers(filteredUsers);
  initUserFilters();
  initUserActions();
});

function renderUsers(list) {
  const tbody = document.getElementById('usersTableBody');
  if (!tbody) return;

  const countEl = document.getElementById('usersCountLabel');
  if (countEl) countEl.textContent = `${list.length} usuário${list.length !== 1 ? 's' : ''}`;

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:32px;color:#555;">Nenhum usuário encontrado.</td></tr>`;
    return;
  }

  const roleBadge = r => r === 'admin' ? 'badge-warn' : 'badge-info';
  const initials  = n => { const p=n.trim().split(' '); return(p.length>1?p[0][0]+p[p.length-1][0]:p[0].slice(0,2)).toUpperCase(); };

  tbody.innerHTML = list.map(u => `
    <tr>
      <td>
        <div class="student-cell">
          <div class="admin-avatar" style="width:34px;height:34px;font-size:0.78rem;flex-shrink:0;">${initials(u.name)}</div>
          <div>
            <div style="font-weight:600;font-size:0.88rem;color:#ccc;">${u.name}</div>
            <div style="font-size:0.75rem;color:#555;">${u.email}</div>
          </div>
        </div>
      </td>
      <td style="color:#888;">${u.phone}</td>
      <td><span class="badge ${roleBadge(u.role)}" style="font-size:0.72rem;">${u.role}</span></td>
      <td><span class="status-dot ${u.status}" style="color:#888;">${u.status === 'active' ? 'Ativo' : 'Inativo'}</span></td>
      <td style="color:#666;font-size:0.82rem;">${u.createdAt}</td>
      <td>
        <div style="display:flex;gap:6px;">
          <button class="btn-admin btn-admin-ghost" data-action="edit-user" data-id="${u.id}">✏</button>
          <button class="btn-admin btn-admin-ghost" data-action="toggle-status" data-id="${u.id}">${u.status === 'active' ? '⏸' : '▶'}</button>
          <button class="btn-admin btn-admin-ghost" style="color:#ff6655;" data-action="remove-user" data-id="${u.id}">✕</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function initUserFilters() {
  const search = document.getElementById('userSearch');
  const role   = document.getElementById('roleFilter');
  const run = () => {
    const q  = search?.value.toLowerCase() || '';
    const rl = role?.value  || '';
    filteredUsers = MOCK_USERS.filter(u =>
      (!q  || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) &&
      (!rl || u.role === rl)
    );
    renderUsers(filteredUsers);
  };
  search?.addEventListener('input', debounce(run, 200));
  role?.addEventListener('change', run);
}

function initUserActions() {
  const tbody = document.getElementById('usersTableBody');
  tbody?.addEventListener('click', event => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const action = button.dataset.action;
    const id = button.dataset.id;
    if (action === 'edit-user') {
      alert('Edição disponível após integração com backend.');
    }
    if (action === 'toggle-status') {
      toggleStatus(id);
    }
    if (action === 'remove-user') {
      removeUser(id);
    }
  });
}

function toggleStatus(id) {
  const u = MOCK_USERS.find(x => x.id === id);
  if (!u) return;
  u.status = u.status === 'active' ? 'inactive' : 'active';
  renderUsers(filteredUsers);
}

function removeUser(id) {
  if (!confirm('Remover este usuário? Esta ação não pode ser desfeita.')) return;
  const idx = MOCK_USERS.findIndex(x => x.id === id);
  if (idx !== -1) MOCK_USERS.splice(idx, 1);
  filteredUsers = filteredUsers.filter(x => x.id !== id);
  renderUsers(filteredUsers);
}

function setEl(id, v) { const el = document.getElementById(id); if (el) el.textContent = v; }
function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(()=>fn(...a), ms); }; }
