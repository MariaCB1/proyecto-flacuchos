import { useState, useEffect } from 'react';
import { voluntarioApi } from '../api/api';
import PageHeader from '../components/PageHeader';
import styles from './AdminVoluntarios.module.css';

function AdminVoluntarios() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [procesando, setProcesando] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todos');

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  const fetchSolicitudes = async () => {
    try {
      setLoading(true);
      const data = await voluntarioApi.getSolicitudes();
      setSolicitudes(data);
      setError(null);
    } catch {
      setError('Error al cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarEstado = async (solicitudId, nuevoEstado) => {
    try {
      setProcesando(solicitudId);
      await voluntarioApi.cambiarEstado(solicitudId, nuevoEstado);
      await fetchSolicitudes();
      alert('Estado actualizado correctamente');
    } catch (err) {
      alert(err.message || 'Error al actualizar el estado');
    } finally {
      setProcesando(null);
    }
  };

  const getEstadoBadge = (estado) => {
    const estados = {
      pending: { label: 'Pendiente', class: styles.pending },
      contactado: { label: 'Contactado', class: styles.contactado },
      aprobado: { label: 'Aprobado', class: styles.aprobado },
      rechazado: { label: 'Rechazado', class: styles.rechazado }
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
    contactado: solicitudes.filter(s => s.estado === 'contactado').length,
    aprobado: solicitudes.filter(s => s.estado === 'aprobado').length,
    rechazado: solicitudes.filter(s => s.estado === 'rechazado').length
  });

  const stats = getStats();

  const formatAreasInteres = (areas) => {
    if (!areas) return '-';
    return areas.split(', ').map((area) => {
      const labels = {
        limpieza: 'Limpieza',
        paseo: 'Pasear perros',
        eventos: 'Eventos',
        fotografia: 'Fotografía',
        rrss: 'Redes sociales',
        transporte: 'Transporte',
        stand: 'Stands/Ferías',
        social: 'Socialización'
      };
      return labels[area] || area;
    }).join(', ');
  };

  const formatDias = (dias) => {
    if (!dias) return '-';
    return dias.split(', ').map(dia => {
      const labels = {
        lunes: 'Lun',
        martes: 'Mar',
        miercoles: 'Mié',
        jueves: 'Jue',
        viernes: 'Vie',
        sabado: 'Sáb',
        domingo: 'Dom'
      };
      return labels[dia] || dia;
    }).join(', ');
  };

  const formatHorario = (horario) => {
    const labels = {
      manana: 'Mañanas',
      tarde: 'Tardes',
      todo: 'Todo el día'
    };
    return labels[horario] || '-';
  };

  if (loading) {
    return (
      <>
        <PageHeader title="Gestión de Voluntarios" subtitle="Administra las solicitudes de voluntariado" variant="admin" />
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
      <PageHeader title="Gestión de Voluntarios" subtitle="Administra las solicitudes de voluntariado" variant="admin" />
      
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
              <span className={`${styles.statValue} ${styles.statBlue}`}>{stats.contactado}</span>
              <span className={styles.statLabel}>Contactados</span>
            </div>
            <div className={styles.statItem}>
              <span className={`${styles.statValue} ${styles.statGreen}`}>{stats.aprobado}</span>
              <span className={styles.statLabel}>Aprobados</span>
            </div>
            <div className={styles.statItem}>
              <span className={`${styles.statValue} ${styles.statGray}`}>{stats.rechazado}</span>
              <span className={styles.statLabel}>Rechazados</span>
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
              className={`${styles.filterBtn} ${filtroEstado === 'contactado' ? styles.active : ''}`}
              onClick={() => setFiltroEstado('contactado')}
            >
              Contactados ({stats.contactado})
            </button>
            <button 
              className={`${styles.filterBtn} ${filtroEstado === 'aprobado' ? styles.active : ''}`}
              onClick={() => setFiltroEstado('aprobado')}
            >
              Aprobados ({stats.aprobado})
            </button>
            <button 
              className={`${styles.filterBtn} ${filtroEstado === 'rechazado' ? styles.active : ''}`}
              onClick={() => setFiltroEstado('rechazado')}
            >
              Rechazados ({stats.rechazado})
            </button>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          {solicitudesFiltradas.length === 0 ? (
            <div className={styles.empty}>
              <span className="material-symbols-outlined">front_hand</span>
              <p>No hay solicitudes de voluntariado</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {solicitudesFiltradas.map((solicitud) => (
                <div key={solicitud.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitle}>
                      <h3>{solicitud.nombre}</h3>
                      <span className={styles.date}>
                        {new Date(solicitud.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {getEstadoBadge(solicitud.estado)}
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.infoRow}>
                      <span className="material-symbols-outlined">mail</span>
                      <span>{solicitud.email}</span>
                    </div>
                    {solicitud.telefono && (
                      <div className={styles.infoRow}>
                        <span className="material-symbols-outlined">phone</span>
                        <span>{solicitud.telefono}</span>
                      </div>
                    )}
                    {solicitud.tiene_vehiculo && (
                      <div className={styles.infoRow}>
                        <span className="material-symbols-outlined">directions_car</span>
                        <span>Dispone de vehículo</span>
                      </div>
                    )}

                    <div className={styles.section}>
                      <h4><span className="material-symbols-outlined">favorite</span> Áreas de interés</h4>
                      <p>{formatAreasInteres(solicitud.areas_interes)}</p>
                    </div>

                    <div className={styles.section}>
                      <h4><span className="material-symbols-outlined">schedule</span> Disponibilidad</h4>
                      <p>Días: {formatDias(solicitud.disponibilidad_dias)} | {formatHorario(solicitud.disponibilidad_horario)}</p>
                    </div>

                    {solicitud.motivacion && (
                      <div className={styles.section}>
                        <h4><span className="material-symbols-outlined">psychology</span> Motivación</h4>
                        <p className={styles.textArea}>{solicitud.motivacion}</p>
                      </div>
                    )}

                    {solicitud.experiencia && (
                      <div className={styles.section}>
                        <h4><span className="material-symbols-outlined">pets</span> Experiencia</h4>
                        <p className={styles.textArea}>{solicitud.experiencia}</p>
                      </div>
                    )}

                    {solicitud.comentarios && (
                      <div className={styles.section}>
                        <h4><span className="material-symbols-outlined">notes</span> Comentarios</h4>
                        <p className={styles.textArea}>{solicitud.comentarios}</p>
                      </div>
                    )}
                  </div>

                  <div className={styles.cardActions}>
                    {solicitud.estado === 'pending' && (
                      <>
                        <button 
                          className={styles.btnContactar}
                          onClick={() => handleCambiarEstado(solicitud.id, 'contactado')}
                          disabled={procesando === solicitud.id}
                        >
                          <span className="material-symbols-outlined">mark_email_unread</span>
                          Contactar
                        </button>
                        <button 
                          className={styles.btnAprobar}
                          onClick={() => handleCambiarEstado(solicitud.id, 'aprobado')}
                          disabled={procesando === solicitud.id}
                        >
                          <span className="material-symbols-outlined">check_circle</span>
                          Aprobar
                        </button>
                        <button 
                          className={styles.btnRechazar}
                          onClick={() => handleCambiarEstado(solicitud.id, 'rechazado')}
                          disabled={procesando === solicitud.id}
                        >
                          <span className="material-symbols-outlined">cancel</span>
                          Rechazar
                        </button>
                      </>
                    )}
                    {solicitud.estado === 'contactado' && (
                      <>
                        <button 
                          className={styles.btnAprobar}
                          onClick={() => handleCambiarEstado(solicitud.id, 'aprobado')}
                          disabled={procesando === solicitud.id}
                        >
                          <span className="material-symbols-outlined">check_circle</span>
                          Aprobar
                        </button>
                        <button 
                          className={styles.btnRechazar}
                          onClick={() => handleCambiarEstado(solicitud.id, 'rechazado')}
                          disabled={procesando === solicitud.id}
                        >
                          <span className="material-symbols-outlined">cancel</span>
                          Rechazar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default AdminVoluntarios;
