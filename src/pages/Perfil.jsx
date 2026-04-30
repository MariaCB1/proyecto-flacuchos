import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { animalApi } from '../api/api';
import styles from './Perfil.module.css';

function Perfil() {
  const { user, logout, updatePerfil } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('');
  
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [misSolicitudes, setMisSolicitudes] = useState([]);
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(false);

  const [animales, setAnimales] = useState([]);
  const [loadingAnimales, setLoadingAnimales] = useState(false);

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
    if (activeTab === 'animales') {
      fetchAnimales();
    }
    if (activeTab === 'admin-solicitudes') {
      fetchSolicitudesAdmin();
    }
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
      if (contrasena) datos.contrasena = contrasena;

      if (Object.keys(datos).length === 0) {
        setSuccess('No hay cambios que guardar');
        setLoading(false);
        return;
      }

      await updatePerfil(datos);
      setSuccess('Perfil actualizado correctamente');
      setContrasena('');
    } catch (err) {
      setError(err.message || 'Error al actualizar');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
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
              <span className={styles.menuRole}>{isAdmin ? 'Administrador' : 'Usuario'}</span>
            </div>
          </div>

          <div className={styles.menuButtons}>
            <button 
              className={`${styles.menuBtn} ${activeTab === 'datos' ? styles.active : ''}`}
              onClick={() => setActiveTab('datos')}
            >
              <span className="material-symbols-outlined">person</span>
              <span className={styles.btnText}>
                <span className={styles.btnTitle}>Editar Mis Datos</span>
                <span className={styles.btnSubtitle}>Nombre, email, contraseña</span>
              </span>
              <span className="material-symbols-outlined arrow">chevron_right</span>
            </button>

            {!isAdmin && (
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
            )}

            {isAdmin && (
              <Link to="/admin/solicitudes" className={styles.menuBtn}>
                <span className="material-symbols-outlined">folder_open</span>
                <span className={styles.btnText}>
                  <span className={styles.btnTitle}>Gestionar Solicitudes</span>
                  <span className={styles.btnSubtitle}>Aprobar o rechazar adopciones</span>
                </span>
                <span className="material-symbols-outlined arrow">chevron_right</span>
              </Link>
            )}
          </div>

          <div className={styles.menuContent}>
            {error && <div className={styles.error}><span className="material-symbols-outlined">error</span>{error}</div>}
            {success && <div className={styles.success}><span className="material-symbols-outlined">check_circle</span>{success}</div>}

            {activeTab === 'datos' && (
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.field}>
                  <label htmlFor="nombre"><span className="material-symbols-outlined">badge</span>Nombre completo</label>
                  <input type="text" id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                </div>
                <div className={styles.field}>
                  <label htmlFor="email"><span className="material-symbols-outlined">mail</span>Email</label>
                  <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className={styles.field}>
                  <label htmlFor="contrasena"><span className="material-symbols-outlined">lock</span>Nueva contraseña (opcional)</label>
                  <input type="password" id="contrasena" value={contrasena} onChange={(e) => setContrasena(e.target.value)} placeholder="Dejar vacío para mantener actual" />
                </div>
                <button type="submit" className={styles.button} disabled={loading}>
                  {loading ? <><span className={styles.spinner}></span>Guardando...</> : <><span className="material-symbols-outlined">save</span>Guardar Cambios</>}
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
                              {new Date(sol.created_at).toLocaleDateString('es-ES')}
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
                          <span>Fecha:</span> {new Date(detalleSolicitud.created_at).toLocaleDateString('es-ES')}
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
                              {sol.usuario_nombre} • {new Date(sol.created_at).toLocaleDateString('es-ES')}
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
    </main>
  );
}

export default Perfil;