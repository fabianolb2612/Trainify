const FALLBACK_FAQS = [
  {
    question: 'O TrainiFy é gratuito?',
    answer: 'Sim! O TrainiFy é gratuito e permite cadastrar até 5 alunos, criar treinos básicos e usar o dashboard com todos os recursos essenciais para organizar sua rotina.'
  },
  {
    question: 'Preciso instalar algum aplicativo?',
    answer: 'Não. O TrainiFy é uma plataforma web responsiva que funciona diretamente no navegador — no computador, tablet ou celular. Sem instalação, sem download.'
  },
  {
    question: 'Meus alunos precisam ter uma conta?',
    answer: 'Não. Apenas o personal trainer precisa de uma conta. Você cadastra seus alunos dentro da plataforma e pode exportar as fichas em PDF para compartilhar com eles pelo meio que preferir.'
  },
  {
    question: 'Como funciona a exportação em PDF?',
    answer: 'Com um clique, o TrainiFy gera um PDF profissional da ficha de treino do aluno, com layout formatado e pronto para impressão ou envio via WhatsApp.'
  }
];

function getPublicApiBase() {
  const path = window.location.pathname;
  const viewsIndex = path.indexOf('/views/');
  if (viewsIndex !== -1) {
    return `${window.location.origin}${path.substring(0, viewsIndex)}/api`;
  }
  const basePath = path.replace(/\/[^/]*$/, '');
  return `${window.location.origin}${basePath}/api`;
}

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initChartBars();
  animateOnScroll();
  initMobileMenu();
  initFaqToggle();
  loadPublicFaqs();
  initSmoothScroll();
});

function initNav() {
  const nav = document.querySelector('.pub-nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

/** Animated chart bars in benefits section */
function initChartBars() {
  const bars = document.querySelectorAll('.chart-bar');
  const heights = [45, 70, 55, 85, 60, 90, 75, 50, 80, 65, 95, 40];
  bars.forEach((bar, i) => {
    bar.style.height = `${heights[i % heights.length]}%`;
    if (i === 6 || i === 10) bar.classList.add('active');
  });
}

function animateOnScroll() {
  const targets = document.querySelectorAll('.feature-card, .step-card, .price-card, .benefit-item');
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  targets.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = `opacity 0.5s ease ${i * 0.06}s, transform 0.5s ease ${i * 0.06}s`;
    observer.observe(el);
  });
}

/** Mobile nav toggle */
function initMobileMenu() {
  const toggle = document.getElementById('mobileMenuToggle');
  const menu = document.getElementById('mobileMenu');
  if (!toggle || !menu) return;
  toggle.addEventListener('click', () => {
    menu.classList.toggle('open');
  });
}

function initFaqToggle() {
  const faqList = document.getElementById('faqList');
  if (!faqList) return;

  faqList.addEventListener('click', (event) => {
    const button = event.target.closest('.faq-question');
    if (!button) return;

    const item = button.closest('.faq-item');
    if (!item) return;

    item.classList.toggle('open');
    const icon = button.querySelector('.faq-icon');
    if (icon) {
      icon.textContent = item.classList.contains('open') ? '−' : '+';
    }
  });
}

async function loadPublicFaqs() {
  const listEl = document.getElementById('faqList');
  if (!listEl) return;

  try {
    const response = await fetch(`${getPublicApiBase()}/faqs/`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    const rawText = await response.text();
    const result = JSON.parse(rawText);

    if (!response.ok || result.type === 'error') {
      renderPublicFaqs(FALLBACK_FAQS);
      return;
    }

    const faqs = Array.isArray(result.data) ? result.data : [];

    if (faqs.length === 0) {
      listEl.innerHTML = `
        <div style="text-align:center;padding:32px;color:var(--clr-grey-500);">
          Nenhuma pergunta frequente cadastrada no momento.
        </div>
      `;
      return;
    }

    renderPublicFaqs(faqs);
  } catch (error) {
    console.warn('Não foi possível carregar FAQs da API, exibindo padrão:', error);
    renderPublicFaqs(FALLBACK_FAQS);
  }
}

function renderPublicFaqs(faqs) {
  const listEl = document.getElementById('faqList');
  if (!listEl) return;

  listEl.innerHTML = faqs.map((item, index) => {
    const isOpen = index === 0;
    return `
      <div class="faq-item${isOpen ? ' open' : ''}">
        <button type="button" class="faq-question">
          ${escapeHtml(item.question)}
          <span class="faq-icon">${isOpen ? '−' : '+'}</span>
        </button>
        <div class="faq-answer">
          <p>${escapeHtml(item.answer)}</p>
        </div>
      </div>
    `;
  }).join('');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text ?? '';
  return div.innerHTML;
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}