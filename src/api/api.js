const API_URL = 'http://localhost:3001';

const getToken = () => localStorage.getItem('token');

const setToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

const getUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

const setUser = (user) => {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
};

const api = {
  async request(endpoint, options = {}) {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.error || 'Error en la solicitud');
      error.status = response.status;
      throw error;
    }

    return data;
  },

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },
};

export const authApi = {
  async registro(nombre, email, contrasena) {
    const data = await api.post('/auth/registro', { nombre, email, contrasena });
    setToken(data.token);
    setUser(data.user);
    return data;
  },

  async login(email, contrasena) {
    const data = await api.post('/auth/login', { email, contrasena });
    setToken(data.token);
    setUser(data.user);
    return data;
  },

  async verify() {
    const data = await api.get('/auth/verify');
    setUser(data.user);
    return data;
  },

  logout() {
    setToken(null);
    setUser(null);
  },

  isAuthenticated() {
    return !!getToken();
  },

  getCurrentUser() {
    return getUser();
  },
};

export const userApi = {
  async getPerfil() {
    return api.get('/usuarios/perfil');
  },

  async updatePerfil(datos) {
    const data = await api.put('/usuarios/perfil', datos);
    setUser(data);
    return data;
  },
};

export const notificationApi = {
  async getAll() {
    return api.get('/notificaciones');
  },

  async getNoLeidas() {
    return api.get('/notificaciones/no-leidas');
  },

  async marcarLeida(id) {
    return api.put(`/notificaciones/${id}/leer`, {});
  },
};

export default api;