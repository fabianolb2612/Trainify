/**
 * TrainiFy - workout.js
 * Static version: renders hardcoded mock workout.
 */

const MOCK_WORKOUT_DETAIL = {
  id: 'w1',
  name: 'Treino A — Hipertrofia',
  description: 'Foco em volume e intensidade moderada para ganho de massa muscular.',
  frequency: '4x por semana',
  goal: 'Hipertrofia',
  level: 'Intermediário',
  studentName: 'João Silva',
  studentId: '1',
  days: [
    {
      name: 'Peito, Tríceps e Ombro',
      exercises: [
        { name: 'Supino Reto c/ Barra',        sets: 4, reps: '10-12', rest: 60 },
        { name: 'Crucifixo no Banco Inclinado', sets: 3, reps: '12-15', rest: 45 },
        { name: 'Desenvolvimento c/ Halteres',  sets: 4, reps: '10',    rest: 60 },
        { name: 'Elevação Lateral',             sets: 3, reps: '15',    rest: 45 },
        { name: 'Tríceps Testa',                sets: 4, reps: '10',    rest: 60 },
        { name: 'Tríceps Corda',                sets: 3, reps: '12',    rest: 45 }
      ]
    },
    {
      name: 'Costas e Bíceps',
      exercises: [
        { name: 'Puxada Frente c/ Barra',    sets: 4, reps: '10-12', rest: 60 },
        { name: 'Remada Curvada c/ Barra',   sets: 4, reps: '10',    rest: 60 },
        { name: 'Remada Unilateral',         sets: 3, reps: '12',    rest: 45 },
        { name: 'Rosca Direta c/ Barra',     sets: 3, reps: '10-12', rest: 45 },
        { name: 'Rosca Alternada c/ Halteres', sets: 3, reps: '12',  rest: 45 }
      ]
    },
    {
      name: 'Pernas',
      exercises: [
        { name: 'Agachamento Livre',   sets: 4, reps: '8-10', rest: 90 },
        { name: 'Leg Press 45°',       sets: 4, reps: '12',   rest: 60 },
        { name: 'Cadeira Extensora',   sets: 3, reps: '15',   rest: 45 },
        { name: 'Mesa Flexora',        sets: 3, reps: '12',   rest: 45 },
        { name: 'Panturrilha em Pé',   sets: 4, reps: '20',   rest: 30 }
      ]
    }
  ]
};

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('id')) {
    renderWorkoutView(MOCK_WORKOUT_DETAIL);
  } else {
    renderWorkoutBuilder();
  }
  initWorkoutActions();
});

function renderWorkoutView(w) {
  const titleEl = document.getElementById('topbarTitle');
  if (titleEl) titleEl.textContent = w.name;

  const container = document.getElementById('workoutContent');
  if (!container) return;

  const letters = ['A','B','C','D','E','F','G'];

  const daysHtml = w.days.map((day, di) => `
    <div class="day-block">
      <div class="day-block-header">
        <div class="day-block-title">
          <span>${letters[di]}</span> ${day.name}
        </div>
        <div style="display:flex;gap:8px;">
          <span class="badge badge-info">${day.exercises.length} exercícios</span>
          <button class="btn btn-ghost btn-sm" type="button" data-action="edit-day">✏ Editar</button>
        </div>
      </div>
      <div class="day-block-body">
        <div class="ex-table-header">
          <div>Exercício</div>
          <div style="text-align:center;">Séries</div>
          <div style="text-align:center;">Reps</div>
          <div style="text-align:center;">Descanso</div>
          <div></div>
        </div>
        ${day.exercises.map((ex, ei) => `
          <div class="ex-row">
            <div class="ex-name-cell"><span class="ex-num">${ei+1}</span>${ex.name}</div>
            <div class="ex-cell">${ex.sets}</div>
            <div class="ex-cell">${ex.reps}</div>
            <div class="ex-cell"><span class="rest-badge">⏱ ${ex.rest}s</span></div>
            <div class="ex-actions">
              <button class="btn btn-ghost btn-sm ex-edit-btn" type="button" data-action="edit-exercise">✏</button>
            </div>
          </div>
        `).join('')}
        <div class="add-exercise-row" data-action="add-exercise">
          <span>+</span> Adicionar exercício
        </div>
      </div>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="workout-meta-card" style="margin-bottom:var(--space-lg);">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:var(--space-md);">
        <div>
          <h2 style="font-size:1.6rem;font-weight:800;margin-bottom:4px;">${w.name}</h2>
          <p style="color:var(--clr-grey-300);font-size:0.9rem;">${w.description}</p>
        </div>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-ghost btn-sm" type="button" data-action="duplicate-workout">⎘ Duplicar</button>
          <button class="btn btn-primary btn-sm" type="button" data-action="save-workout">💾 Salvar</button>
        </div>
      </div>
      <div class="workout-meta-grid">
        <div class="info-block"><div class="info-block-label">Frequência</div><div class="info-block-value">${w.frequency}</div></div>
        <div class="info-block"><div class="info-block-label">Objetivo</div><div class="info-block-value">${w.goal}</div></div>
        <div class="info-block"><div class="info-block-label">Nível</div><div class="info-block-value">${w.level}</div></div>
        <div class="info-block">
          <div class="info-block-label">Aluno</div>
          <div class="info-block-value">
            <a href="student.html" style="color:var(--clr-neon);">${w.studentName}</a>
          </div>
        </div>
      </div>
    </div>
    <div class="workout-builder">
      ${daysHtml}
      <button class="btn btn-outline" style="align-self:flex-start;" type="button" data-action="add-workout-day">
        + Adicionar Dia de Treino
      </button>
    </div>
  `;
}

function renderWorkoutBuilder() {
  const titleEl = document.getElementById('topbarTitle');
  if (titleEl) titleEl.textContent = 'Novo Treino';

  const container = document.getElementById('workoutContent');
  if (!container) return;

  container.innerHTML = `
    <div class="card" style="max-width:600px;margin-bottom:var(--space-lg);">
      <h2 style="margin-bottom:var(--space-xl);">Criar Novo Treino</h2>
      <form id="newWorkoutForm">
        <div class="form-group">
          <label>Nome do Treino *</label>
          <input class="form-control" name="name" required placeholder="Treino de Força — Hipertrofia" />
        </div>
        <div class="form-group">
          <label>Descrição</label>
          <input class="form-control" name="description" placeholder="Foco em volume e intensidade moderada..." />
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-md);">
          <div class="form-group">
            <label>Objetivo</label>
            <select class="form-control" name="goal">
              <option value="">Selecionar...</option>
              <option>Hipertrofia</option>
              <option>Emagrecimento</option>
              <option>Condicionamento</option>
              <option>Reabilitação</option>
              <option>Força</option>
            </select>
          </div>
          <div class="form-group">
            <label>Nível</label>
            <select class="form-control" name="level">
              <option value="">Selecionar...</option>
              <option value="beginner">Iniciante</option>
              <option value="intermediate">Intermediário</option>
              <option value="advanced">Avançado</option>
            </select>
          </div>
          <div class="form-group">
            <label>Frequência Semanal</label>
            <select class="form-control" name="frequency">
              <option>3x por semana</option>
              <option>4x por semana</option>
              <option>5x por semana</option>
              <option>6x por semana</option>
            </select>
          </div>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:var(--space-md);">
          <button type="button" class="btn btn-ghost" data-action="cancel-form">Cancelar</button>
          <button type="submit" class="btn btn-primary">Criar Treino</button>
        </div>
      </form>
    </div>
  `;

  document.getElementById('newWorkoutForm').addEventListener('submit', e => {
    e.preventDefault();
    alert('Criação de treino disponível após integração com backend PHP.');
  });
}

function initWorkoutActions() {
  const container = document.getElementById('workoutContent');
  container?.addEventListener('click', event => {
    const button = event.target.closest('button[data-action]');
    if (button) {
      const action = button.dataset.action;
      if (action === 'edit-day' || action === 'edit-exercise') {
        alert('Edição disponível após integração com backend.');
        return;
      }
      if (action === 'duplicate-workout') {
        alert('Duplicar disponível após integração com backend.');
        return;
      }
      if (action === 'save-workout') {
        alert('Salvar disponível após integração com backend.');
        return;
      }
      if (action === 'add-workout-day' || action === 'add-exercise') {
        alert('Adicionar disponível após integração com backend.');
        return;
      }
      if (action === 'cancel-form') {
        history.back();
        return;
      }
    }

    const link = event.target.closest('a');
    if (link && link.getAttribute('href') === 'student.html') {
      event.preventDefault();
      window.location.href = 'student.html';
    }
  });
}
