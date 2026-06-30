/**
 * TrainiFy - API Helper
 * views/assets/_common/scripts/api.js
 *
 * Provides a centralized, reusable interface for all HTTP requests.
 * Business logic stays in the backend — this layer only handles transport.
 */

const API_BASE = '/api';

/**
 * Core API request function.
 * @param {string} endpoint  - e.g. "login", "alunos", "treinos/5"
 * @param {string} method    - HTTP method (GET, POST, PUT, DELETE, PATCH)
 * @param {object|null} body - Request payload (will be JSON-encoded)
 * @param {object} customHeaders - Any extra headers
 * @returns {Promise<{ok: boolean, status: number, data: any}>}
 */
async function apiRequest(endpoint, method = 'GET', body = null, customHeaders = {}) {
  const token = localStorage.getItem('trainify_token');

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...customHeaders,
  };

  const options = {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  };

  try {
    const response = await fetch(`${API_BASE}/${endpoint}`, options);

    // Handle 401 - token expired or invalid
    if (response.status === 401) {
      Auth.logout();
      return { ok: false, status: 401, data: { message: 'Sessão expirada. Faça login novamente.' } };
    }

    let data = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    return { ok: response.ok, status: response.status, data };

  } catch (err) {
    console.error(`[API] Erro em ${method} /${endpoint}:`, err);
    return {
      ok: false,
      status: 0,
      data: { message: 'Erro de conexão. Verifique sua internet.' }
    };
  }
}

/* ── Shorthand helpers ───────────────────────────── */
const api = {
  get:    (endpoint)              => apiRequest(endpoint, 'GET'),
  post:   (endpoint, body)        => apiRequest(endpoint, 'POST', body),
  put:    (endpoint, body)        => apiRequest(endpoint, 'PUT', body),
  patch:  (endpoint, body)        => apiRequest(endpoint, 'PATCH', body),
  delete: (endpoint)              => apiRequest(endpoint, 'DELETE'),
};

/* ── Auth Utilities ─────────────────────────────── */
const Auth = {
  /** Save token and user data after successful login */
  setSession(token, user) {
    localStorage.setItem('trainify_token', token);
    localStorage.setItem('trainify_user', JSON.stringify(user));
  },

  /** Retrieve stored token */
  getToken() {
    return localStorage.getItem('trainify_token');
  },

  /** Retrieve stored user object */
  getUser() {
    try {
      return JSON.parse(localStorage.getItem('trainify_user'));
    } catch {
      return null;
    }
  },

  /** Check if a session exists */
  isLoggedIn() {
    return !!this.getToken();
  },

  /** Check if logged-in user is admin */
  isAdmin() {
    const user = this.getUser();
    return user && user.role === 'admin';
  },

  /** Clear session and redirect to login */
  logout() {
    localStorage.removeItem('trainify_token');
    localStorage.removeItem('trainify_user');
    window.location.href = '/views/public/login.html';
  },

  /** Guard: redirect to login if not authenticated */
  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = '/views/public/login.html';
      return false;
    }
    return true;
  },

  /** Guard: redirect to app if not admin */
  requireAdmin() {
    if (!this.isAdmin()) {
      window.location.href = '/views/app/dashboard.html';
      return false;
    }
    return true;
  },
};

/* ── Toast Notifications ────────────────────────── */
const Toast = {
  _container: null,

  _getContainer() {
    if (!this._container) {
      this._container = document.createElement('div');
      this._container.className = 'toast-container';
      document.body.appendChild(this._container);
    }
    return this._container;
  },

  show(message, type = 'info', duration = 3500) {
    const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
    const container = this._getContainer();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span style="color:var(--clr-neon);font-weight:700;">${icons[type] || '•'}</span> ${message}`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(40px)';
      toast.style.transition = '0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  success: (msg) => Toast.show(msg, 'success'),
  error:   (msg) => Toast.show(msg, 'error'),
  info:    (msg) => Toast.show(msg, 'info'),
  warning: (msg) => Toast.show(msg, 'warning'),
};

/* ── DOM Helpers ─────────────────────────────────── */
const DOM = {
  /** Show loading state on a button */
  setLoading(btn, loading = true, originalText = '') {
    if (loading) {
      btn.disabled = true;
      btn.dataset.original = btn.innerHTML;
      btn.innerHTML = `<span class="spinner"></span> Aguarde...`;
    } else {
      btn.disabled = false;
      btn.innerHTML = originalText || btn.dataset.original || 'Enviar';
    }
  },

  /** Fill element with error state */
  showError(container, message) {
    container.innerHTML = `
      <div style="text-align:center;padding:var(--space-xl);color:var(--clr-grey-300);">
        <div style="font-size:2rem;margin-bottom:8px;">⚠</div>
        <p>${message}</p>
      </div>`;
  },

  /** Render empty state */
  showEmpty(container, message = 'Nenhum dado encontrado.') {
    container.innerHTML = `
      <div style="text-align:center;padding:var(--space-xl);color:var(--clr-grey-500);">
        <div style="font-size:2.5rem;margin-bottom:8px;">—</div>
        <p>${message}</p>
      </div>`;
  },
};
