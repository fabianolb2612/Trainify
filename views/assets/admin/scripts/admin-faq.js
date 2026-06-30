/**
 * TrainiFy - admin-faq.js
 * Static FAQ management mock page.
 */

const MOCK_FAQS = [
  { id: '1', question: 'O TrainiFy é gratuito?', answer: 'Sim! O TrainiFy é gratuito e permite cadastrar até 5 alunos, criar treinos básicos e usar o dashboard com todos os recursos essenciais para organizar sua rotina.', status: 'published' },
  { id: '2', question: 'Preciso instalar algum aplicativo?', answer: 'Não. O TrainiFy é uma plataforma web responsiva que funciona diretamente no navegador — no computador, tablet ou celular. Sem instalação, sem download.', status: 'published' },
  { id: '3', question: 'Meus alunos precisam ter uma conta?', answer: 'Não. Apenas o personal trainer precisa de uma conta. Você cadastra seus alunos dentro da plataforma e pode exportar as fichas em PDF para compartilhar com eles pelo meio que preferir.', status: 'published' },
  { id: '4', question: 'Como funciona a exportação em PDF?', answer: 'Com um clique, o TrainiFy gera um PDF profissional da ficha de treino do aluno, com layout formatado e pronto para impressão ou envio via WhatsApp.', status: 'published' },
  { id: '5', question: 'Posso encerrar minha conta a qualquer momento?', answer: 'Sim. Você pode encerrar sua conta a qualquer momento. Seus dados serão tratados conforme nossa política de privacidade e disponibilizados para exclusão quando necessário.', status: 'published' },
  { id: '6', question: 'Os dados dos meus alunos estão seguros?', answer: 'Absolutamente. Todos os dados são criptografados em trânsito e em repouso. Seguimos as diretrizes da LGPD e nenhuma informação dos seus alunos é compartilhada com terceiros.', status: 'published' }
];

let currentFaqs = [...MOCK_FAQS];

document.addEventListener('DOMContentLoaded', () => {
  renderFaqRows();
  updateFaqStats();
  initFaqControls();
});

function renderFaqRows() {
  const body = document.getElementById('faqTableBody');
  if (!body) return;

  if (currentFaqs.length === 0) {
    body.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:32px;color:#777;">Nenhuma FAQ encontrada.</td></tr>';
    return;
  }

  body.innerHTML = currentFaqs.map(item => `
    <tr data-faq-id="${item.id}">
      <td>${item.question}</td>
      <td>${item.answer}</td>
      <td><span class="status-dot ${item.status === 'published' ? 'active' : 'inactive'}">${item.status === 'published' ? 'Publicado' : 'Rascunho'}</span></td>
      <td>
        <button class="btn-admin btn-admin-ghost" data-action="toggle" data-id="${item.id}">${item.status === 'published' ? 'Despublicar' : 'Publicar'}</button>
        <button class="btn-admin btn-admin-outline" data-action="edit" data-id="${item.id}">Editar</button>
      </td>
    </tr>
  `).join('');
}

function updateFaqStats() {
  const published = currentFaqs.filter(item => item.status === 'published').length;
  const draft = currentFaqs.filter(item => item.status === 'draft').length;
  document.getElementById('faqCount').textContent = currentFaqs.length;
  document.getElementById('faqPublishedCount').textContent = published;
  document.getElementById('faqDraftCount').textContent = draft;
  document.getElementById('faqTableLabel').textContent = `${currentFaqs.length} perguntas exibidas`;
}

function initFaqControls() {
  document.getElementById('faqSearch')?.addEventListener('input', event => {
    filterFaqs(event.target.value, document.getElementById('faqStatusFilter')?.value);
  });

  document.getElementById('faqStatusFilter')?.addEventListener('change', event => {
    filterFaqs(document.getElementById('faqSearch')?.value, event.target.value);
  });

  document.getElementById('newFaqBtn')?.addEventListener('click', () => {
    showToast('A funcionalidade de criação de FAQ será integrada em breve.', 'info');
  });

  document.getElementById('refreshFaqsBtn')?.addEventListener('click', () => {
    currentFaqs = [...MOCK_FAQS];
    renderFaqRows();
    updateFaqStats();
    showToast('Lista de FAQs atualizada.', 'success');
  });

  document.getElementById('faqTableBody')?.addEventListener('click', event => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const action = button.dataset.action;
    const id = button.dataset.id;
    const item = currentFaqs.find(faq => faq.id === id);
    if (!item) return;

    if (action === 'toggle') {
      item.status = item.status === 'published' ? 'draft' : 'published';
      renderFaqRows();
      updateFaqStats();
      showToast(`FAQ ${item.status === 'published' ? 'publicada' : 'despublicada'} com sucesso.`, 'success');
    }

    if (action === 'edit') {
      showToast('Edição de FAQ ainda é uma ação mock. Integração futura necessária.', 'info');
    }
  });
}

function filterFaqs(search = '', status = '') {
  const trimmed = search.trim().toLowerCase();
  currentFaqs = MOCK_FAQS.filter(item => {
    const matchesText = item.question.toLowerCase().includes(trimmed) || item.answer.toLowerCase().includes(trimmed);
    const matchesStatus = !status || item.status === status;
    return matchesText && matchesStatus;
  });
  renderFaqRows();
  updateFaqStats();
}

function showToast(msg, type = 'info') {
  const icons = { success:'✓', error:'✕', info:'ℹ' };
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span style="color:var(--clr-neon);font-weight:700;">${icons[type]||'•'}</span> ${msg}`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(40px)';
    toast.style.transition = '0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
