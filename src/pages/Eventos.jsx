import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { eventosApi, inscripcionesApi } from '../api/api';
import PageHeader from '../components/PageHeader';
import styles from './Eventos.module.css';

const getImageGradient = (imageUrl) => {
  if (!imageUrl) return null;
  
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 50;
      canvas.height = 50;
      ctx.drawImage(img, 0, 0, 50, 50);
      
      try {
        const imageData = ctx.getImageData(0, 0, 50, 50);
        const data = imageData.data;
        let r = 0, g = 0, b = 0, count = 0;
        
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] > 128) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            count++;
          }
        }
        
        if (count > 0) {
          r = Math.floor(r / count);
          g = Math.floor(g / count);
          b = Math.floor(b / count);
          
          const rLight = Math.min(255, r + 60);
          const gLight = Math.min(255, g + 60);
          const bLight = Math.min(255, b + 60);
          
          resolve(`linear-gradient(135deg, rgb(${r}, ${g}, ${b}) 0%, rgb(${rLight}, ${gLight}, ${bLight}) 100%)`);
        } else {
          resolve(null);
        }
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = imageUrl;
  });
};

const CATEGORIAS = ['Adopción', 'Solidario', 'Educativo', 'Deportivo', 'Cultural', 'Otro'];

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
};

const getCountdown = (fecha) => {
  const eventoDate = new Date(fecha);
  const now = new Date();
  const diff = eventoDate - now;
  
  if (diff <= 0) return null;
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return { days, hours, minutes };
};

function Eventos() {
  const { user } = useAuth();
  const isAdmin = user?.rol === 'admin';
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gradientCache, setGradientCache] = useState({});
  const [countdowns, setCountdowns] = useState({});
  
  const [filtros, setFiltros] = useState({
    categoria: '',
    busqueda: '',
    tipo: 'todos',
    orden: 'proximos',
    fechaDesde: '',
    fechaHasta: ''
  });

  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [eventoForm, setEventoForm] = useState({
    titulo: '',
    descripcion: '',
    fecha: '',
    hora: '',
    horaInicio: '',
    horaFin: '',
    ubicacion: '',
    precio: 'Gratis',
    imagen_url: '',
    categoria: 'Otro'
  });
  const [imagenFile, setImagenFile] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxImage, setLightboxImage] = useState('');
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  const [misInscripciones, setMisInscripciones] = useState([]);

  const fetchEventos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await eventosApi.getEventos(filtros);
      
      const gradients = {};
      await Promise.all(data.map(async (evento) => {
        if (evento.imagen_url) {
          const gradient = await getImageGradient(evento.imagen_url);
          gradients[evento.id] = gradient;
        }
      }));
      
      setGradientCache(gradients);
      setEventos(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching eventos:', err);
      setError('Error al cargar los eventos');
      setEventos([]);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    fetchEventos();
  }, [fetchEventos]);

  useEffect(() => {
    if (user) {
      inscripcionesApi.getMisInscripciones()
        .then(data => setMisInscripciones(data.map(i => i.evento_id)))
        .catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    const updateCountdowns = () => {
      const counts = {};
      eventos.forEach(evento => {
        const countdown = getCountdown(evento.fecha);
        if (countdown) {
          counts[evento.id] = countdown;
        }
      });
      setCountdowns(counts);
    };
    
    updateCountdowns();
    const interval = setInterval(updateCountdowns, 60000);
    
    return () => clearInterval(interval);
  }, [eventos]);

  useEffect(() => {
    const eventoId = searchParams.get('evento');
    if (eventoId && eventos.length > 0) {
      const evento = eventos.find(e => e.id === eventoId);
      if (evento) {
        setEventoSeleccionado(evento);
        setShowViewModal(true);
      }
    }
  }, [eventos, searchParams]);

  const handleFilterChange = (key, value) => {
    setFiltros(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFiltros({ categoria: '', busqueda: '', tipo: 'todos', orden: 'proximos', fechaDesde: '', fechaHasta: '' });
  };

  const handleVerEvento = (evento) => {
    setEventoSeleccionado(evento);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setEventoSeleccionado(null);
    setSearchParams({});
  };

  const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const handleEditarEvento = (evento) => {
    setEditingId(evento.id);
    const fechaFormateada = formatDateForInput(evento.fecha);
    const horaParts = evento.hora ? evento.hora.split(' - ') : ['', ''];
    setEventoForm({
      titulo: evento.titulo,
      descripcion: evento.descripcion || '',
      fecha: fechaFormateada,
      hora: evento.hora || '',
      horaInicio: horaParts[0] || '',
      horaFin: horaParts[1] || '',
      ubicacion: evento.ubicacion || '',
      precio: evento.precio || 'Gratis',
      imagen_url: evento.imagen_url || '',
      categoria: evento.categoria || 'Otro',
      permitir_inscripcion: evento.permitir_inscripcion !== false
    });
    setImagenFile(null);
    setImagenPreview(null);
    setShowModal(true);
  };

  const handleInscribirse = async (evento, e) => {
    e.stopPropagation();
    if (!confirm(`¿Estás seguro de que quieres inscribirte en "${evento.titulo}"?`)) return;
    try {
      await inscripcionesApi.inscribir(evento.id);
      alert('¡Te has inscrito correctamente al evento!');
      setMisInscripciones(prev => [...prev, evento.id]);
    } catch (err) {
      alert(err.message || 'Error al inscribirse');
    }
  };

  const handleCancelarInscripcion = async (evento, e) => {
    e.stopPropagation();
    
    const eventoFecha = new Date(evento.fecha);
    if (evento.hora) {
      const horaInicio = evento.hora.split(' - ')[0];
      const [horas, minutos] = horaInicio.split(':').map(Number);
      eventoFecha.setHours(horas, minutos, 0, 0);
    }
    const ahora = new Date();
    
    if (eventoFecha < ahora) {
      alert('No puedes cancelar la inscripción de un evento que ya ha pasado');
      return;
    }
    
    if (!confirm(`¿Estás seguro de que quieres cancelar tu inscripción en "${evento.titulo}"?`)) return;
    try {
      await inscripcionesApi.cancelarInscripcion(evento.id);
      alert('Inscripción cancelada');
      setMisInscripciones(prev => prev.filter(id => id !== evento.id));
    } catch (err) {
      alert(err.message || 'Error al cancelar inscripción');
    }
  };

  const handleEliminarEvento = async (eventoId) => {
    if (!confirm('¿Estás seguro de eliminar este evento?')) return;
    try {
      await eventosApi.deleteEvento(eventoId);
      alert('Evento eliminado');
      fetchEventos();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCrearEvento = async (e) => {
    e.preventDefault();
    
    const fechaEvento = new Date(eventoForm.fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (fechaEvento < hoy) {
      alert('La fecha del evento no puede ser anterior a la fecha actual');
      return;
    }
    
    try {
      let imagenUrl = eventoForm.imagen_url;
      
      if (imagenFile) {
        const result = await eventosApi.uploadImage(imagenFile);
        imagenUrl = result.url;
      }

      const eventoData = { ...eventoForm, imagen_url: imagenUrl };
      
      if (editingId) {
        await eventosApi.updateEvento(editingId, eventoData);
        alert('Evento actualizado correctamente');
      } else {
        await eventosApi.createEvento(eventoData);
        alert('Evento creado correctamente');
      }
      setShowModal(false);
      setEditingId(null);
      setEventoForm({
        titulo: '',
        descripcion: '',
        fecha: '',
        hora: '',
        horaInicio: '',
        horaFin: '',
        ubicacion: '',
        precio: 'Gratis',
        imagen_url: '',
        categoria: 'Otro',
        permitir_inscripcion: true
      });
      setImagenFile(null);
      setImagenPreview(null);
      fetchEventos();
    } catch (err) {
      alert(err.message);
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setEventoForm({
      titulo: '',
      descripcion: '',
      fecha: '',
      hora: '',
      horaInicio: '',
      horaFin: '',
      ubicacion: '',
      precio: 'Gratis',
      imagen_url: '',
      categoria: 'Otro'
    });
    setImagenFile(null);
    setImagenPreview(null);
    setShowModal(true);
  };

  const openLightbox = (imagenUrl) => {
    setLightboxImage(imagenUrl);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setShowLightbox(true);
  };

  const handleLightboxImageClick = () => {
    if (hasMoved) {
      setHasMoved(false);
      return;
    }
    if (zoom >= 5) {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    } else {
      setZoom(prev => Math.min(prev + 1, 5));
    }
  };

  const closeLightbox = () => {
    setShowLightbox(false);
    setLightboxImage('');
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 5));
  };

  const handleZoomOut = () => {
    setZoom(prev => {
      const newZoom = Math.max(prev - 0.25, 1);
      if (newZoom === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newZoom;
    });
  };

  const handleWheelZoom = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoom(prev => Math.min(prev + 0.1, 5));
    } else {
      setZoom(prev => Math.max(prev - 0.1, 1));
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setHasMoved(false);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoom > 1) {
      setHasMoved(true);
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      const newX = position.x + deltaX;
      const newY = position.y + deltaY;
      
      const maxMove = (zoom - 1) * 150;
      
      const constrainedX = Math.max(-maxMove, Math.min(maxMove, newX));
      const constrainedY = Math.max(-maxMove, Math.min(maxMove, newY));
      
      setPosition({ x: constrainedX, y: constrainedY });
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const sortEventos = (arr) => {
    const sorted = [...arr];
    if (filtros.orden === 'proximos') {
      sorted.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    } else if (filtros.orden === 'lejanos') {
      sorted.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    } else if (filtros.orden === 'recientes') {
      sorted.sort((a, b) => new Date(b.created_at || b.fecha) - new Date(a.created_at || a.fecha));
    }
    return sorted;
  };

  const now = new Date();
  
  let eventosProximosRaw = eventos.filter(e => {
    const eventoDate = new Date(e.fecha);
    if (e.hora) {
      const horaInicio = e.hora.split(' - ')[0];
      const [horas, minutos] = horaInicio.split(':').map(Number);
      eventoDate.setHours(horas, minutos, 0, 0);
    }
    return eventoDate >= now;
  });
  
  let eventosPasadosRaw = eventos.filter(e => {
    const eventoDate = new Date(e.fecha);
    if (e.hora) {
      const horaInicio = e.hora.split(' - ')[0];
      const [horas, minutos] = horaInicio.split(':').map(Number);
      eventoDate.setHours(horas, minutos, 0, 0);
    }
    return eventoDate < now;
  });

  const eventosProximos = sortEventos(eventosProximosRaw);
  const eventosPasados = sortEventos(eventosPasadosRaw);
  
const showProximos = filtros.tipo === 'proximos' || filtros.tipo === 'todos';
  const showPasados = filtros.tipo === 'pasados' || filtros.tipo === 'todos';

  return (
    <>
      <PageHeader title="Eventos" subtitle="Únete a nuestras actividades solidarias" variant="events" />

      <section className={styles.events}>
        <div className="container">
          <div className={styles.filtersSection}>
            <div className={styles.filterRow}>
              <div className={styles.filterGroup}>
                <label>Mostrar:</label>
                <select 
                  value={filtros.tipo} 
                  onChange={(e) => handleFilterChange('tipo', e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="proximos">Próximos</option>
                  <option value="pasados">Pasados</option>
                  <option value="todos">Todos</option>
                </select>
              </div>
              
              <div className={styles.filterGroup}>
                <label>Categoría:</label>
                <select 
                  value={filtros.categoria} 
                  onChange={(e) => handleFilterChange('categoria', e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="">Todas</option>
                  {CATEGORIAS.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div className={styles.filterGroup}>
                <label>Orden:</label>
                <select 
                  value={filtros.orden} 
                  onChange={(e) => handleFilterChange('orden', e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="proximos">Más próximos primero</option>
                  <option value="lejanos">Más lejanos primero</option>
                  <option value="recientes">Más recientes</option>
                </select>
              </div>
              
              <div className={styles.filterGroup}>
                <label>Desde:</label>
                <input 
                  type="date" 
                  value={filtros.fechaDesde}
                  onChange={(e) => handleFilterChange('fechaDesde', e.target.value)}
                  className={styles.filterDate}
                />
              </div>
              
              <div className={styles.filterGroup}>
                <label>Hasta:</label>
                <input 
                  type="date" 
                  value={filtros.fechaHasta}
                  onChange={(e) => handleFilterChange('fechaHasta', e.target.value)}
                  className={styles.filterDate}
                />
              </div>
            </div>

            <div className={styles.searchRow}>
              <input
                type="text"
                placeholder="Buscar eventos..."
                value={filtros.busqueda}
                onChange={(e) => handleFilterChange('busqueda', e.target.value)}
                className={styles.searchInput}
              />
            </div>
            {(filtros.categoria || filtros.busqueda || filtros.tipo !== 'proximos' || filtros.orden !== 'proximos' || filtros.fechaDesde || filtros.fechaHasta) && (
              <button onClick={clearFilters} className={styles.clearBtn}>
                ✕ Limpiar filtros
              </button>
            )}
          </div>

          {loading ? (
            <div className={styles.loading}>Cargando eventos...</div>
          ) : error ? (
            <div className={styles.error}>{error}</div>
          ) : (
            <>
              {showProximos && eventosProximos.length > 0 && (
                <>
                  <div className="section-header">
                    <h2 className={styles.eventsSectionTitle}>Próximos Eventos</h2>
                  </div>
                  <p className={styles.resultsCount}>
                    {eventosProximos.length} evento{eventosProximos.length !== 1 ? 's' : ''}
                  </p>
                  <div className={styles.eventsList}>
                    {eventosProximos.map(evento => (
                      <div 
                        key={evento.id} 
                        className={styles.eventCardFull}
                        onClick={() => handleVerEvento(evento)}
                      >
                        <div 
                          className={styles.eventImage}
                          style={{ background: evento.imagen_url ? (gradientCache[evento.id] || 'linear-gradient(135deg, #7B1FA2 0%, #6A1B9A 100%)') : '#E1BEE7' }}
                        >
                          {evento.imagen_url ? (
                            <img 
                              src={evento.imagen_url} 
                              alt={evento.titulo} 
                            />
                          ) : (
                            <span className={`material-symbols-outlined ${styles.eventEmoji}`} style={{ color: '#7B1FA2', fontSize: '3rem' }}>
                              event
                            </span>
                          )}
                        </div>
                        
                        <div className={styles.eventDateBadge}>
                          <span className={styles.eventDay}>
                            {new Date(evento.fecha).getDate()}
                          </span>
                          <span className={styles.eventMonth}>
                            {new Date(evento.fecha).toLocaleDateString('es-ES', { month: 'short' })}
                          </span>
                        </div>
                        
                        <div className={styles.eventDetails}>
                          <span className={styles.eventCategory}>
                            {evento.categoria}
                          </span>
                          <h3>{evento.titulo}</h3>
                          <p>{evento.descripcion}</p>
                          
                          <div className={styles.eventInfo}>
                            {evento.ubicacion && (
                              <span>
                                <span className="material-symbols-outlined">location_on</span>
                                {evento.ubicacion}
                              </span>
                            )}
                            {evento.hora && (
                              <span>
                                <span className="material-symbols-outlined">schedule</span>
                                {evento.hora}
                              </span>
                            )}
                            <span>
                              <span className="material-symbols-outlined">confirmation_number</span>
                              {evento.precio || 'Gratis'}
                            </span>
                          </div>
                          
                          {countdowns[evento.id] && (
                            <div className={styles.countdown}>
                              <span className={styles.countdownLabel}>Faltan:</span>
                              <div className={styles.countdownItems}>
                                <div className={styles.countdownItem}>
                                  <span className={styles.countdownNumber}>{countdowns[evento.id].days}</span>
                                  <span className={styles.countdownUnit}>días</span>
                                </div>
                                <div className={styles.countdownItem}>
                                  <span className={styles.countdownNumber}>{countdowns[evento.id].hours}</span>
                                  <span className={styles.countdownUnit}>horas</span>
                                </div>
                                <div className={styles.countdownItem}>
                                  <span className={styles.countdownNumber}>{countdowns[evento.id].minutes}</span>
                                  <span className={styles.countdownUnit}>min</span>
                                </div>
</div>
        </div>
      )}
                          
                          <div className={styles.eventActions}>
                            {!isAdmin && evento.permitir_inscripcion !== false && user && (
                              misInscripciones.includes(evento.id) ? (
                                <button 
                                  className="btn btn-secondary"
                                  onClick={(e) => handleCancelarInscripcion(evento, e)}
                                >
                                  Cancelar inscripción
                                </button>
                              ) : (
                                <button 
                                  className="btn btn-primary"
                                  onClick={(e) => handleInscribirse(evento, e)}
                                >
                                  Inscribirse
                                </button>
                              )
                            )}
                            {!isAdmin && evento.permitir_inscripcion !== false && !user && (
                              <Link to="/login" className="btn btn-primary" onClick={e => e.stopPropagation()}>
                                Inscribirse
                              </Link>
                            )}
                            
                            {isAdmin && (
                              <div className={styles.adminButtons}>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleEditarEvento(evento); }}
                                  className={styles.adminBtnEdit}
                                >
                                  <span className="material-symbols-outlined">edit</span> Editar
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleEliminarEvento(evento.id); }}
                                  className={styles.adminBtnDelete}
                                >
                                  <span className="material-symbols-outlined">delete</span> Eliminar
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {isAdmin && showProximos && (
                    <div className={styles.addEventBar}>
                      <button onClick={openCreateModal} className={styles.addEventBtn}>
                        <span className="material-symbols-outlined">add</span>
                        Agregar nuevo evento
                      </button>
                    </div>
                  )}
                </>
              )}

              {showPasados && eventosPasados.length > 0 && (
                <>
                  <div className="section-header" style={{marginTop: '60px'}}>
                    <h2 className={styles.eventsSectionTitle}>Eventos Pasados</h2>
                  </div>
                  <p className={styles.resultsCount}>
                    {eventosPasados.length} evento{eventosPasados.length !== 1 ? 's' : ''} pasado{eventosPasados.length !== 1 ? 's' : ''}
                  </p>
                  <div className={styles.pastEvents}>
                    {eventosPasados.map(evento => (
                      <div 
                        key={evento.id} 
                        className={styles.pastEvent}
                        onClick={() => handleVerEvento(evento)}
                      >
                        <div 
                          className={styles.pastEventImage}
                          style={{ background: evento.imagen_url ? (gradientCache[evento.id] || 'linear-gradient(135deg, #7B1FA2 0%, #6A1B9A 100%)') : '#E1BEE7' }}
                        >
                          {evento.imagen_url ? (
                            <img 
                              src={evento.imagen_url} 
                              alt={evento.titulo}
                            />
                          ) : (
                            <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: '#7B1FA2' }}>
                              event
                            </span>
                          )}
                        </div>
                        <div className={styles.pastEventContent}>
                          <span className={styles.pastEventCategory}>
                            {evento.categoria}
                          </span>
                          <div className={styles.pastEventDate}>
                            <span className="material-symbols-outlined">calendar_today</span>
                            {formatDate(evento.fecha)}
                          </div>
                          <h4>{evento.titulo}</h4>
                          {evento.ubicacion && (
                            <div className={styles.pastEventInfo}>
                              <span className="material-symbols-outlined">location_on</span>
                              {evento.ubicacion}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </section>

{showViewModal && eventoSeleccionado && (
        <div className={styles.modalOverlay} onClick={handleCloseViewModal}>
          <div className={styles.viewModalContent} onClick={(e) => e.stopPropagation()}>
            <button onClick={handleCloseViewModal} className={styles.closeBtn}>✕</button>
            
            {(() => {
              const eventoDate = new Date(eventoSeleccionado.fecha);
              if (eventoSeleccionado.hora) {
                const horaInicio = eventoSeleccionado.hora.split(' - ')[0];
                const [horas, minutos] = horaInicio.split(':').map(Number);
                eventoDate.setHours(horas, minutos, 0, 0);
              }
              const eventoPasado = eventoDate < new Date();
              
              return (
                <div className={styles.viewModalContent}>
                  <div 
                    className={styles.viewModalImage}
                    style={{ background: eventoSeleccionado.imagen_url ? (gradientCache[eventoSeleccionado.id] || 'linear-gradient(135deg, #7B1FA2 0%, #6A1B9A 100%)') : '#E1BEE7' }}
                    onClick={() => eventoSeleccionado.imagen_url && openLightbox(eventoSeleccionado.imagen_url)}
                  >
                    {eventoSeleccionado.imagen_url ? (
                      <img src={eventoSeleccionado.imagen_url} alt={eventoSeleccionado.titulo} style={{ cursor: 'zoom-in' }} />
                    ) : (
                      <span className={`material-symbols-outlined ${styles.eventEmojiLarge}`} style={{ color: '#7B1FA2' }}>
                        event
                      </span>
                    )}
                  </div>
                  
                  <div className={styles.viewModalBody}>
                    <span className={styles.eventCategoryLarge}>
                      {eventoSeleccionado.categoria}
                    </span>
                    <h2>{eventoSeleccionado.titulo}</h2>
                    
                    <div className={styles.viewModalMeta}>
                      <div className={styles.viewModalMetaItem}>
                        <span className="material-symbols-outlined">calendar_today</span>
                        {formatDate(eventoSeleccionado.fecha)}
                      </div>
                      {eventoSeleccionado.hora && (
                        <div className={styles.viewModalMetaItem}>
                          <span className="material-symbols-outlined">schedule</span>
                          {eventoSeleccionado.hora}
                        </div>
                      )}
                      {eventoSeleccionado.ubicacion && (
                        <div className={styles.viewModalMetaItem}>
                          <span className="material-symbols-outlined">location_on</span>
                          {eventoSeleccionado.ubicacion}
                        </div>
                      )}
                      <div className={styles.viewModalMetaItem}>
                        <span className="material-symbols-outlined">confirmation_number</span>
                        {eventoSeleccionado.precio || 'Gratis'}
                      </div>
                    </div>
                    
                    <p className={styles.viewModalDescription}>{eventoSeleccionado.descripcion}</p>
                    
                    {!isAdmin && eventoSeleccionado.permitir_inscripcion !== false && !eventoPasado && (
                      <>                        
                        {!user ? (
                          <Link to="/login" className="btn btn-primary" style={{ marginTop: '20px' }}>
                            Inscribirse
                          </Link>
                        ) : misInscripciones.includes(eventoSeleccionado.id) ? (
                          <button 
                            className="btn btn-secondary"
                            style={{ marginTop: '20px' }}
                            onClick={(e) => {
                              handleCancelarInscripcion(eventoSeleccionado, e);
                              handleCloseViewModal();
                            }}
                          >
                            Cancelar inscripción
                          </button>
                        ) : (
                          <button 
                            className="btn btn-primary"
                            style={{ marginTop: '20px' }}
                            onClick={(e) => {
                              handleInscribirse(eventoSeleccionado, e);
                              handleCloseViewModal();
                            }}
                          >
                            Inscribirse
                          </button>
                        )}
                      </>
                    )}
                    
                    {eventoPasado && (
                      <p style={{ marginTop: '20px', color: '#7B1FA2', fontWeight: '600' }}>Este evento ya ha pasado</p>
                    )}
                    </div>

                    {countdowns[eventoSeleccionado.id] && (
                      <div className={styles.countdownLarge}>
                        <span className={styles.countdownLabel}>Este evento es en:</span>
                        <div className={styles.countdownItemsLarge}>
                          <div className={styles.countdownItemLarge}>
                            <span className={styles.countdownNumberLarge}>{countdowns[eventoSeleccionado.id].days}</span>
                            <span className={styles.countdownUnitLarge}>días</span>
                          </div>
                          <div className={styles.countdownItemLarge}>
                            <span className={styles.countdownNumberLarge}>{countdowns[eventoSeleccionado.id].hours}</span>
                            <span className={styles.countdownUnitLarge}>horas</span>
                          </div>
                          <div className={styles.countdownItemLarge}>
                            <span className={styles.countdownNumberLarge}>{countdowns[eventoSeleccionado.id].minutes}</span>
                            <span className={styles.countdownUnitLarge}>minutos</span>
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              );
})()}
          </div>
        </div>
      )}

      {showModal && (
        <div className={styles.modalOverlay} onClick={() => { setShowModal(false); setEditingId(null); }}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{editingId ? 'Editar Evento' : 'Nuevo Evento'}</h3>
              <button onClick={() => { setShowModal(false); setEditingId(null); }} className={styles.closeBtn}>✕</button>
            </div>
            <form onSubmit={handleCrearEvento} className={styles.modalForm}>
              <div className={styles.fieldGroup}>
                <div className={styles.fieldGroupTitle}>Información del Evento</div>
                <div className={styles.field}>
                  <label>Título *</label>
                  <input 
                    type="text" 
                    value={eventoForm.titulo} 
                    onChange={(e) => setEventoForm({...eventoForm, titulo: e.target.value})} 
                    required 
                    placeholder="Nombre del evento"
                  />
                </div>
                
                <div className={styles.field}>
                  <label>Categoría *</label>
                  <select 
                    value={eventoForm.categoria} 
                    onChange={(e) => setEventoForm({...eventoForm, categoria: e.target.value})}
                  >
                    {CATEGORIAS.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className={styles.fieldGroup}>
                <div className={styles.fieldGroupTitle}>Fecha y Hora</div>
                <div className={styles.fieldRow}>
                  <div className={styles.field}>
                    <label>Fecha *</label>
                    <input 
                      type="date" 
                      value={eventoForm.fecha} 
                      onChange={(e) => setEventoForm({...eventoForm, fecha: e.target.value})} 
                      required 
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Hora inicio</label>
                    <input 
                      type="time" 
                      value={eventoForm.horaInicio || ''}
                      onChange={(e) => setEventoForm({...eventoForm, horaInicio: e.target.value, hora: e.target.value + (eventoForm.horaFin ? ' - ' + eventoForm.horaFin : '')})}
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Hora fin</label>
                    <input 
                      type="time" 
                      value={eventoForm.horaFin || ''}
                      onChange={(e) => setEventoForm({...eventoForm, horaFin: e.target.value, hora: (eventoForm.horaInicio || '') + ' - ' + e.target.value})}
                    />
                  </div>
                </div>
              </div>
              
              <div className={styles.fieldGroup}>
                <div className={styles.fieldGroupTitle}>Ubicación y Precio</div>
                <div className={styles.field}>
                  <label>Ubicación</label>
                  <input 
                    type="text" 
                    value={eventoForm.ubicacion} 
                    onChange={(e) => setEventoForm({...eventoForm, ubicacion: e.target.value})} 
                    placeholder="Dirección del evento"
                  />
                </div>
                <div className={styles.field}>
                  <label>Precio</label>
                  <input 
                    type="text" 
                    value={eventoForm.precio} 
                    onChange={(e) => setEventoForm({...eventoForm, precio: e.target.value})} 
                    placeholder="ej: Gratis, 5€, etc."
                  />
                </div>
              </div>
              
              <div className={styles.fieldGroup}>
                <div className={styles.fieldGroupTitle}>Descripción</div>
                <div className={styles.field}>
                  <textarea 
                    value={eventoForm.descripcion} 
                    onChange={(e) => setEventoForm({...eventoForm, descripcion: e.target.value})} 
                    rows={4}
                    placeholder="Describe el evento..."
                  ></textarea>
                </div>
              </div>
              
              <div className={styles.fieldCheckbox}>
                <label className={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    checked={eventoForm.permitir_inscripcion}
                    onChange={(e) => setEventoForm({...eventoForm, permitir_inscripcion: e.target.checked})}
                  />
                  Permitir inscripciones (mostrar botón "Inscribirse")
                </label>
              </div>
              
              <div className={styles.fieldGroup}>
                <div className={styles.fieldGroupTitle}>Imagen del Evento</div>
                <input 
                  type="file" 
                  accept="image/*"
                  className={styles.fileInput}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setImagenFile(file);
                      setImagenPreview(URL.createObjectURL(file));
                    }
                  }}
                />
                {(imagenPreview || eventoForm.imagen_url) && (
                  <div className={styles.fieldImagePreview}>
                    <img 
                      src={imagenPreview || eventoForm.imagen_url} 
                      alt="Preview" 
                      style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                  </div>
                )}
              </div>
              
              <div className={styles.modalActions}>
                <button type="button" onClick={() => { setShowModal(false); setEditingId(null); }} className="btn btn-secondary">Cancelar</button>
                <button type="submit" className="btn btn-primary">{editingId ? 'Actualizar' : 'Crear Evento'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showLightbox && (
        <div 
          className={styles.lightboxOverlay}
          onWheel={handleWheelZoom}
        >
          <button className={styles.lightboxClose} onClick={closeLightbox}>✕</button>
          <div 
            className={styles.lightboxContent}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img 
              src={lightboxImage} 
              alt="Imagen ampliada"
              className={styles.lightboxImage}
              onClick={handleLightboxImageClick}
              style={{ 
                transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)`,
                cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in'
              }}
              draggable={false}
            />
          </div>
          <div className={styles.lightboxControls}>
            <button className={styles.lightboxZoomBtn} onClick={handleZoomOut}>
              <span className="material-symbols-outlined">remove</span>
            </button>
            <span className={styles.zoomLevel}>{Math.round(zoom * 100)}%</span>
            <button className={styles.lightboxZoomBtn} onClick={handleZoomIn}>
              <span className="material-symbols-outlined">add</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Eventos;