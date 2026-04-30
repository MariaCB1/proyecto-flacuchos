import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { animalApi } from '../api/api';
import PageHeader from '../components/PageHeader';
import styles from './Adopciones.module.css';

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
      } catch (e) {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = imageUrl;
  });
};

function Adopciones() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [animales, setAnimales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gradientCache, setGradientCache] = useState({});
  const [misSolicitudes, setMisSolicitudes] = useState([]);
  
  const [filtros, setFiltros] = useState({
    tipo: '',
    tamano: '',
    urgente: false,
    busqueda: '',
    orden: ''
  });

  const [showAnimalModal, setShowAnimalModal] = useState(false);
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
  const [imagenFile, setImagenFile] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);

  useEffect(() => {
    fetchAnimales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros.tipo, filtros.tamano, filtros.urgente, filtros.busqueda, filtros.orden]);

  useEffect(() => {
    if (isAuthenticated && user?.rol !== 'admin') {
      animalApi.getMisSolicitudes().then(data => setMisSolicitudes(data)).catch(console.error);
    }
  }, [isAuthenticated, user]);

  const fetchAnimales = async () => {
    try {
      setLoading(true);
      const data = await animalApi.getAnimales(filtros);
      
      const gradients = {};
      await Promise.all(data.map(async (animal) => {
        if (animal.imagen_url) {
          const gradient = await getImageGradient(animal.imagen_url);
          gradients[animal.id] = gradient;
        }
      }));
      
      setGradientCache(gradients);
      setAnimales(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching animales:', err);
      setError('Error al cargar los animales');
      setAnimales([]);
    } finally {
      setLoading(false);
    }
  };

  const tieneSolicitudParaAnimal = (animalId) => {
    return misSolicitudes.some(sol => sol.animal_id === animalId && sol.estado === 'pending');
  };

  const handleAdoptar = (animalId) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/adopcion/${animalId}` } });
      return;
    }
    if (user?.rol === 'admin') {
      alert('Los administradores no pueden adoptar');
      return;
    }
    if (tieneSolicitudParaAnimal(animalId)) {
      alert('Ya has solicitado este animal. Puedes eliminar tu solicitud en tu perfil.');
      return;
    }
    navigate(`/adopcion/${animalId}`);
  };

  const handleFilterChange = (key, value) => {
    setFiltros(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFiltros({
      tipo: '',
      tamano: '',
      urgente: false,
      busqueda: '',
      orden: ''
    });
  };

  const [editingAnimalId, setEditingAnimalId] = useState(null);

  const handleEditarAnimal = (animal) => {
    setEditingAnimalId(animal.id);
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
    setImagenFile(null);
    setImagenPreview(null);
    setShowAnimalModal(true);
  };

  const handleEliminarAnimal = async (animalId) => {
    if (!confirm('¿Estás seguro de eliminar este animal?')) return;
    try {
      await animalApi.deleteAnimal(animalId);
      alert('Animal eliminado');
      fetchAnimales();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCrearAnimal = async (e) => {
    e.preventDefault();
    
    if (animalForm.peso && parseFloat(animalForm.peso) < 0) {
      alert('El peso no puede ser negativo');
      return;
    }
    
    try {
      let imagenUrl = animalForm.imagen_url;
      
      if (imagenFile) {
        const result = await animalApi.uploadImage(imagenFile);
        imagenUrl = result.url;
      }

      const animalData = { ...animalForm, imagen_url: imagenUrl };
      
      if (editingAnimalId) {
        await animalApi.updateAnimal(editingAnimalId, animalData);
        alert('Animal actualizado correctamente');
      } else {
        await animalApi.createAnimal(animalData);
        alert('Animal creado correctamente');
      }
      setShowAnimalModal(false);
      setEditingAnimalId(null);
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
      setImagenFile(null);
      setImagenPreview(null);
      fetchAnimales();
    } catch (err) {
      alert(err.message);
    }
  };

  const isAdmin = user?.rol === 'admin';

  return (
    <>
      <PageHeader title="Adopciones" subtitle="Encuentra a tu nuevo mejor amigo" />

      <section className={styles.adoption}>
        <div className="container">
          <div className={styles.filtersSection}>
            <div className={styles.filterRow}>
              <div className={styles.filterGroup}>
                <label>Tipo:</label>
                <select 
                  value={filtros.tipo} 
                  onChange={(e) => handleFilterChange('tipo', e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="">Todos</option>
                  <option value="perro">Perros</option>
                  <option value="gato">Gatos</option>
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label>Tamaño:</label>
                <select 
                  value={filtros.tamano} 
                  onChange={(e) => handleFilterChange('tamano', e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="">Todos</option>
                  <option value="pequeño">Pequeño</option>
                  <option value="mediano">Mediano</option>
                  <option value="grande">Grande</option>
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
                <label className={`${styles.checkboxLabel} ${styles.urgentCheckbox}`}>
                  <input 
                    type="checkbox" 
                    checked={filtros.urgente}
                    onChange={(e) => handleFilterChange('urgente', e.target.checked)}
                  />
                  <span className="material-symbols-outlined">warning</span> Solo urgentes
                </label>
              </div>
            </div>

            <div className={styles.searchRow}>
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={filtros.busqueda}
                onChange={(e) => handleFilterChange('busqueda', e.target.value)}
                className={styles.searchInput}
              />
              {(filtros.tipo || filtros.tamano || filtros.urgente || filtros.busqueda) && (
                <button onClick={clearFilters} className={styles.clearBtn}>
                  ✕ Limpiar filtros
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className={styles.loading}>Cargando animales...</div>
          ) : error ? (
            <div className={styles.error}>{error}</div>
          ) : animales.length === 0 ? (
            <div className={styles.noResults}>
              <p>No se encontraron animales con los filtros seleccionados.</p>
              <button onClick={clearFilters} className="btn btn-primary">
                Ver todos los animales
              </button>
            </div>
          ) : (
            <>
              <p className={styles.resultsCount}>
                {animales.length} animal{animales.length !== 1 ? 'es' : ''} encontrado{animales.length !== 1 ? 's' : ''}
              </p>
              <div className={styles.petsGrid}>
                {animales.map(animal => (
                  <div key={animal.id} className={styles.petCard}>
                    <div 
                      className={styles.petImage}
                      style={{ background: gradientCache[animal.id] || 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 50%, #a5d6a7 100%)' }}
                    >
                      {animal.imagen_url ? (
                        <img src={animal.imagen_url} alt={animal.nombre} />
                      ) : (
                        <span className={styles.petEmoji}><span className="material-symbols-outlined">pets</span></span>
                      )}
                      {animal.urgente && (
                        <span className={styles.urgentTag}><span className="material-symbols-outlined">priority_high</span> URGENTE</span>
                      )}
                      <span className={`${styles.petStatus} ${styles[animal.estado]}`}>
                        {animal.estado === 'disponible' ? 'Disponible' : 'Adoptado'}
                      </span>
                    </div>
                    <div className={styles.petContent}>
                      <h3>{animal.nombre}</h3>
                      <div className={styles.petInfo}>
                        <span><span className="material-symbols-outlined">cake</span> {animal.edad}</span>
                        <span><span className="material-symbols-outlined">straighten</span> {animal.tamano}</span>
                      </div>
                      {animal.caracter && (
                        <div className={styles.petCharacter}>
                          {animal.caracter.split(',').slice(0, 3).map((trait, idx) => (
                            <span key={idx} className={styles.characterTag}>{trait.trim()}</span>
                          ))}
                        </div>
                      )}
                      {animal.salud && (
                        <div className={styles.petHealth}><span className="material-symbols-outlined">medical_services</span> {animal.salud}</div>
                      )}
                      {isAdmin ? (
                        <div className={styles.adminButtons}>
                          <button 
                            onClick={() => handleEditarAnimal(animal)}
                            className={styles.adminBtnEdit}
                          >
                            <span className="material-symbols-outlined">edit</span> Editar
                          </button>
                          <button 
                            onClick={() => handleEliminarAnimal(animal.id)}
                            className={styles.adminBtnDelete}
                          >
                            <span className="material-symbols-outlined">delete</span> Eliminar
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleAdoptar(animal.id)}
                          className={`btn btn-primary ${styles.adoptBtn}`}
                          disabled={animal.estado !== 'disponible'}
                        >
                          {animal.estado === 'disponible' ? <><span className="material-symbols-outlined">pets</span> Adoptar</> : 'No disponible'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>

            {isAdmin && (
              <div className={styles.addAnimalBar}>
                <button onClick={() => setShowAnimalModal(true)} className={styles.addAnimalBtn}>
                  <span className="material-symbols-outlined">add</span>
                  Agregar nuevo animal
                </button>
              </div>
            )}
          </>
        )}
        </div>
      </section>

      {showAnimalModal && (
            <div className={styles.modalOverlay} onClick={() => { setShowAnimalModal(false); setEditingAnimalId(null); }}>
              <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                  <h3>{editingAnimalId ? 'Editar Animal' : 'Agregar Nuevo Animal'}</h3>
                  <button onClick={() => { setShowAnimalModal(false); setEditingAnimalId(null); }} className={styles.closeBtn}>✕</button>
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
                    <label>Imagen</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setImagenFile(file);
                          setImagenPreview(URL.createObjectURL(file));
                        }
                      }} 
                    />
                    {(imagenPreview || animalForm.imagen_url) && (
                      <div style={{ marginTop: '10px' }}>
                        <img 
                          src={imagenPreview || animalForm.imagen_url} 
                          alt="Preview" 
                          style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
                        />
                      </div>
                    )}
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.field}>
                      <label>Peso (kg)</label>
                      <input type="number" step="0.1" min="0" value={animalForm.peso} onChange={(e) => setAnimalForm({...animalForm, peso: e.target.value})} />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.checkboxLabel}>
                        <input type="checkbox" checked={animalForm.urgente} onChange={(e) => setAnimalForm({...animalForm, urgente: e.target.checked})} />
                        Animal Urgente
                      </label>
                    </div>
                  </div>
                  <div className={styles.modalActions}>
                    <button type="button" onClick={() => { setShowAnimalModal(false); setEditingAnimalId(null); }} className="btn btn-secondary">Cancelar</button>
                    <button type="submit" className="btn btn-primary">{editingAnimalId ? 'Actualizar' : 'Crear Animal'}</button>
                  </div>
                </form>
              </div>
            </div>
          )}
    </>
  );
}

export default Adopciones;