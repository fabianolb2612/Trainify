/**
 * TrainiFy - students.js
 * Static version: all data is hardcoded mock data.
 */

const MOCK_STUDENTS_LIST = [
  { id:'1', name:'João Silva',      email:'joao@email.com',    phone:'(51) 99111-0001', level:'intermediate', gym:'SmartFit Centro',  status:'active' },
  { id:'2', name:'Maria Cardoso',   email:'maria@email.com',   phone:'(51) 99111-0002', level:'advanced',     gym:'BioFit',           status:'active' },
  { id:'3', name:'Pedro Tavares',   email:'pedro@email.com',   phone:'(51) 99111-0003', level:'beginner',     gym:'BlueGym',          status:'inactive' },
  { id:'4', name:'Ana Lima',        email:'ana@email.com',     phone:'(51) 99111-0004', level:'intermediate', gym:'FitClub',          status:'active' },
  { id:'5', name:'Carlos Rocha',    email:'carlos@email.com',  phone:'(51) 99111-0005', level:'advanced',     gym:'SmartFit Norte',   status:'active' },
  { id:'6', name:'Fernanda Souza',  email:'feh@email.com',     phone:'(51) 99111-0006', level:'beginner',     gym:'AcquaFit',         status:'active' },
  { id:'7', name:'Ricardo Melo',    email:'rico@email.com',    phone:'(51) 99111-0007', level:'intermediate', gym:'BlueGym',          status:'inactive' },
  { id:'8', name:'Juliana Neves',   email:'ju@email.com',      phone:'(51) 99111-0008', level:'advanced',     gym:'BioFit',           status:'active' }
];

const LEVEL_LABEL = { beginner:'Iniciante', intermediate:'Intermediário', advanced:'Avançado' };

let filtered = [...MOCK_STUDENTS_LIST];
let currentPage = 1;
const PER_PAGE = 6;

let studentsBootstrapped = false;

function bootstrapStudentsPage() {
  if (studentsBootstrapped) return;
  studentsBootstrapped = true;

  // Stats
  setEl('statStudents', MOCK_STUDENTS_LIST.length);
  setEl('statActive',   MOCK_STUDENTS_LIST.filter(s => s.status === 'active').length);
  setEl('statBeginner', MOCK_STUDENTS_LIST.filter(s => s.level === 'beginner').length);
  setEl('statAdvanced', MOCK_STUDENTS_LIST.filter(s => s.level === 'advanced').length);
  setEl('studentsCount', MOCK_STUDENTS_LIST.length);

  renderTable(filtered);
  initFilters();
  initStudentActions();

  document.getElementById('addStudentBtn')
    ?.addEventListener('click', () => { window.location.href = 'student.html?new=1'; });
}

document.addEventListener('DOMContentLoaded', bootstrapStudentsPage);
if (document.readyState === 'interactive' || document.readyState === 'complete') {
  bootstrapStudentsPage();
}

function initStudentActions() {
  const tbody = document.getElementById('studentsTableBody');
  tbody?.addEventListener('click', event => {
    const row = event.target.closest('tr[data-student-id]');
    if (!row) return;
    window.location.href = `student.html?student=${row.dataset.studentId}`;
  });

  const pagination = document.getElementById('pagination');
  pagination?.addEventListener('click', event => {
    const button = event.target.closest('button[data-page]');
    if (!button) return;
    goToPage(Number(button.dataset.page));
  });
}

function renderTable(list) {
  const tbody = document.getElementById('studentsTableBody');
  if (!tbody) return;
  const start = (currentPage - 1) * PER_PAGE;
  const page  = list.slice(start, start + PER_PAGE);

  if (!page.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--clr-grey-500);">Nenhum aluno encontrado.</td></tr>`;
    renderPagination(0);
    return;
  }

  tbody.innerHTML = page.map(s => `
    <tr data-student-id="${s.id}" class="student-row" style="cursor:pointer;">
      <td>
        <div class="student-cell">
          <div class="student-avatar">${initials(s.name)}</div>
          <div>
            <div class="student-name">${s.name}</div>
            <div class="student-email">${s.email}</div>
          </div>
        </div>
      </td>
      <td>${s.phone}</td>
      <td><span class="badge badge-info">${LEVEL_LABEL[s.level] || s.level}</span></td>
      <td>${s.gym}</td>
      <td><span class="badge ${s.status === 'active' ? 'badge-neon' : 'badge-warn'}">${s.status === 'active' ? 'Ativo' : 'Inativo'}</span></td>
    </tr>
  `).join('');

  renderPagination(list.length);
}

function renderPagination(total) {
  const container = document.getElementById('pagination');
  if (!container) return;
  const pages = Math.ceil(total / PER_PAGE);
  if (pages <= 1) { container.innerHTML = ''; return; }
  container.innerHTML = Array.from({ length: pages }, (_, i) =>
    `<button class="btn btn-sm ${i+1 === currentPage ? 'btn-primary' : 'btn-ghost'}" data-page="${i+1}">${i+1}</button>`
  ).join('');
}

function goToPage(page) {
  currentPage = page;
  renderTable(filtered);
}

function initFilters() {
  const search = document.getElementById('searchInput');
  const level  = document.getElementById('levelFilter');
  const status = document.getElementById('statusFilter');
  const run = () => {
    currentPage = 1;
    const q  = search?.value.toLowerCase() || '';
    const lv = level?.value  || '';
    const st = status?.value || '';
    filtered = MOCK_STUDENTS_LIST.filter(s =>
      (!q  || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)) &&
      (!lv || s.level === lv) &&
      (!st || s.status === st)
    );
    renderTable(filtered);
  };
  search?.addEventListener('input',  debounce(run, 200));
  level?.addEventListener('change',  run);
  status?.addEventListener('change', run);
}

// Called by topbar search in app-layout.js
function onTopbarSearch(q) {
  const el = document.getElementById('searchInput');
  if (el) { el.value = q; el.dispatchEvent(new Event('input')); }
}

function setEl(id, val) { const e = document.getElementById(id); if (e) e.textContent = val; }
function initials(n='') { const p=n.trim().split(' '); return(p.length>1?p[0][0]+p[p.length-1][0]:p[0].slice(0,2)).toUpperCase(); }
function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(()=>fn(...a), ms); }; }
