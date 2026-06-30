/**
 * TrainiFy - landing.js
 * Public landing page interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initChartBars();
  animateOnScroll();
  initMobileMenu();
  initFaqToggle();
});

/** Sticky navbar on scroll */
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

/** Fade-in on scroll via IntersectionObserver */
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
  const faqButtons = document.querySelectorAll('.faq-question');
  faqButtons.forEach(button => {
    button.addEventListener('click', () => {
      const item = button.closest('.faq-item');
      if (!item) return;
      item.classList.toggle('open');
      const icon = button.querySelector('.faq-icon');
      if (icon) icon.textContent = item.classList.contains('open') ? '−' : '+';
    });
  });
}

/** Smooth scroll for anchor links */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
