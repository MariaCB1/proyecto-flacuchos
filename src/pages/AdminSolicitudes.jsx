import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { animalApi } from '../api/api';
import PageHeader from '../components/PageHeader';
import styles from './AdminSolicitudes.module.css';

function AdminSolicitudes() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [procesando, setProcesando] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [detalleSolicitud, setDetalleSolicitud] = useState(null);
  const [showRechazoModal, setShowRechazoModal] = useState(false);
  const [rechazoMotivo, setRechazoMotivo] = useState('');
  const [rechazoSolicitudId, setRechazoSolicitudId] = useState(null);

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  const fetchSolicitudes = async () => {
    try {
      setLoading(true);
      const data = await animalApi.getAllSolicitudes();
      setSolicitudes(data);
      setError(null);
    } catch {
      setError('Error al cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const handleAprobar = async (solicitudId) => {
    if (!confirm('¿Estás seguro de aprobar esta solicitud? Se creará la adopción automáticamente.')) {
      return;
    }
    
    try {
      setProcesando(solicitudId);
      await animalApi.aprobarSolicitud(solicitudId);
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
      await animalApi.rechazarSolicitud(rechazoSolicitudId, rechazoMotivo);
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

  const handleVerDetalle = async (solicitudId) => {
    try {
      const data = await animalApi.getSolicitudDetalle(solicitudId);
      setDetalleSolicitud(data);
    } catch {
      alert('Error al cargar el detalle');
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

  const solicitudesFiltradas = filtroEstado === 'todos' 
    ? solicitudes 
    : solicitudes.filter(s => s.estado === filtroEstado);

  const pendientesCount = solicitudes.filter(s => s.estado === 'pending').length;

  if (loading) {
    return (
      <>
        <PageHeader title="Gestión de Solicitudes" subtitle="Panel de administración" />
        <section className={styles.adminSection}>
          <div className="container">
            <div className={styles.loading}>Cargando solicitudes...</div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Gestión de Solicitudes" subtitle="Panel de administración" />

      <section className={styles.adminSection}>
        <div className="container">
          <div className={styles.statsBar}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>{solicitudes.length}</span>
              <span className={styles.statLabel}>Total</span>
            </div>
            <div className={`${styles.stat} ${styles.statPending}`}>
              <span className={styles.statNumber}>{pendientesCount}</span>
              <span className={styles.statLabel}>Pendientes</span>
            </div>
            <div className={`${styles.stat} ${styles.statApproved}`}>
              <span className={styles.statNumber}>{solicitudes.filter(s => s.estado === 'approved').length}</span>
              <span className={styles.statLabel}>Aprobadas</span>
            </div>
            <div className={`${styles.stat} ${styles.statRejected}`}>
              <span className={styles.statNumber}>{solicitudes.filter(s => s.estado === 'rejected').length}</span>
              <span className={styles.statLabel}>Rechazadas</span>
            </div>
          </div>

          <div className={styles.filters}>
            <button 
              className={`${styles.filterBtn} ${filtroEstado === 'todos' ? styles.active : ''}`}
              onClick={() => setFiltroEstado('todos')}
            >
              Todas
            </button>
            <button 
              className={`${styles.filterBtn} ${filtroEstado === 'pending' ? styles.active : ''}`}
              onClick={() => setFiltroEstado('pending')}
            >
              Pendientes ({pendientesCount})
            </button>
            <button 
              className={`${styles.filterBtn} ${filtroEstado === 'approved' ? styles.active : ''}`}
              onClick={() => setFiltroEstado('approved')}
            >
              Aprobadas
            </button>
            <button 
              className={`${styles.filterBtn} ${filtroEstado === 'rejected' ? styles.active : ''}`}
              onClick={() => setFiltroEstado('rejected')}
            >
              Rechazadas
            </button>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          {solicitudesFiltradas.length === 0 ? (
            <div className={styles.empty}>
              <p>No hay solicitudes que mostrar</p>
            </div>
          ) : (
            <div className={styles.solicitudesList}>
              {solicitudesFiltradas.map(solicitud => (
                <div key={solicitud.id} className={styles.solicitudCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.animalInfo}>
                      <div className={styles.animalImage}>
                        {solicitud.animal_imagen ? (
                          <img src={solicitud.animal_imagen} alt={solicitud.animal_nombre} />
                        ) : '🐾'}
                      </div>
                      <div>
                        <h4>{solicitud.animal_nombre || 'Animal'}</h4>
                        <span className={styles.fecha}>
                          {new Date(solicitud.created_at).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    </div>
                    {getEstadoBadge(solicitud.estado)}
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.userInfo}>
                      <strong>Solicitante:</strong> {solicitud.usuario_nombre || 'Usuario'}
                      <span className={styles.email}>{solicitud.usuario_email}</span>
                    </div>
                    
                    {solicitud.nombre_completo && (
                      <div className={styles.detailRow}>
                        <strong>Nombre completo:</strong> {solicitud.nombre_completo}
                      </div>
                    )}
                    
                    {solicitud.telefono && (
                      <div className={styles.detailRow}>
                        <strong>Teléfono:</strong> {solicitud.telefono}
                      </div>
                    )}

                    {solicitud.tipo_vivienda && (
                      <div className={styles.detailRow}>
                        <strong>Vivienda:</strong> {solicitud.tipo_vivienda}
                        {solicitud.es_alquiler ? ' (alquiler)' : ''}
                      </div>
                    )}

                    {solicitud.personas_hogar && (
                      <div className={styles.detailRow}>
                        <strong>Personas en hogar:</strong> {solicitud.personas_hogar}
                      </div>
                    )}

                    {solicitud.paseos_dia && (
                      <div className={styles.detailRow}>
                        <strong>Paseos al día:</strong> {solicitud.paseos_dia}
                      </div>
                    )}

                    {solicitud.ha_tenido_animales && (
                      <div className={styles.detailRow}>
                        <strong>Experiencia previa:</strong> Sí
                      </div>
                    )}
                  </div>

                  {solicitud.estado === 'pending' && (
                    <div className={styles.cardActions}>
                      <button 
                        onClick={() => handleVerDetalle(solicitud.id)}
                        className={styles.btnDetail}
                      >
                        Ver Detalle
                      </button>
                      <button 
                        onClick={() => handleAprobar(solicitud.id)}
                        disabled={procesando === solicitud.id}
                        className={`btn btn-primary ${styles.btnApprove}`}
                      >
                        {procesando === solicitud.id ? '...' : 'Aceptar'}
                      </button>
                      <button 
                        onClick={() => handleRechazar(solicitud.id)}
                        disabled={procesando === solicitud.id}
                        className={`btn btn-danger ${styles.btnReject}`}
                      >
Rechazar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {detalleSolicitud && (
        <div className={styles.modalOverlay} onClick={() => setDetalleSolicitud(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Detalle de Solicitud</h3>
              <button onClick={() => setDetalleSolicitud(null)} className={styles.closeBtn}>✕</button>
            </div>
            <div className={styles.modalBody}>
              {(detalleSolicitud.animal_nombre || detalleSolicitud.animal_imagen) && (
                <div className={styles.detailSection}>
                  <h4>Detalle del Animal</h4>
                  <div className={styles.detailGrid}>
                    {detalleSolicitud.animal_imagen && (
                      <div className={styles.detailItem}>
                        <img 
                          src={detalleSolicitud.animal_imagen} 
                          alt={detalleSolicitud.animal_nombre} 
                          style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
                        />
                      </div>
                    )}
                    <div className={styles.detailItem}><span>Nombre:</span> {detalleSolicitud.animal_nombre || '-'}</div>
                    <div className={styles.detailItem}><span>Especie:</span> {detalleSolicitud.animal_especie || '-'}</div>
                    <div className={styles.detailItem}><span>Edad:</span> {detalleSolicitud.animal_edad || '-'}</div>
                    <div className={styles.detailItem}><span>Tamano:</span> {detalleSolicitud.animal_tamano || '-'}</div>
                    <div className={styles.detailItem}><span>Caracter:</span> {detalleSolicitud.animal_caracter || '-'}</div>
                    <div className={styles.detailItem}><span>Salud:</span> {detalleSolicitud.animal_salud || '-'}</div>
                  </div>
                </div>
              )}

              <div className={styles.detailSection}>
                <h4>Datos Personales</h4>
                <div className={styles.detailSubSection}>
                  <h5>Datos básicos</h5>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}><span>Nombre:</span> {detalleSolicitud.nombre_completo || '-'}</div>
                    <div className={styles.detailItem}><span>Teléfono:</span> {detalleSolicitud.telefono || '-'}</div>
                    <div className={styles.detailItem}><span>Fecha nacimiento:</span> {detalleSolicitud.fecha_nacimiento ? new Date(detalleSolicitud.fecha_nacimiento).toLocaleDateString('es-ES') : '-'}</div>
                    <div className={styles.detailItem}><span>Residencia:</span> {detalleSolicitud.residencia || '-'}</div>
                  </div>
                </div>
                <div className={styles.detailSubSection}>
                  <h5>Redes</h5>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}><span>Redes sociales:</span> {detalleSolicitud.redes_sociales || '-'}</div>
                  </div>
                </div>
                {detalleSolicitud.es_extranjero && (
                  <div className={styles.detailSubSection}>
                    <h5>Extranjero</h5>
                    <div className={styles.detailGrid}>
                      <div className={styles.detailItem}><span>Tiempo en España:</span> {detalleSolicitud.tiempo_en_espana || '-'}</div>
                      <div className={styles.detailItem}><span>Posibilidad regreso:</span> {detalleSolicitud.posibilidad_regreso || '-'}</div>
                      <div className={styles.detailItem}><span>Plan con animal:</span> {detalleSolicitud.plan_con_animal || '-'}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.detailSection}>
                <h4>Vivienda</h4>
                <div className={styles.detailSubSection}>
                  <h5>Características</h5>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}><span>Tipo:</span> {detalleSolicitud.tipo_vivienda || '-'}</div>
                    <div className={styles.detailItem}><span>M²:</span> {detalleSolicitud.metros_cuadrados || '-'}</div>
                    <div className={styles.detailItem}><span>Alquiler:</span> {detalleSolicitud.es_alquiler ? 'Sí' : 'No'}</div>
                    <div className={styles.detailItem}><span>Exterior:</span> {detalleSolicitud.tiene_exterior ? 'Sí' : 'No'}</div>
                  </div>
                </div>
                <div className={styles.detailSubSection}>
                  <h5>Sueño</h5>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}><span>Lugar dormir:</span> {detalleSolicitud.lugar_dormir || '-'}</div>
                    <div className={styles.detailItem}><span>Tipo cama:</span> {detalleSolicitud.tipo_cama || '-'}</div>
                  </div>
                </div>
                <div className={styles.detailSubSection}>
                  <h5>Actividades y permisos</h5>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}><span>Actividades:</span> {detalleSolicitud.actividades || '-'}</div>
                    <div className={styles.detailItem}><span>Permiso propietario:</span> {detalleSolicitud.permiso_propietario ? 'Sí' : 'No'}</div>
                    <div className={styles.detailItem}><span>Restricciones:</span> {detalleSolicitud.restricciones_vivienda || '-'}</div>
                  </div>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h4>Familia</h4>
                <div className={styles.detailSubSection}>
                  <h5>Composición</h5>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}><span>Nº personas en hogar:</span> {detalleSolicitud.personas_hogar || '-'}</div>
                    <div className={styles.detailItem}><span>Personas domicilio (parentesco, edad):</span> {detalleSolicitud.parentesco_personas || '-'}</div>
                    <div className={styles.detailItem}><span>Ocupación y horarios:</span> {detalleSolicitud.ocupaciones_horarios || '-'}</div>
                  </div>
                </div>
                <div className={styles.detailSubSection}>
                  <h5>Convivencia</h5>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}><span>Todos aceptan:</span> {detalleSolicitud.convivencia_aceptada || '-'}</div>
                    <div className={styles.detailItem}><span>Posibilidad de tener bebé:</span> {detalleSolicitud.posibilidad_bebe || '-'}</div>
                    {detalleSolicitud.posibilidad_bebe === 'si' && (
                      <div className={styles.detailItem}><span>Opinión sobre bebes:</span> {detalleSolicitud.opinion_convivencia_bebes || '-'}</div>
                    )}
                    <div className={styles.detailItem}><span>Si se separa, quién cuida:</span> {detalleSolicitud.en_separacion_quien_cuida || '-'}</div>
                  </div>
                </div>
                {detalleSolicitud.ha_tenido_animales && (
                  <div className={styles.detailSubSection}>
                    <h5>Historial animal</h5>
                    <div className={styles.detailGrid}>
                      <div className={styles.detailItem}><span>Edad animales anteriores:</span> {detalleSolicitud.edad_animales || '-'}</div>
                      <div className={styles.detailItem}><span>Motivo pérdida animal:</span> {detalleSolicitud.motivo_perdida || '-'}</div>
                    </div>
                  </div>
                )}
                {detalleSolicitud.ha_visitado_refugio && (
                  <div className={styles.detailSubSection}>
                    <h5>Visitas</h5>
                    <div className={styles.detailGrid}>
                      <div className={styles.detailItem}><span>Nombre refugio:</span> {detalleSolicitud.nombre_refugio || '-'}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.detailSection}>
                <h4>Cuidados</h4>
                <div className={styles.detailSubSection}>
                  <h5>Ejercicio</h5>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}><span>Paseos/día:</span> {detalleSolicitud.paseos_dia || '-'}</div>
                    <div className={styles.detailItem}><span>Duración paseo:</span> {detalleSolicitud.duracion_paseos || '-'}</div>
                    <div className={styles.detailItem}><span>Horas solo:</span> {detalleSolicitud.horas_solo || '-'}</div>
                  </div>
                </div>
                <div className={styles.detailSubSection}>
                  <h5>Alimentación y vacaciones</h5>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}><span>Alimentación:</span> {detalleSolicitud.tipo_alimentacion || '-'}</div>
                    <div className={styles.detailItem}><span>Vacaciones:</span> {detalleSolicitud.vacaciones_cuidado || '-'}</div>
                  </div>
                </div>
                <div className={styles.detailSubSection}>
                  <h5>Comportamiento</h5>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}><span>Problema de ladridos:</span> {detalleSolicitud.problema_ladridos || '-'}</div>
                    {detalleSolicitud.problema_ladridos === 'si' && (
                      <div className={styles.detailItem}><span>Solución ladridos:</span> {detalleSolicitud.solucion_ladridos || '-'}</div>
                    )}
                    <div className={styles.detailItem}><span>Si se muda, qué hace con el animal:</span> {detalleSolicitud.plan_mudanza || '-'}</div>
                  </div>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h4>Economía</h4>
                <div className={styles.detailSubSection}>
                  <h5>Veterinario</h5>
                  <div className={styles.detailGrid}>
<div className={styles.detailItem}><span>Opinión costes veterinarios:</span> {detalleSolicitud.coste_veterinario_opinion || '-'}</div>
                  <div className={styles.detailItem}><span>Cuándo ir al veterinario:</span> {detalleSolicitud.cuando_veterinario || '-'}</div>
                  <div className={styles.detailItem}><span>Acepta cambios en costes:</span> {detalleSolicitud.acepta_cambios_estimacion ? 'Sí' : 'No'}</div>
                  <div className={styles.detailItem}><span>Puede asumir gastos veterinarios:</span> {detalleSolicitud.puede_asumir_costes || '-'}</div>
                  {detalleSolicitud.puede_asumir_costes === 'no' && (
                    <div className={styles.detailItem}><span>Alternativa si no puede pagar:</span> {detalleSolicitud.alternativa_costes || '-'}</div>
                  )}
                  </div>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h4>Compromisos</h4>
                <div className={styles.detailSubSection}>
                  <h5>Seguimiento y visita</h5>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}><span>Acepta seguimiento post-adopción:</span> {detalleSolicitud.acepta_seguimiento ? 'Sí' : 'No'}</div>
                    <div className={styles.detailItem}><span>Acepta tasa de adopción:</span> {detalleSolicitud.acepta_tasa_adopcion ? 'Sí' : 'No'}</div>
                  </div>
                </div>
                <div className={styles.detailSubSection}>
                  <h5>Cómo nos conoció</h5>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}><span>Fuente:</span> {detalleSolicitud.como_conocio || '-'}</div>
                  </div>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h4>Otros</h4>
                {(detalleSolicitud.gestion_problemas_conducta || detalleSolicitud.motivos_devolucion) && (
                  <div className={styles.detailSubSection}>
                    <h5>Problemas conducta</h5>
                    <div className={styles.detailGrid}>
                      {detalleSolicitud.gestion_problemas_conducta && (
                        <div className={styles.detailItem}><span>Problemas conducta:</span> {detalleSolicitud.gestion_problemas_conducta}</div>
                      )}
                      {detalleSolicitud.motivos_devolucion && (
                        <div className={styles.detailItem}><span>Motivos devolución:</span> {detalleSolicitud.motivos_devolucion}</div>
                      )}
                    </div>
                  </div>
                )}
                <div className={styles.detailSubSection}>
                  <h5>Necesidades y esterilización</h5>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}><span>Necesidades perro:</span> {detalleSolicitud.necesidades_perro || '-'}</div>
                    <div className={styles.detailItem}><span>Necesidades:</span> {detalleSolicitud.necesidades || '-'}</div>
                    <div className={styles.detailItem}><span>Esterilización:</span> {detalleSolicitud.esterilizacion || '-'}</div>
                  </div>
                </div>
                <div className={styles.detailSubSection}>
                  <h5>Relación con otros animales</h5>
                  <div className={styles.detailGrid}>
<div className={styles.detailItem}><span>Relación con otros perros:</span> {detalleSolicitud.relacion_con_perros || '-'}</div>
                    {detalleSolicitud.relacion_con_perros === 'tengo' && (
                      <div className={styles.detailItem}><span>Motivo de socialización:</span> {detalleSolicitud.motivo_socializacion || '-'}</div>
                    )}
                    <div className={styles.detailItem}><span>Necesidades del adoptante:</span> {detalleSolicitud.necesidades || '-'}</div>
                    <div className={styles.detailItem}><span>Opinión sobre esterilización:</span> {detalleSolicitud.esterilizacion || '-'}</div>
                    <div className={styles.detailItem}><span>Adoptaría otro animal:</span> {detalleSolicitud.adoptaria_otro_animal || '-'}</div>
                  </div>
                </div>
              </div>

              {detalleSolicitud.estado === 'pending' && (
                <div className={styles.modalActions}>
                  <button 
                    onClick={async () => {
                      if (!confirm('¿Aprobar esta solicitud?')) return;
                      await handleAprobar(detalleSolicitud.id);
                      setDetalleSolicitud(null);
                    }}
                    className="btn btn-primary"
                  >
                    Aceptar Solicitud
                  </button>
                  <button 
                    onClick={() => {
                      handleRechazar(detalleSolicitud.id);
                      setDetalleSolicitud(null);
                    }}
                    className="btn btn-danger"
                  >
                    Rechazar Solicitud
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showRechazoModal && (
        <div className={styles.modalOverlay} onClick={() => setShowRechazoModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Motivo del Rechazo</h3>
              <button onClick={() => setShowRechazoModal(false)} className={styles.closeBtn}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <p>Indica el motivo por el cual rechazas esta solicitud:</p>
              <textarea
                className={styles.textarea}
                rows={4}
                value={rechazoMotivo}
                onChange={(e) => setRechazoMotivo(e.target.value)}
                placeholder="Escribe el motivo del rechazo..."
              />
            </div>
            <div className={styles.modalActions}>
              <button onClick={() => setShowRechazoModal(false)} className="btn btn-secondary">
                Cancelar
              </button>
              <button onClick={confirmarRechazo} className="btn btn-danger">
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminSolicitudes;