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
  loadAdminDashboard();

  const refreshBtn = document.querySelector('.admin-page-header .btn-admin-ghost');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', loadAdminDashboard);
  }
});

async function loadAdminDashboard() {
  const tbody = document.getElementById('recentUsersBody');
  if (tbody) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:32px;"><span class="spinner"></span></td></tr>`;
  }

  try {
    const response = await fetch(`${getApiBase()}/admin/stats`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    const result = await response.json();

    if (!response.ok || result.type !== 'success') {
      console.error('Erro ao carregar dashboard:', result.message);
      if (tbody) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:24px;color:#ff6655;">${result.message || 'Erro ao carregar dados.'}</td></tr>`;
      }
      return;
    }

    const { totalUsers, totalStudents, totalWorkouts, recentUsers } = result.data;

    setEl('adminStatUsers', totalUsers ?? 0);
    setEl('adminStatStudents', totalStudents ?? 0);
    setEl('adminStatWorkouts', totalWorkouts ?? 0);

    renderRecentUsers(recentUsers || []);
  } catch (error) {
    console.error('Falha na comunicação com a API:', error);
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:24px;color:#ff6655;">Falha de conexão com o servidor.</td></tr>`;
    }
  }
}

function renderRecentUsers(users) {
  const tbody = document.getElementById('recentUsersBody');
  if (!tbody) return;

  if (!users.length) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:24px;color:#555;">Nenhum usuário cadastrado no sistema.</td></tr>`;
    return;
  }

  tbody.innerHTML = users.map(u => {
    const isActive = Number(u.active) === 1;
    const dateStr = u.created_at
      ? new Date(u.created_at).toLocaleDateString('pt-BR')
      : `#${u.id}`;

    return `
      <tr>
        <td style="color:#ccc;">
          <div style="font-weight:600;">${u.name}</div>
          <div style="font-size:0.75rem;color:#555;">${u.email || ''}</div>
        </td>
        <td><span class="status-dot ${isActive ? 'active' : 'inactive'}" style="color:#888;">${isActive ? 'Ativo' : 'Inativo'}</span></td>
        <td style="color:#555;font-size:0.82rem;">${dateStr}</td>
      </tr>
    `;
  }).join('');
}

function setEl(id, v) {
  const el = document.getElementById(id);
  if (el) el.textContent = v;
}