import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { stripeApi, socioApi } from '../api/api';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PageHeader from '../components/PageHeader';
import CheckoutSocio from '../components/CheckoutSocio';
import styles from './FormularioSocio.module.css';

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

function FormularioSocio() {
  const { isAuthenticated, user } = useAuth();
  
  const [step, setStep] = useState(1);
  const [stripePromise, setStripePromise] = useState(null);
  const [config, setConfig] = useState(null);
  const [error] = useState(null);
  const [aportacion, setAportacion] = useState(10);
  const totalConComision = aportacion === 5 ? 5.35 : 10.50;
  const comisionMostrar = totalConComision - aportacion;
  const [errores, setErrores] = useState({});
  const [fueSocioEsteMes, setFueSocioEsteMes] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre_apellidos: user?.nombre || '',
    dni_nie: '',
    telefono: '',
    direccion: '',
    codigo_postal: '',
    ciudad_provincia: ''
  });

  useEffect(() => {
    (async () => {
      try {
        const cfg = await stripeApi.getConfig();
        setConfig(cfg);
        if (cfg.publishableKey) {
          setStripePromise(loadStripe(cfg.publishableKey));
        }
      } catch (err) {
        console.error('Error loading Stripe:', err);
      }
    })();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      (async () => {
        try {
          const result = await socioApi.checkFueSocioEsteMes();
          setFueSocioEsteMes(result.fueSocioEsteMes);
        } catch (err) {
          console.error('Error checking socio status:', err);
        }
      })();
    }
  }, [isAuthenticated, user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    let formattedValue = value;
    if (name === 'telefono') {
      formattedValue = value.replace(/[^0-9]/g, '').slice(0, 9);
    } else if (name === 'dni_nie') {
      formattedValue = value.replace(/[^0-9A-Z]/g, '').toUpperCase().slice(0, 9);
    } else if (name === 'codigo_postal') {
      formattedValue = value.replace(/[^0-9]/g, '').slice(0, 5);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : formattedValue
    }));
    
    if (errores[name]) {
      setErrores(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validarPaso1 = () => {
    const nuevosErrores = {};
    let tieneErrores = false;

    if (!formData.dni_nie?.trim()) {
      nuevosErrores.dni_nie = 'El DNI/NIE es requerido';
      tieneErrores = true;
    } else if (!validarDNI(formData.dni_nie)) {
      nuevosErrores.dni_nie = 'El DNI/NIE no es válido';
      tieneErrores = true;
    }

    if (!formData.telefono?.trim()) {
      nuevosErrores.telefono = 'El teléfono es requerido';
      tieneErrores = true;
    } else if (!validarTelefono(formData.telefono)) {
      nuevosErrores.telefono = 'El teléfono debe tener 9 dígitos';
      tieneErrores = true;
    }

    if (!formData.direccion?.trim()) {
      nuevosErrores.direccion = 'La dirección es requerida';
      tieneErrores = true;
    }

    if (!formData.codigo_postal?.trim()) {
      nuevosErrores.codigo_postal = 'El código postal es requerido';
      tieneErrores = true;
    } else if (formData.codigo_postal.length !== 5) {
      nuevosErrores.codigo_postal = 'El código postal debe tener 5 dígitos';
      tieneErrores = true;
    }

    if (!formData.ciudad_provincia?.trim()) {
      nuevosErrores.ciudad_provincia = 'La ciudad/provincia es requerida';
      tieneErrores = true;
    }

    setErrores(nuevosErrores);
    return !tieneErrores;
  };

  const handleContinuar = () => {
    if (!validarPaso1()) {
      return;
    }
    setStep(2);
    window.scrollTo(0, 0);
  };

  const handlePagoExitoso = () => {
    setStep(3);
  };

  if (!isAuthenticated) {
    return (
      <>
        <PageHeader 
          title="Formulario de Alta de Socio"
          subtitle="¡Únete a nuestra familia de socios!"
          variant="help"
        />
        <section className={styles.formSection}>
          <div className="container">
            <div className={styles.loginPrompt}>
              <span className="material-symbols-outlined">lock</span>
              <h3>Necesitas estar registrado</h3>
              <p>Para hacerte socio, primero debes iniciar sesión o registrarte.</p>
              <div className={styles.loginButtons}>
                <Link to="/login?redirect=/socio" className={styles.btnPrimary}>Iniciar Sesión</Link>
                <Link to="/registro?redirect=/socio" className={styles.btnSecondary}>Registrarse</Link>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  if (user?.es_socio || user?.rol === 'admin') {
    const titulo = user?.rol === 'admin' ? 'Eres administrador' : 'Ya eres socio';
    const mensaje = user?.rol === 'admin' 
      ? 'Los socios se gestionan desde el panel de administración' 
      : 'Ya formas parte de nuestra familia de socios.';
    const linkPerfil = user?.rol === 'admin' ? '/admin/ayudas?tab=socios' : '/perfil?tab=socio';
    
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
                <Link to={linkPerfil} className={styles.btnPrimary}>
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

  if (step === 3) {
    return (
      <>
        <PageHeader 
          title="¡Bienvenido Socio!"
          subtitle="Gracias por tu apoyo a Flacuchos" 
          variant="help"
        />
        <section className={styles.formSection}>
          <div className="container">
            <div className={styles.successMessage}>
              <h3>¡Te has convertido en socio de Flacuchos!</h3>
              <p>Tu aportación de {totalConComision.toFixed(2).replace('.', ',')}€/mes ({aportacion}€ + {comisionMostrar.toFixed(2).replace('.', ',')}€ comisión) es muy importante para nosotros.</p>
              <p>Gracias a personas como tú, podemos seguir rescatar y cuidar a los animales.</p>
              <div className={styles.successLinks}>
                <a href="/como-ayudar" className={styles.btnPrimary}>Volver a Cómo Ayudar</a>
                <a href="/perfil" className={styles.btnSecondary}>Ver mi perfil</a>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
<PageHeader 
          title="Formulario de Alta de Socio/a" 
          subtitle="¡Gracias por tu interés en colaborar con Flacuchos!" 
          variant="help"
        />

      <section className={styles.formSection}>
        <div className="container">
          <div className={styles.form}>
            {error && <div className={styles.error}>{error}</div>}

            {step === 1 && (
              <>
                <div className={styles.formSection}>
                  <h3 className={styles.sectionTitle}>
                    <span className="material-symbols-outlined">person</span>
                    Datos Personales
                  </h3>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label>Nombre y apellidos</label>
                      <input
                        type="text"
                        value={formData.nombre_apellidos}
                        disabled
                        className={styles.inputDisabled}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="dni_nie">DNI/NIE *</label>
                      <input
                        type="text"
                        id="dni_nie"
                        name="dni_nie"
                        value={formData.dni_nie}
                        onChange={handleChange}
                        required
                        className={`${styles.input} ${errores.dni_nie ? styles.inputError : ''}`}
                        placeholder="12345678A / X1234567L"
                      />
                      {errores.dni_nie && <span className={styles.errorText}>{errores.dni_nie}</span>}
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="telefono">Teléfono *</label>
                      <input
                        type="text"
                        id="telefono"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        required
                        maxLength={9}
                        placeholder="612345678"
                        className={`${styles.input} ${errores.telefono ? styles.inputError : ''}`}
                      />
                      {errores.telefono && <span className={styles.errorText}>{errores.telefono}</span>}
                    </div>
                  </div>
                </div>

                <div className={styles.formSection}>
                  <h3 className={styles.sectionTitle}>
                    <span className="material-symbols-outlined">home</span>
                    Dirección
                  </h3>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label htmlFor="direccion">Dirección completa *</label>
                      <input
                        type="text"
                        id="direccion"
                        name="direccion"
                        value={formData.direccion}
                        onChange={handleChange}
                        required
                        className={`${styles.input} ${errores.direccion ? styles.inputError : ''}`}
                        placeholder="Calle, número, piso..."
                      />
                      {errores.direccion && <span className={styles.errorText}>{errores.direccion}</span>}
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="codigo_postal">Código postal *</label>
                      <input
                        type="text"
                        id="codigo_postal"
                        name="codigo_postal"
                        value={formData.codigo_postal}
                        onChange={handleChange}
                        required
                        className={`${styles.input} ${errores.codigo_postal ? styles.inputError : ''}`}
                        placeholder="12345"
                      />
                      {errores.codigo_postal && <span className={styles.errorText}>{errores.codigo_postal}</span>}
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="ciudad_provincia">Ciudad / Provincia *</label>
                      <input
                        type="text"
                        id="ciudad_provincia"
                        name="ciudad_provincia"
                        value={formData.ciudad_provincia}
                        onChange={handleChange}
                        required
                        className={`${styles.input} ${errores.ciudad_provincia ? styles.inputError : ''}`}
                        placeholder="Madrid, Madrid"
                      />
                      {errores.ciudad_provincia && <span className={styles.errorText}>{errores.ciudad_provincia}</span>}
                    </div>
                  </div>
                </div>

                {fueSocioEsteMes && (
                  <div className={styles.warningBox}>
                    <span className="material-symbols-outlined">warning</span>
                    <div>
                      <p><strong>Atención:</strong> Ya has sido socio este mes.</p>
                      <p>Al confirmar, se te cobrará inmediatamente {totalConComision.toFixed(2).replace('.', ',')}€ ({aportacion}€ + {comisionMostrar.toFixed(2).replace('.', ',')}€ comisión) de forma recurrente.</p>
                    </div>
                  </div>
                )}

                <div className={styles.formSection}>
                  <h3 className={styles.sectionTitle}>
                    <span className="material-symbols-outlined">euro</span>
                    Cuota mensual
                  </h3>
                  <div className={styles.aportacionOptions}>
                    <label className={`${styles.radioLabel} ${aportacion === 5 ? styles.selected : ''}`}>
                      <input
                        type="radio"
                        name="aportacion"
                        value={5}
                        checked={aportacion === 5}
                        onChange={() => setAportacion(5)}
                      />
                      <span className={styles.radioContent}>
                        <span className={styles.radioAmount}>5 €</span>
                        <span className={styles.radioLabelText}>al mes (estudiante) — pagas 5,35€ (0,35€ comisión)</span>
                      </span>
                    </label>

                    <label className={`${styles.radioLabel} ${aportacion === 10 ? styles.selected : ''}`}>
                      <input
                        type="radio"
                        name="aportacion"
                        value={10}
                        checked={aportacion === 10}
                        onChange={() => setAportacion(10)}
                      />
                      <span className={styles.radioContent}>
                        <span className={styles.radioAmount}>10 €</span>
                        <span className={styles.radioLabelText}>al mes (socio adulto) — pagas 10,50€ (0,50€ comisión)</span>
                      </span>
                    </label>
                  </div>
                </div>

                <div className={styles.submitSection}>
                  <button 
                    type="button" 
                    onClick={handleContinuar}
                    className={styles.submitBtn}
                  >
                    Continuar al pago
                  </button>
                  <p className={styles.finalPhrase}>
                    "Con solo 5 € o 10 € al mes, estás ayudando directamente a salvar vidas."
                  </p>
                </div>
              </>
            )}

            {step === 2 && stripePromise && (
              <Elements stripe={stripePromise}>
                <CheckoutSocio 
                  amount={aportacion}
                  email={user?.email}
                  nombre={formData.nombre_apellidos}
                  datosPersonales={{
                    nombre_apellidos: formData.nombre_apellidos,
                    dni_nie: formData.dni_nie,
                    telefono: formData.telefono,
                    direccion: formData.direccion,
                    codigo_postal: formData.codigo_postal,
                    ciudad_provincia: formData.ciudad_provincia
                  }}
                  onSuccess={handlePagoExitoso}
                  onBack={() => setStep(1)}
                  priceId={config?.monthlyPrices?.[`price_${aportacion}`]}
                />
              </Elements>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export default FormularioSocio;