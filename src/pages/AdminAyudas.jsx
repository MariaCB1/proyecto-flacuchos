import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { stripeApi, voluntarioApi, socioApi, apadrinamientoApi, contactoApi, resumenApi } from '../api/api';
import PageHeader from '../components/PageHeader';
import { formatDateTime as formatDate } from '../utils/dateUtils';
import styles from './AdminAyudas.module.css';

function formatearDiasSimple(dias) {
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

function AdminAyudas() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'acogidas';
  const [activeTab, setActiveTab] = useState(initialTab);

  const [donaciones, setDonaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalDonaciones, setTotalDonaciones] = useState(0);
  const [actualizando, setActualizando] = useState(false);

  const [voluntarios, setVoluntarios] = useState([]);
  const [loadingVoluntarios, setLoadingVoluntarios] = useState(false);
  const [expandedFields, setExpandedFields] = useState({});

  const [socios, setSocios] = useState([]);
  const [sociosStats, setSociosStats] = useState(null);
  const [loadingSocios, setLoadingSocios] = useState(false);
  const [sociosFilter, setSociosFilter] = useState('all');

  const [apadrinamientos, setApadrinamientos] = useState([]);
  const [apadrinamientosStats, setApadrinamientosStats] = useState(null);
  const [loadingApadrinamientos, setLoadingApadrinamientos] = useState(false);
  const [apadrinamientosFilter, setApadrinamientosFilter] = useState('all');
  const [rechazoModal, setRechazoModal] = useState({ open: false, id: null, motivo: '' });
  const [procesandoApadrinamiento, setProcesandoApadrinamiento] = useState(null);

  const [acogidas, setAcogidas] = useState([]);
  const [acogidasAnimales, setAcogidasAnimales] = useState([]);
  const [loadingAcogidas, setLoadingAcogidas] = useState(false);
  const [acogidasFilter, setAcogidasFilter] = useState('all');
  const [acogidaRechazoModal, setAcogidaRechazoModal] = useState({ open: false, id: null, motivo: '' });
  const [acogidaAsignarModal, setAcogidaAsignarModal] = useState({ open: false, solicitudId: null, animalId: '' });
  const [procesandoAcogida, setProcesandoAcogida] = useState(null);

  const [resumenData, setResumenData] = useState(null);
  const [loadingResumen, setLoadingResumen] = useState(false);
  const [resumenPeriodo, setResumenPeriodo] = useState('ano');
  const [resumenMesSeleccionado, setResumenMesSeleccionado] = useState(null);

  useEffect(() => {
    if (activeTab === 'donaciones') {
      fetchDonaciones();
    } else if (activeTab === 'voluntarios') {
      fetchVoluntarios();
    } else if (activeTab === 'socios') {
      fetchSocios();
    } else if (activeTab === 'apadrinar') {
      fetchApadrinamientos();
    } else if (activeTab === 'acogidas') {
      fetchAcogidas();
      fetchAcogidasAnimales();
    } else if (activeTab === 'resumen') {
      fetchResumen();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, resumenPeriodo]);

  const fetchResumen = async () => {
    setLoadingResumen(true);
    try {
      const data = await resumenApi.getResumenAyudas(resumenPeriodo);
      setResumenData(data);
    } catch (err) {
      console.error('Error fetching resumen:', err);
    } finally {
      setLoadingResumen(false);
    }
  };

  const fetchAcogidas = async () => {
    setLoadingAcogidas(true);
    try {
      const data = await contactoApi.getSolicitudesAcogida();
      setAcogidas(data);
    } catch (err) {
      console.error('Error fetching acogidas:', err);
    } finally {
      setLoadingAcogidas(false);
    }
  };

  const fetchAcogidasAnimales = async () => {
    try {
      const data = await contactoApi.getAnimalesDisponibles();
      setAcogidasAnimales(data);
    } catch (err) {
      console.error('Error fetching animales:', err);
    }
  };

  const fetchDonaciones = async (isRefresh = false) => {
    if (isRefresh) {
      setActualizando(true);
    } else {
      setLoading(true);
    }
    try {
      let data;
      if (isRefresh) {
        data = await stripeApi.actualizarDonaciones();
      } else {
        data = await stripeApi.getDonaciones();
      }
      setDonaciones(data.donaciones || []);
      setTotalDonaciones(parseFloat(data.total) || 0);
    } catch (err) {
      console.error('Error fetching donaciones:', err);
    } finally {
      setLoading(false);
      setActualizando(false);
    }
  };

  const fetchVoluntarios = async () => {
    setLoadingVoluntarios(true);
    try {
      const data = await voluntarioApi.getAll();
      setVoluntarios(data);
    } catch (err) {
      console.error('Error fetching voluntarios:', err);
    } finally {
      setLoadingVoluntarios(false);
    }
  };

  const fetchSocios = async () => {
    setLoadingSocios(true);
    try {
      const data = await socioApi.getSociosStats();
      setSocios(data.socios || []);
      setSociosStats(data.stats);
    } catch (err) {
      console.error('Error fetching socios:', err);
    } finally {
      setLoadingSocios(false);
    }
  };

  const fetchApadrinamientos = async () => {
    setLoadingApadrinamientos(true);
    try {
      const data = await apadrinamientoApi.getAllAdmin();
      setApadrinamientos(data.apadrinamientos || []);
      setApadrinamientosStats(data.stats);
    } catch (err) {
      console.error('Error fetching apadrinamientos:', err);
    } finally {
      setLoadingApadrinamientos(false);
    }
  };

  const handleAceptarApadrinamiento = async (id) => {
    if (!confirm('¿Aceptar este apadrinamiento?')) return;
    setProcesandoApadrinamiento(id);
    try {
      await apadrinamientoApi.aceptar(id);
      fetchApadrinamientos();
    } catch (err) {
      alert(err.message || 'Error al aceptar');
    } finally {
      setProcesandoApadrinamiento(null);
    }
  };

  const handleRechazarApadrinamiento = (id) => {
    setRechazoModal({ open: true, id: id, motivo: '' });
  };

  const apadrinamientosPorAnimal = apadrinamientos
    .filter(a => a.estado === 'active')
    .reduce((acc, apadr) => {
      if (!acc[apadr.animal_nombre]) {
        acc[apadr.animal_nombre] = { total: 0, count: 0, ids: [] };
      }
      acc[apadr.animal_nombre].total += parseFloat(apadr.importe || 0);
      acc[apadr.animal_nombre].count += 1;
      acc[apadr.animal_nombre].ids.push(apadr.id);
      return acc;
    }, {});

  const handleConfirmarRechazo = async () => {
    if (!rechazoModal.motivo.trim()) {
      alert('Por favor, escribe un motivo para el rechazo');
      return;
    }
    try {
      setProcesandoApadrinamiento(rechazoModal.id);
      await apadrinamientoApi.rechazar(rechazoModal.id, rechazoModal.motivo);
      setRechazoModal({ open: false, id: null, motivo: '' });
      fetchApadrinamientos();
    } catch (err) {
      alert(err.message || 'Error al rechazar');
    } finally {
      setProcesandoApadrinamiento(null);
    }
  };

  const handleAprobarAcogida = async (id) => {
    if (!confirm('¿Aprobar esta solicitud de acogida?')) return;
    try {
      setProcesandoAcogida(id);
      await contactoApi.aprobarAcogida(id);
      await fetchAcogidas();
      alert('Solicitud aprobada');
    } catch (err) {
      alert(err.message || 'Error al aprobar');
    } finally {
      setProcesandoAcogida(null);
    }
  };

  const handleRechazarAcogida = (id) => {
    setAcogidaRechazoModal({ open: true, id: id, motivo: '' });
  };

  const handleConfirmarRechazoAcogida = async () => {
    if (!acogidaRechazoModal.motivo.trim()) {
      alert('Por favor, escribe un motivo para el rechazo');
      return;
    }
    try {
      setProcesandoAcogida(acogidaRechazoModal.id);
      await contactoApi.rechazarAcogida(acogidaRechazoModal.id, acogidaRechazoModal.motivo);
      setAcogidaRechazoModal({ open: false, id: null, motivo: '' });
      fetchAcogidas();
    } catch (err) {
      alert(err.message || 'Error al rechazar');
    } finally {
      setProcesandoAcogida(null);
    }
  };

  const handleAsignarAnimalAcogida = (id) => {
    setAcogidaAsignarModal({ open: true, solicitudId: id, animalId: '' });
  };

  const handleConfirmarAsignacionAcogida = async () => {
    if (!acogidaAsignarModal.animalId) {
      alert('Por favor, selecciona un animal');
      return;
    }
    try {
      setProcesandoAcogida(acogidaAsignarModal.solicitudId);
      await contactoApi.asignarAnimalAcogida(acogidaAsignarModal.solicitudId, acogidaAsignarModal.animalId);
      setAcogidaAsignarModal({ open: false, solicitudId: null, animalId: '' });
      fetchAcogidas();
      alert('Animal asignado correctamente');
    } catch (err) {
      alert(err.message || 'Error al asignar');
    } finally {
      setProcesandoAcogida(null);
    }
  };

  const getAcogidaStats = () => ({
    total: acogidas.length,
    pending: acogidas.filter(a => a.estado === 'pending').length,
    approved: acogidas.filter(a => a.estado === 'approved').length,
    asignado: acogidas.filter(a => a.estado === 'asignado_pendiente').length,
    aceptado: acogidas.filter(a => a.estado === 'aceptado').length,
    rejected: acogidas.filter(a => a.estado === 'rejected').length
  });

  const getAcogidaBadge = (estado) => {
    const estados = {
      pending: { label: 'Pendiente', class: styles.pending },
      approved: { label: 'Aprobada', class: styles.completada },
      rejected: { label: 'Rechazada', class: styles.cancelada },
      asignado_pendiente: { label: 'Asignado (pendiente)', class: styles.apadrinarPendiente },
      aceptado: { label: 'Confirmada', class: styles.apadrinarActivo }
    };
    return estados[estado] || estados.pending;
  };

const handleToggleVoluntario = async (usuarioId, activo) => {
    if (!confirm(`¿${activo ? 'Desactivar' : 'Activar'} este voluntario?`)) return;
    try {
      await voluntarioApi.toggleActivo(usuarioId, !activo);
      fetchVoluntarios();
    } catch (err) {
      alert(err.message || 'Error al actualizar');
    }
  };

  const toggleField = (voluntarioId, fieldName) => {
    setExpandedFields(prev => ({
      ...prev,
      [`${voluntarioId}_${fieldName}`]: !prev[`${voluntarioId}_${fieldName}`]
    }));
  };

  // formatDate (formatDateTime) imported from utils/dateUtils

  const getEstadoBadge = (estado) => {
    const estados = {
      pending: { label: 'Pendiente', class: styles.pending },
      completada: { label: 'Completada', class: styles.completada },
      cancelada: { label: 'Cancelada', class: styles.cancelada }
    };
    const estadoObj = estados[estado] || estados.pending;
    return <span className={`${styles.badge} ${estadoObj.class}`}>{estadoObj.label}</span>;
  };

  const getSocioBadgeClass = (estado) => {
    if (estado === 'active') return styles.completada;
    if (estado === 'pending') return styles.pending;
    return styles.cancelada;
  };

  const getSocioLabel = (estado) => {
    if (estado === 'active') return 'Activo';
    if (estado === 'pending') return 'Pendiente';
    if (estado === 'payment_failed') return 'Fallido';
    return 'Cancelado';
  };

  return (
    <>
      <PageHeader 
        title="Gestión de Ayudas" 
        subtitle="Administra las ayudas económicas y voluntarios" 
        variant="help" 
      />

      <section className={styles.adminSection}>
        <div className="container">
          <div className={styles.tabs}>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'acogidas' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('acogidas')}
            >
              <span className="material-symbols-outlined">home</span>
              Acogidas
            </button>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'apadrinar' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('apadrinar')}
            >
              <span className="material-symbols-outlined">favorite</span>
              Apadrinar
            </button>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'voluntarios' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('voluntarios')}
            >
              <span className="material-symbols-outlined">groups</span>
              Voluntarios
            </button>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'socios' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('socios')}
            >
              <span className="material-symbols-outlined">card_membership</span>
              Socios
            </button>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'donaciones' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('donaciones')}
            >
              <span className="material-symbols-outlined">volunteer_activism</span>
              Donaciones
            </button>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'resumen' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('resumen')}
            >
              <span className="material-symbols-outlined">analytics</span>
              Resumen
            </button>
          </div>

          {activeTab === 'donaciones' && (
            <>
              <div className={styles.statsBar}>
                <div className={styles.stat}>
                  <span className={styles.statNumber}>{donaciones.length}</span>
                  <span className={styles.statLabel}>Total Registros</span>
                </div>
                <div className={`${styles.stat} ${styles.statGreen}`}>
                  <span className={styles.statNumber}>{donaciones.filter(d => d.estado === 'completada').length}</span>
                  <span className={styles.statLabel}>Completadas</span>
                </div>
                <div className={`${styles.stat} ${styles.statYellow}`}>
                  <span className={styles.statNumber}>{donaciones.filter(d => d.estado === 'pending').length}</span>
                  <span className={styles.statLabel}>Pendientes</span>
                </div>
                <div className={`${styles.stat} ${styles.statRed}`}>
                  <span className={styles.statNumber}>{donaciones.filter(d => d.estado === 'cancelada').length}</span>
                  <span className={styles.statLabel}>Canceladas</span>
                </div>
              </div>

              {loading ? (
                <div className={styles.loading}>Cargando...</div>
              ) : donaciones.length === 0 ? (
                <div className={styles.empty}>
                  <span className="material-symbols-outlined">volunteer_activism</span>
                  <p>No hay donaciones registradas</p>
                </div>
              ) : (
                <>
                  <div className={styles.tableHeader}>
                    <h3 className={styles.tableTitle}>Listado de Donaciones</h3>
                    <button 
                      onClick={() => fetchDonaciones(true)} 
                      className={styles.refreshBtn}
                      disabled={actualizando}
                    >
                      <span className="material-symbols-outlined">refresh</span>
                      {actualizando ? 'Actualizando...' : 'Actualizar'}
                    </button>
                  </div>

                  <div className={styles.tableContainer}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Nombre</th>
                          <th>Email</th>
                          <th>Importe</th>
                          <th>Estado</th>
                          <th>Fecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        {donaciones.map((donacion) => (
                          <tr key={donacion.id}>
                            <td>{donacion.nombre || 'Anónimo'}</td>
                            <td>{donacion.email || '-'}</td>
                            <td className={styles.monto}>{donacion.monto}€</td>
                            <td>{getEstadoBadge(donacion.estado)}</td>
                            <td>{formatDate(donacion.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className={styles.totalSection}>
                    <div className={styles.totalBox}>
                      <span className={styles.totalLabel}>Total de beneficios obtenidos por donaciones:</span>
                      <span className={styles.totalAmount}>{totalDonaciones.toFixed(2)}€</span>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {activeTab === 'voluntarios' && (
            <>
              <div className={styles.statsBar}>
                <div className={styles.stat}>
                  <span className={styles.statNumber}>{voluntarios.length}</span>
                  <span className={styles.statLabel}>Total</span>
                </div>
                <div className={`${styles.stat} ${styles.statGreen}`}>
                  <span className={styles.statNumber}>{voluntarios.filter(v => v.voluntario_activo !== false).length}</span>
                  <span className={styles.statLabel}>Activos</span>
                </div>
                <div className={`${styles.stat} ${styles.statRed}`}>
                  <span className={styles.statNumber}>{voluntarios.filter(v => v.voluntario_activo === false).length}</span>
                  <span className={styles.statLabel}>Inactivos</span>
                </div>
              </div>

              {loadingVoluntarios ? (
                <div className={styles.loading}>Cargando...</div>
              ) : voluntarios.length === 0 ? (
                <div className={styles.empty}>
                  <span className="material-symbols-outlined">groups</span>
                  <p>No hay voluntarios registrados</p>
                </div>
              ) : (
                <>
                  <div className={styles.tableHeader}>
                    <h3 className={styles.tableTitle}>Listado de Voluntarios</h3>
                    <button 
                      onClick={fetchVoluntarios} 
                      className={styles.refreshBtn}
                    >
                      <span className="material-symbols-outlined">refresh</span>
                      Actualizar
                    </button>
                  </div>

                  <div className={styles.voluntariosGrid}>
                    {voluntarios.map((voluntario) => {
                      const esActivo = voluntario.voluntario_activo !== false;
                      return (
                        <div key={voluntario.id} className={styles.voluntarioCard}>
                          <div className={styles.voluntarioHeader}>
                            <div className={styles.voluntarioInfo}>
                              <h4 className={styles.voluntarioDetailText}>{voluntario.nombre}</h4>
                              <p className={styles.voluntarioDetailText}>{voluntario.email}</p>
                            </div>
                            <div className={styles.toggleContainer}>
                              <span className={esActivo ? styles.toggleLabelActive : styles.toggleLabelInactive}>
                                {esActivo ? 'Activo' : 'Inactivo'}
                              </span>
                              <label className={styles.switch}>
                                <input
                                  type="checkbox"
                                  checked={esActivo}
                                  onChange={() => handleToggleVoluntario(voluntario.usuario_id, esActivo)}
                                />
                                <span className={styles.slider}></span>
                              </label>
                            </div>
                          </div>
                          <div className={styles.voluntarioDetails}>
                            <div className={styles.voluntarioDetail}>
                              <span className="material-symbols-outlined">phone</span>
                              <span className={styles.voluntarioDetailText}>{voluntario.telefono}</span>
                            </div>
                            <div className={styles.voluntarioDetail}>
                              <span className="material-symbols-outlined">badge</span>
                              <span className={styles.voluntarioDetailText}>{voluntario.dni}</span>
                            </div>
                            <div className={styles.voluntarioDetail}>
                              <span className="material-symbols-outlined">event</span>
                              <span className={styles.voluntarioDetailText}>Desde {formatDate(voluntario.created_at)}</span>
                            </div>
                            {voluntario.disponibilidad_dias && (
                              <div className={styles.voluntarioDetail}>
                                <span className="material-symbols-outlined">calendar_today</span>
                                <span className={styles.voluntarioDetailText}>
                                  {(() => {
                                    const dias = Array.isArray(voluntario.disponibilidad_dias) 
                                      ? voluntario.disponibilidad_dias 
                                      : formatearDiasSimple(voluntario.disponibilidad_dias);
                                    const diasLabels = { lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles', jueves: 'Jueves', viernes: 'Viernes', sabado: 'Sábado', domingo: 'Domingo' };
                                    return dias.map(d => diasLabels[d] || d).join(', ');
                                  })()}
                                </span>
                              </div>
                            )}
                            {voluntario.disponibilidad_horario && (
                              <div className={styles.voluntarioDetail}>
                                <span className="material-symbols-outlined">schedule</span>
                                <span className={styles.voluntarioDetailText}>
                                  {voluntario.disponibilidad_horario === 'manana' ? 'Mañanas' : 
                                   voluntario.disponibilidad_horario === 'tarde' ? 'Tardes' : 
                                   voluntario.disponibilidad_horario === 'todo' ? 'Todo el día' : 
                                   voluntario.disponibilidad_horario}
                                </span>
                              </div>
                            )}
                            {voluntario.tiene_vehiculo && (
                              <div className={styles.voluntarioDetail}>
                                <span className="material-symbols-outlined">directions_car</span>
                                <span className={styles.voluntarioDetailText}>Con vehículo</span>
                              </div>
                            )}
                            {voluntario.motivacion && (
                              <div className={styles.voluntarioDetail}>
                                <span className="material-symbols-outlined">favorite</span>
                                <span className={`${styles.voluntarioText} ${expandedFields[`${voluntario.id}_motivacion`] ? '' : styles.textTruncated}`}>
                                  {voluntario.motivacion}
                                </span>
                                {voluntario.motivacion.length > 80 && (
                                  <button 
                                    type="button" 
                                    className={styles.expandBtn}
                                    onClick={() => toggleField(voluntario.id, 'motivacion')}
                                  >
                                    {expandedFields[`${voluntario.id}_motivacion`] ? 'Ver menos' : 'Ver más'}
                                  </button>
                                )}
                              </div>
                            )}
                            {voluntario.experiencia && (
                              <div className={styles.voluntarioDetail}>
                                <span className="material-symbols-outlined">pets</span>
                                <span className={`${styles.voluntarioText} ${expandedFields[`${voluntario.id}_experiencia`] ? '' : styles.textTruncated}`}>
                                  {voluntario.experiencia}
                                </span>
                                {voluntario.experiencia.length > 80 && (
                                  <button 
                                    type="button" 
                                    className={styles.expandBtn}
                                    onClick={() => toggleField(voluntario.id, 'experiencia')}
                                  >
                                    {expandedFields[`${voluntario.id}_experiencia`] ? 'Ver menos' : 'Ver más'}
                                  </button>
                                )}
                              </div>
                            )}
                            {voluntario.comentarios && (
                              <div className={styles.voluntarioDetail}>
                                <span className="material-symbols-outlined">comment</span>
                                <span className={`${styles.voluntarioText} ${expandedFields[`${voluntario.id}_comentarios`] ? '' : styles.textTruncated}`}>
                                  {voluntario.comentarios}
                                </span>
                                {voluntario.comentarios.length > 80 && (
                                  <button 
                                    type="button" 
                                    className={styles.expandBtn}
                                    onClick={() => toggleField(voluntario.id, 'comentarios')}
                                  >
                                    {expandedFields[`${voluntario.id}_comentarios`] ? 'Ver menos' : 'Ver más'}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          )}

          {activeTab === 'socios' && (
            <>
              <div className={styles.statsBar}>
                <div className={styles.stat}>
                  <span className={styles.statNumber}>{sociosStats?.total || 0}</span>
                  <span className={styles.statLabel}>Total</span>
                </div>
                <div className={`${styles.stat} ${styles.statGreen}`}>
                  <span className={styles.statNumber}>{sociosStats?.activos || 0}</span>
                  <span className={styles.statLabel}>Activos</span>
                </div>
                <div className={`${styles.stat} ${styles.statYellow}`}>
                  <span className={styles.statNumber}>{sociosStats?.pendientes || 0}</span>
                  <span className={styles.statLabel}>Pendientes</span>
                </div>
                <div className={`${styles.stat} ${styles.statRed}`}>
                  <span className={styles.statNumber}>{sociosStats?.cancelados || 0}</span>
                  <span className={styles.statLabel}>Cancelados</span>
                </div>
              </div>

              <div className={styles.filterBar}>
                <button
                  className={`${styles.filterBtn} ${sociosFilter === 'all' ? styles.activeFilter : ''}`}
                  onClick={() => setSociosFilter('all')}
                >
                  Todos ({socios.length})
                </button>
                <button
                  className={`${styles.filterBtn} ${sociosFilter === 'active' ? styles.activeFilter : ''}`}
                  onClick={() => setSociosFilter('active')}
                >
                  Activos ({sociosStats?.activos || 0})
                </button>
                <button
                  className={`${styles.filterBtn} ${sociosFilter === 'pending' ? styles.activeFilter : ''}`}
                  onClick={() => setSociosFilter('pending')}
                >
                  Pendientes ({sociosStats?.pendientes || 0})
                </button>
                <button
                  className={`${styles.filterBtn} ${sociosFilter === 'canceled' ? styles.activeFilter : ''}`}
                  onClick={() => setSociosFilter('canceled')}
                >
                  Cancelados ({sociosStats?.cancelados || 0})
                </button>
              </div>

              {loadingSocios ? (
                <div className={styles.loading}>Cargando...</div>
              ) : socios.length === 0 ? (
                <div className={styles.empty}>
                  <span className="material-symbols-outlined">card_membership</span>
                  <p>No hay socios registrados</p>
                </div>
              ) : (
                <>
                  <div className={styles.tableHeader}>
                    <h3 className={styles.tableTitle}>Listado de Socios</h3>
                    <button 
                      onClick={fetchSocios} 
                      className={styles.refreshBtn}
                    >
                      <span className="material-symbols-outlined">refresh</span>
                      Actualizar
                    </button>
                  </div>

                  <div className={styles.tableContainer}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Nombre</th>
                          <th>Email</th>
                          <th>Aportación</th>
                          <th>Estado</th>
                          <th>Fecha Alta</th>
                        </tr>
                      </thead>
                      <tbody>
                        {socios
                          .filter(s => sociosFilter === 'all' || s.estado === sociosFilter)
                          .map((socio) => (
                          <tr key={socio.id}>
                            <td>{socio.nombre_apellidos || socio.nombre_usuario || 'Sin nombre'}</td>
                            <td>{socio.email || socio.email_usuario || '-'}</td>
                            <td className={styles.monto}>{socio.aportacion}€/mes</td>
                            <td>
                              <span className={`${styles.badge} ${getSocioBadgeClass(socio.estado)}`}>
                                {getSocioLabel(socio.estado)}
                              </span>
                            </td>
                            <td>{socio.started_at ? formatDate(socio.started_at) : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className={styles.totalSection}>
                    <div className={styles.totalBox}>
                      <span className={styles.totalLabel}>Total de ingresos mensuales (activos):</span>
                      <span className={styles.totalAmount}>{sociosStats?.ingresosMensuales || 0}€</span>
                    </div>
                    <div className={styles.totalBox} style={{marginTop: '10px'}}>
                      <span className={styles.totalLabel}>Total histórico acumulado:</span>
                      <span className={styles.totalAmount}>{sociosStats?.ingresosHistoricos || 0}€</span>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {activeTab === 'apadrinar' && (
            <>
              <div className={styles.statsBar}>
                <div className={styles.stat}>
                  <span className={styles.statNumber}>{apadrinamientosStats?.total || 0}</span>
                  <span className={styles.statLabel}>Total</span>
                </div>
                <div className={`${styles.stat} ${styles.statGreen}`}>
                  <span className={styles.statNumber}>{apadrinamientosStats?.activos || 0}</span>
                  <span className={styles.statLabel}>Activos</span>
                </div>
                <div className={`${styles.stat} ${styles.statYellow}`}>
                  <span className={styles.statNumber}>{apadrinamientosStats?.pendientes || 0}</span>
                  <span className={styles.statLabel}>Pendientes</span>
                </div>
                <div className={`${styles.stat} ${styles.statRed}`}>
                  <span className={styles.statNumber}>{(apadrinamientosStats?.rechazados || 0) + (apadrinamientosStats?.cancelados || 0)}</span>
                  <span className={styles.statLabel}>Rechazados/Cancelados</span>
                </div>
              </div>

              <div className={styles.filterBar}>
                <button
                  className={`${styles.filterBtn} ${apadrinamientosFilter === 'all' ? styles.activeFilter : ''}`}
                  onClick={() => setApadrinamientosFilter('all')}
                >
                  Todos ({apadrinamientos.length})
                </button>
                <button
                  className={`${styles.filterBtn} ${apadrinamientosFilter === 'active' ? styles.activeFilter : ''}`}
                  onClick={() => setApadrinamientosFilter('active')}
                >
                  Activos ({apadrinamientosStats?.activos || 0})
                </button>
                <button
                  className={`${styles.filterBtn} ${apadrinamientosFilter === 'pending' ? styles.activeFilter : ''}`}
                  onClick={() => setApadrinamientosFilter('pending')}
                >
                  Pendientes ({apadrinamientosStats?.pendientes || 0})
                </button>
                <button
                  className={`${styles.filterBtn} ${apadrinamientosFilter === 'rejected' ? styles.activeFilter : ''}`}
                  onClick={() => setApadrinamientosFilter('rejected')}
                >
                  Rechazados ({apadrinamientosStats?.rechazados || 0})
                </button>
                <button
                  className={`${styles.filterBtn} ${apadrinamientosFilter === 'canceled' ? styles.activeFilter : ''}`}
                  onClick={() => setApadrinamientosFilter('canceled')}
                >
                  Cancelados ({apadrinamientosStats?.cancelados || 0})
                </button>
              </div>

              {loadingApadrinamientos ? (
                <div className={styles.loading}>Cargando...</div>
              ) : apadrinamientos.length === 0 ? (
                <div className={styles.empty}>
                  <span className="material-symbols-outlined">favorite</span>
                  <p>No hay apadrinamientos registrados</p>
                </div>
              ) : (
                <>
                  <div className={styles.tableHeader}>
                    <h3 className={styles.tableTitle}>Listado de Apadrinamientos</h3>
                    <button 
                      onClick={fetchApadrinamientos} 
                      className={styles.refreshBtn}
                    >
                      <span className="material-symbols-outlined">refresh</span>
                      Actualizar
                    </button>
                  </div>

                  <div className={styles.tableContainer}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Usuario</th>
                          <th>Animal</th>
                          <th>Importe</th>
                          <th>Estado</th>
                          <th>Fecha</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {apadrinamientos
                          .filter(a => apadrinamientosFilter === 'all' || a.estado === apadrinamientosFilter)
                          .map((apadr) => (
                          <tr key={apadr.id}>
                            <td>
                              <div>
                                <strong>{apadr.usuario_nombre}</strong>
                                <div style={{ fontSize: '12px', color: '#666' }}>{apadr.usuario_email}</div>
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {apadr.animal_imagen && (
                                  <img src={apadr.animal_imagen} alt={apadr.animal_nombre} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                                )}
                                <div>
                                  <span>{apadr.animal_nombre}</span>
                                  {apadrinamientosPorAnimal[apadr.animal_nombre] && apadrinamientosPorAnimal[apadr.animal_nombre].count > 1 && (
                                    <div style={{ fontSize: '11px', color: '#00897B', fontWeight: '500' }}>
                                      Total: {apadrinamientosPorAnimal[apadr.animal_nombre].total}€/mes
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className={styles.monto}>{apadr.importe}€/mes</td>
                            <td>
                              <span className={`${styles.badge} ${apadr.estado === 'active' ? styles.completada : apadr.estado === 'pending' ? styles.pending : styles.cancelada}`}>
                                {apadr.estado === 'active' ? 'Activo' : apadr.estado === 'pending' ? 'Pendiente' : apadr.estado === 'rejected' ? 'Rechazado' : 'Cancelado'}
                              </span>
                            </td>
                            <td>{formatDate(apadr.created_at)}</td>
                            <td>
                              {apadr.estado === 'pending' && (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button
                                    onClick={() => handleAceptarApadrinamiento(apadr.id)}
                                    className={styles.actionBtnAceptar}
                                    disabled={procesandoApadrinamiento === apadr.id}
                                  >
                                    {procesandoApadrinamiento === apadr.id ? 'Procesando...' : 'Aceptar'}
                                  </button>
                                  <button
                                    onClick={() => handleRechazarApadrinamiento(apadr.id)}
                                    className={styles.actionBtnRechazar}
                                    disabled={procesandoApadrinamiento !== null}
                                  >
                                    {procesandoApadrinamiento !== null ? 'Procesando...' : 'Rechazar'}
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className={styles.totalSection}>
                    <div className={styles.totalBox}>
                      <span className={styles.totalLabel}>Total de ingresos mensuales (activos):</span>
                      <span className={styles.totalAmount}>{apadrinamientosStats?.ingresosMensuales || 0}€</span>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {activeTab === 'acogidas' && (
            <>
              <div className={styles.statsBar}>
                <div className={styles.stat}>
                  <span className={styles.statNumber}>{getAcogidaStats().total}</span>
                  <span className={styles.statLabel}>Total</span>
                </div>
                <div className={`${styles.stat} ${styles.statYellow}`}>
                  <span className={styles.statNumber}>{getAcogidaStats().pending}</span>
                  <span className={styles.statLabel}>Pendientes</span>
                </div>
                <div className={`${styles.stat} ${styles.statGreen}`}>
                  <span className={styles.statNumber}>{getAcogidaStats().approved}</span>
                  <span className={styles.statLabel}>Aprobadas</span>
                </div>
                <div className={`${styles.stat} ${styles.statOrange}`}>
                  <span className={styles.statNumber}>{getAcogidaStats().asignado}</span>
                  <span className={styles.statLabel}>Asignadas</span>
                </div>
                <div className={`${styles.stat} ${styles.statBlue}`}>
                  <span className={styles.statNumber}>{getAcogidaStats().aceptado}</span>
                  <span className={styles.statLabel}>Confirmadas</span>
                </div>
                <div className={`${styles.stat} ${styles.statRed}`}>
                  <span className={styles.statNumber}>{getAcogidaStats().rejected}</span>
                  <span className={styles.statLabel}>Rechazadas</span>
                </div>
              </div>

              <div className={styles.filterBar}>
                <button
                  className={`${styles.filterBtn} ${acogidasFilter === 'all' ? styles.activeFilter : ''}`}
                  onClick={() => setAcogidasFilter('all')}
                >
                  Todas ({acogidas.length})
                </button>
                <button
                  className={`${styles.filterBtn} ${acogidasFilter === 'pending' ? styles.activeFilter : ''}`}
                  onClick={() => setAcogidasFilter('pending')}
                >
                  Pendientes ({getAcogidaStats().pending})
                </button>
                <button
                  className={`${styles.filterBtn} ${acogidasFilter === 'approved' ? styles.activeFilter : ''}`}
                  onClick={() => setAcogidasFilter('approved')}
                >
                  Aprobadas ({getAcogidaStats().approved})
                </button>
                <button
                  className={`${styles.filterBtn} ${acogidasFilter === 'asignado_pendiente' ? styles.activeFilter : ''}`}
                  onClick={() => setAcogidasFilter('asignado_pendiente')}
                >
                  Asignadas ({getAcogidaStats().asignado})
                </button>
                <button
                  className={`${styles.filterBtn} ${acogidasFilter === 'aceptado' ? styles.activeFilter : ''}`}
                  onClick={() => setAcogidasFilter('aceptado')}
                >
                  Confirmadas ({getAcogidaStats().aceptado})
                </button>
                <button
                  className={`${styles.filterBtn} ${acogidasFilter === 'rejected' ? styles.activeFilter : ''}`}
                  onClick={() => setAcogidasFilter('rejected')}
                >
                  Rechazadas ({getAcogidaStats().rejected})
                </button>
              </div>

              {loadingAcogidas ? (
                <div className={styles.loading}>Cargando...</div>
              ) : acogidas.length === 0 ? (
                <div className={styles.empty}>
                  <span className="material-symbols-outlined">home</span>
                  <p>No hay solicitudes de acogida</p>
                </div>
              ) : (
                <div className={styles.grid}>
                  {acogidas
                    .filter(a => acogidasFilter === 'all' || a.estado === acogidasFilter)
                    .map((solicitud) => (
                      <div key={solicitud.id} className={styles.card}>
                        <div className={styles.cardHeader}>
                          <div className={styles.cardTitle}>
                            <h3>{solicitud.nombre_completo}</h3>
                            <span className={styles.date}>
                              {formatDate(solicitud.created_at)}
                            </span>
                          </div>
                          <span className={`${styles.badge} ${getAcogidaBadge(solicitud.estado).class}`}>
                            {getAcogidaBadge(solicitud.estado).label}
                          </span>
                        </div>

                        <div className={styles.cardBody}>
                          <div className={styles.infoRow}>
                            <span className="material-symbols-outlined">phone</span>
                            <span className={styles.infoRowText}>{solicitud.telefono}</span>
                          </div>
                          <div className={styles.infoRow}>
                            <span className="material-symbols-outlined">mail</span>
                            <span className={styles.infoRowText}>{solicitud.email}</span>
                          </div>
                          <div className={styles.infoRow}>
                            <span className="material-symbols-outlined">home</span>
                            <span className={styles.infoRowText}>{solicitud.tipo_vivienda} ({solicitud.vivienda_propia})</span>
                          </div>
                          <div className={styles.infoRow}>
                            <span className="material-symbols-outlined">schedule</span>
                            <span className={styles.infoRowText}>Tiempo: {solicitud.tiempo_acogida}</span>
                          </div>
                          <div className={styles.infoRow}>
                            <span className="material-symbols-outlined">pets</span>
                            <span className={styles.infoRowText}>Tipo: {solicitud.tipo_animal}</span>
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
                                onClick={() => handleAprobarAcogida(solicitud.id)}
                                disabled={procesandoAcogida === solicitud.id}
                              >
                                <span className="material-symbols-outlined">check_circle</span>
                                Aprobar
                              </button>
                              <button 
                                className={styles.btnRechazar}
                                onClick={() => handleRechazarAcogida(solicitud.id)}
                                disabled={procesandoAcogida === solicitud.id}
                              >
                                <span className="material-symbols-outlined">cancel</span>
                                Rechazar
                              </button>
                              <button 
                                className={styles.btnAsignar}
                                onClick={() => handleAsignarAnimalAcogida(solicitud.id)}
                                disabled={procesandoAcogida === solicitud.id}
                              >
                                <span className="material-symbols-outlined">pets</span>
                                Asignar animal
                              </button>
                            </>
                          )}
                          {solicitud.estado === 'approved' && (
                            <button 
                              className={styles.btnAsignar}
                              onClick={() => handleAsignarAnimalAcogida(solicitud.id)}
                              disabled={procesandoAcogida === solicitud.id}
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
            </>
          )}
        </div>
      </section>

      {acogidaRechazoModal.open && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Rechazar Solicitud de Acogida</h3>
            <p>Indica el motivo del rechazo:</p>
            <textarea
              value={acogidaRechazoModal.motivo}
              onChange={(e) => setAcogidaRechazoModal({ ...acogidaRechazoModal, motivo: e.target.value })}
              placeholder="Escribe el motivo del rechazo..."
              rows={4}
              className={styles.textarea}
            />
            <div className={styles.modalButtons}>
              <button
                onClick={() => setAcogidaRechazoModal({ open: false, id: null, motivo: '' })}
                className={styles.btnCancel}
              >
                Cancelar
              </button>
              <button onClick={handleConfirmarRechazoAcogida} className={styles.btnConfirm} disabled={procesandoAcogida}>
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}

      {acogidaAsignarModal.open && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Asignar Animal</h3>
            <p>Selecciona el animal para esta acogida:</p>
            <select 
              value={acogidaAsignarModal.animalId}
              onChange={(e) => setAcogidaAsignarModal({ ...acogidaAsignarModal, animalId: e.target.value })}
              className={styles.select}
            >
              <option value="">Selecciona un animal...</option>
              {acogidasAnimales.map((animal) => (
                <option key={animal.id} value={animal.id}>
                  {animal.nombre} - {animal.especie} ({animal.edad})
                </option>
              ))}
            </select>
            <div className={styles.modalButtons}>
              <button
                onClick={() => setAcogidaAsignarModal({ open: false, solicitudId: null, animalId: '' })}
                className={styles.btnCancel}
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirmarAsignacionAcogida} 
                className={styles.btnConfirm}
                disabled={procesandoAcogida || !acogidaAsignarModal.animalId}
              >
                Asignar Animal
              </button>
            </div>
          </div>
        </div>
      )}

          {activeTab === 'resumen' && (
            <div className={styles.resumenContent}>
              <div className={styles.filterBar}>
                <button
                  className={`${styles.filterBtn} ${resumenPeriodo === 'mes' ? styles.activeFilter : ''}`}
                  onClick={() => setResumenPeriodo('mes')}
                >
                  Este mes
                </button>
                <button
                  className={`${styles.filterBtn} ${resumenPeriodo === 'tres_meses' ? styles.activeFilter : ''}`}
                  onClick={() => setResumenPeriodo('tres_meses')}
                >
                  3 meses
                </button>
                <button
                  className={`${styles.filterBtn} ${resumenPeriodo === 'seis_meses' ? styles.activeFilter : ''}`}
                  onClick={() => setResumenPeriodo('seis_meses')}
                >
                  6 meses
                </button>
                <button
                  className={`${styles.filterBtn} ${resumenPeriodo === 'ano' ? styles.activeFilter : ''}`}
                  onClick={() => setResumenPeriodo('ano')}
                >
                  Este año
                </button>
                <button
                  className={`${styles.filterBtn} ${resumenPeriodo === 'todo' ? styles.activeFilter : ''}`}
                  onClick={() => setResumenPeriodo('todo')}
                >
                  Todo
                </button>
              </div>

              {loadingResumen ? (
                <div className={styles.loading}>Cargando...</div>
              ) : resumenData ? (
                <>
                  <div className={styles.resumenHeader}>
                    <h2>Resumen de Ingresos</h2>
                    <span className={styles.resumenPeriodoLabel}>
                      Período: {resumenPeriodo === 'mes' ? 'Este mes' : resumenPeriodo === 'tres_meses' ? '3 meses' : resumenPeriodo === 'seis_meses' ? '6 meses' : resumenPeriodo === 'ano' ? 'Este año' : 'Todo'}
                    </span>
                  </div>

                  <div className={styles.statsBar}>
                    <div className={styles.stat}>
                      <span className={styles.statNumber}>{resumenData.ingresosMesActual.total.toFixed(2)}€</span>
                      <span className={styles.statLabel}>Este mes</span>
                    </div>
                    <div className={`${styles.stat} ${styles.statPurple}`}>
                      <span className={styles.statNumber}>{resumenData.ingresosPeriodo.total.toFixed(2)}€</span>
                      <span className={styles.statLabel}>Período</span>
                    </div>
                    <div className={`${styles.stat} ${styles.statGreen}`}>
                      <span className={styles.statNumber}>{(resumenData.ingresosHistoricos.donaciones + resumenData.ingresosHistoricos.sociosActivos * 12 + resumenData.ingresosHistoricos.apadrinamientosActivos * 12).toFixed(2)}€</span>
                      <span className={styles.statLabel}>Histórico</span>
                    </div>
                  </div>

                  <div className={styles.resumenCards}>
                    <div className={styles.resumenCard}>
                      <div className={styles.resumenCardHeader} style={{ background: 'linear-gradient(135deg, #42A5F5 0%, #1976D2 100%)' }}>
                        <span className="material-symbols-outlined">volunteer_activism</span>
                        <span>Donaciones</span>
                      </div>
                      <div className={styles.resumenCardBody}>
                        <div className={styles.resumenCardRow}>
                          <span>Este mes:</span>
                          <strong style={{ color: '#1976D2' }}>{resumenData.ingresosMesActual.donaciones.toFixed(2)}€</strong>
                        </div>
                        <div className={styles.resumenCardRow}>
                          <span>Período:</span>
                          <strong>{resumenData.ingresosPeriodo.donaciones.toFixed(2)}€</strong>
                        </div>
                        <div className={styles.resumenCardRow}>
                          <span>Histórico:</span>
                          <strong>{resumenData.ingresosHistoricos.donaciones.toFixed(2)}€</strong>
                        </div>
                      </div>
</div>
                    <div className={styles.resumenCard}>
                      <div className={styles.resumenCardHeader} style={{ background: 'linear-gradient(135deg, #66BB6A 0%, #4CAF50 100%)' }}>
                        <span className="material-symbols-outlined">card_membership</span>
                        <span>Socios</span>
                      </div>
                      <div className={styles.resumenCardBody}>
                        <div className={styles.resumenCardRow}>
                          <span>Mensual:</span>
                          <strong style={{ color: '#4CAF50' }}>{resumenData.ingresosHistoricos.sociosActivos.toFixed(2)}€</strong>
                        </div>
                        <div className={styles.resumenCardRow}>
                          <span>Período est.:</span>
                          <strong>{resumenData.ingresosPeriodo.socios.toFixed(2)}€</strong>
                        </div>
                        <div className={styles.resumenCardRow}>
                          <span>Ingresos/año:</span>
                          <strong>{(resumenData.ingresosHistoricos.sociosActivos * 12).toFixed(2)}€</strong>
                        </div>
                      </div>
                    </div>
                    <div className={styles.resumenCard}>
                      <div className={styles.resumenCardHeader} style={{ background: 'linear-gradient(135deg, #AB47BC 0%, #7B1FA2 100%)' }}>
                        <span className="material-symbols-outlined">favorite</span>
                        <span>Apadrinamientos</span>
                      </div>
                      <div className={styles.resumenCardBody}>
                        <div className={styles.resumenCardRow}>
                          <span>Mensual:</span>
                          <strong style={{ color: '#7B1FA2' }}>{resumenData.ingresosHistoricos.apadrinamientosActivos.toFixed(2)}€</strong>
                        </div>
                        <div className={styles.resumenCardRow}>
                          <span>Período est.:</span>
                          <strong>{resumenData.ingresosPeriodo.apadrinamientos.toFixed(2)}€</strong>
                        </div>
                        <div className={styles.resumenCardRow}>
                          <span>Ingresos/año:</span>
                          <strong>{(resumenData.ingresosHistoricos.apadrinamientosActivos * 12).toFixed(2)}€</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.graficoContainer}>
                    <h3 className={styles.graficoTitle}>Ingresos últimos 12 meses</h3>
                    <div className={styles.grafico}>
                      {resumenData.grafico.map((item, index) => {
                        const maxDonaciones = Math.max(...resumenData.grafico.map(d => d.donaciones), 1);
                        const maxSocios = Math.max(...resumenData.grafico.map(d => d.socios), 1);
                        const maxApadr = Math.max(...resumenData.grafico.map(d => d.apadrinamientos), 1);
                        const maxTotal = Math.max(maxDonaciones + maxSocios + maxApadr, 1);
                        const mesTotal = item.donaciones + item.socios + item.apadrinamientos;
                        
                        return (
                          <div 
                            key={index} 
                            className={styles.graficoBar}
                            onClick={() => setResumenMesSeleccionado(resumenMesSeleccionado === index ? null : index)}
                            style={{ cursor: 'pointer' }}
                          >
                            {resumenMesSeleccionado === index && mesTotal > 0 && (
                              <div className={styles.graficoTooltip}>
                                <div><strong style={{ color: '#42A5F5' }}>Donaciones:</strong> {item.donaciones.toFixed(2)}€</div>
                                <div><strong style={{ color: '#66BB6A' }}>Socios:</strong> {item.socios.toFixed(2)}€</div>
                                <div><strong style={{ color: '#AB47BC' }}>Apadrinamientos:</strong> {item.apadrinamientos.toFixed(2)}€</div>
                                <div style={{ borderTop: '1px solid #555', marginTop: '6px', paddingTop: '6px' }}><strong>Total:</strong> {mesTotal.toFixed(2)}€</div>
                              </div>
                            )}
                            <div className={styles.graficoBarras}>
                              <div 
                                className={styles.barraDonaciones} 
                                style={{ height: `${Math.max((item.donaciones / maxTotal) * 100, 3)}%` }}
                                data-value={`${item.donaciones.toFixed(2)}€`}
                              />
                              <div 
                                className={styles.barraSocios} 
                                style={{ height: `${Math.max((item.socios / maxTotal) * 100, 3)}%` }}
                                data-value={`${item.socios.toFixed(2)}€`}
                              />
                              <div 
                                className={styles.barraApadr} 
                                style={{ height: `${Math.max((item.apadrinamientos / maxTotal) * 100, 3)}%` }}
                                data-value={`${item.apadrinamientos.toFixed(2)}€`}
                              />
                            </div>
                            <span className={styles.graficoLabel}>{item.mes}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className={styles.graficoLeyenda}>
                      <span><span className={styles.legendDonaciones}></span> Donaciones</span>
                      <span><span className={styles.legendSocios}></span> Socios</span>
                      <span><span className={styles.legendApadr}></span> Apadrinamientos</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className={styles.empty}>No hay datos disponibles</div>
              )}
            </div>
          )}

      {rechazoModal.open && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Rechazar solicitud de apadrinamiento</h3>
            <p>Introduce el motivo del rechazo (opcional):</p>
            <textarea
              value={rechazoModal.motivo}
              onChange={(e) => setRechazoModal({ ...rechazoModal, motivo: e.target.value })}
              placeholder="Motivo del rechazo..."
              rows={4}
              className={styles.textarea}
            />
            <div className={styles.modalButtons}>
              <button
                onClick={() => { setRechazoModal({ open: false, id: null, motivo: '' }); setProcesandoApadrinamiento(null); }}
                className={styles.btnCancel}
              >
                Cancelar
              </button>
              <button onClick={handleConfirmarRechazo} className={styles.btnConfirm} disabled={procesandoApadrinamiento !== null}>
                {procesandoApadrinamiento !== null ? 'Procesando...' : 'Rechazar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminAyudas;