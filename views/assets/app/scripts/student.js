/**
 * TrainiFy - student.js
 * Static version: renders hardcoded mock student profile.
 */

const MOCK_STUDENT = {
  id: '1',
  name: 'João Silva',
  email: 'joao@email.com',
  phone: '(51) 99111-0001',
  birthdate: '1992-03-15',
  gym: 'SmartFit Centro',
  level: 'intermediate',
  goal: 'Hipertrofia',
  status: 'active',
  createdAt: '2025-01-10',
  notes: 'Tendinite no joelho esquerdo — evitar agachamento profundo. Prefere treinos de alta intensidade pela manhã. Histórico de hérnia de disco L4-L5 em 2023, já recuperado.'
};

const MOCK_WORKOUT = {
  id: 'w1',
  name: 'Treino A — Hipertrofia',
  description: 'Foco em volume e intensidade moderada',
  days: [
    {
      name: 'Dia A — Peito, Tríceps e Ombro',
      exercises: [
        { name: 'Supino Reto c/ Barra',   sets: 4, reps: '10-12', rest: 60 },
        { name: 'Crucifixo no Banco',      sets: 3, reps: '12-15', rest: 45 },
        { name: 'Desenvolvimento c/ Halteres', sets: 4, reps: '10',    rest: 60 },
        { name: 'Tríceps Testa',           sets: 4, reps: '10',    rest: 60 }
      ]
    },
    {
      name: 'Dia B — Costas e Bíceps',
      exercises: [
        { name: 'Puxada Frente c/ Barra',  sets: 4, reps: '10-12', rest: 60 },
        { name: 'Remada Curvada',           sets: 4, reps: '10',    rest: 60 },
        { name: 'Rosca Direta c/ Barra',   sets: 3, reps: '10-12', rest: 45 },
        { name: 'Rosca Alternada',          sets: 3, reps: '12',    rest: 45 }
      ]
    },
    {
      name: 'Dia C — Pernas',
      exercises: [
        { name: 'Agachamento Livre',        sets: 4, reps: '8-10',  rest: 90 },
        { name: 'Leg Press 45°',            sets: 4, reps: '12',    rest: 60 },
        { name: 'Cadeira Extensora',        sets: 3, reps: '15',    rest: 45 },
        { name: 'Mesa Flexora',             sets: 3, reps: '12',    rest: 45 }
      ]
    }
  ]
};

const LEVEL_LABEL = { beginner:'Iniciante', intermediate:'Intermediário', advanced:'Avançado' };

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('new') === '1') {
    renderNewStudentForm();
  } else {
    renderStudentProfile(MOCK_STUDENT);
    renderWorkout(MOCK_WORKOUT);
  }
  initStudentActions();
});

function renderStudentProfile(s) {
  document.title = `${s.name} — TrainiFy`;
  const titleEl = document.getElementById('topbarTitle');
  if (titleEl) titleEl.textContent = s.name;

  const container = document.getElementById('studentContent');
  if (!container) return;

  container.innerHTML = `
    <div class="profile-hero">
      <div class="profile-avatar-lg">${initials(s.name)}</div>
      <div class="profile-meta">
        <div class="profile-name">${s.name}</div>
        <div class="profile-tags">
          <span class="badge badge-info">${LEVEL_LABEL[s.level] || s.level}</span>
          ${s.gym ? `<span class="badge badge-info">${s.gym}</span>` : ''}
          <span class="badge ${s.status === 'active' ? 'badge-neon' : 'badge-warn'}">${s.status === 'active' ? 'Ativo' : 'Inativo'}</span>
        </div>
      </div>
      <div class="profile-actions">
        <button class="btn btn-ghost btn-sm" type="button" data-action="edit-student">✏ Editar</button>
        <button class="btn btn-outline btn-sm" type="button" data-action="export-student-pdf">↓ Exportar PDF</button>
        <button class="btn btn-danger btn-sm" type="button" data-action="remove-student">✕ Remover</button>
      </div>
    </div>

    <div class="info-grid">
      <div class="info-block"><div class="info-block-label">Email</div><div class="info-block-value">${s.email}</div></div>
      <div class="info-block"><div class="info-block-label">Telefone</div><div class="info-block-value">${s.phone}</div></div>
      <div class="info-block"><div class="info-block-label">Data de Nascimento</div><div class="info-block-value">${fmtDate(s.birthdate)}</div></div>
      <div class="info-block"><div class="info-block-label">Academia</div><div class="info-block-value">${s.gym}</div></div>
      <div class="info-block"><div class="info-block-label">Objetivo</div><div class="info-block-value">${s.goal}</div></div>
      <div class="info-block"><div class="info-block-label">Cadastrado em</div><div class="info-block-value">${fmtDate(s.createdAt)}</div></div>
    </div>

    <div class="notes-card">
      <h3>📋 Observações / Lesões / Dificuldades</h3>
      <div class="notes-text">${s.notes || '<span style="color:var(--clr-grey-500)">Nenhuma observação registrada.</span>'}</div>
    </div>

    <div id="workoutSection"></div>
  `;
}

function renderWorkout(w) {
  const section = document.getElementById('workoutSection');
  if (!section) return;

  const daysHtml = w.days.map(day => `
    <div class="workout-day">
      <div class="day-label">${day.name}</div>
      <div class="exercise-list">
        ${day.exercises.map(ex => `
          <div class="exercise-row">
            <div class="exercise-name">${ex.name}</div>
            <div class="exercise-meta"><span>${ex.sets}</span>Séries</div>
            <div class="exercise-meta"><span>${ex.reps}</span>Reps</div>
            <div class="exercise-meta"><span>${ex.rest}s</span>Descanso</div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  section.innerHTML = `
    <div class="workout-section">
      <div class="workout-section-header">
        <div>
          <h3 style="font-size:1rem;font-weight:700;">🏋 ${w.name}</h3>
          <div style="font-size:0.8rem;color:var(--clr-grey-500);margin-top:2px;">${w.description}</div>
        </div>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-ghost btn-sm" type="button" data-action="view-workout-details">Ver Detalhes</button>
          <button class="btn btn-outline btn-sm" type="button" data-action="export-workout-pdf">↓ PDF</button>
        </div>
      </div>
      ${daysHtml}
    </div>
  `;
}

function renderWorkoutModal(w) {
  const body = document.getElementById('workoutModalBody');
  const title = document.getElementById('workoutModalTitle');
  const subtitle = document.getElementById('workoutModalSubtitle');
  if (!body || !title || !subtitle) return;

  title.textContent = w.name;
  subtitle.textContent = w.description;
  body.innerHTML = w.days.map(day => `
    <section class="modal-workout-day">
      <div class="modal-day-header">
        <div>
          <div class="day-label">${day.name}</div>
          <p class="modal-day-note">${day.exercises.length} exercícios</p>
        </div>
        <button class="btn btn-ghost btn-sm" type="button" data-action="toggle-workout-edit">Editar dia</button>
      </div>
      <div class="modal-exercises">
        ${day.exercises.map(ex => `
          <div class="modal-exercise-row">
            <input class="modal-input modal-input-name" value="${ex.name}" disabled />
            <input class="modal-input modal-input-meta" value="${ex.sets}" disabled />
            <input class="modal-input modal-input-meta" value="${ex.reps}" disabled />
            <input class="modal-input modal-input-meta" value="${ex.rest}" disabled />
          </div>
        `).join('')}
      </div>
    </section>
  `).join('');
}

function openWorkoutModal() {
  renderWorkoutModal(MOCK_WORKOUT);
  const modal = document.getElementById('workoutModal');
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
}

function closeWorkoutModal() {
  const modal = document.getElementById('workoutModal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
}

function toggleWorkoutEditMode() {
  const modal = document.getElementById('workoutModal');
  if (!modal) return;
  const isEditing = modal.classList.toggle('editing');
  modal.querySelectorAll('.modal-input').forEach(input => {
    input.disabled = !isEditing;
  });
  modal.querySelectorAll('[data-action="toggle-workout-edit"]').forEach(button => {
    button.textContent = isEditing ? 'Modo Visualizar' : 'Editar treino';
  });
}

function saveWorkoutChanges() {
  const modal = document.getElementById('workoutModal');
  if (modal && modal.classList.contains('editing')) {
    toggleWorkoutEditMode();
  }
  alert('As alterações ficam visíveis após integração com o backend.');
}

function addWorkoutExercise() {
  const firstDay = document.querySelector('#workoutModalBody .modal-workout-day .modal-exercises');
  if (!firstDay) return;
  firstDay.insertAdjacentHTML('beforeend', `
    <div class="modal-exercise-row">
      <input class="modal-input modal-input-name" value="Novo exercício" />
      <input class="modal-input modal-input-meta" value="3" />
      <input class="modal-input modal-input-meta" value="12" />
      <input class="modal-input modal-input-meta" value="60" />
    </div>
  `);
  const modal = document.getElementById('workoutModal');
  if (modal && !modal.classList.contains('editing')) toggleWorkoutEditMode();
}

function renderNewStudentForm() {
  const titleEl = document.getElementById('topbarTitle');
  if (titleEl) titleEl.textContent = 'Novo Aluno';

  const container = document.getElementById('studentContent');
  if (!container) return;

  container.innerHTML = `
    <div class="card" style="max-width:700px;">
      <h2 style="margin-bottom:var(--space-xl);">Cadastrar Novo Aluno</h2>
      <form id="newStudentForm">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-md);">
          <div class="form-group" style="grid-column:1/-1">
            <label>Nome Completo *</label>
            <input class="form-control" name="name" required placeholder="João da Silva" />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input class="form-control" name="email" type="email" placeholder="joao@email.com" />
          </div>
          <div class="form-group">
            <label>Telefone</label>
            <input class="form-control" name="phone" placeholder="(51) 99999-0000" />
          </div>
          <div class="form-group">
            <label>Academia</label>
            <input class="form-control" name="gym" placeholder="SmartFit Centro" />
          </div>
          <div class="form-group">
            <label>Nível de Treino</label>
            <select class="form-control" name="level">
              <option value="">Selecionar...</option>
              <option value="beginner">Iniciante</option>
              <option value="intermediate">Intermediário</option>
              <option value="advanced">Avançado</option>
            </select>
          </div>
          <div class="form-group">
            <label>Data de Nascimento</label>
            <input class="form-control" name="birthdate" type="date" />
          </div>
          <div class="form-group">
            <label>Objetivo</label>
            <input class="form-control" name="goal" placeholder="Hipertrofia, emagrecimento..." />
          </div>
          <div class="form-group" style="grid-column:1/-1">
            <label>Observações / Lesões / Dificuldades</label>
            <textarea class="form-control" name="notes" placeholder="Descreva lesões, limitações ou qualquer informação importante..."></textarea>
          </div>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:var(--space-sm);margin-top:var(--space-md);">
          <button type="button" class="btn btn-ghost" data-action="cancel-form">Cancelar</button>
          <button type="submit" class="btn btn-primary">Cadastrar Aluno</button>
        </div>
      </form>
    </div>
  `;

  document.getElementById('newStudentForm').addEventListener('submit', e => {
    e.preventDefault();
    alert('Cadastro disponível após integração com backend PHP.');
  });
}

function initStudentActions() {
  document.body.addEventListener('click', event => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const action = button.dataset.action;
    if (action === 'edit-student' || action === 'export-student-pdf' || action === 'export-workout-pdf') {
      alert('Funcionalidade disponível após integração com backend.');
      return;
    }
    if (action === 'remove-student') {
      confirmDelete();
      return;
    }
    if (action === 'view-workout-details') {
      openWorkoutModal();
      return;
    }
    if (action === 'close-workout-modal') {
      closeWorkoutModal();
      return;
    }
    if (action === 'toggle-workout-edit') {
      toggleWorkoutEditMode();
      return;
    }
    if (action === 'save-workout-changes') {
      saveWorkoutChanges();
      return;
    }
    if (action === 'add-workout-exercise') {
      addWorkoutExercise();
      return;
    }
    if (action === 'cancel-form') {
      history.back();
      return;
    }
  });
}

function confirmDelete() {
  if (confirm('Remover este aluno? Esta ação não pode ser desfeita.')) {
    alert('Remoção disponível após integração com backend.');
  }
}

function initials(n='') { const p=n.trim().split(' '); return(p.length>1?p[0][0]+p[p.length-1][0]:p[0].slice(0,2)).toUpperCase(); }
function fmtDate(d)      { try { return new Date(d).toLocaleDateString('pt-BR'); } catch { return d; } }
