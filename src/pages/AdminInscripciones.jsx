import { useState, useEffect } from 'react';
import { eventosApi, inscripcionesApi } from '../api/api';
import PageHeader from '../components/PageHeader';
import { formatDate } from '../utils/dateUtils';
import styles from './AdminInscripciones.module.css';

function AdminInscripciones() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedEventos, setExpandedEventos] = useState({});
  const [inscripcionesData, setInscripcionesData] = useState({});
  const [inscripcionesCounts, setInscripcionesCounts] = useState({});
  const [filtro, setFiltro] = useState('todos');

  useEffect(() => {
    fetchEventos();
  }, []);

  const fetchEventos = async () => {
    try {
      setLoading(true);
      const data = await eventosApi.getEventos({ tipo: 'todos' });
      
      const counts = {};
      const arrays = {};
      for (const evento of data) {
        try {
          const inscs = await inscripcionesApi.getInscripcionesEvento(evento.id);
          counts[evento.id] = inscs.length;
          arrays[evento.id] = inscs;
        } catch {
          counts[evento.id] = 0;
          arrays[evento.id] = [];
        }
      }
      setInscripcionesCounts(counts);
      setInscripcionesData(arrays);
      
      const sorted = [...data].sort((a, b) => {
        const fechaA = new Date(a.fecha);
        const fechaB = new Date(b.fecha);
        const ahora = new Date();
        const aFuturo = fechaA >= ahora;
        const bFuturo = fechaB >= ahora;
        
        if (aFuturo && !bFuturo) return -1;
        if (!aFuturo && bFuturo) return 1;
        return fechaA - fechaB;
      });
      
      setEventos(sorted);
      setError(null);
    } catch (err) {
      console.error('Error fetching eventos:', err);
      setError('Error al cargar los eventos');
    } finally {
      setLoading(false);
    }
  };

  const toggleEvento = (eventoId) => {
    setExpandedEventos(prev => ({ ...prev, [eventoId]: !prev[eventoId] }));
  };

  // formatDate imported from utils/dateUtils

  const getCount = (eventoId) => {
    return typeof inscripcionesCounts[eventoId] === 'number' ? inscripcionesCounts[eventoId] : 0;
  };

  const isEventoPasado = (evento) => {
    const eventoDate = new Date(evento.fecha);
    if (evento.hora) {
      const horaInicio = evento.hora.split(' - ')[0];
      const [horas, minutos] = horaInicio.split(':').map(Number);
      eventoDate.setHours(horas, minutos, 0, 0);
    }
    return eventoDate < new Date();
  };

  const pasadasCount = eventos.filter(e => isEventoPasado(e)).length;
  const futurasCount = eventos.filter(e => !isEventoPasado(e)).length;
  const conInscripcionesCount = eventos.filter(e => getCount(e.id) > 0).length;
  const sinInscripcionesCount = eventos.filter(e => getCount(e.id) === 0).length;

  const eventosFiltrados = eventos.filter(evento => {
    const pasado = isEventoPasado(evento);
    const count = getCount(evento.id);
    
    if (filtro === 'pasadas') return pasado;
    if (filtro === 'futuras') return !pasado;
    if (filtro === 'con_inscripciones') return count > 0;
    if (filtro === 'sin_inscripciones') return count === 0;
    return true;
  });

  if (loading) {
    return (
      <>
        <PageHeader title="Gestión de Inscripciones" subtitle="Administra las inscripciones a los eventos" variant="events" />
        <section className={styles.adminSection}>
          <div className="container">
            <div className={styles.loading}>Cargando...</div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Gestión de Inscripciones" subtitle="Administra las inscripciones a los eventos" variant="events" />

      <section className={styles.adminSection}>
        <div className="container">
          <div className={styles.statsBar}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>{eventos.length}</span>
              <span className={styles.statLabel}>Total</span>
            </div>
            <div className={`${styles.stat} ${styles.statPurple}`}>
              <span className={styles.statNumber}>{futurasCount}</span>
              <span className={styles.statLabel}>Futuros</span>
            </div>
            <div className={`${styles.stat} ${styles.statGray}`}>
              <span className={styles.statNumber}>{pasadasCount}</span>
              <span className={styles.statLabel}>Pasados</span>
            </div>
            <div className={`${styles.stat} ${styles.statGreen}`}>
              <span className={styles.statNumber}>{conInscripcionesCount}</span>
              <span className={styles.statLabel}>Con Insc.</span>
            </div>
            <div className={`${styles.stat} ${styles.statRed}`}>
              <span className={styles.statNumber}>{sinInscripcionesCount}</span>
              <span className={styles.statLabel}>Sin Insc.</span>
            </div>
          </div>

          <div className={styles.filters}>
            <button 
              className={`${styles.filterBtn} ${filtro === 'todos' ? styles.active : ''}`}
              onClick={() => setFiltro('todos')}
            >
              Todos
            </button>
            <button 
              className={`${styles.filterBtn} ${filtro === 'futuras' ? styles.active : ''}`}
              onClick={() => setFiltro('futuras')}
            >
              Futuros ({futurasCount})
            </button>
            <button 
              className={`${styles.filterBtn} ${filtro === 'pasadas' ? styles.active : ''}`}
              onClick={() => setFiltro('pasadas')}
            >
              Pasados
            </button>
            <button 
              className={`${styles.filterBtn} ${filtro === 'con_inscripciones' ? styles.active : ''}`}
              onClick={() => setFiltro('con_inscripciones')}
            >
              Con Inscripciones
            </button>
            <button 
              className={`${styles.filterBtn} ${filtro === 'sin_inscripciones' ? styles.active : ''}`}
              onClick={() => setFiltro('sin_inscripciones')}
            >
              Sin Inscripciones
            </button>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          {eventosFiltrados.length === 0 ? (
            <div className={styles.empty}>
              <p>No hay eventos que mostrar</p>
            </div>
          ) : (
            <div className={styles.cardsContainer}>
              {eventosFiltrados.map(evento => {
                const count = getCount(evento.id);
                const eventoPasado = isEventoPasado(evento);
                
                return (
                  <div 
                    key={evento.id} 
                    className={`${styles.eventCard} ${eventoPasado ? styles.eventCardPasado : ''}`}
                  >
                    <div 
                      className={styles.cardHeader}
                      onClick={() => toggleEvento(evento.id)}
                    >
                      <div className={styles.eventImage}>
                        {evento.imagen_url ? (
                          <img src={evento.imagen_url} alt={evento.titulo} />
                        ) : (
                          <span className="material-symbols-outlined">event</span>
                        )}
                      </div>
                      
                      <div className={styles.eventDetails}>
                        <h3 className={styles.eventTitle}>{evento.titulo}</h3>
                        <div className={styles.eventMeta}>
                          <span className={styles.metaItem}>
                            <span className="material-symbols-outlined">calendar_today</span>
                            {formatDate(evento.fecha)}
                          </span>
                          {evento.hora && (
                            <span className={styles.metaItem}>
                              <span className="material-symbols-outlined">schedule</span>
                              {evento.hora}
                            </span>
                          )}
                          {evento.ubicacion && (
                            <span className={styles.metaItem}>
                              <span className="material-symbols-outlined">location_on</span>
                              {evento.ubicacion}
                            </span>
                          )}
                        </div>
                        
                        <div className={styles.inscripcionCount}>
                          <span className={`${styles.badge} ${count > 0 ? styles.badgePurple : styles.badgeGray}`}>
                            {count === 1 ? '1 inscripción' : `${count} inscripciones`}
                          </span>
                          {eventoPasado && (
                            <span className={`${styles.badge} ${styles.badgeExpired}`}>
                              Evento pasado
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className={styles.expandButton}>
                        <span className={`material-symbols-outlined ${expandedEventos[evento.id] ? styles.rotateIcon : ''}`}>
                          expand_more
                        </span>
                      </div>
                    </div>

                    {expandedEventos[evento.id] && (
                      <div className={styles.usuariosList}>
                        <div className={styles.usuariosHeader}>
                          <h4>Usuarios Inscritos ({count})</h4>
                        </div>
                        
                        {count === 0 ? (
                          <div className={styles.noUsuarios}>
                            No hay inscripciones para este evento
                          </div>
                        ) : (
                          <div className={styles.usuariosGrid}>
                            {inscripcionesData[evento.id]?.map(insc => (
                              <div key={insc.id} className={styles.usuarioCard}>
                                <div className={styles.usuarioInfo}>
                                  <div className={styles.usuarioAvatar}>
                                    {insc.usuario_nombre?.charAt(0).toUpperCase()}
                                  </div>
                                  <div className={styles.usuarioData}>
                                    <h5>{insc.usuario_nombre}</h5>
                                    <p className={styles.usuarioEmail}>{insc.usuario_email}</p>
                                    <p className={styles.inscripcionDate}>
                                      Inscrito el {formatDate(insc.created_at)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default AdminInscripciones;