import { useState, useEffect } from 'react';
import { contactoApi } from '../api/api';
import PageHeader from '../components/PageHeader';
import { formatDateShort } from '../utils/dateUtils';
import styles from './AdminAcogidas.module.css';

function AdminAcogidas() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [animales, setAnimales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [procesando, setProcesando] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [showRechazoModal, setShowRechazoModal] = useState(false);
  const [showAsignarModal, setShowAsignarModal] = useState(false);
  const [rechazoMotivo, setRechazoMotivo] = useState('');
  const [rechazoSolicitudId, setRechazoSolicitudId] = useState(null);
  const [asignarSolicitudId, setAsignarSolicitudId] = useState(null);
  const [animalSeleccionado, setAnimalSeleccionado] = useState('');

  useEffect(() => {
    fetchSolicitudes();
    fetchAnimales();
  }, []);

  const fetchSolicitudes = async () => {
    try {
      setLoading(true);
      const data = await contactoApi.getSolicitudesAcogida();
      setSolicitudes(data);
      setError(null);
    } catch {
      setError('Error al cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnimales = async () => {
    try {
      const data = await contactoApi.getAnimalesDisponibles();
      setAnimales(data);
    } catch (err) {
      console.error('Error fetching animales:', err);
    }
  };

  const handleAprobar = async (solicitudId) => {
    if (!confirm('¿Estás seguro de aprobar esta solicitud de acogida?')) {
      return;
    }
    
    try {
      setProcesando(solicitudId);
      await contactoApi.aprobarAcogida(solicitudId);
      await fetchSolicitudes();
      alert('Solicitud aprobada correctamente');
    } catch (err) {
      alert(err.message || 'Error al aprobar la solicitud');
    } finally {
      setProcesando(null);
    }
  };

  const handleRechazar = (solicitudId) => {
    setRechazoSolicitudId(solicitudId);
    setRechazoMotivo('');
    setShowRechazoModal(true);
  };

  const confirmarRechazo = async () => {
    if (!rechazoMotivo.trim()) {
      alert('Por favor, escribe un motivo para el rechazo');
      return;
    }
    
    try {
      setProcesando(rechazoSolicitudId);
      await contactoApi.rechazarAcogida(rechazoSolicitudId, rechazoMotivo);
      await fetchSolicitudes();
      setShowRechazoModal(false);
      setRechazoSolicitudId(null);
      setRechazoMotivo('');
      alert('Solicitud rechazada');
    } catch (err) {
      alert(err.message || 'Error al rechazar la solicitud');
    } finally {
      setProcesando(null);
    }
  };

  const handleAsignarAnimal = (solicitudId) => {
    setAsignarSolicitudId(solicitudId);
    setAnimalSeleccionado('');
    setShowAsignarModal(true);
  };

  const confirmarAsignacion = async () => {
    if (!animalSeleccionado) {
      alert('Por favor, selecciona un animal');
      return;
    }
    
    try {
      setProcesando(asignarSolicitudId);
      await contactoApi.asignarAnimalAcogida(asignarSolicitudId, animalSeleccionado);
      await fetchSolicitudes();
      setShowAsignarModal(false);
      setAsignarSolicitudId(null);
      setAnimalSeleccionado('');
      alert('Animal asignado correctamente');
    } catch (err) {
      alert(err.message || 'Error al asignar el animal');
    } finally {
      setProcesando(null);
    }
  };

  const getEstadoBadge = (estado) => {
    const estados = {
      pending: { label: 'Pendiente', class: styles.pending },
      approved: { label: 'Aprobada', class: styles.approved },
      rejected: { label: 'Rechazada', class: styles.rejected },
      asignado_pendiente: { label: 'Asignado (pendiente)', class: styles.asignado },
      aceptado: { label: 'Aceptada', class: styles.aceptado }
    };
    const estadoObj = estados[estado] || estados.pending;
    return <span className={`${styles.badge} ${estadoObj.class}`}>{estadoObj.label}</span>;
  };

  const solicitudesFiltradas = filtroEstado === 'todos' 
    ? solicitudes 
    : solicitudes.filter(s => s.estado === filtroEstado);

  const getStats = () => ({
    total: solicitudes.length,
    pending: solicitudes.filter(s => s.estado === 'pending').length,
    approved: solicitudes.filter(s => s.estado === 'approved').length,
    asignado: solicitudes.filter(s => s.estado === 'asignado_pendiente').length,
    aceptado: solicitudes.filter(s => s.estado === 'aceptado').length,
    rejected: solicitudes.filter(s => s.estado === 'rejected').length
  });

  const stats = getStats();

  if (loading) {
    return (
      <>
        <PageHeader title="Gestión de Acogidas" subtitle="Administra las solicitudes de casa de acogida" variant="admin" />
        <section className={styles.container}>
          <div className="container">
            <div className={styles.loading}>Cargando...</div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Gestión de Acogidas" subtitle="Administra las solicitudes de casa de acogida" variant="admin" />
      
      <section className={styles.container}>
        <div className="container">
          <div className={styles.statsBar}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{stats.total}</span>
              <span className={styles.statLabel}>Total</span>
            </div>
            <div className={styles.statItem}>
              <span className={`${styles.statValue} ${styles.statPurple}`}>{stats.pending}</span>
              <span className={styles.statLabel}>Pendientes</span>
            </div>
            <div className={styles.statItem}>
              <span className={`${styles.statValue} ${styles.statGreen}`}>{stats.approved}</span>
              <span className={styles.statLabel}>Aprobadas</span>
            </div>
            <div className={styles.statItem}>
              <span className={`${styles.statValue} ${styles.statOrange}`}>{stats.asignado}</span>
              <span className={styles.statLabel}>Asignadas</span>
            </div>
            <div className={styles.statItem}>
              <span className={`${styles.statValue} ${styles.statBlue}`}>{stats.aceptado}</span>
              <span className={styles.statLabel}>Confirmadas</span>
            </div>
            <div className={styles.statItem}>
              <span className={`${styles.statValue} ${styles.statGray}`}>{stats.rejected}</span>
              <span className={styles.statLabel}>Rechazadas</span>
            </div>
          </div>

          <div className={styles.filters}>
            <button 
              className={`${styles.filterBtn} ${filtroEstado === 'todos' ? styles.active : ''}`}
              onClick={() => setFiltroEstado('todos')}
            >
              Todas ({stats.total})
            </button>
            <button 
              className={`${styles.filterBtn} ${filtroEstado === 'pending' ? styles.active : ''}`}
              onClick={() => setFiltroEstado('pending')}
            >
              Pendientes ({stats.pending})
            </button>
            <button 
              className={`${styles.filterBtn} ${filtroEstado === 'approved' ? styles.active : ''}`}
              onClick={() => setFiltroEstado('approved')}
            >
              Aprobadas ({stats.approved})
            </button>
            <button 
              className={`${styles.filterBtn} ${filtroEstado === 'asignado_pendiente' ? styles.active : ''}`}
              onClick={() => setFiltroEstado('asignado_pendiente')}
            >
              Asignadas ({stats.asignado})
            </button>
            <button 
              className={`${styles.filterBtn} ${filtroEstado === 'aceptado' ? styles.active : ''}`}
              onClick={() => setFiltroEstado('aceptado')}
            >
              Confirmadas ({stats.aceptado})
            </button>
            <button 
              className={`${styles.filterBtn} ${filtroEstado === 'rejected' ? styles.active : ''}`}
              onClick={() => setFiltroEstado('rejected')}
            >
              Rechazadas ({stats.rejected})
            </button>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          {solicitudesFiltradas.length === 0 ? (
            <div className={styles.empty}>
              <span className="material-symbols-outlined">home</span>
              <p>No hay solicitudes de acogida</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {solicitudesFiltradas.map((solicitud) => (
                <div key={solicitud.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitle}>
                      <h3>{solicitud.nombre_completo}</h3>
                      <span className={styles.date}>
                        {formatDateShort(solicitud.created_at)}
                      </span>
                    </div>
                    {getEstadoBadge(solicitud.estado)}
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.infoRow}>
                      <span className="material-symbols-outlined">phone</span>
                      <span>{solicitud.telefono}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className="material-symbols-outlined">mail</span>
                      <span>{solicitud.email}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className="material-symbols-outlined">home</span>
                      <span>{solicitud.tipo_vivienda} ({solicitud.vivienda_propia})</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className="material-symbols-outlined">schedule</span>
                      <span>Tiempo: {solicitud.tiempo_acogida}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className="material-symbols-outlined">pets</span>
                      <span>Tipo: {solicitud.tipo_animal}</span>
                    </div>

                    {solicitud.motivo_rechazo && (
                      <div className={styles.motivoRechazo}>
                        <strong>Motivo del rechazo:</strong>
                        <p>{solicitud.motivo_rechazo}</p>
                      </div>
                    )}

                    {solicitud.animal_asignado_id && (
                      <div className={styles.animalAsignado}>
                        <strong>Animal asignado:</strong>
                        <div className={styles.animalInfo}>
                          {solicitud.animal_imagen && (
                            <img src={solicitud.animal_imagen} alt={solicitud.animal_nombre} />
                          )}
                          <div>
                            <span className={styles.animalName}>{solicitud.animal_nombre}</span>
                            <span className={styles.animalDetails}>
                              {solicitud.animal_especie} | {solicitud.animal_edad}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={styles.cardActions}>
                    {solicitud.estado === 'pending' && (
                      <>
                        <button 
                          className={styles.btnAprobar}
                          onClick={() => handleAprobar(solicitud.id)}
                          disabled={procesando === solicitud.id}
                        >
                          <span className="material-symbols-outlined">check_circle</span>
                          Aprobar
                        </button>
                        <button 
                          className={styles.btnRechazar}
                          onClick={() => handleRechazar(solicitud.id)}
                          disabled={procesando === solicitud.id}
                        >
                          <span className="material-symbols-outlined">cancel</span>
                          Rechazar
                        </button>
                        <button 
                          className={styles.btnAsignar}
                          onClick={() => handleAsignarAnimal(solicitud.id)}
                          disabled={procesando === solicitud.id}
                        >
                          <span className="material-symbols-outlined">pets</span>
                          Asignar animal
                        </button>
                      </>
                    )}
                    {solicitud.estado === 'approved' && (
                      <button 
                        className={styles.btnAsignar}
                        onClick={() => handleAsignarAnimal(solicitud.id)}
                        disabled={procesando === solicitud.id}
                      >
                        <span className="material-symbols-outlined">pets</span>
                        Asignar animal
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {showRechazoModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Rechazar Solicitud</h3>
            <p>Indica el motivo del rechazo:</p>
            <textarea 
              value={rechazoMotivo}
              onChange={(e) => setRechazoMotivo(e.target.value)}
              placeholder="Escribe el motivo del rechazo..."
              rows={4}
            />
            <div className={styles.modalActions}>
              <button 
                className={styles.btnCancelar}
                onClick={() => {
                  setShowRechazoModal(false);
                  setRechazoSolicitudId(null);
                  setRechazoMotivo('');
                }}
              >
                Cancelar
              </button>
              <button 
                className={styles.btnConfirmar}
                onClick={confirmarRechazo}
                disabled={procesando}
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}

      {showAsignarModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Asignar Animal</h3>
            <p>Selecciona el animal para esta acogida:</p>
            <select 
              value={animalSeleccionado}
              onChange={(e) => setAnimalSeleccionado(e.target.value)}
              className={styles.select}
            >
              <option value="">Selecciona un animal...</option>
              {animales.map((animal) => (
                <option key={animal.id} value={animal.id}>
                  {animal.nombre} - {animal.especie} ({animal.edad})
                </option>
              ))}
            </select>
            <div className={styles.modalActions}>
              <button 
                className={styles.btnCancelar}
                onClick={() => {
                  setShowAsignarModal(false);
                  setAsignarSolicitudId(null);
                  setAnimalSeleccionado('');
                }}
              >
                Cancelar
              </button>
              <button 
                className={styles.btnConfirmar}
                onClick={confirmarAsignacion}
                disabled={procesando || !animalSeleccionado}
              >
                Asignar Animal
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminAcogidas;