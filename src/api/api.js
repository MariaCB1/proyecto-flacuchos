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

  delete(endpoint, data = null) {
    const options = { method: 'DELETE' };
    if (data) {
      options.body = JSON.stringify(data);
    }
    return this.request(endpoint, options);
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

  async verificarEmail(token) {
    return api.post('/auth/verificar', { token });
  },

  async reenviarVerificacion() {
    return api.post('/auth/reenviar-verificacion', { email: getUser()?.email });
  },

  async getEstadoVerificacion() {
    return api.get('/auth/verificado');
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

  async cambiarContrasena(contrasenaActual, nuevaContrasena) {
    return api.post('/usuarios/cambiar-contrasena', { contrasenaActual, nuevaContrasena });
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

export const contactoApi = {
  async enviarMensaje(data) {
    return api.post('/contacto', data);
  },

  async crearSolicitudAcogida(data) {
    return api.post('/contacto/solicitud-acogida', data);
  },

  async getAnimalesDisponibles() {
    return api.get('/contacto/animales-disponibles');
  },

  async getSolicitudesAcogida(filtros = {}) {
    const params = new URLSearchParams();
    if (filtros.estado) params.append('estado', filtros.estado);
    const queryString = params.toString();
    const endpoint = queryString ? `/contacto/solicitudes-acogida?${queryString}` : '/contacto/solicitudes-acogida';
    return api.get(endpoint);
  },

  async getMisAcogidas() {
    return api.get('/contacto/mis-acogidas');
  },

  async eliminarSolicitudAcogida(id) {
    return api.delete(`/contacto/solicitudes-acogida/${id}`);
  },

  async aprobarAcogida(id) {
    return api.put(`/contacto/solicitud-acogida/${id}/aprobar`, {});
  },

  async rechazarAcogida(id, motivo) {
    return api.put(`/contacto/solicitud-acogida/${id}/rechazar`, { motivo });
  },

  async asignarAnimalAcogida(solicitudId, animalId) {
    return api.put(`/contacto/solicitud-acogida/${solicitudId}/asignar`, { animal_id: animalId });
  },

  async aceptarAnimalAsignado(id) {
    return api.put(`/contacto/solicitud-acogida/${id}/aceptar`, {});
  },

  async rechazarAnimalAsignado(id) {
    return api.put(`/contacto/solicitud-acogida/${id}/rechazar-animal`, {});
  },
};

export const noticiaApi = {
  async getNoticias(filtros = {}) {
    const params = new URLSearchParams();
    if (filtros.categoria) params.append('categoria', filtros.categoria);
    if (filtros.busqueda) params.append('busqueda', filtros.busqueda);
    if (filtros.orden) params.append('orden', filtros.orden);
    if (filtros.fechaDesde) params.append('fechaDesde', filtros.fechaDesde);
    if (filtros.fechaHasta) params.append('fechaHasta', filtros.fechaHasta);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/noticias?${queryString}` : '/noticias';
    return api.get(endpoint);
  },

  async getNoticiaById(id) {
    return api.get(`/noticias/${id}`);
  },

  async createNoticia(data) {
    return api.post('/noticias', data);
  },

  async updateNoticia(id, data) {
    return api.put(`/noticias/${id}`, data);
  },

  async deleteNoticia(id) {
    return api.delete(`/noticias/${id}`);
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

export const eventosApi = {
  async getEventos(filtros = {}) {
    const params = new URLSearchParams();
    if (filtros.categoria) params.append('categoria', filtros.categoria);
    if (filtros.busqueda) params.append('busqueda', filtros.busqueda);
    if (filtros.tipo) params.append('tipo', filtros.tipo);
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.fechaDesde) params.append('fechaDesde', filtros.fechaDesde);
    if (filtros.fechaHasta) params.append('fechaHasta', filtros.fechaHasta);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/eventos?${queryString}` : '/eventos';
    return api.get(endpoint);
  },

  async getEventoById(id) {
    return api.get(`/eventos/${id}`);
  },

  async createEvento(data) {
    return api.post('/eventos', data);
  },

  async updateEvento(id, data) {
    return api.put(`/eventos/${id}`, data);
  },

  async deleteEvento(id) {
    return api.delete(`/eventos/${id}`);
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

export const inscripcionesApi = {
  async inscribir(eventoId) {
    return api.post('/inscripciones', { evento_id: eventoId });
  },

  async getMisInscripciones() {
    return api.get('/inscripciones/mis-inscripciones');
  },

  async cancelarInscripcion(eventoId) {
    return api.delete('/inscripciones', { evento_id: eventoId });
  },

  async getAllInscripciones() {
    return api.get('/inscripciones');
  },

  async getInscripcionesEvento(eventoId) {
    return api.get(`/inscripciones/evento/${eventoId}`);
  },
};

export const stripeApi = {
  async getConfig() {
    return api.get('/stripe/config');
  },

  async createPaymentIntent(amount, email, nombre, metodoPago = 'card', usuarioId = null) {
    return api.post('/stripe/create-payment-intent', { amount, email, nombre, metodoPago, usuarioId });
  },

  async cancelPaymentIntent(paymentId) {
    return api.post('/stripe/cancel-payment-intent', { paymentId });
  },

  async createSubscription(priceId, email, nombre, usuarioId, metodoPago = 'card', datosPersonales = null) {
    return api.post('/stripe/create-subscription', { priceId, email, nombre, usuarioId, metodoPago, datosPersonales });
  },

  async crearSuscripcionReal(paymentIntentId, usuarioId) {
    return api.post('/stripe/crear-suscripcion-real', { paymentIntentId, usuarioId });
  },

  async confirmSepaSetup(setupIntentId, priceId, usuarioId, datosPersonales = null) {
    return api.post('/stripe/confirm-sepa-setup', { setupIntentId, priceId, usuarioId, datosPersonales });
  },

  async createSepaMandate(email, nombre) {
    return api.post('/stripe/create-sepa-mandate', { email, nombre });
  },

  async checkDonacion(paymentId) {
    return api.get(`/stripe/check-donacion?paymentId=${paymentId}`);
  },

  async getDonaciones() {
    return api.get('/stripe/donaciones');
  },

  async actualizarDonaciones() {
    return api.post('/stripe/donaciones/actualizar');
  },

  async getMisDonaciones() {
    return api.get('/stripe/donaciones/mis-donaciones');
  },

  async marcarSocioFallido(setupIntentId, usuarioId, errorMessage) {
    return api.post('/stripe/marcar-socio-fallido', { setupIntentId, usuarioId, errorMessage });
  },
};

export const socioApi = {
  async getMiSocio() {
    return api.get('/socios/mis-socio');
  },

  async getSocios() {
    return api.get('/socios');
  },

  async getSociosStats() {
    return api.get('/socios/stats');
  },

  async cancelarMiSocio() {
    return api.delete('/socios/mi-socio');
  },

  async checkFueSocioEsteMes() {
    return api.get('/socios/check-fue-socio');
  },

  async getTotalHistorico() {
    return api.get('/socios/total-historico');
  },
};

export const voluntarioApi = {
  async crearVoluntario(data) {
    return api.post('/voluntarios', data);
  },

  async getMisDatos() {
    return api.get('/voluntarios/mis-datos');
  },

  async getAll() {
    return api.get('/voluntarios');
  },

  async toggleMiEstado(activo) {
    return api.put('/voluntarios/mi-estado', { activo });
  },

  async toggleActivo(usuarioId, activo) {
    return api.put(`/voluntarios/${usuarioId}/toggle`, { activo });
  },

  async actualizarVoluntario(data) {
    return api.put('/voluntarios', data);
  },
};

export const apadrinamientoApi = {
  async getAnimalesDisponibles(usuarioId = null) {
    const params = usuarioId ? `?usuarioId=${encodeURIComponent(usuarioId)}` : '';
    return api.get(`/apadrinamientos/disponibles${params}`);
  },

  async getAnimalesConPadrino() {
    return api.get('/apadrinamientos/con-padrino');
  },

  async getMisApadrinamientos() {
    return api.get('/apadrinamientos/mis-apadrinamientos');
  },

  async checkTuvoApadrinamientoPrevio() {
    return api.get('/apadrinamientos/check-previo');
  },

  async getAllAdmin() {
    return api.get('/apadrinamientos/admin');
  },

  async crear(data) {
    return api.post('/apadrinamientos', data);
  },

  async aceptar(id) {
    return api.put(`/apadrinamientos/${id}/aceptar`);
  },

  async rechazar(id, motivo) {
    return api.put(`/apadrinamientos/${id}/rechazar`, { motivo });
  },

  async cancelar(id) {
    return api.put(`/apadrinamientos/${id}/cancelar`);
  },

  async eliminar(id) {
    return api.delete(`/apadrinamientos/${id}`);
  },

  async getCobros() {
    return api.get('/apadrinamientos/cobros');
  },

  async ejecutarCobros() {
    return api.post('/apadrinamientos/cobros-ejecutar');
  },
};

export const resumenApi = {
  async getResumenAyudas(periodo = 'ano') {
    return api.get(`/admin/resumen-ayudas?periodo=${periodo}`);
  },
};

export const transparenciaApi = {
  async getDocumentos() {
    return api.get('/transparencia/documentos');
  },

  async updateDocumento(tipo, data) {
    return api.put(`/transparencia/documentos/${tipo}`, data);
  },

async uploadFile(file) {
    const formData = new FormData();
    formData.append('imagen', file);

    const response = await fetch(`${API_URL}/upload/transparencia`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al subir archivo');
    }

    return response.json();
  },

  async getJustificantes(año = null) {
    const query = año ? `?año=${año}` : '';
    return api.get(`/transparencia/justificantes${query}`);
  },

  async getAñosJustificantes() {
    return api.get('/transparencia/justificantes/anios');
  },

  async createJustificante(data) {
    return api.post('/transparencia/justificantes', data);
  },

  async updateJustificante(id, data) {
    return api.put(`/transparencia/justificantes/${id}`, data);
  },

  async deleteJustificante(id) {
    return api.delete(`/transparencia/justificantes/${id}`);
  },
};

export default api;