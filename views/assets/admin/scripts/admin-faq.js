let allFaqs = [];
let filteredFaqs = [];
let defaultCategoryId = 1;

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

document.addEventListener('DOMContentLoaded', async () => {
  injectFaqModal();
  initFaqControls();
  await ensureCategoryExists();
  await loadFaqs();
});

async function ensureCategoryExists() {
  try {
    const response = await fetch(`${getApiBase()}/faqs-categories/`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    const text = await response.text();
    const result = JSON.parse(text);
    const list = Array.isArray(result.data) ? result.data : [];

    if (list.length > 0 && list[0].id) {
      defaultCategoryId = Number(list[0].id);
      return;
    }

    const createRes = await fetch(`${getApiBase()}/faqs-categories/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name: 'Geral' })
    });
    const created = JSON.parse(await createRes.text());
    if (created?.data?.id) {
      defaultCategoryId = Number(created.data.id);
    }
  } catch (error) {
    console.warn('Aviso ao verificar categorias de FAQ:', error);
  }
}

async function loadFaqs() {
  const body = document.getElementById('faqTableBody');
  if (body) {
    body.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:32px;"><span class="spinner"></span></td></tr>';
  }

  try {
    const response = await fetch(`${getApiBase()}/faqs/`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    const rawText = await response.text();
    let result;
    try {
      result = JSON.parse(rawText);
    } catch (e) {
      console.error('Resposta inválida da API:', rawText);
      if (body) {
        body.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:32px;color:#ff6655;">Erro na resposta do servidor.</td></tr>';
      }
      return;
    }

    if (!response.ok || result.type === 'error') {
      if (body) {
        body.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:32px;color:#ff6655;">${result.message || 'Erro ao carregar FAQs.'}</td></tr>`;
      }
      return;
    }

    const rawList = Array.isArray(result.data) ? result.data : [];

    allFaqs = rawList.map(item => ({
      id: String(item.id),
      question: item.question || '',
      answer: item.answer || '',
      category_name: item.category_name || 'Geral',
      status: 'published'
    }));

    applyFilters();
  } catch (error) {
    console.error('Erro ao carregar FAQs:', error);
    if (body) {
      body.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:32px;color:#ff6655;">Erro ao carregar FAQs do servidor.</td></tr>';
    }
  }
}

function renderFaqRows() {
  const body = document.getElementById('faqTableBody');
  if (!body) return;

  if (filteredFaqs.length === 0) {
    body.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:32px;color:#777;">Nenhuma FAQ cadastrada no banco.</td></tr>';
    return;
  }

  body.innerHTML = filteredFaqs.map(item => `
    <tr data-faq-id="${item.id}">
      <td style="color:#ddd;font-weight:500;">${escapeHtml(item.question)}</td>
      <td style="color:#999;">${escapeHtml(item.answer)}</td>
      <td><span class="status-dot active">Ativo</span></td>
      <td>
        <div style="display:flex;gap:6px;">
          <button type="button" class="btn-admin btn-admin-outline" data-action="edit" data-id="${item.id}">
            Editar
          </button>
          <button type="button" class="btn-admin btn-admin-ghost" style="color:#ff6655;" data-action="delete" data-id="${item.id}" title="Remover FAQ">
            ✕
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function updateFaqStats() {
  setEl('faqCount', allFaqs.length);
  setEl('faqPublishedCount', allFaqs.length);
  setEl('faqDraftCount', 0);
  setEl('faqTableLabel', `${filteredFaqs.length} pergunta${filteredFaqs.length !== 1 ? 's' : ''} exibida${filteredFaqs.length !== 1 ? 's' : ''}`);
}

function applyFilters() {
  const search = (document.getElementById('faqSearch')?.value || '').trim().toLowerCase();
  const status = document.getElementById('faqStatusFilter')?.value || '';

  filteredFaqs = allFaqs.filter(item => {
    const matchesText =
      item.question.toLowerCase().includes(search) ||
      item.answer.toLowerCase().includes(search);
    const matchesStatus = !status || item.status === status;
    return matchesText && matchesStatus;
  });

  renderFaqRows();
  updateFaqStats();
}

function initFaqControls() {
  document.getElementById('faqSearch')?.addEventListener('input', applyFilters);
  document.getElementById('faqStatusFilter')?.addEventListener('change', applyFilters);

  document.getElementById('newFaqBtn')?.addEventListener('click', () => {
    openFaqModal();
  });

  document.getElementById('refreshFaqsBtn')?.addEventListener('click', async () => {
    await loadFaqs();
    showToast('Lista de FAQs atualizada.', 'success');
  });

  document.getElementById('faqTableBody')?.addEventListener('click', event => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const action = button.dataset.action;
    const id = button.dataset.id;
    const item = allFaqs.find(faq => faq.id === id);
    if (!item) return;

    if (action === 'edit') {
      openFaqModal(item);
    } else if (action === 'delete') {
      deleteFaq(item.id);
    }
  });
}

async function saveFaq(event) {
  event.preventDefault();

  const id = document.getElementById('faqFormId').value;
  const question = document.getElementById('faqFormQuestion').value.trim();
  const answer = document.getElementById('faqFormAnswer').value.trim();

  if (!question || !answer) {
    showToast('Preencha a pergunta e a resposta.', 'error');
    return;
  }

  const isEdit = Boolean(id);
  const url = isEdit ? `${getApiBase()}/faqs/${id}` : `${getApiBase()}/faqs/`;
  const method = isEdit ? 'PUT' : 'POST';

  const payload = {
    question,
    answer,
    faqs_category_id: defaultCategoryId
  };

  try {
    const response = await fetch(url, {
      method,
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });

    const rawText = await response.text();
    const result = JSON.parse(rawText);

    if (!response.ok || result.type === 'error') {
      showToast(result.message || 'Erro ao salvar FAQ.', 'error');
      return;
    }

    closeFaqModal();
    await loadFaqs();
    showToast(isEdit ? 'FAQ atualizada com sucesso.' : 'FAQ cadastrada com sucesso.', 'success');
  } catch (error) {
    console.error('Erro ao salvar FAQ:', error);
    showToast('Falha de comunicação com o servidor.', 'error');
  }
}

async function deleteFaq(id) {
  if (!confirm('Remover esta FAQ?')) return;

  try {
    const response = await fetch(`${getApiBase()}/faqs/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    const rawText = await response.text();
    const result = JSON.parse(rawText);

    if (!response.ok || result.type === 'error') {
      showToast(result.message || 'Erro ao remover FAQ.', 'error');
      return;
    }

    await loadFaqs();
    showToast('FAQ removida com sucesso.', 'success');
  } catch (error) {
    console.error('Erro ao excluir FAQ:', error);
    showToast('Falha ao excluir FAQ.', 'error');
  }
}

function injectFaqModal() {
  if (document.getElementById('faqModalOverlay')) return;

  const modalHtml = `
    <div id="faqModalOverlay" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:999;align-items:center;justify-content:center;padding:16px;">
      <div style="background:#111;border:1px solid #242424;border-radius:12px;width:100%;max-width:520px;padding:24px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h2 id="faqModalTitle" style="font-size:1.15rem;color:#fff;margin:0;">Nova FAQ</h2>
          <button type="button" id="closeFaqModalBtn" class="btn-admin btn-admin-ghost">✕</button>
        </div>

        <form id="faqForm" style="display:flex;flex-direction:column;gap:14px;">
          <input type="hidden" id="faqFormId" />

          <div>
            <label style="display:block;font-size:0.82rem;color:#999;margin-bottom:6px;">Pergunta</label>
            <input type="text" id="faqFormQuestion" required placeholder="Ex: Como funciona o TrainiFy?"
              style="width:100%;padding:10px 12px;background:#181818;border:1px solid #2a2a2a;border-radius:8px;color:#eee;" />
          </div>

          <div>
            <label style="display:block;font-size:0.82rem;color:#999;margin-bottom:6px;">Resposta</label>
            <textarea id="faqFormAnswer" rows="4" required placeholder="Digite a resposta completa..."
              style="width:100%;padding:10px 12px;background:#181818;border:1px solid #2a2a2a;border-radius:8px;color:#eee;resize:vertical;"></textarea>
          </div>

          <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:8px;">
            <button type="button" id="cancelFaqModalBtn" class="btn-admin btn-admin-ghost">Cancelar</button>
            <button type="submit" class="btn-admin btn-admin-primary">Salvar FAQ</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  document.getElementById('closeFaqModalBtn')?.addEventListener('click', closeFaqModal);
  document.getElementById('cancelFaqModalBtn')?.addEventListener('click', closeFaqModal);
  document.getElementById('faqModalOverlay')?.addEventListener('click', e => {
    if (e.target.id === 'faqModalOverlay') closeFaqModal();
  });
  document.getElementById('faqForm')?.addEventListener('submit', saveFaq);
}

function openFaqModal(item = null) {
  const overlay = document.getElementById('faqModalOverlay');
  if (!overlay) return;

  document.getElementById('faqModalTitle').textContent = item ? 'Editar FAQ' : 'Nova FAQ';
  document.getElementById('faqFormId').value = item ? item.id : '';
  document.getElementById('faqFormQuestion').value = item ? item.question : '';
  document.getElementById('faqFormAnswer').value = item ? item.answer : '';

  overlay.style.display = 'flex';
}

function closeFaqModal() {
  const overlay = document.getElementById('faqModalOverlay');
  if (overlay) overlay.style.display = 'none';
}

function setEl(id, v) {
  const el = document.getElementById(id);
  if (el) el.textContent = v;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text ?? '';
  return div.innerHTML;
}

function showToast(msg, type = 'info') {
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span style="color:var(--clr-neon);font-weight:700;">${icons[type] || '•'}</span> ${msg}`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(40px)';
    toast.style.transition = '0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}