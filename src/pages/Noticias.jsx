import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { noticiaApi } from '../api/api';
import PageHeader from '../components/PageHeader';
import styles from './Noticias.module.css';

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

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
};

const CATEGORIAS = ['Final Feliz', 'Rescate', 'Evento', 'Veterinario', 'Colaboración', 'Adopción', 'General'];

function Noticias() {
  const { user } = useAuth();
  const isAdmin = user?.rol === 'admin';
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gradientCache, setGradientCache] = useState({});
  
  const [filtros, setFiltros] = useState({
    categoria: '',
    busqueda: '',
    orden: '',
    fechaDesde: '',
    fechaHasta: ''
  });

  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [noticiaSeleccionada, setNoticiaSeleccionada] = useState(null);
  const [noticiaForm, setNoticiaForm] = useState({
    titulo: '',
    contenido: '',
    categoria: 'General',
    imagen_url: ''
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

  const fetchNoticias = useCallback(async () => {
    try {
      setLoading(true);
      const data = await noticiaApi.getNoticias(filtros);
      
      const gradients = {};
      await Promise.all(data.map(async (noticia) => {
        if (noticia.imagen_url) {
          const gradient = await getImageGradient(noticia.imagen_url);
          gradients[noticia.id] = gradient;
        }
      }));
      
      setGradientCache(gradients);
      setNoticias(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching noticias:', err);
      setError('Error al cargar las noticias');
      setNoticias([]);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    fetchNoticias();
  }, [fetchNoticias]);

  useEffect(() => {
    const noticiaId = searchParams.get('noticia');
    if (noticiaId && noticias.length > 0) {
      const noticia = noticias.find(n => n.id === noticiaId);
      if (noticia) {
        setNoticiaSeleccionada(noticia);
        setShowViewModal(true);
      }
    }
  }, [noticias, searchParams]);

  const handleFilterChange = (key, value) => {
    setFiltros(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFiltros({
      categoria: '',
      busqueda: '',
      orden: '',
      fechaDesde: '',
      fechaHasta: ''
    });
  };

  const handleVerNoticia = (noticia) => {
    setNoticiaSeleccionada(noticia);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setNoticiaSeleccionada(null);
    setSearchParams({});
  };

  const handleEditarNoticia = (noticia) => {
    setEditingId(noticia.id);
    setNoticiaForm({
      titulo: noticia.titulo,
      contenido: noticia.contenido,
      categoria: noticia.categoria || 'General',
      imagen_url: noticia.imagen_url || ''
    });
    setImagenFile(null);
    setImagenPreview(null);
    setShowModal(true);
  };

  const handleEliminarNoticia = async (noticiaId) => {
    if (!confirm('¿Estás seguro de eliminar esta noticia?')) return;
    try {
      await noticiaApi.deleteNoticia(noticiaId);
      alert('Noticia eliminada');
      fetchNoticias();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCrearNoticia = async (e) => {
    e.preventDefault();
    
    try {
      let imagenUrl = noticiaForm.imagen_url;
      
      if (imagenFile) {
        const result = await noticiaApi.uploadImage(imagenFile);
        imagenUrl = result.url;
      }

      const noticiaData = { ...noticiaForm, imagen_url: imagenUrl };
      
      if (editingId) {
        await noticiaApi.updateNoticia(editingId, noticiaData);
        alert('Noticia actualizada correctamente');
      } else {
        await noticiaApi.createNoticia(noticiaData);
        alert('Noticia creada correctamente');
      }
      setShowModal(false);
      setEditingId(null);
      setNoticiaForm({
        titulo: '',
        contenido: '',
        categoria: 'General',
        imagen_url: ''
      });
      setImagenFile(null);
      setImagenPreview(null);
      fetchNoticias();
    } catch (err) {
      alert(err.message);
    }
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

  const openCreateModal = () => {
    setEditingId(null);
    setNoticiaForm({
      titulo: '',
      contenido: '',
      categoria: 'General',
      imagen_url: ''
    });
    setImagenFile(null);
    setImagenPreview(null);
    setShowModal(true);
  };

  return (
    <>
      <PageHeader title="Noticias" subtitle="Historias de rescate y adopción que nos alegran el corazón" variant="news" />

      <section className={styles.news}>
        <div className="container">
          <div className={styles.filtersSection}>
            <div className={styles.filterRow}>
              <div className={styles.filterGroup}>
                <label>Categoría:</label>
                <select 
                  value={filtros.categoria} 
                  onChange={(e) => handleFilterChange('categoria', e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="">Todas</option>
                  {CATEGORIAS.filter(c => c !== 'General').map(cat => (
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
                  <option value="recientes">Más Recientes</option>
                  <option value="antiguos">Más Antiguos</option>
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
                placeholder="Buscar noticias..."
                value={filtros.busqueda}
                onChange={(e) => handleFilterChange('busqueda', e.target.value)}
                className={styles.searchInput}
              />
              {(filtros.categoria || filtros.busqueda || filtros.fechaDesde || filtros.fechaHasta) && (
                <button onClick={clearFilters} className={styles.clearBtn}>
                  ✕ Limpiar filtros
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className={styles.loading}>Cargando noticias...</div>
          ) : error ? (
            <div className={styles.error}>{error}</div>
          ) : noticias.length === 0 ? (
            <div className={styles.noResults}>
              <p>No se encontraron noticias con los filtros seleccionados.</p>
              <button onClick={clearFilters} className="btn btn-primary">
                Ver todas las noticias
              </button>
            </div>
          ) : (
            <>
              <p className={styles.resultsCount}>
                {noticias.length} noticia{noticias.length !== 1 ? 's' : ''} encontrada{noticias.length !== 1 ? 's' : ''}
              </p>
              <div className={styles.newsList}>
                {noticias.map(noticia => (
                  <article 
                    key={noticia.id} 
                    className={styles.newsItem}
                    onClick={() => handleVerNoticia(noticia)}
                  >
                    <div 
                      className={styles.newsImage}
                      style={{ background: gradientCache[noticia.id] || 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 50%, #a5d6a7 100%)' }}
                    >
                      {noticia.imagen_url ? (
                        <img src={noticia.imagen_url} alt={noticia.titulo} />
                      ) : (
                        <span className={`material-symbols-outlined ${styles.newsEmoji}`}>newspaper</span>
                      )}
                    </div>
                    <div className={styles.newsContent}>
                      <span className={styles.newsCategory}>{noticia.categoria || 'General'}</span>
                      <h3>{noticia.titulo}</h3>
                      <p className={styles.newsPreview}>{noticia.contenido?.substring(0, 150)}...</p>
                      <div className={styles.newsFooter}>
                        <span className={styles.newsDate}>{noticia.created_at ? formatDate(noticia.created_at) : ''}</span>
                        {isAdmin && (
                          <div className={styles.adminButtons}>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleEditarNoticia(noticia); }}
                              className={styles.adminBtnEdit}
                            >
                              <span className="material-symbols-outlined">edit</span> Editar
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleEliminarNoticia(noticia.id); }}
                              className={styles.adminBtnDelete}
                            >
                              <span className="material-symbols-outlined">delete</span> Eliminar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {isAdmin && (
                <div className={styles.addNewsBar}>
                  <button onClick={openCreateModal} className={styles.addNewsBtn}>
                    <span className="material-symbols-outlined">add</span>
                    Agregar nueva noticia
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {showViewModal && noticiaSeleccionada && (
        <div className={styles.modalOverlay} onClick={handleCloseViewModal}>
          <div className={styles.viewModalContent} onClick={(e) => e.stopPropagation()}>
            <button onClick={handleCloseViewModal} className={styles.closeBtn}>✕</button>
            <div 
              className={styles.viewModalImage}
              style={{ background: gradientCache[noticiaSeleccionada.id] || 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 50%, #a5d6a7 100%)' }}
            >
              {noticiaSeleccionada.imagen_url ? (
                <img 
                  src={noticiaSeleccionada.imagen_url} 
                  alt={noticiaSeleccionada.titulo}
                  onClick={(e) => { e.stopPropagation(); openLightbox(noticiaSeleccionada.imagen_url); }}
                  style={{ cursor: 'zoom-in' }}
                />
              ) : (
                <span className={`material-symbols-outlined ${styles.newsEmoji}`}>newspaper</span>
              )}
              {noticiaSeleccionada.imagen_url && (
                <div className={styles.zoomControls}>
                  <button className={styles.zoomBtn} onClick={(e) => { e.stopPropagation(); openLightbox(noticiaSeleccionada.imagen_url); }} title="Ampliar">
                    <span className="material-symbols-outlined">search</span>
                  </button>
                </div>
              )}
            </div>
            <div className={styles.viewModalBody}>
              <span className={styles.newsCategory}>{noticiaSeleccionada.categoria || 'General'}</span>
              <h2>{noticiaSeleccionada.titulo}</h2>
              <p className={styles.viewModalDate}>
                <span className="material-symbols-outlined">calendar_today</span>
                {noticiaSeleccionada.created_at ? formatDate(noticiaSeleccionada.created_at) : ''}
              </p>
              <div className={styles.viewModalText}>
                {noticiaSeleccionada.contenido}
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className={styles.modalOverlay} onClick={() => { setShowModal(false); setEditingId(null); }}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{editingId ? 'Editar Noticia' : 'Agregar Nueva Noticia'}</h3>
              <button onClick={() => { setShowModal(false); setEditingId(null); }} className={styles.closeBtn}>✕</button>
            </div>
            <form onSubmit={handleCrearNoticia} className={styles.modalForm}>
              <div className={styles.fieldGroup}>
                <div className={styles.fieldGroupTitle}>
                  <span className="material-symbols-outlined">article</span>
                  Información de la Noticia
                </div>
                <div className={styles.field}>
                  <label>Título *</label>
                  <input 
                    type="text" 
                    value={noticiaForm.titulo} 
                    onChange={(e) => setNoticiaForm({...noticiaForm, titulo: e.target.value})} 
                    required 
                    placeholder="Título de la noticia"
                  />
                </div>
                
                <div className={styles.field}>
                  <label>Categoría *</label>
                  <select 
                    value={noticiaForm.categoria} 
                    onChange={(e) => setNoticiaForm({...noticiaForm, categoria: e.target.value})}
                  >
                    {CATEGORIAS.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className={styles.fieldGroup}>
                <div className={styles.fieldGroupTitle}>
                  <span className="material-symbols-outlined">description</span>
                  Contenido
                </div>
                <div className={styles.field}>
                  <label>Contenido *</label>
                  <textarea 
                    value={noticiaForm.contenido} 
                    onChange={(e) => setNoticiaForm({...noticiaForm, contenido: e.target.value})} 
                    required 
                    rows={6}
                    placeholder="Escribe el contenido de la noticia..."
                  ></textarea>
                </div>
              </div>
              
              <div className={styles.fieldGroup}>
                <div className={styles.fieldGroupTitle}>
                  <span className="material-symbols-outlined">image</span>
                  Imagen
                </div>
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
                {(imagenPreview || noticiaForm.imagen_url) && (
                  <div className={styles.fieldImagePreview}>
                    <img 
                      src={imagenPreview || noticiaForm.imagen_url} 
                      alt="Preview" 
                    />
                  </div>
                )}
              </div>
              
              <div className={styles.modalActions}>
                <button type="button" onClick={() => { setShowModal(false); setEditingId(null); }} className="btn btn-secondary">Cancelar</button>
                <button type="submit" className="btn btn-primary">{editingId ? 'Actualizar' : 'Crear Noticia'}</button>
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

export default Noticias;