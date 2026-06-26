/**
 * TrainiFy - admin-dashboard.js
 * Static version: hardcoded mock data.
 */

const MOCK_ADMIN_STATS = {
  totalUsers: 142,
  totalStudents: 980,
  totalWorkouts: 2400,
  revenue: 'R$ 5.8k'
};

const MOCK_ADMIN_ACTIVITY = [
  { text: 'Novo usuário <strong>Carlos Melo</strong> cadastrado', time: '5 min' },
  { text: 'Conta ativada por Fernanda S.', time: '20 min' },
  { text: 'Relatório mensal exportado por Admin', time: '1h' },
  { text: 'Usuário <strong>Pedro R.</strong> suspendeu a conta', time: '3h' },
  { text: 'Conta ativada para novo usuário', time: '5h' }
];

const MOCK_RECENT_USERS = [
  { name: 'João Dorea',   status: 'active',   date: '10/01/2025' },
  { name: 'Maria Santos', status: 'active',   date: '15/01/2025' },
  { name: 'Carlos Rocha', status: 'active',   date: '22/01/2025' },
  { name: 'Ana Pereira',  status: 'active',   date: '03/02/2025' },
  { name: 'Lucas Dias',   status: 'inactive', date: '10/02/2025' }
];

document.addEventListener('DOMContentLoaded', () => {
  renderAdminStats();
  renderAdminActivity();
  renderRecentUsers();
});

function renderAdminStats() {
  setEl('adminStatUsers',    MOCK_ADMIN_STATS.totalUsers);
  setEl('adminStatStudents', MOCK_ADMIN_STATS.totalStudents);
  setEl('adminStatWorkouts', MOCK_ADMIN_STATS.totalWorkouts);
}

function renderAdminActivity() {
  const el = document.getElementById('adminActivity');
  if (!el) return;
  el.innerHTML = MOCK_ADMIN_ACTIVITY.map(i => `
    <div class="activity-item">
      <div class="activity-dot" style="background:var(--admin-accent);box-shadow:0 0 6px var(--admin-accent);"></div>
      <div class="activity-text">${i.text}</div>
      <div class="activity-time">${i.time}</div>
    </div>
  `).join('');
}

function renderRecentUsers() {
  const tbody = document.getElementById('recentUsersBody');
  if (!tbody) return;
  tbody.innerHTML = MOCK_RECENT_USERS.map(u => `
    <tr>
      <td style="color:#ccc;">${u.name}</td>
      <td><span class="status-dot ${u.status}" style="color:#888;">${u.status === 'active' ? 'Ativo' : 'Inativo'}</span></td>
      <td style="color:#555;font-size:0.82rem;">${u.date}</td>
    </tr>
  `).join('');
}

function drawAdminChart() {
  const area = document.getElementById('adminChart');
  if (!area) return;
  const vals = [2,5,3,7,4,9,6,10,5,12,8,14];
  area.innerHTML = vals.map((v, i) => `
    <div class="chart-bar admin-chart-bar"
         style="height:${(v/14*100)}%;transition:height 0.6s ease ${i*0.05}s"
         title="${v} usuários"></div>
  `).join('');
}

function setEl(id, v) { const el = document.getElementById(id); if (el) el.textContent = v; }
