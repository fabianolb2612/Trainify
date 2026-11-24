const MOCK_ADMIN_STATS = {
  totalUsers: 1,
  totalStudents: 1,
  totalWorkouts: 1,
  revenue: 'R$ 0,00'
};

const MOCK_ADMIN_ACTIVITY = [
  { text: 'Novo usuário <strong>Fabiano Braga</strong> cadastrado', time: '10 min' },
  { text: 'Aluno <strong>Alex Possamai</strong> cadastrado por Fabiano Braga', time: '5 min' },
  { text: 'Novo treino criado para <strong>Alex Possamai</strong>', time: '2 min' }
];

const MOCK_RECENT_USERS = [
  { name: 'Fabiano Braga', status: 'active', date: '24/11/2026' }
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