let allUsers = [];
let filteredUsers = [];

function getApiBase() {
  const path = window.location.pathname;
  const viewsIndex = path.indexOf('/views/');
  const basePath = viewsIndex !== -1 ? path.substring(0, viewsIndex) : '';
  return `${window.location.origin}${basePath}/api`;
}

function getAuthHeaders() {
  const token = localStorage.getItem('trainify_token') || '';
  return {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

document.addEventListener('DOMContentLoaded', () => {
  loadUsers();
  initUserFilters();
  initUserActions();
});

async function loadUsers() {
  const tbody = document.getElementById('usersTableBody');
  if (tbody) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:32px;"><span class="spinner"></span></td></tr>`;
  }

  try {
    const response = await fetch(`${getApiBase()}/users/list`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    const result = await response.json();

    if (!response.ok || result.type !== 'success') {
      console.error('Erro ao buscar usuários:', result.message);
      if (tbody) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:32px;color:#ff6655;">${result.message || 'Erro ao carregar usuários.'}</td></tr>`;
      }
      return;
    }

    const rawList = Array.isArray(result.data) ? result.data : [];

    // Exibe apenas os personal trainers (type_id === 2)
    allUsers = rawList.filter(u => Number(u.type_id) === 2);
    filteredUsers = [...allUsers];

    updateUserStats();
    renderUsers(filteredUsers);
  } catch (error) {
    console.error('Falha na requisição de usuários:', error);
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:32px;color:#ff6655;">Falha de conexão com o servidor.</td></tr>`;
    }
  }
}

function updateUserStats() {
  const activeCount = allUsers.filter(u => Number(u.active) === 1).length;
  setEl('adminStatUsers', allUsers.length);
  setEl('adminStatActive', activeCount);
  setEl('adminStatNew', allUsers.length);
}

function renderUsers(list) {
  const tbody = document.getElementById('usersTableBody');
  if (!tbody) return;

  const countEl = document.getElementById('usersCountLabel');
  if (countEl) {
    countEl.textContent = `${list.length} usuário${list.length !== 1 ? 's' : ''}`;
  }

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:32px;color:#555;">Nenhum usuário encontrado.</td></tr>`;
    return;
  }

  const initials = n => {
    const p = (n || 'U').trim().split(' ');
    return (p.length > 1 ? p[0][0] + p[p.length - 1][0] : p[0].slice(0, 2)).toUpperCase();
  };

  tbody.innerHTML = list.map(u => {
    const isActive = Number(u.active) === 1;
    const roleLabel = Number(u.type_id) === 1 ? 'admin' : 'trainer';
    const roleBadge = roleLabel === 'admin' ? 'badge-warn' : 'badge-info';
    const dateStr = u.created_at
      ? new Date(u.created_at).toLocaleDateString('pt-BR')
      : `#${u.id}`;

    return `
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
        <td style="color:#888;">${u.phone || '—'}</td>
        <td><span class="badge ${roleBadge}" style="font-size:0.72rem;">${roleLabel}</span></td>
        <td><span class="status-dot ${isActive ? 'active' : 'inactive'}" style="color:#888;">${isActive ? 'Ativo' : 'Inativo'}</span></td>
        <td style="color:#666;font-size:0.82rem;">${dateStr}</td>
        <td>
          <div style="display:flex;gap:6px;">
            <button class="btn-admin btn-admin-ghost" title="${isActive ? 'Pausar usuário' : 'Ativar usuário'}" data-action="toggle-status" data-id="${u.id}">${isActive ? '⏸' : '▶'}</button>
            <button class="btn-admin btn-admin-ghost" title="Remover usuário" style="color:#ff6655;" data-action="remove-user" data-id="${u.id}">✕</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function initUserFilters() {
  const search = document.getElementById('userSearch');
  const role = document.getElementById('roleFilter');

  const run = () => {
    const q = search?.value.toLowerCase() || '';
    const rl = role?.value || '';

    filteredUsers = allUsers.filter(u => {
      const roleLabel = Number(u.type_id) === 1 ? 'admin' : 'trainer';
      return (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) &&
             (!rl || roleLabel === rl);
    });

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

    if (action === 'toggle-status') {
      toggleStatus(id);
    }
    if (action === 'remove-user') {
      removeUser(id);
    }
  });
}

async function toggleStatus(id) {
  try {
    const response = await fetch(`${getApiBase()}/users/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });

    const result = await response.json();

    if (response.ok && result.type === 'success') {
      await loadUsers();
    } else {
      alert(result.message || 'Não foi possível alterar o status do usuário.');
    }
  } catch (error) {
    console.error('Erro ao alterar status:', error);
  }
}

async function removeUser(id) {
  if (!confirm('Remover este usuário permanentemente do servidor? Esta ação não pode ser desfeita.')) return;

  try {
    const response = await fetch(`${getApiBase()}/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    const result = await response.json();

    if (response.ok && result.type === 'success') {
      await loadUsers();
    } else {
      alert(result.message || 'Erro ao remover usuário.');
    }
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
  }
}

function setEl(id, v) {
  const el = document.getElementById(id);
  if (el) el.textContent = v;
}

function debounce(fn, ms) {
  let t;
  return (...a) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), ms);
  };
}