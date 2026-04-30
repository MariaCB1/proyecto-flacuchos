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

  async eliminar(id) {
    return api.delete(`/notificaciones/${id}`);
  },

  async eliminarTodas() {
    return api.delete('/notificaciones');
  },
};

export const animalApi = {
  async getAnimales(filtros = {}) {
    const params = new URLSearchParams();
    if (filtros.urgente) params.append('urgente', filtros.urgente);
    if (filtros.tipo) params.append('tipo', filtros.tipo);
    if (filtros.tamano) params.append('tamano', filtros.tamano);
    if (filtros.busqueda) params.append('busqueda', filtros.busqueda);
    if (filtros.orden) params.append('orden', filtros.orden);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/animales?${queryString}` : '/animales';
    return api.get(endpoint);
  },

  async getAnimalById(id) {
    return api.get(`/animales/${id}`);
  },

  async crearSolicitud(animalId, data) {
    return api.post(`/solicitudes/${animalId}`, data);
  },

  async getMisSolicitudes() {
    return api.get('/solicitudes/mis-solicitudes');
  },

  async eliminarMiSolicitud(id) {
    return api.delete(`/solicitudes/${id}`);
  },

  async getAllSolicitudes() {
    return api.get('/solicitudes');
  },

  async getSolicitudesPendientes() {
    return api.get('/solicitudes/pendientes');
  },

  async aprobarSolicitud(id) {
    return api.put(`/solicitudes/${id}/aprobar`, {});
  },

  async rechazarSolicitud(id, motivo) {
    return api.put(`/solicitudes/${id}/rechazar`, { motivo });
  },

  async getMisAdopciones() {
    return api.get('/adopciones/mis-adopciones');
  },

  async getAllAnimalesAdmin() {
    return api.get('/animales/todos');
  },

  async createAnimal(data) {
    return api.post('/animales', data);
  },

  async updateAnimal(id, data) {
    return api.put(`/animales/${id}`, data);
  },

  async deleteAnimal(id) {
    return api.delete(`/animales/${id}`);
  },

  async getSolicitudDetalle(id) {
    return api.get(`/solicitudes/${id}`);
  },

  async uploadImage(file) {
    const formData = new FormData();
    formData.append('imagen', file);
    
    const response = await fetch(`${API_URL}/upload/imagen`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      },
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al subir imagen');
    }
    
    return response.json();
  },
};

export default api;