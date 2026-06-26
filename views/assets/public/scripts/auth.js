/**
 * TrainiFy - auth.js
 * Static version: simulates login/register without API calls.
 */

document.addEventListener('DOMContentLoaded', () => {
  initLoginForm();
  initRegisterForm();
  initPasswordToggle();
});

function initLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn    = form.querySelector('[type="submit"]');
    const alertEl = document.getElementById('loginAlert');
    hideAlert(alertEl);

    const email = form.email.value.trim();
    const pass  = form.password.value;

    if (!email || !pass) {
      showAlert(alertEl, 'Preencha email e senha.', 'error');
      return;
    }

    // Simulate loading then redirect
    btn.disabled = true;
    btn.textContent = 'Entrando...';

    setTimeout(() => {
      window.location.href = '../app/dashboard.html';
    }, 800);
  });
}

function initRegisterForm() {
  const form = document.getElementById('registerForm');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn     = form.querySelector('[type="submit"]');
    const alertEl = document.getElementById('registerAlert');
    hideAlert(alertEl);

    if (form.password.value !== form.passwordConfirm.value) {
      showAlert(alertEl, 'As senhas não coincidem.', 'error');
      return;
    }
    if (form.password.value.length < 8) {
      showAlert(alertEl, 'A senha deve ter pelo menos 8 caracteres.', 'error');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Criando conta...';

    setTimeout(() => {
      showAlert(alertEl, 'Conta criada com sucesso! Redirecionando...', 'success');
      setTimeout(() => { window.location.href = '../app/dashboard.html'; }, 1000);
    }, 800);
  });
}

function initPasswordToggle() {
  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.closest('.input-wrapper').querySelector('input');
      const isText = input.type === 'text';
      input.type   = isText ? 'password' : 'text';
      btn.textContent = isText ? '👁' : '🙈';
    });
  });
}

function showAlert(el, msg, type) {
  if (!el) return;
  el.textContent = msg;
  el.className = `alert alert-${type} show`;
}
function hideAlert(el) {
  if (!el) return;
  el.className = 'alert';
  el.textContent = '';
}
