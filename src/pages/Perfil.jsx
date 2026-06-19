import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { animalApi, userApi, authApi, inscripcionesApi, contactoApi, stripeApi, voluntarioApi, socioApi, apadrinamientoApi } from '../api/api';
import { formatDateShort } from '../utils/dateUtils';
import styles from './Perfil.module.css';

const calculateStrength = (password) => {
  const result = {
    score: 0,
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
    hasSpecial: false,
    hasLength: false,
  };

  if (!password) return result;

  result.hasLength = password.length >= 8;
  result.hasUpper = /[A-Z]/.test(password);
  result.hasLower = /[a-z]/.test(password);
  result.hasNumber = /[0-9]/.test(password);
  result.hasSpecial = /[!@#$%^&*()_+\-=[\]{}|',.<>/?]/.test(password);

  if (result.hasLength) result.score++;
  if (result.hasUpper) result.score++;
  if (result.hasLower) result.score++;
  if (result.hasNumber) result.score++;
  if (result.hasSpecial) result.score++;

  return result;
};

function formatearDias(dias) {
  if (!dias) return [];
  if (Array.isArray(dias)) return dias;
  if (typeof dias === 'string') {
    if (dias.startsWith('{')) {
      const contenido = dias.slice(1, -1);
      if (!contenido) return [];
      return contenido.split(',').map(d => d.trim().replace(/"/g, '').replace(/'/g, '').toLowerCase()).filter(d => d);
    }
    if (dias.startsWith('[')) {
      try {
        return JSON.parse(dias);
      } catch {
        return dias.split(',').map(d => d.trim().replace(/"/g, '').toLowerCase());
      }
    }
    return dias.split(',').map(d => d.trim().replace(/"/g, '').toLowerCase());
  }
  return [];
}

const validarTelefono = (telefono) => {
  const regex = /^[6-9]\d{8}$/;
  return regex.test(telefono);
};

const validarDNI = (dni) => {
  const nifRegex = /^[0-9]{8}[A-Z]$/;
  const nieRegex = /^[XYZxyz][0-9]{7}[A-Z]$/;
  
  if (nifRegex.test(dni)) {
    const letras = 'TRWAGMYFPDXBNJZSQVHLCKE';
    const numero = parseInt(dni.substring(0, 8), 10);
    const letraCalculada = letras[numero % 23];
    return dni[8] === letraCalculada;
  }
  
  if (nieRegex.test(dni)) {
    const letrasNie = 'XYZ';
    const numeroCompleto = dni.replace(/[XYZ]/i, (match) => letrasNie.indexOf(match.toUpperCase()));
    const letrasFinales = 'TRWAGMYFPDXBNJZSQVHLCKE';
    const numero = parseInt(numeroCompleto.substring(0, 8), 10);
    const letraCalculada = letrasFinales[numero % 23];
    return dni[8] === letraCalculada;
  }
  
  return false;
};

function Perfil() {
  const { user, logout, updatePerfil, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || '');
  
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [contrasenaActual, setContrasenaActual] = useState('');
  const [mostrarActual, setMostrarActual] = useState(false);
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [mostrarNueva, setMostrarNueva] = useState(false);
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const [misSolicitudes, setMisSolicitudes] = useState([]);
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(false);

  const [misInscripciones, setMisInscripciones] = useState([]);
  const [loadingInscripciones, setLoadingInscripciones] = useState(false);

  const [misAcogidas, setMisAcogidas] = useState([]);
  const [loadingAcogidas, setLoadingAcogidas] = useState(false);
  const [modalAcogida, setModalAcogida] = useState({ show: false });

  const [misDonaciones, setMisDonaciones] = useState([]);
  const [loadingDonaciones, setLoadingDonaciones] = useState(false);

  const [emailVerificado, setEmailVerificado] = useState(true);
  const [loadingVerificacion, setLoadingVerificacion] = useState(false);

  const [animales, setAnimales] = useState([]);
  const [loadingAnimales, setLoadingAnimales] = useState(false);

  const [misVoluntario, setMisVoluntario] = useState(null);

  const [solicitudesAdmin, setSolicitudesAdmin] = useState([]);
  const [loadingSolicitudesAdmin, setLoadingSolicitudesAdmin] = useState(false);

  const [detalleSolicitud, setDetalleSolicitud] = useState(null);

  const [showAnimalModal, setShowAnimalModal] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState(null);
  const [animalForm, setAnimalForm] = useState({
    nombre: '',
    especie: 'perro',
    edad: '',
    tamano: 'mediano',
    caracter: '',
    salud: '',
    imagen_url: '',
    peso: '',
    urgente: false
  });

  const [voluntarioActivo, setVoluntarioActivo] = useState(false);
  const [loadingToggle, setLoadingToggle] = useState(false);
  const [editandoVoluntario, setEditandoVoluntario] = useState(false);
  const [guardandoVoluntario, setGuardandoVoluntario] = useState(false);

  const [voluntarioFormData, setVoluntarioFormData] = useState({
    telefono: '',
    dni: '',
    disponibilidad_dias: [],
    disponibilidad_horario: '',
    tiene_vehiculo: false,
    motivacion: '',
    experiencia: '',
    comentarios: ''
  });

  const [voluntarioErrores, setVoluntarioErrores] = useState({
    telefono: '',
    dni: '',
    disponibilidad_dias: '',
    disponibilidad_horario: ''
  });

  const [misSocios, setMisSocios] = useState(null);
  const [loadingSocio, setLoadingSocio] = useState(false);
  const [cancelandoSocio, setCancelandoSocio] = useState(false);

  const [misApadrinamientos, setMisApadrinamientos] = useState([]);
  const [loadingApadrinamientos, setLoadingApadrinamientos] = useState(false);
  const [cancelandoApadrinamiento, setCancelandoApadrinamiento] = useState(false);

  const DIAS_SEMANA = [
    { id: 'lunes', label: 'Lunes' },
    { id: 'martes', label: 'Martes' },
    { id: 'miercoles', label: 'Miércoles' },
    { id: 'jueves', label: 'Jueves' },
    { id: 'viernes', label: 'Viernes' },
    { id: 'sabado', label: 'Sábado' },
    { id: 'domingo', label: 'Domingo' }
  ];

  const HORARIOS = [
    { id: 'manana', label: 'Mañanas' },
    { id: 'tarde', label: 'Tardes' },
    { id: 'todo', label: 'Todo el día' }
  ];

  const fetchVoluntario = async () => {
    if (!user?.es_voluntario) return;
    try {
      const data = await voluntarioApi.getMisDatos();
      setMisVoluntario(data);
    } catch (err) {
      console.error('Error fetching voluntario:', err);
    }
  };

  const fetchSocio = async () => {
    if (!user?.es_socio) return;
    setLoadingSocio(true);
    try {
      const data = await socioApi.getMiSocio();
      setMisSocios(data);
    } catch (err) {
      console.error('Error fetching socio:', err);
    } finally {
      setLoadingSocio(false);
    }
  };

  const handleCancelarSocio = async () => {
    if (!confirm('¿Estás seguro de darte de baja como socio? Ya no formarás parte del programa de socios.')) return;
    
    setCancelandoSocio(true);
    try {
      await socioApi.cancelarMiSocio();
      alert('Has causado baja como socio. Gracias por todo el tiempo que has estado con nosotros.');
      setMisSocios(null);
      await refreshUser();
    } catch (err) {
      alert(err.message || 'Error al darte de baja');
    } finally {
      setCancelandoSocio(false);
    }
  };

  const fetchApadrinamientos = async () => {
    setLoadingApadrinamientos(true);
    try {
      const data = await apadrinamientoApi.getMisApadrinamientos();
      setMisApadrinamientos(data);
    } catch (err) {
      console.error('Error fetching apadrinamientos:', err);
    } finally {
      setLoadingApadrinamientos(false);
    }
  };

  const handleCancelarApadrinamiento = async (id) => {
    if (!confirm('¿Estás seguro de cancelar este apadrinamiento? Los cobros mensuales se detendrán.')) return;
    
    setCancelandoApadrinamiento(true);
    try {
      await apadrinamientoApi.cancelar(id);
      alert('Apadrinamiento cancelado correctamente.');
      await fetchApadrinamientos();
    } catch (err) {
      alert(err.message || 'Error al cancelar');
    } finally {
      setCancelandoApadrinamiento(false);
    }
  };

  const handleEliminarSolicitudApadrinamiento = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta solicitud?')) return;
    
    try {
      await apadrinamientoApi.eliminar(id);
      alert('Solicitud eliminada.');
      await fetchApadrinamientos();
    } catch (err) {
      alert(err.message || 'Error al eliminar');
    }
  };

  useEffect(() => {
    if (user?.voluntario_activo !== undefined) {
      setVoluntarioActivo(user.voluntario_activo);
    }
    if (user?.email_verificado !== undefined) {
      setEmailVerificado(user.email_verificado);
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'datos') {
      fetchVoluntario();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, user?.es_voluntario]);

  const handleToggleVoluntario = async () => {
    if (!user?.es_voluntario) {
      navigate('/voluntario');
      return;
    }

    const nuevoEstado = !voluntarioActivo;
    if (!confirm(`¿${nuevoEstado ? 'Activar' : 'Desactivar'} tu estado como voluntario?`)) return;

    setLoadingToggle(true);
    try {
      await voluntarioApi.toggleMiEstado(!voluntarioActivo);
      setVoluntarioActivo(!voluntarioActivo);
      await refreshUser();
      alert(nuevoEstado ? 'Voluntario activado' : 'Voluntario desactivado');
    } catch (err) {
      alert(err.message || 'Error al actualizar');
    } finally {
      setLoadingToggle(false);
    }
  };

  const handleEditarVoluntario = () => {
    if (!misVoluntario) return;
    setVoluntarioFormData({
      telefono: misVoluntario.telefono || '',
      dni: misVoluntario.dni || '',
      disponibilidad_dias: misVoluntario.disponibilidad_dias || [],
      disponibilidad_horario: misVoluntario.disponibilidad_horario || '',
      tiene_vehiculo: misVoluntario.tiene_vehiculo || false,
      motivacion: misVoluntario.motivacion || '',
      experiencia: misVoluntario.experiencia || '',
      comentarios: misVoluntario.comentarios || ''
    });
    setEditandoVoluntario(true);
  };

  const handleCancelarEdicionVoluntario = () => {
    setEditandoVoluntario(false);
  };

  const handleVoluntarioChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    let formattedValue = value;
    if (name === 'telefono') {
      formattedValue = value.replace(/\D/g, '').slice(0, 9);
    } else if (name === 'dni') {
      formattedValue = value.replace(/[^0-9A-Z]/g, '').toUpperCase().slice(0, 9);
    }
    
    setVoluntarioFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : formattedValue
    }));
    if (name === 'telefono') {
      setVoluntarioErrores(prev => ({ ...prev, telefono: '' }));
    }
    if (name === 'dni') {
      setVoluntarioErrores(prev => ({ ...prev, dni: '' }));
    }
    if (name === 'disponibilidad_horario') {
      setVoluntarioErrores(prev => ({ ...prev, disponibilidad_horario: '' }));
    }
  };

  const handleVoluntarioCheckboxGroup = (field, value) => {
    setVoluntarioFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }));
    if (field === 'disponibilidad_dias') {
      setVoluntarioErrores(prev => ({ ...prev, disponibilidad_dias: '' }));
    }
  };

  const handleGuardarVoluntario = async (e) => {
    e.preventDefault();
    
    const errores = { telefono: '', dni: '', disponibilidad_dias: '', disponibilidad_horario: '' };
    let tieneErrores = false;

    if (!validarTelefono(voluntarioFormData.telefono)) {
      errores.telefono = 'El teléfono debe tener 9 dígitos';
      tieneErrores = true;
    }

    if (!validarDNI(voluntarioFormData.dni)) {
      errores.dni = 'El DNI/NIE no es válido';
      tieneErrores = true;
    }

    if (voluntarioFormData.disponibilidad_dias.length === 0) {
      errores.disponibilidad_dias = 'Selecciona al menos un día';
      tieneErrores = true;
    }

    if (!voluntarioFormData.disponibilidad_horario) {
      errores.disponibilidad_horario = 'Selecciona un horario';
      tieneErrores = true;
    }

    if (tieneErrores) {
      setVoluntarioErrores(errores);
      return;
    }

    setGuardandoVoluntario(true);
    try {
      await voluntarioApi.actualizarVoluntario(voluntarioFormData);
      await fetchVoluntario();
      setEditandoVoluntario(false);
      setVoluntarioErrores({ telefono: '', dni: '', disponibilidad_dias: '', disponibilidad_horario: '' });
    } catch (err) {
      alert(err.message || 'Error al actualizar');
    } finally {
      setGuardandoVoluntario(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setNombre(user.nombre || '');
    setEmail(user.email || '');
  }, [user, navigate]);

  useEffect(() => {
    if (activeTab === 'solicitudes') {
      fetchMisSolicitudes();
    }
    if (activeTab === 'inscripciones') {
      fetchMisInscripciones();
    }
    if (activeTab === 'acogidas') {
      fetchMisAcogidas();
    }
    if (activeTab === 'animales') {
      fetchAnimales();
    }
    if (activeTab === 'admin-solicitudes') {
      fetchSolicitudesAdmin();
    }
    if (activeTab === 'donaciones') {
      fetchMisDonaciones();
    }
    if (activeTab === 'voluntariado') {
      fetchVoluntario();
    }
    if (activeTab === 'socio') {
      fetchSocio();
    }
    if (activeTab === 'apadrinamientos') {
      fetchApadrinamientos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchMisSolicitudes = async () => {
    setLoadingSolicitudes(true);
    try {
      const data = await animalApi.getMisSolicitudes();
      setMisSolicitudes(data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoadingSolicitudes(false);
    }
  };

  const handleEliminarSolicitud = async (solicitudId) => {
    if (!confirm('¿Eliminar esta solicitud? Podrás volver a solicitarla.')) return;
    try {
      await animalApi.eliminarMiSolicitud(solicitudId);
      alert('Solicitud eliminada');
      fetchMisSolicitudes();
    } catch (err) {
      alert(err.message || 'Error al eliminar la solicitud');
    }
  };

  const fetchMisInscripciones = async () => {
    setLoadingInscripciones(true);
    try {
      const data = await inscripcionesApi.getMisInscripciones();
      setMisInscripciones(data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoadingInscripciones(false);
    }
  };

  const fetchMisAcogidas = async () => {
    setLoadingAcogidas(true);
    try {
      const data = await contactoApi.getMisAcogidas();
      setMisAcogidas(data);
    } catch (err) {
      console.error('Error fetching acogidas:', err);
    } finally {
      setLoadingAcogidas(false);
    }
  };

  const handleEliminarSolicitudAcogida = async (id) => {
    if (!confirm('¿Eliminar esta solicitud de acogida? Podrás volver a solicitarla.')) return;
    try {
      await contactoApi.eliminarSolicitudAcogida(id);
      alert('Solicitud eliminada correctamente');
      fetchMisAcogidas();
    } catch (err) {
      alert(err.message || 'Error al eliminar la solicitud');
    }
  };

  const fetchMisDonaciones = async () => {
    setLoadingDonaciones(true);
    try {
      const data = await stripeApi.getMisDonaciones();
      setMisDonaciones(data.donaciones || []);
    } catch (err) {
      console.error('Error fetching donaciones:', err);
    } finally {
      setLoadingDonaciones(false);
    }
  };

  const handleAceptarAnimalAsignado = async (acogidaId) => {
    if (!confirm('¿Estás seguro de aceptar este animal? Se formalizará la acogida.')) return;
    try {
      await contactoApi.aceptarAnimalAsignado(acogidaId);
      await fetchMisAcogidas();
      alert('¡Acogida aceptada! Gracias por tu apoyo.');
    } catch (err) {
      alert(err.message || 'Error al aceptar el animal');
    }
  };

  const handleRechazarAnimalAsignado = async (acogidaId) => {
    if (!confirm('¿Estás seguro de rechazar este animal?')) return;
    try {
      await contactoApi.rechazarAnimalAsignado(acogidaId);
      await fetchMisAcogidas();
      alert('Has rechazado el animal. El admin te asignará otro.');
    } catch (err) {
      alert(err.message || 'Error al rechazar el animal');
    }
  };

  const handleCancelarInscripcion = async (inscripcionId, eventoId, eventoFecha, eventoHora) => {
    const fechaEvento = new Date(eventoFecha);
    if (eventoHora) {
      const horaInicio = eventoHora.split(' - ')[0];
      const [horas, minutos] = horaInicio.split(':').map(Number);
      fechaEvento.setHours(horas, minutos, 0, 0);
    }
    const ahora = new Date();
    
    if (fechaEvento < ahora) {
      alert('No puedes cancelar la inscripción de un evento que ya ha pasado');
      return;
    }
    
    if (!confirm('¿Cancelar esta inscripción?')) return;
    try {
      await inscripcionesApi.cancelarInscripcion(eventoId);
      alert('Inscripción cancelada');
      fetchMisInscripciones();
    } catch (err) {
      alert(err.message || 'Error al cancelar');
    }
  };

  const fetchAnimales = async () => {
    setLoadingAnimales(true);
    try {
      const data = await animalApi.getAllAnimalesAdmin();
      setAnimales(data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoadingAnimales(false);
    }
  };

  const fetchSolicitudesAdmin = async () => {
    setLoadingSolicitudesAdmin(true);
    try {
      const data = await animalApi.getAllSolicitudes();
      setSolicitudesAdmin(data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoadingSolicitudesAdmin(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const datos = {};
      if (nombre !== user.nombre) datos.nombre = nombre;
      if (email !== user.email) datos.email = email;

      if (Object.keys(datos).length === 0) {
        setSuccess('No hay cambios que guardar');
        setLoading(false);
        return;
      }

      await updatePerfil(datos);

      if (email !== user.email) {
        setSuccess('Perfil actualizado. Te hemos enviado un email de verificación a tu nuevo email. Por favor, verifícalo para seguir usando todas las funciones.');
      } else {
        setSuccess('Perfil actualizado correctamente');
      }
    } catch (err) {
      setError(err.message || 'Error al actualizar');
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarContrasena = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const strength = calculateStrength(nuevaContrasena);
    if (strength.score < 4) {
      setError('La contraseña debe ser más fuerte (al menos 4 requisitos)');
      return;
    }

    if (nuevaContrasena !== confirmarContrasena) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoadingPassword(true);
    try {
      await userApi.cambiarContrasena(contrasenaActual, nuevaContrasena);
      setSuccess('Contraseña actualizada correctamente');
      setContrasenaActual('');
      setNuevaContrasena('');
      setConfirmarContrasena('');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cambiar la contraseña');
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleReenviarVerificacion = async () => {
    if (!confirm('¿Reenviar email de verificación?')) return;
    setLoadingVerificacion(true);
    try {
      await authApi.reenviarVerificacion();
      alert('Se ha enviado un nuevo email de verificación');
    } catch (err) {
      alert(err.message || 'Error al reenviar verificación');
    }
    setLoadingVerificacion(false);
  };

  const handleAprobar = async (solicitudId) => {
    if (!confirm('¿Aprobar esta solicitud?')) return;
    try {
      await animalApi.aprobarSolicitud(solicitudId);
      fetchSolicitudesAdmin();
      alert('Solicitud aprobada');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRechazar = async (solicitudId) => {
    if (!confirm('¿Rechazar esta solicitud?')) return;
    try {
      await animalApi.rechazarSolicitud(solicitudId);
      fetchSolicitudesAdmin();
      alert('Solicitud rechazada');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCrearAnimal = async (e) => {
    e.preventDefault();
    try {
      if (editingAnimal) {
        await animalApi.updateAnimal(editingAnimal.id, animalForm);
        alert('Animal actualizado');
      } else {
        await animalApi.createAnimal(animalForm);
        alert('Animal creado');
      }
      setShowAnimalModal(false);
      setEditingAnimal(null);
      setAnimalForm({
        nombre: '',
        especie: 'perro',
        edad: '',
        tamano: 'mediano',
        caracter: '',
        salud: '',
        imagen_url: '',
        peso: '',
        urgente: false
      });
      fetchAnimales();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditarAnimal = (animal) => {
    setEditingAnimal(animal);
    setAnimalForm({
      nombre: animal.nombre,
      especie: animal.especie || 'perro',
      edad: animal.edad,
      tamano: animal.tamano,
      caracter: animal.caracter || '',
      salud: animal.salud || '',
      imagen_url: animal.imagen_url || '',
      peso: animal.peso || '',
      urgente: animal.urgente || false
    });
    setShowAnimalModal(true);
  };

  const handleEliminarAnimal = async (animalId) => {
    if (!confirm('¿Eliminar este animal?')) return;
    try {
      await animalApi.deleteAnimal(animalId);
      fetchAnimales();
      alert('Animal eliminado');
    } catch (err) {
      alert(err.message);
    }
  };

  const getEstadoBadge = (estado) => {
    const estados = {
      pending: { label: 'Pendiente', class: styles.pending },
      approved: { label: 'Aprobada', class: styles.approved },
      rejected: { label: 'Rechazada', class: styles.rejected }
    };
    const estadoObj = estados[estado] || estados.pending;
    return <span className={`${styles.badge} ${estadoObj.class}`}>{estadoObj.label}</span>;
  };

  if (!user) return null;

  const isAdmin = user.rol === 'admin';

  return (
    <main className={styles.container}>
      <div className="container">
        <div className={styles.menuCard}>
          <div className={styles.menuHeader}>
            <div className={styles.menuAvatar}>
              <span className="material-symbols-outlined">
                {isAdmin ? 'admin_panel_settings' : 'person'}
              </span>
            </div>
            <div className={styles.menuTitle}>
              <h2>{user.nombre || 'Usuario'}</h2>
              <p>{user.email}</p>
              <div className={styles.roleContainer}>
                <span className={styles.menuRole}>{isAdmin ? 'Administrador' : 'Usuario'}</span>
                {user.es_voluntario && (
                  <span className={`${styles.menuRole} ${voluntarioActivo ? styles.voluntarioActivo : styles.voluntarioInactivo}`}>
                    <span className="material-symbols-outlined">volunteer_activism</span>
                    {voluntarioActivo ? 'Voluntario' : 'Voluntario inactivo'}
                  </span>
                )}
                {user.es_socio && (
                  <span className={`${styles.menuRole} ${styles.socioActivo}`}>
                    <span className="material-symbols-outlined">card_membership</span>
                    Socio
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className={styles.menuButtons}>
            {user.es_socio && (
              <button 
                className={`${styles.menuBtn} ${activeTab === 'socio' ? styles.active : ''}`}
                onClick={() => setActiveTab('socio')}
              >
                <span className="material-symbols-outlined">card_membership</span>
                <span className={styles.btnText}>
                  <span className={styles.btnTitle}>Mi Socio</span>
                  <span className={styles.btnSubtitle}>Ver datos y gestionar baja</span>
                </span>
                <span className="material-symbols-outlined arrow">chevron_right</span>
              </button>
            )}

            {user.es_voluntario && (
              <button 
                className={`${styles.menuBtn} ${activeTab === 'voluntariado' ? styles.active : ''}`}
                onClick={() => setActiveTab('voluntariado')}
              >
                <span className="material-symbols-outlined">volunteer_activism</span>
                <span className={styles.btnText}>
                  <span className={styles.btnTitle}>Mi Voluntariado</span>
                  <span className={styles.btnSubtitle}>Editar datos y gestionar estado</span>
                </span>
                <span className="material-symbols-outlined arrow">chevron_right</span>
              </button>
            )}

            {!isAdmin && (
              <button
                className={`${styles.menuBtn} ${activeTab === 'datos' ? styles.active : ''}`}
                onClick={() => setActiveTab('datos')}
              >
                <span className="material-symbols-outlined">person</span>
                <span className={styles.btnText}>
                  <span className={styles.btnTitle}>Editar Mi Perfil</span>
                  <span className={styles.btnSubtitle}>Nombre y email</span>
                </span>
                <span className="material-symbols-outlined arrow">chevron_right</span>
              </button>
            )}

            <button
              className={`${styles.menuBtn} ${activeTab === 'password' ? styles.active : ''}`}
              onClick={() => setActiveTab('password')}
            >
              <span className="material-symbols-outlined">lock</span>
              <span className={styles.btnText}>
                <span className={styles.btnTitle}>Cambiar Contraseña</span>
                <span className={styles.btnSubtitle}>Actual y nueva contraseña</span>
              </span>
              <span className="material-symbols-outlined arrow">chevron_right</span>
            </button>

            {user.rol !== 'admin' && (
              <>
                <button
                  className={`${styles.menuBtn} ${activeTab === 'solicitudes' ? styles.active : ''}`}
                  onClick={() => setActiveTab('solicitudes')}
                >
                  <span className="material-symbols-outlined">description</span>
                  <span className={styles.btnText}>
                    <span className={styles.btnTitle}>Ver Mis Solicitudes</span>
                    <span className={styles.btnSubtitle}>Estado de tus adopciones</span>
                  </span>
                  <span className="material-symbols-outlined arrow">chevron_right</span>
                </button>

                <button
                  className={`${styles.menuBtn} ${activeTab === 'inscripciones' ? styles.active : ''}`}
                  onClick={() => setActiveTab('inscripciones')}
                >
                  <span className="material-symbols-outlined">event</span>
                  <span className={styles.btnText}>
                    <span className={styles.btnTitle}>Mis Inscripciones</span>
                    <span className={styles.btnSubtitle}>Eventos a los que te has inscrito</span>
                  </span>
                  <span className="material-symbols-outlined arrow">chevron_right</span>
                </button>

                <button
                  className={`${styles.menuBtn} ${activeTab === 'acogidas' ? styles.active : ''}`}
                  onClick={() => setActiveTab('acogidas')}
                >
                  <span className="material-symbols-outlined">home</span>
                  <span className={styles.btnText}>
                    <span className={styles.btnTitle}>Mis Acogidas</span>
                    <span className={styles.btnSubtitle}>Estado de tus solicitudes de acogida</span>
                  </span>
                  <span className="material-symbols-outlined arrow">chevron_right</span>
                </button>

                <button
                  className={`${styles.menuBtn} ${activeTab === 'apadrinamientos' ? styles.active : ''}`}
                  onClick={() => setActiveTab('apadrinamientos')}
                >
                  <span className="material-symbols-outlined">favorite</span>
                  <span className={styles.btnText}>
                    <span className={styles.btnTitle}>Mis Apadrinamientos</span>
                    <span className={styles.btnSubtitle}>Ver y gestionar mis apadrinamientos</span>
                  </span>
                  <span className="material-symbols-outlined arrow">chevron_right</span>
                </button>

                <button
                  className={`${styles.menuBtn} ${activeTab === 'donaciones' ? styles.active : ''}`}
                  onClick={() => setActiveTab('donaciones')}
                >
                  <span className="material-symbols-outlined">volunteer_activism</span>
                  <span className={styles.btnText}>
                    <span className={styles.btnTitle}>Mis Donaciones</span>
                    <span className={styles.btnSubtitle}>Historial de tus donaciones</span>
                  </span>
                  <span className="material-symbols-outlined arrow">chevron_right</span>
                </button>
              </>
            )}

            {isAdmin && (
              <>
                <Link to="/admin/solicitudes" className={styles.menuBtn}>
                  <span className="material-symbols-outlined">folder_open</span>
                  <span className={styles.btnText}>
                    <span className={styles.btnTitle}>Gestionar Solicitudes</span>
                    <span className={styles.btnSubtitle}>Aprobar o rechazar adopciones</span>
                  </span>
                  <span className="material-symbols-outlined arrow">chevron_right</span>
                </Link>

                <Link to="/admin/inscripciones" className={styles.menuBtn}>
                  <span className="material-symbols-outlined">how_to_reg</span>
                  <span className={styles.btnText}>
                    <span className={styles.btnTitle}>Gestionar Inscripciones</span>
                    <span className={styles.btnSubtitle}>Ver inscripciones a eventos</span>
                  </span>
                  <span className="material-symbols-outlined arrow">chevron_right</span>
                </Link>

                <Link to="/admin/ayudas" className={styles.menuBtn}>
                  <span className="material-symbols-outlined">volunteer_activism</span>
                  <span className={styles.btnText}>
                    <span className={styles.btnTitle}>Gestionar Ayudas</span>
                    <span className={styles.btnSubtitle}>Ver donaciones y ayudas económicas</span>
                  </span>
                  <span className="material-symbols-outlined arrow">chevron_right</span>
                </Link>
              </>
            )}
          </div>

          <div className={styles.menuContent}>
            {error && <div className={styles.error}><span className="material-symbols-outlined">error</span>{error}</div>}
            {success && <div className={styles.success}><span className="material-symbols-outlined">check_circle</span>{success}</div>}

            {activeTab === 'datos' && (
              <>
                {!emailVerificado && (
                  <div className={styles.verificacionBanner}>
                    <span className="material-symbols-outlined">mark_email_unread</span>
                    <div className={styles.bannerText}>
                      <strong>Verifica tu email para acceder a todas las funciones</strong>
                      <span>Se ha enviado un email de verificación a tu dirección. Revisa tu bandeja de entrada y spam.</span>
                    </div>
                  </div>
                )}
                <div className={styles.verificacionStatus}>
                  <div className={`${styles.verificacionBadge} ${emailVerificado ? styles.verificado : styles.noVerificado}`}>
                    <span className="material-symbols-outlined">
                      {emailVerificado ? 'verified' : 'pending'}
                    </span>
                    <span>
                      {emailVerificado ? 'Email verificado' : 'Email no verificado'}
                    </span>
                  </div>
                  {!emailVerificado && (
                    <button 
                      type="button" 
                      className={styles.reenviarBtn}
                      onClick={handleReenviarVerificacion}
                      disabled={loadingVerificacion}
                    >
                      {loadingVerificacion ? 'Enviando...' : 'Reenviar verificación'}
                    </button>
                  )}
                </div>
                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.field}>
                    <label htmlFor="nombre"><span className="material-symbols-outlined">badge</span>Nombre completo</label>
                    <input type="text" id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="email"><span className="material-symbols-outlined">mail</span>Email</label>
                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  {!emailVerificado && (
                    <p className={styles.warningText}>
                      <span className="material-symbols-outlined">info</span>
                      Al cambiar tu email recibirás un nuevo email de verificación
                    </p>
                  )}
                  <button type="submit" className={styles.button} disabled={loading}>
                    {loading ? <><span className={styles.spinner}></span>Guardando...</> : <><span className="material-symbols-outlined">save</span>Guardar Cambios</>}
                  </button>
                </form>
              </>
            )}

            {activeTab === 'voluntariado' && user.es_voluntario && misVoluntario && (
              <div className={styles.voluntarioInfo}>
                <div className={styles.voluntarioHeader}>
                  <h3 className={styles.voluntarioTitle}>Mi Voluntariado</h3>
                  <div className={styles.toggleContainer}>
                    <span className={voluntarioActivo ? styles.toggleLabelActive : styles.toggleLabelInactive}>
                      {voluntarioActivo ? 'Activo' : 'Inactivo'}
                    </span>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={voluntarioActivo}
                        onChange={handleToggleVoluntario}
                        disabled={loadingToggle}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>
                </div>

{editandoVoluntario ? (
                  <form onSubmit={handleGuardarVoluntario} className={styles.voluntarioForm}>
                    <div className={styles.voluntarioGrid}>
                      <div className={styles.voluntarioItem}>
                        <label>Teléfono *</label>
                        <input
                          type="tel"
                          name="telefono"
                          value={voluntarioFormData.telefono}
                          onChange={handleVoluntarioChange}
                          placeholder="600123456"
                        />
                        {voluntarioErrores.telefono && <span className={styles.errorText}>{voluntarioErrores.telefono}</span>}
                      </div>
                      <div className={styles.voluntarioItem}>
                        <label>DNI *</label>
                        <input
                          type="text"
                          name="dni"
                          value={voluntarioFormData.dni}
                          onChange={handleVoluntarioChange}
                          placeholder="12345678A / X1234567L"
                        />
                        {voluntarioErrores.dni && <span className={styles.errorText}>{voluntarioErrores.dni}</span>}
                      </div>
                    </div>
                    <div className={styles.voluntarioItem}>
                      <label>Días disponibles *</label>
                      <div className={styles.daysGrid}>
                        {DIAS_SEMANA.map(dia => (
                          <label key={dia.id} className={`${styles.dayCheckbox} ${voluntarioFormData.disponibilidad_dias.includes(dia.id) ? styles.selected : ''}`}>
                            <input
                              type="checkbox"
                              checked={voluntarioFormData.disponibilidad_dias.includes(dia.id)}
                              onChange={() => handleVoluntarioCheckboxGroup('disponibilidad_dias', dia.id)}
                            />
                            <span>{dia.label}</span>
                          </label>
                        ))}
                      </div>
                      {voluntarioErrores.disponibilidad_dias && <span className={styles.errorText}>{voluntarioErrores.disponibilidad_dias}</span>}
                    </div>
                    <div className={styles.voluntarioItem}>
                      <label>Horario preferido *</label>
                      <div className={styles.radioGroup}>
                        {HORARIOS.map(horario => (
                          <label key={horario.id} className={`${styles.radioOption} ${voluntarioFormData.disponibilidad_horario === horario.id ? styles.selected : ''}`}>
                            <input
                              type="radio"
                              name="disponibilidad_horario"
                              value={horario.id}
                              checked={voluntarioFormData.disponibilidad_horario === horario.id}
                              onChange={handleVoluntarioChange}
                            />
                            <span>{horario.label}</span>
                          </label>
                        ))}
                      </div>
                      {voluntarioErrores.disponibilidad_horario && <span className={styles.errorText}>{voluntarioErrores.disponibilidad_horario}</span>}
                    </div>
                    <div className={styles.voluntarioItem}>
                      <label className={styles.checkboxVehicle}>
                        <input
                          type="checkbox"
                          name="tiene_vehiculo"
                          checked={voluntarioFormData.tiene_vehiculo}
                          onChange={handleVoluntarioChange}
                        />
                        <span>Disponibilidad para traslados</span>
                      </label>
                    </div>
                    <div className={styles.formButtons}>
                      <button type="submit" className={styles.button} disabled={guardandoVoluntario}>
                        {guardandoVoluntario ? 'Guardando...' : 'Guardar Cambios'}
                      </button>
                      <button type="button" onClick={handleCancelarEdicionVoluntario} className={styles.cancelButton}>
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className={styles.voluntarioView}>
                    <div className={styles.voluntarioGrid}>
                      <div className={styles.voluntarioItem}>
                        <span className={styles.voluntarioLabel}>Teléfono</span>
                        <span className={styles.voluntarioValue}>{misVoluntario.telefono}</span>
                      </div>
                      <div className={styles.voluntarioItem}>
                        <span className={styles.voluntarioLabel}>DNI</span>
                        <span className={styles.voluntarioValue}>{misVoluntario.dni}</span>
                      </div>
                      <div className={styles.voluntarioItem}>
                        <span className={styles.voluntarioLabel}>Días disponibles</span>
                        <span className={styles.voluntarioValue}>
                          {(() => {
                            const dias = misVoluntario.disponibilidad_dias;
                            if (!dias) return 'No especificados';
                            const diasArray = formatearDias(dias);
                            if (diasArray.length === 0) return 'No especificados';
                            const diasLabels = { lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles', jueves: 'Jueves', viernes: 'Viernes', sabado: 'Sábado', domingo: 'Domingo' };
                            return diasArray.map(d => diasLabels[d] || d).join(', ');
                          })()}
                        </span>
                      </div>
                      <div className={styles.voluntarioItem}>
                        <span className={styles.voluntarioLabel}>Horario</span>
                        <span className={styles.voluntarioValue}>
                          {misVoluntario.disponibilidad_horario === 'manana' ? 'Mañanas' :
                           misVoluntario.disponibilidad_horario === 'tarde' ? 'Tardes' :
                           misVoluntario.disponibilidad_horario === 'todo' ? 'Todo el día' : 'No especificado'}
                        </span>
                      </div>
                      <div className={styles.voluntarioItem}>
                        <span className={styles.voluntarioLabel}>Vehículo</span>
                        <span className={styles.voluntarioValue}>{misVoluntario.tiene_vehiculo ? 'Sí' : 'No'}</span>
                      </div>
                      <div className={styles.voluntarioItem}>
                        <span className={styles.voluntarioLabel}>Fecha de registro</span>
                        <span className={styles.voluntarioValue}>
                          {formatDateShort(misVoluntario.created_at)}
                        </span>
                      </div>
                    </div>
                    {misVoluntario.motivacion && (
                      <div className={styles.voluntarioItem} style={{marginTop: '15px'}}>
                        <span className={styles.voluntarioLabel}>Motivación</span>
                        <span className={styles.voluntarioValue}>{misVoluntario.motivacion}</span>
                      </div>
                    )}
                    {misVoluntario.experiencia && (
                      <div className={styles.voluntarioItem} style={{marginTop: '15px'}}>
                        <span className={styles.voluntarioLabel}>Experiencia</span>
                        <span className={styles.voluntarioValue}>{misVoluntario.experiencia}</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={handleEditarVoluntario}
                      className={styles.editButton}
                    >
                      <span className="material-symbols-outlined">edit</span>
                      Editar Datos
                    </button>
                  </div>
)}
            </div>
)}

            {activeTab === 'socio' && user.es_socio && (
              loadingSocio ? (
                <div className={styles.loading}>Cargando datos de socio...</div>
              ) : misSocios ? (
                <div className={styles.voluntarioInfo}>
                  <div className={styles.voluntarioHeader}>
                    <h3 className={styles.voluntarioTitle}>Mi Socio</h3>
                    <span className={styles.socioActivoBadge}>Activo</span>
                  </div>
                  <div className={styles.voluntarioView}>
                    <div className={styles.voluntarioGrid}>
                      <div className={styles.voluntarioItem}>
                        <span className={styles.voluntarioLabel}>Nombre completo</span>
                        <span className={styles.voluntarioValue}>{misSocios.nombre_apellidos}</span>
                      </div>
                      <div className={styles.voluntarioItem}>
                        <span className={styles.voluntarioLabel}>DNI/NIE</span>
                        <span className={styles.voluntarioValue}>{misSocios.dni_nie}</span>
                      </div>
                      <div className={styles.voluntarioItem}>
                        <span className={styles.voluntarioLabel}>Teléfono</span>
                        <span className={styles.voluntarioValue}>{misSocios.telefono}</span>
                      </div>
                      <div className={styles.voluntarioItem}>
                        <span className={styles.voluntarioLabel}>Email</span>
                        <span className={styles.voluntarioValue}>{misSocios.email_usuario}</span>
                      </div>
                      <div className={styles.voluntarioItem}>
                        <span className={styles.voluntarioLabel}>Dirección</span>
                        <span className={styles.voluntarioValue}>{misSocios.direccion}</span>
                      </div>
                      <div className={styles.voluntarioItem}>
                        <span className={styles.voluntarioLabel}>Código Postal</span>
                        <span className={styles.voluntarioValue}>{misSocios.codigo_postal}</span>
                      </div>
                      <div className={styles.voluntarioItem}>
                        <span className={styles.voluntarioLabel}>Ciudad/Provincia</span>
                        <span className={styles.voluntarioValue}>{misSocios.ciudad_provincia}</span>
                      </div>
                      <div className={styles.voluntarioItem}>
                        <span className={styles.voluntarioLabel}>Aportación mensual</span>
                        <span className={styles.voluntarioValue}>{misSocios.aportacion}€/mes</span>
                      </div>
                      <div className={styles.voluntarioItem}>
                        <span className={styles.voluntarioLabel}>Forma de pago</span>
                        <span className={styles.voluntarioValue}>
                          {misSocios.metodo_pago === 'sepa' ? 'Domiciliación' : 'Tarjeta'}
                        </span>
                      </div>
                      <div className={styles.voluntarioItem}>
                        <span className={styles.voluntarioLabel}>Fecha de alta</span>
                        <span className={styles.voluntarioValue}>
                          {misSocios.started_at ? formatDateShort(misSocios.started_at) : '-'}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleCancelarSocio}
                      className={styles.socioCancelButton}
                      disabled={cancelandoSocio}
                    >
                      {cancelandoSocio ? 'Cancelando...' : 'Darme de baja'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.empty}>No tienes datos de socio</div>
              )
            )}

            {activeTab === 'password' && (
              <form onSubmit={handleCambiarContrasena} className={styles.form}>
                <p className={styles.formDescription}>Introduce tu contraseña actual y luego la nueva contraseña.</p>
                
                <div className={styles.field}>
                  <label htmlFor="contrasenaActual"><span className="material-symbols-outlined">lock</span>Contraseña actual</label>
                  <div className={styles.passwordWrapper}>
                    <input 
                      type={mostrarActual ? 'text' : 'password'} 
                      id="contrasenaActual" 
                      value={contrasenaActual} 
                      onChange={(e) => setContrasenaActual(e.target.value)} 
                      required 
                      placeholder="Tu contraseña actual"
                    />
                    <button type="button" className={styles.togglePassword} onClick={() => setMostrarActual(!mostrarActual)}>
                      <span className="material-symbols-outlined">{mostrarActual ? 'visibility' : 'visibility_off'}</span>
                    </button>
                  </div>
                </div>

                <div className={styles.field}>
                  <label htmlFor="nuevaContrasena"><span className="material-symbols-outlined">lock</span>Nueva contraseña</label>
                  <div className={styles.passwordWrapper}>
                    <input 
                      type={mostrarNueva ? 'text' : 'password'} 
                      id="nuevaContrasena" 
                      value={nuevaContrasena} 
                      onChange={(e) => setNuevaContrasena(e.target.value)} 
                      required 
                      minLength={8}
                      placeholder="Mínimo 8 caracteres"
                    />
                    <button type="button" className={styles.togglePassword} onClick={() => setMostrarNueva(!mostrarNueva)}>
                      <span className="material-symbols-outlined">{mostrarNueva ? 'visibility' : 'visibility_off'}</span>
                    </button>
                  </div>
                </div>

                {nuevaContrasena && (() => {
                  const strength = calculateStrength(nuevaContrasena);
                  return (
                    <div className={styles.requirements}>
                      <div className={styles.strengthBar}>
                        <div 
                          className={styles.strengthFill} 
                          style={{ 
                            width: `${(strength.score / 5) * 100}%`,
                            backgroundColor: strength.score <= 1 ? '#ef5350' : strength.score <= 2 ? '#ff9800' : strength.score <= 3 ? '#ffca28' : '#66bb6a'
                          }}
                        />
                      </div>
                      <p className={styles.strengthText}>
                        {strength.score === 0 && 'Débil'}
                        {strength.score === 1 && 'Muy débil'}
                        {strength.score === 2 && 'Débil'}
                        {strength.score === 3 && 'Media'}
                        {strength.score === 4 && 'Fuerte'}
                        {strength.score === 5 && 'Muy fuerte'}
                      </p>
                      <ul className={styles.requirementsList}>
                        <li className={strength.hasLength ? styles.met : ''}>
                          <span className="material-symbols-outlined">{strength.hasLength ? 'check_circle' : 'radio_button_unchecked'}</span>
                          Mínimo 8 caracteres
                        </li>
                        <li className={strength.hasUpper ? styles.met : ''}>
                          <span className="material-symbols-outlined">{strength.hasUpper ? 'check_circle' : 'radio_button_unchecked'}</span>
                          Una mayúscula (A-Z)
                        </li>
                        <li className={strength.hasLower ? styles.met : ''}>
                          <span className="material-symbols-outlined">{strength.hasLower ? 'check_circle' : 'radio_button_unchecked'}</span>
                          Una minúscula (a-z)
                        </li>
                        <li className={strength.hasNumber ? styles.met : ''}>
                          <span className="material-symbols-outlined">{strength.hasNumber ? 'check_circle' : 'radio_button_unchecked'}</span>
                          Un número (0-9)
                        </li>
                        <li className={strength.hasSpecial ? styles.met : ''}>
                          <span className="material-symbols-outlined">{strength.hasSpecial ? 'check_circle' : 'radio_button_unchecked'}</span>
                          Un carácter especial (!@#$...)
                        </li>
                      </ul>
                    </div>
                  );
                })()}

                <div className={styles.field}>
                  <label htmlFor="confirmarContrasena"><span className="material-symbols-outlined">lock</span>Confirmar contraseña</label>
                  <div className={styles.passwordWrapper}>
                    <input 
                      type={mostrarConfirmar ? 'text' : 'password'} 
                      id="confirmarContrasena" 
                      value={confirmarContrasena} 
                      onChange={(e) => setConfirmarContrasena(e.target.value)} 
                      required 
                      placeholder="Repite tu contraseña"
                    />
                    <button type="button" className={styles.togglePassword} onClick={() => setMostrarConfirmar(!mostrarConfirmar)}>
                      <span className="material-symbols-outlined">{mostrarConfirmar ? 'visibility' : 'visibility_off'}</span>
                    </button>
                  </div>
                </div>

                <button type="submit" className={styles.button} disabled={loadingPassword}>
                  {loadingPassword ? <><span className={styles.spinner}></span>Cambiando...</> : <><span className="material-symbols-outlined">save</span>Cambiar Contraseña</>}
                </button>
              </form>
            )}

            {activeTab === 'solicitudes' && (
              <div className={styles.solicitudesSection}>
                <h3 className={styles.sectionTitle}>Mis Solicitudes de Adopción</h3>
                {loadingSolicitudes ? (
                  <div className={styles.loading}>Cargando...</div>
                ) : misSolicitudes.length === 0 ? (
                  <div className={styles.empty}>No has realizado ninguna solicitud</div>
                ) : (
                  <div className={styles.solicitudesList}>
                    {misSolicitudes.map(sol => (
                      <div key={sol.id} className={styles.solicitudItem}>
                        <div className={styles.solicitudInfo}>
                          <div className={styles.animalThumb}>
                            {sol.animal_imagen ? <img src={sol.animal_imagen} alt={sol.animal_nombre} /> : <span className="material-symbols-outlined">pets</span>}
                          </div>
                          <div>
                            <h4>{sol.animal_nombre || 'Animal'}</h4>
                            <p className={styles.solicitudFecha}>
{formatDateShort(sol.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className={styles.solicitudActions}>
                          {getEstadoBadge(sol.estado)}
                          <button 
                            onClick={() => setDetalleSolicitud(sol)}
                            className={styles.btnVerDetalles}
                            title="Ver detalles"
                          >
                            <span className="material-symbols-outlined">visibility</span>
                          </button>
                          {sol.estado === 'pending' && (
                            <button 
                              onClick={() => handleEliminarSolicitud(sol.id)}
                              className={styles.btnEliminarSolicitud}
                              title="Eliminar solicitud"
                            >
                              <span className="material-symbols-outlined">delete</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

{activeTab === 'inscripciones' && (
              <div className={styles.inscripcionesSection}>
                <h3 className={styles.sectionTitle}>
                  Mis Inscripciones a Eventos
                </h3>
                {loadingInscripciones ? (
                  <div className={styles.loadingInscripciones}>Cargando...</div>
                ) : misInscripciones.length === 0 ? (
                  <div className={styles.emptyInscripciones}>
                    <span className="material-symbols-outlined">event_busy</span>
                    <p>No te has inscrito a ningún evento</p>
                  </div>
                ) : (
                  <div className={styles.inscripcionesGrid}>
                    {misInscripciones.map((insc) => {
                      const eventoDate = new Date(insc.evento_fecha);
                      if (insc.evento_hora) {
                        const horaInicio = insc.evento_hora.split(' - ')[0];
                        const [horas, minutos] = horaInicio.split(':').map(Number);
                        eventoDate.setHours(horas, minutos, 0, 0);
                      }
                      const eventoPasado = eventoDate < new Date();
                      
                      return (
                        <div 
                          key={insc.id} 
                          className={styles.inscripcionCard}
                          onClick={() => navigate(`/eventos?evento=${insc.evento_id}`)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className={styles.inscripcionCardHeader}>
                            {insc.evento_imagen ? (
                              <img src={insc.evento_imagen} alt={insc.evento_titulo} className={styles.inscripcionCardImage} />
                            ) : (
                              <div className={styles.inscripcionCardImagePlaceholder}>
                                <span className="material-symbols-outlined">event</span>
                              </div>
                            )}
                            <div className={styles.inscripcionCardInfo}>
                              <h4>{insc.evento_titulo || 'Evento'}</h4>
                              <p className={styles.inscripcionCardFecha}>
                                <span className="material-symbols-outlined">calendar_today</span>
                                {insc.evento_fecha && formatDateShort(insc.evento_fecha)}
                              </p>
                            </div>
                          </div>
                          <div className={styles.inscripcionCardBody}>
                            <span className={`${styles.badge} ${eventoPasado ? styles.badgeExpired : styles.badgeSuccess}`}>
                              {eventoPasado ? 'Evento ya pasado' : 'Inscrito'}
                            </span>
                            {!eventoPasado && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelarInscripcion(insc.id, insc.evento_id, insc.evento_fecha, insc.evento_hora);
                                }}
                                className={styles.btnEliminarSolicitud}
                                title="Cancelar inscripción"
                              >
                                <span className="material-symbols-outlined">delete</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'acogidas' && (
              loadingAcogidas ? (
                <div className={styles.loading}>Cargando acogidas...</div>
              ) : (
                <>
                  {misAcogidas.length > 0 && (
                    <div className={styles.voluntarioInfo}>
                      <h3 className={styles.voluntarioTitle}>Mis Acogidas</h3>
                      {misAcogidas.map((acogida) => (
                        <div key={acogida.id} className={styles.acogidaCard}>
                          <div className={styles.voluntarioHeader}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              {acogida.animal_imagen ? (
                                <img src={acogida.animal_imagen} alt={acogida.animal_nombre} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                              ) : (
                                <div style={{ width: '60px', height: '60px', borderRadius: '8px', background: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <span className="material-symbols-outlined" style={{ color: '#1976D2' }}>pets</span>
                                </div>
                              )}
                              <div>
                                <h4 style={{ margin: 0, color: '#333' }}>{acogida.animal_nombre ? `Animal: ${acogida.animal_nombre}` : 'Sin animal asignado'}</h4>
                                <span className={`${styles.badge} ${acogida.estado === 'aceptado' ? styles.aprobada : acogida.estado === 'pending' ? styles.pendiente : styles.rechazada}`}>
                                  {acogida.estado === 'pending' ? 'Pendiente' : acogida.estado === 'approved' ? 'Aprobada' : acogida.estado === 'asignado_pendiente' ? 'Asignado' : acogida.estado === 'aceptado' ? 'Confirmada' : 'Rechazada'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className={styles.voluntarioGrid}>
                            {acogida.estado !== 'pending' && (
                              <>
                                <div className={styles.voluntarioItem}>
                                  <span className={styles.voluntarioLabel}>Especie</span>
                                  <span className={styles.voluntarioValue}>{acogida.animal_especie || '-'}</span>
                                </div>
                                <div className={styles.voluntarioItem}>
                                  <span className={styles.voluntarioLabel}>Edad</span>
                                  <span className={styles.voluntarioValue}>{acogida.animal_edad || '-'}</span>
                                </div>
                              </>
                            )}
                            <div className={styles.voluntarioItem}>
                              <span className={styles.voluntarioLabel}>Fecha solicitud</span>
                              <span className={styles.voluntarioValue}>{acogida.created_at ? formatDateShort(acogida.created_at) : '-'}</span>
                            </div>
                          </div>
                          {acogida.estado === 'pending' && (
                            <button
                              type="button"
                              onClick={() => handleEliminarSolicitudAcogida(acogida.id)}
                              className={styles.socioCancelButton}
                              style={{ background: '#f57c00', marginTop: '10px' }}
                            >
                              Eliminar solicitud
                            </button>
                          )}
                          {acogida.estado === 'asignado_pendiente' && (
                            <div className={styles.aceptarRechazarBtns}>
                              <button
                                onClick={() => handleAceptarAnimalAsignado(acogida.id)}
                                className={styles.btnAprobar}
                              >
                                <span className="material-symbols-outlined">check_circle</span> Aceptar
                              </button>
                              <button
                                onClick={() => handleRechazarAnimalAsignado(acogida.id)}
                                className={styles.btnRechazar}
                              >
                                <span className="material-symbols-outlined">cancel</span> Rechazar
                              </button>
                            </div>
                          )}
                          {acogida.estado === 'rejected' && acogida.motivo_rechazo && (
                            <p style={{ fontSize: '0.85rem', color: '#c62828', marginTop: '10px' }}>
                              <strong>Motivo del rechazo:</strong> {acogida.motivo_rechazo}
                            </p>
                          )}
                        </div>
                      ))}

                      <button
                        onClick={() => {
                          const tieneActiva = misAcogidas.some(a =>
                            a.estado === 'pending' || a.estado === 'approved' ||
                            a.estado === 'asignado_pendiente' || a.estado === 'aceptado'
                          );
                          if (tieneActiva) {
                            setModalAcogida({ show: true });
                          } else {
                            navigate('/acogida');
                          }
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginTop: '20px',
                          padding: '12px 24px',
                          backgroundColor: '#1976D2',
                          color: 'white',
                          borderRadius: '8px',
                          fontWeight: '600',
                          textDecoration: 'none',
                          fontSize: '15px',
                          boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
                          cursor: 'pointer',
                          border: 'none',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add_circle</span>
                        Solicitar otra acogida
                      </button>
                    </div>
                  )}

                  {misAcogidas.length === 0 && (
                    <div className={styles.empty}>
                      <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#1976D2' }}>home</span>
                      <p>No tienes solicitudes de acogida</p>
                      <Link to="/acogida" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 24px',
                        backgroundColor: '#1976D2',
                        color: 'white',
                        borderRadius: '8px',
                        fontWeight: '600',
                        textDecoration: 'none',
                        fontSize: '15px',
                        boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
                        transition: 'all 0.2s ease'
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>pets</span>
                        Solicitar Acogida
                      </Link>
                    </div>
                  )}
                </>
              )
            )}

            {activeTab === 'apadrinamientos' && (
              loadingApadrinamientos ? (
                <div className={styles.loading}>Cargando apadrinamientos...</div>
              ) : misApadrinamientos.length > 0 ? (
                <div className={styles.voluntarioInfo}>
                  <h3 className={styles.voluntarioTitle}>Mis Apadrinamientos</h3>
                  {misApadrinamientos.map((apadr) => (
                    <div key={apadr.id} className={styles.apadrinamientoCard}>
                      <div className={styles.voluntarioHeader}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {apadr.animal_imagen && (
                            <img src={apadr.animal_imagen} alt={apadr.animal_nombre} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                          )}
                          <div>
                            <h4 style={{ margin: 0, color: '#333' }}>{apadr.animal_nombre}</h4>
                            <span className={`${styles.badge} ${apadr.estado === 'active' ? styles.aprobada : apadr.estado === 'pending' ? styles.pendiente : styles.rechazada}`}>
                              {apadr.estado === 'active' ? 'Activo' : apadr.estado === 'pending' ? 'Pendiente' : apadr.estado === 'rejected' ? 'Rechazado' : 'Cancelado'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className={styles.voluntarioGrid}>
                        <div className={styles.voluntarioItem}>
                          <span className={styles.voluntarioLabel}>Importe mensual</span>
                          <span className={styles.voluntarioValue}>{apadr.importe}€/mes</span>
                        </div>
                        <div className={styles.voluntarioItem}>
                          <span className={styles.voluntarioLabel}>DNI/NIE</span>
                          <span className={styles.voluntarioValue}>{apadr.dni_nie || '-'}</span>
                        </div>
                        <div className={styles.voluntarioItem}>
                          <span className={styles.voluntarioLabel}>Teléfono</span>
                          <span className={styles.voluntarioValue}>{apadr.telefono || '-'}</span>
                        </div>
                        <div className={styles.voluntarioItem}>
                          <span className={styles.voluntarioLabel}>Visibilidad</span>
                          <span className={styles.voluntarioValue}>{apadr.mostrar_publico ? 'Público' : 'Privado'}</span>
                        </div>
                        <div className={styles.voluntarioItem}>
                          <span className={styles.voluntarioLabel}>Fecha solicitud</span>
                          <span className={styles.voluntarioValue}>{apadr.created_at ? formatDateShort(apadr.created_at) : '-'}</span>
                        </div>
                      </div>
                      {apadr.estado === 'pending' && (
                        <button
                          type="button"
                          onClick={() => handleEliminarSolicitudApadrinamiento(apadr.id)}
                          className={styles.socioCancelButton}
                          style={{ background: '#f57c00' }}
                        >
                          Eliminar solicitud
                        </button>
                      )}
                      {apadr.estado === 'active' && (
                        <button
                          type="button"
                          onClick={() => handleCancelarApadrinamiento(apadr.id)}
                          className={styles.socioCancelButton}
                          disabled={cancelandoApadrinamiento}
                        >
                          {cancelandoApadrinamiento ? 'Cancelando...' : 'Cancelar apadrinamiento'}
                        </button>
                      )}
                    </div>
                  ))}

                  <Link to="/apadrinar" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: '20px',
                    padding: '12px 24px',
                    backgroundColor: '#1976D2',
                    color: 'white',
                    borderRadius: '8px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    fontSize: '15px',
                    boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
                    transition: 'all 0.2s ease'
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add_circle</span>
                    Apadrinar otro animal
                  </Link>
                </div>
              ) : (
                <div className={styles.empty}>
                  <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#1976D2' }}>favorite</span>
<p>No tienes apadrinamientos</p>
                  <Link to="/apadrinar" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    backgroundColor: '#1976D2',
                    color: 'white',
                    borderRadius: '8px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    fontSize: '15px',
                    boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
                    transition: 'all 0.2s ease'
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>pets</span>
                    Apadrinar un animal
                  </Link>
                </div>
)
            )}

            {activeTab === 'donaciones' && !isAdmin && (
              <div className={styles.tabContent}>
                <h3 className={styles.sectionTitle}>Mis Donaciones</h3>
                {loadingDonaciones ? (
                  <div className={styles.loading}>Cargando...</div>
                ) : misDonaciones.length === 0 ? (
                  <div className={styles.empty}>
                    <span className="material-symbols-outlined">volunteer_activism</span>
                    <p>No has realizado ninguna donación</p>
                  </div>
                ) : (
                  <div className={styles.donacionesList}>
                    {misDonaciones.map((donacion) => (
                      <div key={donacion.id} className={styles.solicitudItem}>
                        <div className={styles.solicitudInfo}>
                          <div className={styles.animalThumb}>
                            <span className="material-symbols-outlined">volunteer_activism</span>
                          </div>
                          <div>
                            <h4>{donacion.nombre || 'Anónimo'}</h4>
                            <p className={styles.solicitudFecha}>
                              {formatDateShort(donacion.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className={styles.solicitudActions}>
                          <span className={`${styles.monto} ${styles.montoDonacion}`}>{donacion.monto}€</span>
                          {donacion.estado === 'completada' && (
                            <span className={`${styles.badge} ${styles.completada}`}>Completada</span>
                          )}
                          {donacion.estado === 'pending' && (
                            <span className={`${styles.badge} ${styles.pending}`}>Pendiente</span>
                          )}
                          {donacion.estado === 'cancelada' && (
                            <span className={`${styles.badge} ${styles.rejected}`}>Cancelada</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {detalleSolicitud && (
              <div className={styles.modalOverlay} onClick={() => setDetalleSolicitud(null)}>
                <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                  <div className={styles.modalHeader}>
                    <h3>Detalles de la Solicitud</h3>
                    <button onClick={() => setDetalleSolicitud(null)} className={styles.closeBtn}>✕</button>
                  </div>
                  <div className={styles.modalBody}>
                    <div className={styles.detalleAnimal}>
                      <h4>Información del Animal</h4>
                      <div className={styles.animalPreviewModal}>
                        <div className={styles.animalImageModal}>
                          {detalleSolicitud.animal_imagen ? (
                            <img src={detalleSolicitud.animal_imagen} alt={detalleSolicitud.animal_nombre} />
                          ) : <span className="material-symbols-outlined">pets</span>}
                        </div>
                        <div className={styles.animalInfoModal}>
                          <h3>{detalleSolicitud.animal_nombre || 'No disponible'}</h3>
                          <p>{detalleSolicitud.animal_edad || '?'} • {detalleSolicitud.animal_tamano || '?'}</p>
                          {detalleSolicitud.animal_especie && <p className={styles.especieTag}>{detalleSolicitud.animal_especie}</p>}
                        </div>
                      </div>
                    </div>
                    <div className={styles.detalleSolicitud}>
                      <h4>Información de la Solicitud</h4>
                      <div className={styles.detalleGrid}>
                        <div className={styles.detalleItem}>
                          <span>Estado:</span> 
                          <span className={`${styles.estadoBadge} ${styles[detalleSolicitud.estado]}`}>
                            {detalleSolicitud.estado === 'pending' ? 'Pendiente' : detalleSolicitud.estado === 'approved' ? 'Aprobada' : 'Rechazada'}
                          </span>
                        </div>
                        <div className={styles.detalleItem}>
                          <span>Fecha:</span> {formatDateShort(detalleSolicitud.created_at)}
                        </div>
                        {detalleSolicitud.motivo_rechazo && (
                          <div className={styles.detalleItem}>
                            <span>Motivo del rechazo:</span> {detalleSolicitud.motivo_rechazo}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'animales' && isAdmin && (
              <div className={styles.gestionAnimales}>
                <div className={styles.gestionHeader}>
                  <h3 className={styles.sectionTitle}>Gestión de Animales</h3>
                  <button onClick={() => { setEditingAnimal(null); setShowAnimalModal(true); }} className="btn btn-primary">
                    <span className="material-symbols-outlined">add</span> Nuevo Animal
                  </button>
                </div>
                {loadingAnimales ? (
                  <div className={styles.loading}>Cargando...</div>
                ) : animales.length === 0 ? (
                  <div className={styles.empty}>No hay animales</div>
                ) : (
                  <div className={styles.animalesGrid}>
                    {animales.map(animal => (
                      <div key={animal.id} className={styles.animalCard}>
                        <div className={styles.animalCardImage}>
                          {animal.imagen_url ? <img src={animal.imagen_url} alt={animal.nombre} /> : '🐾'}
                          {animal.urgente && <span className={styles.urgenteTag}>URGENTE</span>}
                        </div>
                        <div className={styles.animalCardBody}>
                          <h4>{animal.nombre}</h4>
                          <p>{animal.especie} • {animal.edad} • {animal.tamano}</p>
                          <span className={`${styles.estadoBadge} ${styles[animal.estado]}`}>
                            {animal.estado}
                          </span>
                        </div>
                        <div className={styles.animalCardActions}>
                          <button onClick={() => handleEditarAnimal(animal)} className={styles.btnEdit}>
                            <span className="material-symbols-outlined">edit</span>
                          </button>
                          <button onClick={() => handleEliminarAnimal(animal.id)} className={styles.btnDelete}>
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'admin-solicitudes' && isAdmin && (
              <div className={styles.solicitudesSection}>
                <h3 className={styles.sectionTitle}>Todas las Solicitudes</h3>
                {loadingSolicitudesAdmin ? (
                  <div className={styles.loading}>Cargando...</div>
                ) : solicitudesAdmin.length === 0 ? (
                  <div className={styles.empty}>No hay solicitudes</div>
                ) : (
                  <div className={styles.solicitudesList}>
                    {solicitudesAdmin.map(sol => (
                      <div key={sol.id} className={styles.solicitudItem}>
                        <div className={styles.solicitudInfo}>
                          <div className={styles.animalThumb}>
                            {sol.animal_imagen ? <img src={sol.animal_imagen} alt={sol.animal_nombre} /> : '🐾'}
                          </div>
                          <div>
                            <h4>{sol.animal_nombre || 'Animal'}</h4>
                            <p className={styles.solicitudFecha}>
                              {sol.usuario_nombre} • {formatDateShort(sol.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className={styles.solicitudActions}>
                          {getEstadoBadge(sol.estado)}
                          {sol.estado === 'pending' && (
                            <>
                              <button onClick={() => handleAprobar(sol.id)} className={styles.btnApprove}>Aprobar</button>
                              <button onClick={() => handleRechazar(sol.id)} className={styles.btnReject}>Rechazar</button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button onClick={handleLogout} className={styles.logoutButton}>
              <span className="material-symbols-outlined">logout</span>Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {showAnimalModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>{editingAnimal ? 'Editar Animal' : 'Nuevo Animal'}</h3>
              <button onClick={() => { setShowAnimalModal(false); setEditingAnimal(null); }} className={styles.closeBtn}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCrearAnimal} className={styles.modalForm}>
              <div className={styles.formRow}>
                <div className={styles.field}>
                  <label>Nombre *</label>
                  <input type="text" value={animalForm.nombre} onChange={(e) => setAnimalForm({...animalForm, nombre: e.target.value})} required />
                </div>
                <div className={styles.field}>
                  <label>Especie *</label>
                  <select value={animalForm.especie} onChange={(e) => setAnimalForm({...animalForm, especie: e.target.value})}>
                    <option value="perro">Perro</option>
                    <option value="gato">Gato</option>
                  </select>
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.field}>
                  <label>Edad *</label>
                  <input type="text" value={animalForm.edad} onChange={(e) => setAnimalForm({...animalForm, edad: e.target.value})} placeholder="Ej: 2 años" required />
                </div>
                <div className={styles.field}>
                  <label>Tamaño *</label>
                  <select value={animalForm.tamano} onChange={(e) => setAnimalForm({...animalForm, tamano: e.target.value})}>
                    <option value="pequeño">Pequeño</option>
                    <option value="mediano">Mediano</option>
                    <option value="grande">Grande</option>
                  </select>
                </div>
              </div>
              <div className={styles.field}>
                <label>Carácter</label>
                <input type="text" value={animalForm.caracter} onChange={(e) => setAnimalForm({...animalForm, caracter: e.target.value})} placeholder="Juguetón, cariñoso..." />
              </div>
              <div className={styles.field}>
                <label>Salud</label>
                <input type="text" value={animalForm.salud} onChange={(e) => setAnimalForm({...animalForm, salud: e.target.value})} placeholder="Vacunado, desparasitado..." />
              </div>
              <div className={styles.field}>
                <label>URL Imagen</label>
                <input type="url" value={animalForm.imagen_url} onChange={(e) => setAnimalForm({...animalForm, imagen_url: e.target.value})} placeholder="https://..." />
              </div>
              <div className={styles.formRow}>
                <div className={styles.field}>
                  <label>Peso (kg)</label>
                  <input type="number" step="0.1" value={animalForm.peso} onChange={(e) => setAnimalForm({...animalForm, peso: e.target.value})} />
                </div>
                <div className={styles.field}>
                  <label className={styles.checkboxLabel}>
                    <input type="checkbox" checked={animalForm.urgente} onChange={(e) => setAnimalForm({...animalForm, urgente: e.target.checked})} />
                    Animal Urgente
                  </label>
                </div>
              </div>
              <div className={styles.modalActions}>
                <button type="button" onClick={() => { setShowAnimalModal(false); setEditingAnimal(null); }} className="btn btn-secondary">Cancelar</button>
                <button type="submit" className="btn btn-primary">{editingAnimal ? 'Actualizar' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalAcogida.show && (
        <div className={styles.modalOverlay} onClick={() => setModalAcogida({ show: false })}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#1976D2' }}>home</span>
            <h3>Ya tienes una solicitud de acogida</h3>
            <p>Tienes una solicitud en curso. ¿Quieres enviar otra?</p>
            <div className={styles.modalButtons}>
              <button onClick={() => setModalAcogida({ show: false })} className={styles.btnCancel}>
                Cancelar
              </button>
              <button onClick={() => { setModalAcogida({ show: false }); navigate('/acogida'); }} className={styles.btnConfirm}>
                Sí, enviar otra
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Perfil;