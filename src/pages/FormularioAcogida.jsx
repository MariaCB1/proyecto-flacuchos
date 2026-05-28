import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { contactoApi } from '../api/api';
import PageHeader from '../components/PageHeader';
import styles from './FormularioAcogida.module.css';

const PASOS = [
  { titulo: 'Datos', icon: 'person' },
  { titulo: 'Vivienda', icon: 'home' },
  { titulo: 'Convivencia', icon: 'group' },
  { titulo: 'Otros Animales', icon: 'pets' },
  { titulo: 'Disponibilidad', icon: 'schedule' },
  { titulo: 'Tipo de Acogida', icon: 'favorite' },
  { titulo: 'Cuidados', icon: 'medical_services' }
];

const initialFormData = {
  nombre_completo: '',
  dni: '',
  telefono: '',
  tipo_vivienda: '',
  otra_vivienda: '',
  vivienda_propia: '',
  permiso_alquiler: false,
  tiene_exterior: false,
  exterior_descripcion: '',
  otras_personas: null,
  num_personas: '',
  todos_de_acuerdo: null,
  hay_ninos: null,
  edad_ninos: '',
  tiene_otros_animales: null,
  tipo_otros_animales: '',
  vaccinated_otros: null,
  tiempo_acogida: '',
  horas_solo: '',
  tipo_animal: [],
  experiencia_previa: null,
  experiencia_detalles: '',
  motivo_acogida: '',
  comentarios: ''
};

function FormularioAcogida() {
  const { user } = useAuth();
  const [pasoActual, setPasoActual] = useState(0);
  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [miSolicitud, setMiSolicitud] = useState(null);
  const [cargandoSolicitud, setCargandoSolicitud] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        nombre_completo: user.nombre_completo || user.nombre || ''
      }));
      fetchMiSolicitud();
    }
  }, [user]);

  const fetchMiSolicitud = async () => {
    try {
      setCargandoSolicitud(true);
      const data = await contactoApi.getMisSolicitudesAcogida();
      if (data.length > 0) {
        setMiSolicitud(data[0]);
      }
    } catch (err) {
      console.error('Error fetching solicitud:', err);
    } finally {
      setCargandoSolicitud(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCheckboxGroup = (field, value) => {
    setFormData(prev => {
      const current = Array.isArray(prev[field]) ? prev[field] : [];
      const newValue = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [field]: newValue };
    });
  };

  const validarPaso = (paso) => {
    const errors = {};

    if (paso === 0) {
      if (!formData.dni?.trim()) errors.dni = 'El DNI/NIE es obligatorio';
      if (!formData.telefono?.trim()) errors.telefono = 'El teléfono es obligatorio';
    }

    if (paso === 1) {
      if (!formData.tipo_vivienda) errors.tipo_vivienda = 'Selecciona el tipo de vivienda';
      if (!formData.vivienda_propia) errors.vivienda_propia = 'Selecciona una opción';
    }

    if (paso === 4) {
      if (!formData.tiempo_acogida) errors.tiempo_acogida = 'Selecciona el tiempo de acogida';
    }

    if (paso === 5) {
      if (formData.tipo_animal.length === 0) errors.tipo_animal = 'Selecciona al menos un tipo de animal';
    }

    return errors;
  };

  const handleNextPaso = () => {
    const errors = validarPaso(pasoActual);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setPasoActual(prev => prev + 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validarPaso(pasoActual);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setEnviando(true);
    setError('');

    try {
      const payload = { ...formData };
      if (!formData.tiene_exterior) {
        payload.exterior_descripcion = '';
      }
      if (!formData.otras_personas) {
        payload.num_personas = '';
      }
      if (!formData.hay_ninos) {
        payload.edad_ninos = '';
      }
      if (!formData.tiene_otros_animales) {
        payload.tipo_otros_animales = '';
        payload.vaccinated_otros = null;
      }
      if (formData.experiencia_previa === false) {
        payload.experiencia_detalles = '';
      }

      await contactoApi.crearSolicitudAcogida(payload);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Error al enviar la solicitud');
    } finally {
      setEnviando(false);
    }
  };

  if (user?.rol === 'admin') {
    return (
      <>
        <PageHeader title="Eres administrador" variant="help" />
        <section className={styles.formSection}>
          <div className={styles.container}>
            <div className={styles.loginPrompt}>
              <span className="material-symbols-outlined">admin_panel_settings</span>
              <h3>Eres administrador</h3>
              <p>Las solicitudes de casa de acogida se gestionan desde el panel de administración</p>
              <div className={styles.loginButtons}>
                <Link to="/admin/ayudas?tab=acogidas" className={styles.btnPrimary}>
                  Ver gestión
                </Link>
                <Link to="/" className={styles.btnSecondary}>
                  Volver al inicio
                </Link>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  if (success) {
    return (
      <>
        <PageHeader title="Solicitud Enviada" variant="help" />
        <section className={styles.formSection}>
          <div className={styles.container}>
            <div className={styles.successBox}>
              <span className="material-symbols-outlined" style={{ fontSize: '4rem', color: '#1976D2' }}>check_circle</span>
              <h2>¡Gracias por tu interés!</h2>
              <p>Tu solicitud de casa de acogida ha sido enviada correctamente.</p>
              <p>Nos pondremos en contacto contigo pronto.</p>
              <a href="/" className={styles.submitBtn}>
                Volver al inicio
              </a>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Formulario de Casa de Acogida" variant="help" />
      <section className={styles.formSection}>
        <div className={styles.container}>
          <div className={styles.introBox}>
            <p>Las casas de acogida son fundamentales para salvar vidas y dar una oportunidad a animales que lo necesitan.</p>
          </div>

          {cargandoSolicitud ? (
            <div className={styles.loading}>Cargando...</div>
          ) : (
            <>
              {miSolicitud && (
                <div className={styles.introBox} style={{ background: '#fff3cd', border: '2px solid #ffc107' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#856404' }}>info</span>
                  <p style={{ color: '#856404', fontWeight: '600', margin: '15px 0 5px' }}>
                    Ya tienes una solicitud {miSolicitud.estado === 'aceptado' ? 'aceptada' : 'en curso'}
                  </p>
                  <p style={{ color: '#856404' }}>Esta es una nueva solicitud de acogida</p>
                </div>
              )}

              <div className={styles.progressBar}>
                {PASOS.map((paso, i) => (
                  <div key={i} className={`${styles.progressStep} ${i < pasoActual ? styles.completed : ''} ${i === pasoActual ? styles.active : ''} ${i === pasoActual ? styles.current : ''}`}>
                    <div className={styles.progressIcon}>
                      <span className="material-symbols-outlined">{paso.icon}</span>
                    </div>
                    <span className={styles.progressLabel}>
                      <span className={styles.stepTitle}>{paso.titulo}</span>
                    </span>
                  </div>
                ))}
              </div>

              <form className={styles.form} onSubmit={handleSubmit}>
                {error && (
                  <div className={styles.error}>
                    <span className="material-symbols-outlined">error</span>
                    <span>{error}</span>
                  </div>
                )}

                {pasoActual === 0 && (
                  <div className={styles.formStep}>
                    <h3><span className="material-symbols-outlined">person</span> Datos personales</h3>
                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label>Nombre y apellidos *</label>
                        <input type="text" name="nombre_completo" value={formData.nombre_completo} onChange={handleChange} disabled className={`${fieldErrors.nombre_completo ? styles.inputError : ''} ${styles.inputDisabled}`} />
                        {fieldErrors.nombre_completo && <span className={styles.fieldError}>{fieldErrors.nombre_completo}</span>}
                      </div>
                      <div className={styles.formGroup}>
                        <label>DNI/NIE *</label>
                        <input type="text" name="dni" value={formData.dni} onChange={handleChange} className={fieldErrors.dni ? styles.inputError : ''} />
                        {fieldErrors.dni && <span className={styles.fieldError}>{fieldErrors.dni}</span>}
                      </div>
                      <div className={styles.formGroup}>
                        <label>Teléfono *</label>
                        <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} className={fieldErrors.telefono ? styles.inputError : ''} />
                        {fieldErrors.telefono && <span className={styles.fieldError}>{fieldErrors.telefono}</span>}
                      </div>
                      <div className={styles.formGroup}>
                        <label>Correo electrónico</label>
                        <input type="email" value={user?.email || ''} disabled className={styles.inputDisabled} />
                      </div>
                    </div>
                    <div className={styles.formActions}>
                      <button type="button" onClick={handleNextPaso} className={styles.btnPrimary}>
                        Siguiente
                      </button>
                    </div>
                  </div>
                )}

                {pasoActual === 1 && (
                  <div className={styles.formStep}>
                    <h3><span className="material-symbols-outlined">home</span> Vivienda</h3>
                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label>Tipo de vivienda *</label>
                        <select name="tipo_vivienda" value={formData.tipo_vivienda} onChange={handleChange} required className={fieldErrors.tipo_vivienda ? styles.inputError : ''}>
                          <option value="">Selecciona...</option>
                          <option value="piso">Piso</option>
                          <option value="casa">Casa</option>
                          <option value="otro">Otro</option>
                        </select>
                        {fieldErrors.tipo_vivienda && <span className={styles.fieldError}>{fieldErrors.tipo_vivienda}</span>}
                      </div>
                      {formData.tipo_vivienda === 'otro' && (
                        <div className={styles.formGroup}>
                          <label>Especifica:</label>
                          <input type="text" name="otra_vivienda" value={formData.otra_vivienda} onChange={handleChange} />
                        </div>
                      )}
                      <div className={styles.formGroup}>
                        <label>¿Es vivienda propia o de alquiler? *</label>
                        <select name="vivienda_propia" value={formData.vivienda_propia} onChange={handleChange} required className={fieldErrors.vivienda_propia ? styles.inputError : ''}>
                          <option value="">Selecciona...</option>
                          <option value="propia">Propia</option>
                          <option value="alquiler">Alquiler</option>
                        </select>
                        {fieldErrors.vivienda_propia && <span className={styles.fieldError}>{fieldErrors.vivienda_propia}</span>}
                      </div>
                      {formData.vivienda_propia === 'alquiler' && (
                        <div className={styles.formGroup}>
                          <label>¿Permite animales?</label>
                          <div className={styles.checkboxGroup}>
                            <label className={styles.checkbox}>
                              <input type="checkbox" name="permiso_alquiler" checked={formData.permiso_alquiler} onChange={handleChange} />
                              Sí
                            </label>
                          </div>
                          {fieldErrors.permiso_alquiler && <span className={styles.fieldError}>{fieldErrors.permiso_alquiler}</span>}
                        </div>
                      )}
                      <div className={styles.formGroup}>
                        <label>¿Tiene espacios exteriores? (terraza, jardín…)</label>
                        <div className={styles.checkboxGroup}>
                          <label className={styles.checkbox}>
                            <input type="checkbox" name="tiene_exterior" checked={formData.tiene_exterior} onChange={handleChange} />
                            Sí
                          </label>
                        </div>
                      </div>
                      {formData.tiene_exterior && (
                        <div className={styles.formGroup}>
                          <label>Describe los espacios exteriores</label>
                          <textarea
                            name="exterior_descripcion"
                            value={formData.exterior_descripcion}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Describe el tamaño, tipo de cierre, si tiene acceso directo..."
                          />
                        </div>
                      )}
                    </div>
                    <div className={styles.formActions}>
                      {pasoActual > 0 && (
                        <button type="button" onClick={() => { setPasoActual(pasoActual - 1); setError(''); }} className={styles.btnSecondary}>
                          Anterior
                        </button>
                      )}
                      <button type="button" onClick={handleNextPaso} className={styles.btnPrimary}>
                        Siguiente
                      </button>
                    </div>
                  </div>
                )}

                {pasoActual === 2 && (
                  <div className={styles.formStep}>
                    <h3><span className="material-symbols-outlined">group</span> Convivencia</h3>
                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label>¿Hay otras personas en el hogar?</label>
                        <div className={styles.radioGroup}>
                          <label className={styles.radio}>
                            <input type="radio" name="otras_personas" value={true} checked={formData.otras_personas === true} onChange={() => setFormData(p => ({ ...p, otras_personas: true }))} />
                            Sí
                          </label>
                          <label className={styles.radio}>
                            <input type="radio" name="otras_personas" value={false} checked={formData.otras_personas === false} onChange={() => setFormData(p => ({ ...p, otras_personas: false, num_personas: '' }))} />
                            No
                          </label>
                        </div>
                      </div>
                      {formData.otras_personas && (
                        <div className={styles.formGroup}>
                          <label>¿Cuántas?</label>
                          <input type="number" name="num_personas" value={formData.num_personas} onChange={handleChange} />
                        </div>
                      )}
                      <div className={styles.formGroup}>
                        <label>¿Todos están de acuerdo con la acogida?</label>
                        <div className={styles.radioGroup}>
                          <label className={styles.radio}>
                            <input type="radio" name="todos_de_acuerdo" value={true} checked={formData.todos_de_acuerdo === true} onChange={() => setFormData(p => ({ ...p, todos_de_acuerdo: true }))} />
                            Sí
                          </label>
                          <label className={styles.radio}>
                            <input type="radio" name="todos_de_acuerdo" value={false} checked={formData.todos_de_acuerdo === false} onChange={() => setFormData(p => ({ ...p, todos_de_acuerdo: false }))} />
                            No
                          </label>
                        </div>
                      </div>
                      <div className={styles.formGroup}>
                        <label>¿Hay niños/as?</label>
                        <div className={styles.radioGroup}>
                          <label className={styles.radio}>
                            <input type="radio" name="hay_ninos" value={true} checked={formData.hay_ninos === true} onChange={() => setFormData(p => ({ ...p, hay_ninos: true }))} />
                            Sí
                          </label>
                          <label className={styles.radio}>
                            <input type="radio" name="hay_ninos" value={false} checked={formData.hay_ninos === false} onChange={() => setFormData(p => ({ ...p, hay_ninos: false, edad_ninos: '' }))} />
                            No
                          </label>
                        </div>
                      </div>
                      {formData.hay_ninos && (
                        <div className={styles.formGroup}>
                          <label>Edad:</label>
                          <input type="text" name="edad_ninos" value={formData.edad_ninos} onChange={handleChange} placeholder="Ej: 5 y 8 años" />
                        </div>
                      )}
                    </div>
                    <div className={styles.formActions}>
                      <button type="button" onClick={() => { setPasoActual(pasoActual - 1); setError(''); }} className={styles.btnSecondary}>
                        Anterior
                      </button>
                      <button type="button" onClick={handleNextPaso} className={styles.btnPrimary}>
                        Siguiente
                      </button>
                    </div>
                  </div>
                )}

                {pasoActual === 3 && (
                  <div className={styles.formStep}>
                    <h3><span className="material-symbols-outlined">pets</span> Otros animales</h3>
                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label>¿Tienes otros animales?</label>
                        <div className={styles.radioGroup}>
                          <label className={styles.radio}>
                            <input type="radio" name="tiene_otros_animales" value={true} checked={formData.tiene_otros_animales === true} onChange={() => setFormData(p => ({ ...p, tiene_otros_animales: true }))} />
                            Sí
                          </label>
                          <label className={styles.radio}>
                            <input type="radio" name="tiene_otros_animales" value={false} checked={formData.tiene_otros_animales === false} onChange={() => setFormData(p => ({ ...p, tiene_otros_animales: false, tipo_otros_animales: '', vaccinated_otros: null }))} />
                            No
                          </label>
                        </div>
                      </div>
                      {formData.tiene_otros_animales && (
                        <>
                          <div className={styles.formGroup}>
                            <label>¿Qué tipo?</label>
                            <input type="text" name="tipo_otros_animales" value={formData.tipo_otros_animales} onChange={handleChange} placeholder="Ej: Perro, gato, etc." />
                          </div>
                          <div className={styles.formGroup}>
                            <label>¿Están Vaccinated y desparasitados?</label>
                            <div className={styles.radioGroup}>
                              <label className={styles.radio}>
                                <input type="radio" name="vaccinated_otros" value={true} checked={formData.vaccinated_otros === true} onChange={() => setFormData(p => ({ ...p, vaccinated_otros: true }))} />
                                Sí
                              </label>
                              <label className={styles.radio}>
                                <input type="radio" name="vaccinated_otros" value={false} checked={formData.vaccinated_otros === false} onChange={() => setFormData(p => ({ ...p, vaccinated_otros: false }))} />
                                No
                              </label>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    <div className={styles.formActions}>
                      <button type="button" onClick={() => { setPasoActual(pasoActual - 1); setError(''); }} className={styles.btnSecondary}>
                        Anterior
                      </button>
                      <button type="button" onClick={handleNextPaso} className={styles.btnPrimary}>
                        Siguiente
                      </button>
                    </div>
                  </div>
                )}

                {pasoActual === 4 && (
                  <div className={styles.formStep}>
                    <h3><span className="material-symbols-outlined">schedule</span> Disponibilidad</h3>
                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label>¿Cuánto tiempo puedes acogida? *</label>
                        <select name="tiempo_acogida" value={formData.tiempo_acogida} onChange={handleChange} className={fieldErrors.tiempo_acogida ? styles.inputError : ''}>
                          <option value="">Selecciona...</option>
                          <option value="dias">Días</option>
                          <option value="semanas">Semanas</option>
                          <option value="meses">Meses</option>
                          <option value="indefinido">Indefinido hasta adopción</option>
                        </select>
                        {fieldErrors.tiempo_acogida && <span className={styles.fieldError}>{fieldErrors.tiempo_acogida}</span>}
                      </div>
                      <div className={styles.formGroup}>
                        <label>¿Cuántas horas al día estaría solo el animal?</label>
                        <input type="number" name="horas_solo" value={formData.horas_solo} onChange={handleChange} placeholder="Ej: 4" />
                      </div>
                    </div>
                    <div className={styles.formActions}>
                      <button type="button" onClick={() => { setPasoActual(pasoActual - 1); setError(''); }} className={styles.btnSecondary}>
                        Anterior
                      </button>
                      <button type="button" onClick={handleNextPaso} className={styles.btnPrimary}>
                        Siguiente
                      </button>
                    </div>
                  </div>
                )}

                {pasoActual === 5 && (
                  <div className={styles.formStep}>
                    <h3><span className="material-symbols-outlined">favorite</span> Tipo de acogida</h3>
                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label>¿Qué tipo de animal podrías acoger? *</label>
                        <div className={styles.checkboxGrid}>
                          <label className={styles.checkbox}>
                            <input type="checkbox" checked={Array.isArray(formData.tipo_animal) && formData.tipo_animal.includes('cachorros')} onChange={() => handleCheckboxGroup('tipo_animal', 'cachorros')} />
                            Cachorros
                          </label>
                          <label className={styles.checkbox}>
                            <input type="checkbox" checked={Array.isArray(formData.tipo_animal) && formData.tipo_animal.includes('adultos')} onChange={() => handleCheckboxGroup('tipo_animal', 'adultos')} />
                            Adultos
                          </label>
                          <label className={styles.checkbox}>
                            <input type="checkbox" checked={Array.isArray(formData.tipo_animal) && formData.tipo_animal.includes('mayores')} onChange={() => handleCheckboxGroup('tipo_animal', 'mayores')} />
                            Animales mayores
                          </label>
                          <label className={styles.checkbox}>
                            <input type="checkbox" checked={Array.isArray(formData.tipo_animal) && formData.tipo_animal.includes('necesidades_especiales')} onChange={() => handleCheckboxGroup('tipo_animal', 'necesidades_especiales')} />
                            Con necesidades especiales
                          </label>
                          <label className={styles.checkbox}>
                            <input type="checkbox" checked={Array.isArray(formData.tipo_animal) && formData.tipo_animal.includes('perros')} onChange={() => handleCheckboxGroup('tipo_animal', 'perros')} />
                            Perros
                          </label>
                          <label className={styles.checkbox}>
                            <input type="checkbox" checked={Array.isArray(formData.tipo_animal) && formData.tipo_animal.includes('gatos')} onChange={() => handleCheckboxGroup('tipo_animal', 'gatos')} />
                            Gatos
                          </label>
                        </div>
                        {fieldErrors.tipo_animal && <span className={styles.fieldError}>{fieldErrors.tipo_animal}</span>}
                      </div>
                    </div>
                    <div className={styles.formActions}>
                      <button type="button" onClick={() => { setPasoActual(pasoActual - 1); setError(''); }} className={styles.btnSecondary}>
                        Anterior
                      </button>
                      <button type="button" onClick={handleNextPaso} className={styles.btnPrimary}>
                        Siguiente
                      </button>
                    </div>
                  </div>
                )}

                {pasoActual === 6 && (
                  <div className={styles.formStep}>
                    <h3><span className="material-symbols-outlined">medical_services</span> Cuidados y compromiso</h3>
                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label>¿Tienes experiencia previa con animales?</label>
                        <div className={styles.radioGroup}>
                          <label className={styles.radio}>
                            <input type="radio" name="experiencia_previa" value={true} checked={formData.experiencia_previa === true} onChange={() => setFormData(p => ({ ...p, experiencia_previa: true }))} />
                            Sí
                          </label>
                          <label className={styles.radio}>
                            <input type="radio" name="experiencia_previa" value={false} checked={formData.experiencia_previa === false} onChange={() => setFormData(p => ({ ...p, experiencia_previa: false, experiencia_detalles: '' }))} />
                            No
                          </label>
                        </div>
                      </div>
                      {formData.experiencia_previa && (
                        <div className={styles.formGroup}>
                          <label>Detalles:</label>
                          <textarea name="experiencia_detalles" value={formData.experiencia_detalles} onChange={handleChange} rows={3} placeholder="Cuéntanos tu experiencia..." />
                        </div>
                      )}
                      <div className={styles.formGroup}>
                        <label>¿Por qué quieres hacerte casa de acogida?</label>
                        <textarea name="motivo_acogida" value={formData.motivo_acogida} onChange={handleChange} rows={3} />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Comentarios adicionales</label>
                        <textarea name="comentarios" value={formData.comentarios} onChange={handleChange} rows={3} placeholder="Cualquier información que quieras añadir..." />
                      </div>
                    </div>
                    <div className={styles.formActions}>
                      <button type="button" onClick={() => { setPasoActual(pasoActual - 1); setError(''); }} className={styles.btnSecondary}>
                        Anterior
                      </button>
                      <button type="submit" disabled={enviando} className={styles.btnPrimary}>
                        {enviando ? 'Enviando...' : 'Enviar Solicitud'}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </>
          )}
        </div>
      </section>
    </>
  );
}

export default FormularioAcogida;