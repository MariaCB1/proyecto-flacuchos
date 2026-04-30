import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { animalApi } from '../api/api';
import PageHeader from '../components/PageHeader';
import styles from './FormularioAdopcion.module.css';

function FormularioAdopcion() {
  const { animalId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [animal, setAnimal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [pasoActual, setPasoActual] = useState(0);
  
  const [formData, setFormData] = useState({
    nombre_perro: '',
    nombre_completo: '',
    fecha_nacimiento: '',
    residencia: '',
    telefono: '',
    redes_sociales: '',
    es_extranjero: false,
    tiempo_en_espana: '',
    posibilidad_regreso: '',
    plan_con_animal: '',
    personas_hogar: '',
    parentesco_personas: '',
    convivencia_aceptada: '',
    ocupaciones_horarios: '',
    tipo_vivienda: '',
    metros_cuadrados: '',
    es_alquiler: false,
    permiso_propietario: '',
    tiene_exterior: false,
    posibilidad_bebe: '',
    opinion_convivencia_bebes: '',
    en_separacion_quien_cuida: '',
    problema_ladridos: '',
    solucion_ladridos: '',
    plan_mudanza: '',
    lugar_dormir: '',
    restricciones_vivienda: '',
    tipo_cama: '',
    actividades: '',
    vacaciones_cuidado: '',
    paseos_dia: '',
    duracion_paseos: '',
    necesidades_perro: '',
    coste_veterinario_opinion: '',
    cuando_veterinario: '',
    tipo_alimentacion: '',
    horas_solo: '',
    acepta_cambios_estimacion: '',
    relacion_con_perros: '',
    motivo_socializacion: '',
    gestion_problemas_conducta: '',
    problema_necesidades: '',
    solucion_necesidades: '',
    opinion_esterilizacion: '',
    plan_esterilizacion: '',
    ha_tenido_animales: '',
    edad_animales: '',
    motivo_perdida: '',
    puede_asumir_costes: '',
    alternativa_costes: '',
    ha_visitado_refugio: '',
    nombre_refugio: '',
    acepta_seguimiento: '',
    acepta_tasa_adopcion: '',
    motivos_devolucion: '',
    adoptaria_otro_animal: '',
    como_conocio: ''
  });

  const fetchAnimal = async () => {
    try {
      const data = await animalApi.getAnimalById(animalId);
      setAnimal(data);
      setFormData(prev => ({ ...prev, nombre_perro: data.nombre }));
    } catch {
      setError('Error al cargar los datos del animal');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || user?.rol === 'admin') {
      navigate('/login');
      return;
    }
    fetchAnimal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animalId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

const validarPaso = (paso) => {
    if (paso === 0) return true;
    
    // Paso 1: Datos Personales
    if (paso === 1) {
      // Verificar edad primero
      if (formData.fecha_nacimiento) {
        const fechaNac = new Date(formData.fecha_nacimiento);
        const hoy = new Date();
        let edad = hoy.getFullYear() - fechaNac.getFullYear();
        const mesActual = hoy.getMonth();
        const mesNac = fechaNac.getMonth();
        if (mesNac > mesActual || (mesNac === mesActual && hoy.getDate() < fechaNac.getDate())) {
          edad--;
        }
        if (edad < 18) {
          return false;
        }
      }
      
      if (!formData.nombre_completo || !formData.fecha_nacimiento || 
          !formData.residencia) {
        return false;
      }
      if (!formData.telefono || formData.telefono.length !== 9) {
        return false;
      }
      if (formData.es_extranjero && 
          (!formData.tiempo_en_espana || !formData.posibilidad_regreso || !formData.plan_con_animal)) {
        return false;
      }
      return true;
    }
    
    // Paso 2: Vivienda y Familia
    if (paso === 2) {
      if (!formData.tipo_vivienda || !formData.metros_cuadrados || 
          !formData.personas_hogar || !formData.lugar_dormir ||
          !formData.ocupaciones_horarios || !formData.actividades || 
          !formData.problema_ladridos || !formData.plan_mudanza) {
        return false;
      }
      return true;
    }
    
    // Paso 3: Cuidado del Animal
    if (paso === 3) {
      if (!formData.necesidades_perro || !formData.acepta_cambios_estimacion ||
          !formData.relacion_con_perros || !formData.gestion_problemas_conducta) {
        return false;
      }
      return true;
    }
    
    // Paso 4: Historial y Compromiso
    if (paso === 4) {
      if (!formData.ha_tenido_animales || !formData.ha_visitado_refugio ||
          !formData.adoptaria_otro_animal || !formData.como_conocio ||
          formData.acepta_seguimiento !== true || formData.acepta_tasa_adopcion !== true) {
        return false;
      }
      return true;
    }
    
    return true;
  };

  const getErrorMessage = (paso) => {
    if (paso === 1) {
      // Primero verificar edad
      if (formData.fecha_nacimiento) {
        const fechaNac = new Date(formData.fecha_nacimiento);
        const hoy = new Date();
        let edad = hoy.getFullYear() - fechaNac.getFullYear();
        const mesActual = hoy.getMonth();
        const mesNac = fechaNac.getMonth();
        if (mesNac > mesActual || (mesNac === mesActual && hoy.getDate() < fechaNac.getDate())) {
          edad--;
        }
        if (edad < 18) {
          return 'Debes ser mayor de 18 años para adoptar';
        }
      }
      
      // Luego verificar teléfono
      if (!formData.telefono || formData.telefono.length !== 9) {
        return 'El teléfono debe tener exactamente 9 dígitos';
      }
      
      // Finalmente verificar campos vacíos
      const camposFaltantes = [];
      if (!formData.nombre_completo) camposFaltantes.push('nombre completo');
      if (!formData.fecha_nacimiento) camposFaltantes.push('fecha de nacimiento');
      if (!formData.residencia) camposFaltantes.push('residencia');
      if (formData.es_extranjero) {
        if (!formData.tiempo_en_espana) camposFaltantes.push('tiempo en España');
        if (!formData.posibilidad_regreso) camposFaltantes.push('posibilidad de regreso');
        if (!formData.plan_con_animal) camposFaltantes.push('plan con el animal');
      }
      if (camposFaltantes.length > 0) {
        return `Faltan campos por completar: ${camposFaltantes.join(', ')}`;
      }
    }
    if (paso === 2) {
      const camposFaltantes = [];
      if (!formData.tipo_vivienda) camposFaltantes.push('tipo de vivienda');
      if (!formData.metros_cuadrados) camposFaltantes.push('metros cuadrados');
      if (!formData.personas_hogar) camposFaltantes.push('número de personas');
      if (!formData.lugar_dormir) camposFaltantes.push('lugar donde dormirá');
      if (!formData.ocupaciones_horarios) camposFaltantes.push('ocupaciones y horarios');
      if (!formData.actividades) camposFaltantes.push('actividades');
      if (!formData.problema_ladridos) camposFaltantes.push('opinión sobre ladridos');
      if (!formData.plan_mudanza) camposFaltantes.push('plan de mudanza');
      if (camposFaltantes.length > 0) {
        return `Faltan campos por completar en Vivienda y Familia: ${camposFaltantes.join(', ')}`;
      }
    }
    if (paso === 3) {
      const camposFaltantes = [];
      if (!formData.necesidades_perro) camposFaltantes.push('necesidades del perro');
      if (!formData.acepta_cambios_estimacion) camposFaltantes.push('aceptar diferencias de tamaño/edad');
      if (!formData.relacion_con_perros) camposFaltantes.push('relación con otros perros');
      if (!formData.gestion_problemas_conducta) camposFaltantes.push('gestión de problemas de conducta');
      if (camposFaltantes.length > 0) {
        return `Faltan campos por completar en Cuidado del Animal: ${camposFaltantes.join(', ')}`;
      }
    }
    if (paso === 4) {
      const camposFaltantes = [];
      if (!formData.ha_tenido_animales) camposFaltantes.push('has tenido animales antes');
      if (!formData.ha_visitado_refugio) camposFaltantes.push('has visitado un refugio');
      if (!formData.adoptaria_otro_animal) camposFaltantes.push('adoptarías otro animal');
      if (!formData.como_conocio) camposFaltantes.push('cómo nos conociste');
      if (formData.acepta_seguimiento !== true) return 'Debes aceptar el seguimiento post-adopción';
      if (formData.acepta_tasa_adopcion !== true) return 'Debes aceptar la tasa de adopción';
      if (camposFaltantes.length > 0) {
        return `Faltan campos por completar: ${camposFaltantes.join(', ')}`;
      }
    }
    return 'Faltan campos por completar';
  };

  const handleSiguiente = () => {
    if (validarPaso(pasoActual)) {
      setPasoActual(prev => prev + 1);
      window.scrollTo(0, 0);
    } else {
      alert(getErrorMessage(pasoActual));
    }
  };

  const handleAtras = () => {
    setPasoActual(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.acepta_seguimiento !== true) {
      alert('Debes aceptar el seguimiento post-adopción para enviar la solicitud');
      return;
    }
    if (formData.acepta_tasa_adopcion !== true) {
      alert('Debes aceptar la tasa de adopción para enviar la solicitud');
      return;
    }
    setEnviando(true);
    setError(null);
    
    try {
      await animalApi.crearSolicitud(animalId, formData);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Error al enviar la solicitud');
    } finally {
      setEnviando(false);
    }
  };

  if (loading) {
    return (
      <>
        <PageHeader title="Formulario de Adopción" subtitle="Cargando..." />
        <section className={styles.formSection}>
          <div className="container">
            <div className={styles.loading}>Cargando datos del animal...</div>
          </div>
        </section>
      </>
    );
  }

  if (success) {
    return (
      <>
        <PageHeader title={<><span className="material-symbols-outlined">check_circle</span> Solicitud Enviada</>} subtitle="Gracias por tu interés en adoptar" />
        <section className={styles.formSection}>
          <div className="container">
            <div className={styles.successMessage}>
              <div className={styles.successIcon}>🎉</div>
              <h3>Tu solicitud ha sido enviada correctamente</h3>
              <p>Hemos recibido tu formulario de adopción. El equipo de Flacuchos revisará tu solicitud y te contactaremos pronto.</p>
              <p>Mientras tanto, puedes:</p>
              <div className={styles.successLinks}>
                <Link to="/adopciones" className="btn btn-primary">Ver más animales</Link>
                <Link to="/perfil" className="btn btn-secondary">Ver mis solicitudes</Link>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  const pasos = [
    { num: 0, titulo: 'Antes de comenzar', icon: 'info' },
    { num: 1, titulo: 'Datos Personales', icon: 'person' },
    { num: 2, titulo: 'Vivienda y Familia', icon: 'home' },
    { num: 3, titulo: 'Cuidado del Animal', icon: 'pets' },
    { num: 4, titulo: 'Historial y Compromiso', icon: 'verified' }
  ];

  return (
    <>
      <PageHeader title="Solicitud de Adopción" subtitle={`Adoptando a ${animal?.nombre}`} />

      <section className={styles.formSection}>
        <div className="container">
          {animal && (
            <div className={styles.animalPreview}>
              <div className={styles.animalImage}>
                {animal.imagen_url ? (
                  <img src={animal.imagen_url} alt={animal.nombre} />
                ) : <span className="material-symbols-outlined">pets</span>}
              </div>
              <div className={styles.animalInfo}>
                <h3>{animal.nombre}</h3>
                <p>{animal.edad} • {animal.tamano}</p>
                {animal.caracter && <p className={styles.caracter}>{animal.caracter}</p>}
              </div>
            </div>
          )}

          <div className={styles.progressBar}>
            {pasos.map((p) => (
              <div 
                key={p.num} 
                className={`${styles.progressStep} ${pasoActual >= p.num ? styles.active : ''} ${pasoActual === p.num ? styles.current : ''}`}
              >
                <div className={styles.progressIcon}><span className="material-symbols-outlined">{p.icon}</span></div>
                <div className={styles.progressLabel}>
                  <span className={styles.progressNum}>Paso {p.num}</span>
                  <span className={styles.progressTitle}>{p.titulo}</span>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.error}>{error}</div>}

            {pasoActual === 0 && (
              <div className={styles.pasoContent}>
                <h3 className={styles.sectionTitle}><span className="material-symbols-outlined">info</span> Antes de Comenzar</h3>
                
                <div className={styles.requisitosContainer}>
                  <div className={styles.requisitoSection}>
                    <h4><span className="material-symbols-outlined">favorite</span> Requisitos adopción responsable</h4>
                    <ul>
                      <li>Ser amantes de los animales</li>
                      <li>Ser mayor de edad</li>
                      <li>Tener estabilidad personal y económica</li>
                      <li>Compromiso para cuidar al animal durante toda su vida</li>
                    </ul>
                  </div>

                  <div className={styles.requisitoSection}>
                    <h4><span className="material-symbols-outlined">home</span> Vivienda</h4>
                    <ul>
                      <li>Una vivienda adecuada donde se permitan animales</li>
                      <li>Si es de alquiler, autorización del propietario</li>
                      <li>El animal vivirá dentro de la casa (no en patios, terrazas o encadenados)</li>
                      <li>Disponer de tiempo diario para paseos, juegos y atención necesaria</li>
                      <li>No dejar solo al animal durante largos periodos de forma habitual</li>
                    </ul>
                  </div>

                  <div className={styles.requisitoSection}>
                    <h4><span className="material-symbols-outlined">payments</span> Responsabilidad económica</h4>
                    <p className={styles.requisitoDesc}>Que puede asumir gastos de:</p>
                    <ul>
                      <li>Veterinario</li>
                      <li>Alimentación, vacunas y urgencias</li>
                    </ul>
                  </div>

                  <div className={styles.requisitoSection}>
                    <h4><span className="material-symbols-outlined">volunteer_activism</span> Compromiso con el bienestar animal</h4>
                    <ul>
                      <li>Trato respetuoso sin castigos físicos</li>
                      <li>Educación en positivo</li>
                      <li>Proporcionar ejercicio y socialización</li>
                    </ul>
                  </div>

                  <div className={styles.requisitoSection}>
                    <h4><span className="material-symbols-outlined">medical_services</span> Obligaciones sanitarias</h4>
                    <p className={styles.requisitoDesc}>Aceptación a la entrega del animal:</p>
                    <ul>
                      <li>Microchip</li>
                      <li>Vacunado y desparasitado</li>
                      <li>Esterilizado (o compromiso de hacerlo)</li>
                      <li>Firma del contrato</li>
                    </ul>
                  </div>

                  <div className={styles.requisitoSection}>
                    <h4><span className="material-symbols-outlined">shield</span> Compromisos adicionales</h4>
                    <ul>
                      <li>No ceder al animal y no abandonarlo</li>
                      <li>Informar en caso de no poder cuidarlo</li>
                      <li>Permitir un seguimiento por parte de la protectora</li>
                    </ul>
                  </div>

                  <div className={styles.requisitoSection}>
                    <h4><span className="material-symbols-outlined">route</span> Proceso de adopción</h4>
                    <ul>
                      <li>Completar formulario</li>
                      <li>Pasar entrevista telefónica o presencial</li>
                      <li>Posible visita pre/post adopción</li>
                    </ul>
                  </div>
                </div>

                <div className={styles.adoptionMessage}>
                  <span className="material-symbols-outlined">lightbulb</span>
                  <p><strong>Adoptar es un acto de responsabilidad y amor.</strong> Buscamos familias comprometidas que entiendan que un animal no es un objeto, sino un miembro más de la familia.</p>
                </div>
                
              </div>
            )}

            {pasoActual === 1 && (
              <div className={styles.pasoContent}>
                <h3 className={styles.sectionTitle}><span className="material-symbols-outlined">person</span> Datos Personales</h3>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label htmlFor="nombre_completo">Nombre completo *</label>
                    <input
                      type="text"
                      id="nombre_completo"
                      name="nombre_completo"
                      value={formData.nombre_completo}
                      onChange={handleChange}
                      required
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="fecha_nacimiento">Fecha de nacimiento *</label>
                    <input
                      type="date"
                      id="fecha_nacimiento"
                      name="fecha_nacimiento"
                      value={formData.fecha_nacimiento}
                      onChange={handleChange}
                      required
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="residencia">Dirección de residencia *</label>
                    <input
                      type="text"
                      id="residencia"
                      name="residencia"
                      value={formData.residencia}
                      onChange={handleChange}
                      required
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="telefono">Teléfono *</label>
                    <input
                      type="text"
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        setFormData(prev => ({ ...prev, telefono: value }));
                      }}
                      required
                      maxLength={9}
                      minLength={9}
                      placeholder="Ej: 612345678"
                      title="Introduce un número de teléfono válido de 9 dígitos"
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="redes_sociales">Redes sociales (opcional)</label>
                    <input
                      type="text"
                      id="redes_sociales"
                      name="redes_sociales"
                      value={formData.redes_sociales}
                      onChange={handleChange}
                      placeholder="Instagram, Facebook, etc."
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        name="es_extranjero"
                        checked={formData.es_extranjero}
                        onChange={handleChange}
                      />
                      ¿Eres extranjero?
                    </label>
                  </div>

                  {formData.es_extranjero && (
                    <>
                      <div className={styles.formGroup}>
                        <label htmlFor="tiempo_en_espana">¿Cuánto tiempo llevas en España? *</label>
                        <input
                          type="text"
                          id="tiempo_en_espana"
                          name="tiempo_en_espana"
                          value={formData.tiempo_en_espana}
                          onChange={handleChange}
                          required
                          className={styles.input}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label htmlFor="posibilidad_regreso">¿Existe la posibilidad de que vuelvas a tu país de origen? *</label>
                        <select
                          id="posibilidad_regreso"
                          name="posibilidad_regreso"
                          value={formData.posibilidad_regreso}
                          onChange={handleChange}
                          required
                          className={styles.select}
                        >
                          <option value="">Selecciona...</option>
                          <option value="si">Sí</option>
                          <option value="no">No</option>
                          <option value="quiza">Quizás</option>
                        </select>
                      </div>

                      <div className={styles.formGroup}>
                        <label htmlFor="plan_con_animal">¿Qué harías con el animal en ese caso? *</label>
                        <textarea
                          id="plan_con_animal"
                          name="plan_con_animal"
                          value={formData.plan_con_animal}
                          onChange={handleChange}
                          required
                          rows={3}
                          className={styles.textarea}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {pasoActual === 2 && (
              <div className={styles.pasoContent}>
                <h3 className={styles.sectionTitle}><span className="material-symbols-outlined">home</span> Vivienda y Familia</h3>
                
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label htmlFor="tipo_vivienda">Tipo de vivienda *</label>
                    <select
                      id="tipo_vivienda"
                      name="tipo_vivienda"
                      value={formData.tipo_vivienda}
                      onChange={handleChange}
                      required
                      className={styles.select}
                    >
                      <option value="">Selecciona...</option>
                      <option value="piso">Piso</option>
                      <option value="casa">Casa</option>
                      <option value="apartamento">Apartamento</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="metros_cuadrados">Metros cuadrados *</label>
                    <input
                      type="text"
                      id="metros_cuadrados"
                      name="metros_cuadrados"
                      value={formData.metros_cuadrados}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        setFormData(prev => ({ ...prev, metros_cuadrados: value }));
                      }}
                      required
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        name="es_alquiler"
                        checked={formData.es_alquiler}
                        onChange={handleChange}
                      />
                      ¿Vives de alquiler?
                    </label>
                  </div>

                  {formData.es_alquiler && (
                    <div className={styles.formGroup}>
                      <label htmlFor="permiso_propietario">¿Tienes permiso del propietario?</label>
                      <select
                        id="permiso_propietario"
                        name="permiso_propietario"
                        value={formData.permiso_propietario}
                        onChange={handleChange}
                        className={styles.select}
                      >
                        <option value="">Selecciona...</option>
                        <option value="si">Sí, tengo permiso escrito</option>
                        <option value="si_oral">Sí, tengo permiso oral</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                  )}

                  <div className={styles.formGroup}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        name="tiene_exterior"
                        checked={formData.tiene_exterior}
                        onChange={handleChange}
                      />
                      ¿Tienes espacio exterior?
                    </label>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="lugar_dormir">¿Dónde dormirá el animal? *</label>
                    <input
                      type="text"
                      id="lugar_dormir"
                      name="lugar_dormir"
                      value={formData.lugar_dormir}
                      onChange={handleChange}
                      required
                      className={styles.input}
                      placeholder="Interior, exterior, habitación..."
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="personas_hogar">Número de personas en el hogar *</label>
                    <input
                      type="text"
                      id="personas_hogar"
                      name="personas_hogar"
                      value={formData.personas_hogar}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        setFormData(prev => ({ ...prev, personas_hogar: value }));
                      }}
                      required
                      min="1"
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="convivencia_aceptada">¿Todos aceptan la adopción?</label>
                    <select
                      id="convivencia_aceptada"
                      name="convivencia_aceptada"
                      value={formData.convivencia_aceptada}
                      onChange={handleChange}
                      className={styles.select}
                    >
                      <option value="">Selecciona...</option>
                      <option value="si">Sí, todos están de acuerdo</option>
                      <option value="no">Algunos tienen dudas</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="posibilidad_bebe">¿Posibilidad de tener hijos?</label>
                    <select
                      id="posibilidad_bebe"
                      name="posibilidad_bebe"
                      value={formData.posibilidad_bebe}
                      onChange={handleChange}
                      className={styles.select}
                    >
                      <option value="">Selecciona...</option>
                      <option value="si">Sí</option>
                      <option value="no">No</option>
                      <option value="sin_decidir">Aún no lo hemos decidido</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        name="ha_tenido_animales"
                        checked={formData.ha_tenido_animales}
                        onChange={handleChange}
                      />
                      ¿Has tenido animales antes?
                    </label>
                  </div>

                  {formData.ha_tenido_animales === 'si' && (
                    <>
                      <div className={styles.formGroup}>
                        <label htmlFor="edad_animales">¿Qué edad tienen o tenían?</label>
                        <input
                          type="text"
                          id="edad_animales"
                          name="edad_animales"
                          value={formData.edad_animales}
                          onChange={handleChange}
                          className={styles.input}
                          placeholder="Ej: 5 años, 12 años..."
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label htmlFor="motivo_perdida">¿Qué pasó con esos animales? ¿Por qué ya no están contigo?</label>
                        <textarea
                          id="motivo_perdida"
                          name="motivo_perdida"
                          value={formData.motivo_perdida}
                          onChange={handleChange}
                          className={styles.textarea}
                          rows="2"
                          placeholder="Fallecimiento, cambio de domicilio, etc."
                        />
                      </div>
                    </>
                  )}

                  <div className={styles.formGroup}>
                    <label htmlFor="ocupaciones_horarios">¿A qué se dedica cada persona de la unidad familiar? ¿En qué horarios? *</label>
                    <textarea
                      id="ocupaciones_horarios"
                      name="ocupaciones_horarios"
                      value={formData.ocupaciones_horarios}
                      onChange={handleChange}
                      required
                      rows={2}
                      className={styles.textarea}
                      placeholder="Ej: Juan trabaja de 9 a 17h, María estudia por las mañanas..."
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="parentesco_personas">¿Qué otras personas viven en el domicilio? (Parentesco, edad, carácter)</label>
                    <textarea
                      id="parentesco_personas"
                      name="parentesco_personas"
                      value={formData.parentesco_personas}
                      onChange={handleChange}
                      rows={2}
                      className={styles.textarea}
                      placeholder="Ej: Mi madre (60 años, jubilada), mi hijo (12 años, sociable)..."
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="problema_ladridos">Los perros pueden ladrar, ¿puede ser un problema para la convivencia con los vecinos? *</label>
                    <select
                      id="problema_ladridos"
                      name="problema_ladridos"
                      value={formData.problema_ladridos}
                      onChange={handleChange}
                      required
                      className={styles.select}
                    >
                      <option value="">Selecciona...</option>
                      <option value="si">Sí, podría ser un problema</option>
                      <option value="no">No, tengo paciencia y buscaré soluciones</option>
                    </select>
                  </div>

                  {formData.problema_ladridos === 'si' && (
                    <div className={styles.formGroup}>
                      <label htmlFor="solucion_ladridos">¿Qué solución le darías?</label>
                      <textarea
                        id="solucion_ladridos"
                        name="solucion_ladridos"
                        value={formData.solucion_ladridos}
                        onChange={handleChange}
                        rows={2}
                        className={styles.textarea}
                      />
                    </div>
                  )}

                  <div className={styles.formGroup}>
                    <label htmlFor="plan_mudanza">En caso de que exista la posibilidad de mudanza durante la vida del perro, ¿qué pasaría con él? *</label>
                    <textarea
                      id="plan_mudanza"
                      name="plan_mudanza"
                      value={formData.plan_mudanza}
                      onChange={handleChange}
                      required
                      rows={2}
                      className={styles.textarea}
                      placeholder="Me lo llevaría, buscaría vivienda que permita animales, etc."
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="actividades">¿Qué actividades compartirás con el perro? *</label>
                    <textarea
                      id="actividades"
                      name="actividades"
                      value={formData.actividades}
                      onChange={handleChange}
                      required
                      rows={2}
                      className={styles.textarea}
                      placeholder="Paseos, juegos, entrenamiento, etc."
                    />
                  </div>

                  {formData.posibilidad_bebe === 'si' && (
                    <div className={styles.formGroup}>
                      <label htmlFor="opinion_convivencia_bebes">¿Qué piensas de la convivencia entre animales y bebés?</label>
                      <textarea
                        id="opinion_convivencia_bebes"
                        name="opinion_convivencia_bebes"
                        value={formData.opinion_convivencia_bebes}
                        onChange={handleChange}
                        rows={2}
                        className={styles.textarea}
                      />
                    </div>
                  )}

                  <div className={styles.formGroup}>
                    <label htmlFor="restricciones_vivienda">¿Tendrá prohibida la entrada a alguna zona de la vivienda?</label>
                    <input
                      type="text"
                      id="restricciones_vivienda"
                      name="restricciones_vivienda"
                      value={formData.restricciones_vivienda}
                      onChange={handleChange}
                      placeholder="Ej: Cocina, dormitorios..."
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="tipo_cama">¿Qué tipo de cama terá el perro?</label>
                    <input
                      type="text"
                      id="tipo_cama"
                      name="tipo_cama"
                      value={formData.tipo_cama}
                      onChange={handleChange}
                      placeholder="Cama, manta, sofá..."
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="en_separacion_quien_cuida">En caso de que la unidad familiar se divida, ¿con quién se quedaría el animal?</label>
                    <input
                      type="text"
                      id="en_separacion_quien_cuida"
                      name="en_separacion_quien_cuida"
                      value={formData.en_separacion_quien_cuida}
                      onChange={handleChange}
                      className={styles.input}
                    />
                  </div>
                </div>
              </div>
            )}

            {pasoActual === 3 && (
              <div className={styles.pasoContent}>
                <h3 className={styles.sectionTitle}><span className="material-symbols-outlined">pets</span> Cuidados y Compromisos</h3>
                
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label htmlFor="paseos_dia">Número de paseos al día *</label>
                    <input
                      type="text"
                      id="paseos_dia"
                      name="paseos_dia"
                      value={formData.paseos_dia}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        setFormData(prev => ({ ...prev, paseos_dia: value }));
                      }}
                      required
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="duracion_paseos">Duración de cada paseo</label>
                    <input
                      type="text"
                      id="duracion_paseos"
                      name="duracion_paseos"
                      value={formData.duracion_paseos}
                      onChange={handleChange}
                      placeholder="Ej: 30 minutos, 1 hora..."
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="horas_solo">Horas solo al día *</label>
                    <input
                      type="text"
                      id="horas_solo"
                      name="horas_solo"
                      value={formData.horas_solo}
                      onChange={handleChange}
                      required
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="tipo_alimentacion">Tipo de alimentación</label>
                    <input
                      type="text"
                      id="tipo_alimentacion"
                      name="tipo_alimentacion"
                      value={formData.tipo_alimentacion}
                      onChange={handleChange}
                      placeholder="Piensa seca, húmeda, casera..."
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="vacaciones_cuidado">¿Qué harás en vacaciones?</label>
                    <textarea
                      id="vacaciones_cuidado"
                      name="vacaciones_cuidado"
                      value={formData.vacaciones_cuidado}
                      onChange={handleChange}
                      className={styles.textarea}
                      rows="2"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="coste_veterinario_opinion">Opinion sobre costes veterinarios</label>
                    <select
                      id="coste_veterinario_opinion"
                      name="coste_veterinario_opinion"
                      value={formData.coste_veterinario_opinion}
                      onChange={handleChange}
                      className={styles.select}
                    >
                      <option value="">Selecciona...</option>
                      <option value="asumo">Los asumo sin problema</option>
                      <option value="ajustado">Podría tener dificultades</option>
                      <option value="preocupado">Me preocupa</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="puede_asumir_costes">¿Puedes asumir costes de vacunación/esterilización? *</label>
                    <select
                      id="puede_asumir_costes"
                      name="puede_asumir_costes"
                      value={formData.puede_asumir_costes}
                      onChange={handleChange}
                      required
                      className={styles.select}
                    >
                      <option value="">Selecciona...</option>
                      <option value="si">Sí</option>
                      <option value="no">No</option>
                      <option value="ayuda">Necesitaría ayuda</option>
                    </select>
                  </div>

                  {formData.puede_asumir_costes === 'no' && (
                    <div className={styles.formGroup}>
                      <label htmlFor="alternativa_costes">¿Qué alternativa tomarías?</label>
                      <textarea
                        id="alternativa_costes"
                        name="alternativa_costes"
                        value={formData.alternativa_costes}
                        onChange={handleChange}
                        rows={2}
                        className={styles.textarea}
                      />
                    </div>
                  )}

                  <div className={styles.formGroup}>
                    <label htmlFor="necesidades_perro">¿Qué necesidades crees que tiene un perro? *</label>
                    <textarea
                      id="necesidades_perro"
                      name="necesidades_perro"
                      value={formData.necesidades_perro}
                      onChange={handleChange}
                      required
                      rows={2}
                      className={styles.textarea}
                      placeholder="Comida, ejercicio, compañía, veterinario..."
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="cuando_veterinario">¿Cuándo crees que es necesario hacer una visita al veterinario?</label>
                    <input
                      type="text"
                      id="cuando_veterinario"
                      name="cuando_veterinario"
                      value={formData.cuando_veterinario}
                      onChange={handleChange}
                      placeholder="Revisiones, enfermedad, vacunación..."
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="acepta_cambios_estimacion">¿Habría algún inconveniente en que el tamaño o edad fuera diferente a lo estimado? *</label>
                    <select
                      id="acepta_cambios_estimacion"
                      name="acepta_cambios_estimacion"
                      value={formData.acepta_cambios_estimacion}
                      onChange={handleChange}
                      required
                      className={styles.select}
                    >
                      <option value="">Selecciona...</option>
                      <option value="si">No, lo acepto</option>
                      <option value="no">Sí, me importa</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="relacion_con_perros">¿Crees que es positivo que tu perro tenga relación con otros perros? *</label>
                    <select
                      id="relacion_con_perros"
                      name="relacion_con_perros"
                      value={formData.relacion_con_perros}
                      onChange={handleChange}
                      required
                      className={styles.select}
                    >
                      <option value="">Selecciona...</option>
                      <option value="si">Sí, es importante</option>
                      <option value="no">Prefiero que no tenga</option>
                      <option value="indiferente">Me es indiferente</option>
                    </select>
                  </div>

                  {formData.relacion_con_perros === 'si' && (
                    <div className={styles.formGroup}>
                      <label htmlFor="motivo_socializacion">¿Por qué?</label>
                      <textarea
                        id="motivo_socializacion"
                        name="motivo_socializacion"
                        value={formData.motivo_socializacion}
                        onChange={handleChange}
                        rows={2}
                        className={styles.textarea}
                      />
                    </div>
                  )}

                  <div className={styles.formGroup}>
                    <label htmlFor="gestion_problemas_conducta">El carácter de los perros puede ser diferente al esperado. En caso de que el comportamiento no fuera el deseado, ¿de qué manera tratarías el tema? *</label>
                    <textarea
                      id="gestion_problemas_conducta"
                      name="gestion_problemas_conducta"
                      value={formData.gestion_problemas_conducta}
                      onChange={handleChange}
                      required
                      rows={2}
                      className={styles.textarea}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="problema_necesidades">Los animales en su mayoría vienen de un refugio, la mayoría nunca han estado en una casa. ¿Sabes que es posible que no sepa hacer sus necesidades en la calle? ¿Sería un problema? ¿Cómo trabajarías este aspecto?</label>
                    <textarea
                      id="problema_necesidades"
                      name="problema_necesidades"
                      value={formData.problema_necesidades}
                      onChange={handleChange}
                      rows={2}
                      className={styles.textarea}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="opinion_esterilizacion">Con respecto a la esterilización de un animal, ¿cuál es tu opinión? ¿Esterilizarás al perro?</label>
                    <textarea
                      id="opinion_esterilizacion"
                      name="opinion_esterilizacion"
                      value={formData.opinion_esterilizacion}
                      onChange={handleChange}
                      rows={2}
                      className={styles.textarea}
                    />
                  </div>

                  {formData.opinion_esterilizacion && formData.opinion_esterilizacion.includes('sí') && (
                    <div className={styles.formGroup}>
                      <label htmlFor="plan_esterilizacion">En caso de hacerlo, ¿en qué momento lo harías?</label>
                      <input
                        type="text"
                        id="plan_esterilizacion"
                        name="plan_esterilizacion"
                        value={formData.plan_esterilizacion}
                        onChange={handleChange}
                        className={styles.input}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {pasoActual === 4 && (
              <div className={styles.pasoContent}>
                <h3 className={styles.sectionTitle}><span className="material-symbols-outlined">verified</span> Historial y Compromiso</h3>
                
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label htmlFor="ha_tenido_animales">¿Has tenido o tienes algún otro animal? *</label>
                    <select
                      id="ha_tenido_animales"
                      name="ha_tenido_animales"
                      value={formData.ha_tenido_animales}
                      onChange={handleChange}
                      required
                      className={styles.select}
                    >
                      <option value="">Selecciona...</option>
                      <option value="si">Sí</option>
                      <option value="no">No</option>
                    </select>
                  </div>

                  {formData.ha_tenido_animales === 'si' && (
                    <>
                      <div className={styles.formGroup}>
                        <label htmlFor="edad_animales">¿Cuántos años tienen o han llegado a tener?</label>
                        <input
                          type="text"
                          id="edad_animales"
                          name="edad_animales"
                          value={formData.edad_animales}
                          onChange={handleChange}
                          className={styles.input}
                          placeholder="Ej: 8 años, 12 años..."
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label htmlFor="motivo_perdida">En caso de que ya no estén, ¿cuál fue el motivo que hizo que ya no estén contigo?</label>
                        <textarea
                          id="motivo_perdida"
                          name="motivo_perdida"
                          value={formData.motivo_perdida}
                          onChange={handleChange}
                          rows={2}
                          className={styles.textarea}
                        />
                      </div>
                    </>
                  )}

                  <div className={styles.formGroup}>
                    <label htmlFor="ha_visitado_refugio">¿Has visitado algún refugio? *</label>
                    <select
                      id="ha_visitado_refugio"
                      name="ha_visitado_refugio"
                      value={formData.ha_visitado_refugio}
                      onChange={handleChange}
                      required
                      className={styles.select}
                    >
                      <option value="">Selecciona...</option>
                      <option value="si">Sí</option>
                      <option value="no">No</option>
                    </select>
                  </div>

                  {formData.ha_visitado_refugio === 'si' && (
                    <div className={styles.formGroup}>
                      <label htmlFor="nombre_refugio">¿Podrías nombrarlo? ¿Qué te pareció?</label>
                      <textarea
                        id="nombre_refugio"
                        name="nombre_refugio"
                        value={formData.nombre_refugio}
                        onChange={handleChange}
                        rows={2}
                        className={styles.textarea}
                      />
                    </div>
                  )}

                  <div className={styles.formGroup}>
                    <label htmlFor="motivos_devolucion">Selecciona los motivos por los que devolverías un animal adoptado:</label>
                    <textarea
                      id="motivos_devolucion"
                      name="motivos_devolucion"
                      value={formData.motivos_devolucion}
                      onChange={handleChange}
                      rows={3}
                      className={styles.textarea}
                      placeholder="Agresividad, ladridos, rompe cosas, llegada de bebé, nueva vivienda no acepta animales, me mudo a otro país, no lo devolvería nunca, otro..."
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="adoptaria_otro_animal">Normalmente recibimos varios cuestionarios para un mismo animal. En caso de que tu cuestionario sea favorable pero por motivos de orden de llegada el animal finalmente sea adoptado por otra persona, ¿estarías dispuesto a adoptar a alguno de nuestros otros perros? *</label>
                    <select
                      id="adoptaria_otro_animal"
                      name="adoptaria_otro_animal"
                      value={formData.adoptaria_otro_animal}
                      onChange={handleChange}
                      required
                      className={styles.select}
                    >
                      <option value="">Selecciona...</option>
                      <option value="si">Sí, me interesa</option>
                      <option value="no">No, solo me interesa este</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="como_conocio">¿Cómo nos has conocido? *</label>
                    <select
                      id="como_conocio"
                      name="como_conocio"
                      value={formData.como_conocio}
                      onChange={handleChange}
                      required
                      className={styles.select}
                    >
                      <option value="">Selecciona...</option>
                      <option value="redes">Redes sociales (Facebook, Instagram)</option>
                      <option value="web">Buscador web (Google)</option>
                      <option value="amigos">Recomendación de amigos/familia</option>
                      <option value="voluntario">Soy voluntario de la protectora</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                </div>

                <div className={styles.commitments}>
                  <h4 className={styles.commitmentsTitle}><span className="material-symbols-outlined">check_circle</span> Compromisos de adopción *</h4>
                  
                  <div className={styles.commitmentItem}>
                    <label className={`${styles.checkboxLabel} ${styles.required}`}>
                      <input
                        type="checkbox"
                        name="acepta_seguimiento"
                        checked={formData.acepta_seguimiento}
                        onChange={handleChange}
                        required
                      />
                      Acepto pasar una entrevista telefónica o presencial con la protectora
                    </label>
                  </div>

                  <div className={styles.commitmentItem}>
                    <label className={`${styles.checkboxLabel} ${styles.required}`}>
                      <input
                        type="checkbox"
                        name="acepta_tasa_adopcion"
                        checked={formData.acepta_tasa_adopcion}
                        onChange={handleChange}
                        required
                      />
                      Acepto una posible visita pre/post adopción por parte de la protectora
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div className={styles.formActions}>
              {pasoActual > 0 && (
                <button 
                  type="button" 
                  onClick={handleAtras}
                  className="btn btn-secondary"
                >
                  Atrás
                </button>
              )}
              
              {pasoActual < 4 ? (
                <button 
                  type="button" 
                  onClick={handleSiguiente}
                  className="btn btn-primary"
                >
                  Siguiente
                </button>
              ) : (
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={enviando}
                >
                  {enviando ? 'Enviando...' : 'Enviar Solicitud'}
                </button>
              )}
              
              <Link to="/adopciones" className="btn btn-outline">
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}

export default FormularioAdopcion;