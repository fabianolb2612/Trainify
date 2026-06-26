/**
 * TrainiFy - dashboard.js
 * Static version: all data is hardcoded mock data.
 */

const MOCK_STATS = {
  totalStudents: 24,
  totalWorkouts: 38,
  activeStudents: 19,
  newThisMonth: 3
};

const MOCK_ACTIVITY = [
  { text: '<strong>João Silva</strong> iniciou o treino A', time: '2 min' },
  { text: '<strong>Maria Cardoso</strong> foi cadastrada', time: '1h' },
  { text: 'Treino de Pedro exportado em PDF', time: '3h' },
  { text: '<strong>Ana Lima</strong> atualizou o perfil', time: '5h' },
  { text: 'Novo treino criado para <strong>Carlos R.</strong>', time: 'Ontem' }
];

const MOCK_STUDENTS = [
  { id: '1', name: 'João Silva',    email: 'joao@email.com',   level: 'Intermediário', gym: 'SmartFit Centro', status: 'active' },
  { id: '2', name: 'Maria Cardoso', email: 'maria@email.com',  level: 'Avançado',      gym: 'BioFit',          status: 'active' },
  { id: '3', name: 'Pedro Tavares', email: 'pedro@email.com',  level: 'Iniciante',     gym: 'BlueGym',         status: 'inactive' },
  { id: '4', name: 'Ana Lima',      email: 'ana@email.com',    level: 'Intermediário', gym: 'FitClub',         status: 'active' },
  { id: '5', name: 'Carlos Rocha',  email: 'carlos@email.com', level: 'Avançado',      gym: 'SmartFit Norte',  status: 'active' }
];

document.addEventListener('DOMContentLoaded', () => {
  renderStats();
  renderActivity();
  renderRecentStudents();
  bindStudentRowClicks();
  initDashboardActions();
  drawChart();
  // Welcome name
  const el = document.getElementById('welcomeName');
  if (el) el.textContent = 'João';
});

function renderStats() {
  setEl('statStudents', MOCK_STATS.totalStudents);
  setEl('statWorkouts', MOCK_STATS.totalWorkouts);
  setEl('statActive',   MOCK_STATS.activeStudents);
  setEl('statNew',      MOCK_STATS.newThisMonth);
}

function renderActivity() {
  const container = document.getElementById('activityFeed');
  if (!container) return;
  container.innerHTML = MOCK_ACTIVITY.map(item => `
    <div class="activity-item">
      <div class="activity-dot"></div>
      <div class="activity-text">${item.text}</div>
      <div class="activity-time">${item.time}</div>
    </div>
  `).join('');
}

function renderRecentStudents() {
  const tbody = document.getElementById('recentStudentsBody');
  if (!tbody) return;
  tbody.innerHTML = MOCK_STUDENTS.map(s => `
    <tr data-student-id="${s.id}" class="student-row">
      <td>
        <div class="student-cell">
          <div class="student-avatar">${initials(s.name)}</div>
          <div>
            <div class="student-name">${s.name}</div>
            <div class="student-email">${s.email}</div>
          </div>
        </div>
      </td>
      <td><span class="badge badge-info">${s.level}</span></td>
      <td>${s.gym}</td>
      <td><span class="badge ${s.status === 'active' ? 'badge-neon' : 'badge-warn'}">${s.status === 'active' ? 'Ativo' : 'Inativo'}</span></td>
    </tr>
  `).join('');
}

function bindStudentRowClicks() {
  const tbody = document.getElementById('recentStudentsBody');
  if (!tbody) return;
  tbody.addEventListener('click', event => {
    const row = event.target.closest('tr[data-student-id]');
    if (!row) return;
    window.location.href = 'student.html?student=' + row.dataset.studentId;
  });
}

function initDashboardActions() {
  document.querySelectorAll('.quick-action-btn[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      if (action === 'new-student') {
        window.location.href = 'student.html?new=1';
      } else if (action === 'new-workout') {
        window.location.href = 'workout.html';
      } else if (action === 'view-students') {
        window.location.href = 'students.html';
      } else if (action === 'view-profile') {
        window.location.href = 'profile.html';
      }
    });
  });
}

function drawChart() {
  const area = document.getElementById('trainingChart');
  if (!area) return;
  const vals = [3, 5, 4, 8, 6, 10, 7, 9, 5, 11, 8, 12];
  area.innerHTML = vals.map((v, i) => `
    <div class="chart-bar${i === 11 ? ' active' : ''}"
         style="height:${(v/12*100)}%;transition:height 0.6s ease ${i*0.04}s"
         title="${v} treinos"></div>
  `).join('');
}

function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}
function initials(name = '') {
  const p = name.trim().split(' ');
  return (p.length > 1 ? p[0][0] + p[p.length-1][0] : p[0].slice(0,2)).toUpperCase();
}
