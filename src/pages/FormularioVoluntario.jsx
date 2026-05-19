import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { voluntarioApi } from '../api/api';
import PageHeader from '../components/PageHeader';
import styles from './FormularioVoluntario.module.css';

const DIAS_SEMANA = [
  { id: 'lunes', label: 'Lunes' },
  { id: 'martes', label: 'Martes' },
  { id: 'miercoles', label: 'Miércoles' },
  { id: 'jueves', label: 'Jueves' },
  { id: 'viernes', label: 'Viernes' },
  { id: 'sabado', label: 'Sábado' },
  { id: 'domingo', label: 'Domingo' }
];

const HORARIOS = [
  { id: 'manana', label: 'Mañanas' },
  { id: 'tarde', label: 'Tardes' },
  { id: 'todo', label: 'Todo el día' }
];

const validarTelefono = (telefono) => {
  const regex = /^\d{9}$/;
  return regex.test(telefono);
};

const validarDNI = (dni) => {
  const nifRegex = /^[0-9]{8}[A-Z]$/;
  const nieRegex = /^[XYZxyz][0-9]{7}[A-Z]$/;
  
  if (nifRegex.test(dni)) {
    const letras = 'TRWAGMYFPDXBNJZSQVHLCKE';
    const numero = parseInt(dni.substring(0, 8), 10);
    const letraCalculada = letras[numero % 23];
    return dni[8] === letraCalculada;
  }
  
  if (nieRegex.test(dni)) {
    const letrasNie = 'XYZ';
    const numeroCompleto = dni.replace(/[XYZ]/i, (match) => letrasNie.indexOf(match.toUpperCase()));
    const letrasFinales = 'TRWAGMYFPDXBNJZSQVHLCKE';
    const numero = parseInt(numeroCompleto.substring(0, 8), 10);
    const letraCalculada = letrasFinales[numero % 23];
    return dni[8] === letraCalculada;
  }
  
  return false;
};

const formatearTelefono = (valor) => {
  return valor.replace(/\D/g, '').slice(0, 9);
};

const formatearDNI = (valor) => {
  const cleaned = valor.replace(/[^0-9A-Z]/g, '').toUpperCase();
  return cleaned.slice(0, 9);
};

function FormularioVoluntario() {
  const { isAuthenticated, user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    telefono: '',
    dni: '',
    disponibilidad_dias: [],
    disponibilidad_horario: '',
    tiene_vehiculo: false,
    motivacion: '',
    experiencia: '',
    comentarios: ''
  });

  const [errores, setErrores] = useState({
    telefono: '',
    dni: '',
    disponibilidad_dias: '',
    disponibilidad_horario: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'telefono') {
      const formatted = formatearTelefono(value);
      setFormData(prev => ({ ...prev, [name]: formatted }));
      if (formatted.length === 9 && !validarTelefono(formatted)) {
        setErrores(prev => ({ ...prev, telefono: 'El teléfono debe tener 9 dígitos' }));
      } else {
        setErrores(prev => ({ ...prev, telefono: '' }));
      }
    } else if (name === 'dni') {
      const formatted = formatearDNI(value);
      setFormData(prev => ({ ...prev, [name]: formatted }));
      if (formatted.length === 9 && !validarDNI(formatted)) {
        setErrores(prev => ({ ...prev, dni: 'El DNI/NIE no es válido' }));
      } else {
        setErrores(prev => ({ ...prev, dni: '' }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
      if (name === 'disponibilidad_horario') {
        setErrores(prev => ({ ...prev, disponibilidad_horario: '' }));
      }
    }
  };

  const handleCheckboxGroup = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }));
    if (field === 'disponibilidad_dias') {
      setErrores(prev => ({ ...prev, disponibilidad_dias: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nuevosErrores = {};
    let tieneErrores = false;

    if (!validarTelefono(formData.telefono)) {
      nuevosErrores.telefono = 'El teléfono debe tener 9 dígitos';
      tieneErrores = true;
    }

    if (!validarDNI(formData.dni)) {
      nuevosErrores.dni = 'El DNI/NIE no es válido';
      tieneErrores = true;
    }

    if (formData.disponibilidad_dias.length === 0) {
      nuevosErrores.disponibilidad_dias = 'Selecciona al menos un día';
      tieneErrores = true;
    }

    if (!formData.disponibilidad_horario) {
      nuevosErrores.disponibilidad_horario = 'Selecciona un horario';
      tieneErrores = true;
    }

    if (tieneErrores) {
      setErrores(nuevosErrores);
      return;
    }

    setLoading(true);
    setError('');

    try {
      await voluntarioApi.crearVoluntario(formData);
      await refreshUser();
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Error al enviar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <PageHeader
          title="Formulario de Voluntariado"
          subtitle="¡Únete a nuestro equipo de voluntarios!"
          variant="help"
        />
        <section className={styles.formSection}>
          <div className="container">
            <div className={styles.loginPrompt}>
              <span className="material-symbols-outlined">lock</span>
              <h3>Necesitas estar registrado</h3>
              <p>Para enviar tu solicitud de voluntariado, primero debes iniciar sesión o registrarte.</p>
              <div className={styles.loginButtons}>
                <Link to="/login?redirect=/voluntario" className={styles.btnPrimary}>Iniciar Sesión</Link>
                <Link to="/registro?redirect=/voluntario" className={styles.btnSecondary}>Registrarse</Link>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  if (user?.es_voluntario || user?.rol === 'admin') {
    const titulo = user?.rol === 'admin' ? 'Eres administrador' : 'Ya eres voluntario';
    const mensaje = user?.rol === 'admin' 
      ? 'Los voluntarios se gestionan desde el panel de administración' 
      : 'Ya formas parte de nuestro equipo de voluntarios.';
    
    return (
      <>
        <PageHeader title={titulo} variant="help" />
        <section className={styles.formSection}>
          <div className="container">
            <div className={styles.loginPrompt}>
              <span className="material-symbols-outlined">admin_panel_settings</span>
              <h3>{titulo}</h3>
              <p>{mensaje}</p>
              <div className={styles.loginButtons}>
                <Link to="/admin/ayudas?tab=voluntarios" className={styles.btnPrimary}>
                  Ver mi perfil
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
        <PageHeader title="Registro Completado" variant="help" />
        <section className={styles.formSection}>
          <div className="container">
            <div className={styles.successBox}>
              <span className="material-symbols-outlined" style={{ fontSize: '4rem', color: '#1976D2' }}>check_circle</span>
              <h2>¡Gracias por unirte como voluntario!</h2>
              <p>Tu registro se ha completado correctamente. Te hemos enviado un correo de confirmación.</p>
              <p>Nos pondremos en contacto contigo pronto.</p>
              <button onClick={() => navigate('/')} className={styles.submitBtn}>
                Volver al inicio
              </button>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Formulario de Voluntariado"
        subtitle="¡Únete a nuestro equipo y ayuda a los animales!"
        variant="help"
      />
      <section className={styles.formSection}>
        <div className="container">
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={`${styles.formSection} ${styles.formSectionFirst}`}>
              <h3 className={styles.sectionTitle}>
                <span className="material-symbols-outlined">person</span>
                Datos de Contacto
              </h3>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Nombre</label>
                  <input
                    type="text"
                    value={user?.nombre || ''}
                    disabled
                    className={styles.inputDisabled}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className={styles.inputDisabled}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Teléfono *</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="600123456"
                    className={errores.telefono ? styles.inputError : ''}
                    required
                  />
                  {errores.telefono && <span className={styles.errorText}>{errores.telefono}</span>}
                </div>
                <div className={styles.formGroup}>
                  <label>DNI/NIE *</label>
                  <input
                    type="text"
                    name="dni"
                    value={formData.dni}
                    onChange={handleChange}
                    placeholder="12345678A / X1234567L"
                    className={errores.dni ? styles.inputError : ''}
                    required
                  />
                  {errores.dni && <span className={styles.errorText}>{errores.dni}</span>}
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>
                <span className="material-symbols-outlined">schedule</span>
                Disponibilidad
              </h3>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Días disponibles *</label>
                  <div className={styles.daysGrid}>
                    {DIAS_SEMANA.map(dia => (
                      <label key={dia.id} className={`${styles.dayCheckbox} ${formData.disponibilidad_dias.includes(dia.id) ? styles.selected : ''}`}>
                        <input
                          type="checkbox"
                          checked={formData.disponibilidad_dias.includes(dia.id)}
                          onChange={() => handleCheckboxGroup('disponibilidad_dias', dia.id)}
                        />
                        <span>{dia.label}</span>
                      </label>
                    ))}
                  </div>
                  {errores.disponibilidad_dias && <span className={styles.errorText}>{errores.disponibilidad_dias}</span>}
                </div>
                <div className={styles.formGroup}>
                  <label>Horario preferido *</label>
                  <div className={styles.radioGroup}>
                    {HORARIOS.map(horario => (
                      <label key={horario.id} className={`${styles.radioOption} ${formData.disponibilidad_horario === horario.id ? styles.selected : ''}`}>
                        <input
                          type="radio"
                          name="disponibilidad_horario"
                          value={horario.id}
                          checked={formData.disponibilidad_horario === horario.id}
                          onChange={handleChange}
                        />
                        <span>{horario.label}</span>
                      </label>
                    ))}
                  </div>
                  {errores.disponibilidad_horario && <span className={styles.errorText}>{errores.disponibilidad_horario}</span>}
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>
                <span className="material-symbols-outlined">directions_car</span>
                Transporte
              </h3>
              <div className={styles.formGroup}>
                <label className={styles.checkboxVehicle}>
                  <input
                    type="checkbox"
                    name="tiene_vehiculo"
                    checked={formData.tiene_vehiculo}
                    onChange={handleChange}
                  />
                  <span className="material-symbols-outlined">directions_car</span>
                  <span>Tengo vehículo y disponibilidad para traslados</span>
                </label>
              </div>
            </div>

            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>
                <span className="material-symbols-outlined">psychology</span>
                Experiencia y Motivación
              </h3>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>¿Tienes experiencia con animales?</label>
                  <textarea
                    name="experiencia"
                    value={formData.experiencia}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Cuéntanos tu experiencia previa con animales..."
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>¿Por qué quieres ser voluntario/a?</label>
                  <textarea
                    name="motivacion"
                    value={formData.motivacion}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Cuéntanos tu motivación para unirte..."
                  />
                </div>
              </div>
            </div>

            <div className={styles.formSectionLast}>
              <div className={styles.formGroup}>
                <label>Comentarios adicionales</label>
                <textarea
                  name="comentarios"
                  value={formData.comentarios}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Cualquier información adicional que quieras añadir..."
                />
              </div>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.submitSection}>
              <button type="submit" disabled={loading} className={styles.submitBtn}>
                {loading ? 'Enviando...' : 'Registrarme como Voluntario'}
              </button>
              <p className={styles.finalPhrase}>
                "Tu tiempo y dedicación pueden hacer la diferencia en la vida de nuestros peludos."
              </p>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}

export default FormularioVoluntario;