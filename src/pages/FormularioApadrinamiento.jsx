import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apadrinamientoApi, stripeApi } from '../api/api';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements, IbanElement } from '@stripe/react-stripe-js';
import PageHeader from '../components/PageHeader';
import styles from './FormularioApadrinamiento.module.css';

const PASOS = [
  { titulo: 'Animal', icon: 'pets' },
  { titulo: 'Datos', icon: 'person' },
  { titulo: 'Importe', icon: 'euro_symbol' },
  { titulo: 'Privacidad', icon: 'lock' },
  { titulo: 'Pago', icon: 'credit_card' }
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

const ibanOptions = { style: { base: { fontSize: '16px', color: '#424770' } }, supportedCountries: ['SEPA'] };

function PaymentForms({ importe, metodoPago, setMetodoPago, user, onSuccess, onError, setLoading, loading, onBack, envioPagoIniciado, paymentError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [sepaStep, setSepaStep] = useState(1);
  const [setupData, setSetupData] = useState(null);

  const handleCardSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    try {
      const email = user?.email;
      const nombre = user?.nombre || 'Usuario';

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/stripe/create-setup-intent-card`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            nombre,
            metadata: { tipo: 'apadrinamiento' }
          })
        }
      );
      const data = await response.json();

      if (data.error) {
        onError(data.error);
        setLoading(false);
        return;
      }

      if (!data.clientSecret || !data.setupIntentId) {
        onError('No se pudo iniciar el proceso. Por favor, intenta de nuevo.');
        setLoading(false);
        return;
      }

      const { clientSecret, customerId } = data;

      const { error: stripeError, setupIntent } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) }
      });

      if (stripeError) {
        if (stripeError.code === 'authentication_required' || stripeError.code === 'card_declined') {
          onError('La tarjeta ha sido rechazada. Por favor, prueba con otro método de pago.');
          setLoading(false);
          return;
        }
        onError(stripeError.message);
        setLoading(false);
        return;
      }

      if (setupIntent?.status === 'succeeded' || setupIntent?.status === 'processing') {
        setTimeout(() => {
          onSuccess(null, customerId, setupIntent?.payment_method);
        }, 2000);
      } else if (setupIntent?.status === 'requires_payment_method') {
        onError('No se pudo guardar el método de pago. Por favor, intenta de nuevo.');
        setLoading(false);
      }
    } catch (err) {
      onError(err.message || 'Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  const handleSEPASubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    try {
      if (sepaStep === 1) {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/stripe/create-setup-intent`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user?.email,
              metadata: { tipo: 'apadrinamiento' }
            })
          }
        );
        const result = await response.json();

        if (result.error) {
          onError(result.error);
          setLoading(false);
          return;
        }

        setSetupData(result);
        setSepaStep(2);
        setLoading(false);
        return;
      }

      const { error: setupError, setupIntent } = await stripe.confirmSepaDebitSetup(
        setupData.clientSecret,
        { payment_method: { sepa_debit: elements.getElement(IbanElement). Bran }
      });

      if (setupError) {
        if (setupError.code === 'canceled' || setupError.code === 'invalid_debit') {
          onError('El IBAN ha sido rechazado. Por favor, prueba con otro IBAN o método de pago.');
        } else {
          onError(setupError.message || 'Error al procesar el pago SEPA.');
        }
        setLoading(false);
        return;
      }

      if (setupIntent?.status === 'succeeded' || setupIntent?.status === 'pending' || setupIntent?.status === 'processing') {
        setTimeout(() => {
          onSuccess(null, setupData.customerId, setupIntent?.payment_method);
        }, 2000);
      } else if (['canceled', 'requires_payment_method'].includes(setupIntent?.status)) {
        onError('El proceso ha sido cancelado. Por favor, intenta de nuevo.');
      } else if (setupIntent?.last_setup_error) {
        onError(setupIntent.last_setup_error.message || 'Error al procesar el pago SEPA.');
      } else {
        onError('No se ha podido procesar el pago SEPA. Por favor, intenta de nuevo.');
      }
    } catch (err) {
      onError(err.message || 'Error al procesar');
    } finally {
      setLoading(false);
    }
  };

  const isCard = metodoPago === 'card';
  const isSEPA = metodoPago === 'sepa';

  return (
    <div>
      <h3 className={styles.pagoTitle}>Pago de apadrinamiento mensual</h3>

      <div className={styles.pagoSelectedAmount}>
        <span className={styles.pagoAmountLabel}>Aportación seleccionada:</span>
        <span className={styles.pagoAmountValue}>{importe}€/mes</span>
      </div>

      <div className={styles.pagoMethodSelector}>
        <p className={styles.pagoMethodLabel}>Método de pago:</p>
        <div className={styles.pagoMethodButtons}>
          <button
            type="button"
            onClick={() => {
              setMetodoPago('card');
              onError(null);
            }}
            className={`${styles.pagoMethodBtn} ${metodoPago === 'card' ? styles.active : ''}`}
          >
            Tarjeta
          </button>
          <button
            type="button"
            onClick={() => {
              setMetodoPago('sepa');
              onError(null);
            }}
            className={`${styles.pagoMethodBtn} ${metodoPago === 'sepa' ? styles.active : ''}`}
          >
            Domiciliación (SEPA)
          </button>
        </div>
      </div>

      <div className={styles.pagoFormInputs}>
        <div className={styles.pagoInputGroup}>
          <label>Email:</label>
          <input type="email" value={user?.email || ''} disabled className={styles.pagoTextInput} />
        </div>
        <div className={styles.pagoInputGroup}>
          <label>Nombre:</label>
          <input type="text" value={user?.nombre || ''} disabled className={styles.pagoTextInput} />
        </div>

        {isCard && (
          <form onSubmit={handleCardSubmit} className={styles.form}>
            <div className={styles.pagoCardElement}>
              <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
            </div>
            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '15px' }}>
              Primer cobro: <strong>{importe}€</strong> - Los cobros mensuales se procesarán manualmente
            </p>
            <button type="submit" disabled={!stripe || loading || envioPagoIniciado} className={styles.pagoSubmitBtn}>
              {loading ? 'Procesando...' : `Pagar ${importe}€ y enviar solicitud`}
            </button>
          </form>
        )}

        {isSEPA && (
          <form onSubmit={handleSEPASubmit} className={styles.form}>
            {sepaStep === 1 && (
              <div style={{ marginBottom: '15px', color: '#424770', fontSize: '0.9rem', lineHeight: '1.5' }}>
                <p>
                  Autorizas a Flacuchos a realizar cobros recurrentes de <strong>{importe}€/mes</strong> de tu cuenta
                  SEPA.
                </p>
                <p style={{ fontStyle: 'italic', color: '#666', fontSize: '0.85rem' }}>
                  El primer cobro se procesará en 1-2 días hábiles. Los cobros mensuales se realizarán manualmente
                  desde nuestro sistema.
                </p>
              </div>
            )}
            {sepaStep === 2 && (
              <div className={styles.pagoCardElement}>
                <IbanElement options={ibanOptions} />
              </div>
            )}
            <button type="submit" disabled={loading || !stripe || !elements || envioPagoIniciado} className={styles.pagoSubmitBtn}>
              {loading ? 'Procesando...' : sepaStep === 1 ? 'Continuar con SEPA' : `Confirmar primer cobro de ${importe}€`}
            </button>
          </form>
        )}

        {paymentError && (
          <div className={styles.pagoError}>{paymentError}</div>
        )}

        <button type="button" onClick={onBack} className={styles.pagoBackBtn}>
          Volver
        </button>
      </div>
    </div>
  );
}

function FormularioApadrinamiento() {
  const { user, refreshUser, isAuthenticated } = useAuth();

  const [stripePromise, setStripePromise] = useState(null);
  const [step, setStep] = useState(1);
  const [animales, setAnimales] = useState([]);
  const [loadingAnimales, setLoadingAnimales] = useState(true);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [envioPagoIniciado, setEnvioPagoIniciado] = useState(false);

  const [importe, setImporte] = useState('');
  const [dniNie, setDniNie] = useState('');
  const [telefono, setTelefono] = useState('');
  const [mostrarPublico, setMostrarPublico] = useState(false);
  const [metodoPago, setMetodoPago] = useState('card');
  const [fieldErrors, setFieldErrors] = useState({});
  const [apadrinamientoPrevio, setApadrinamientoPrevio] = useState(false);

  const fetchAnimales = useCallback(async () => {
    setLoadingAnimales(true);
    try {
      const userId = isAuthenticated && user?.id ? user.id : null;
      const data = await apadrinamientoApi.getAnimalesDisponibles(userId);
      setAnimales(data);
    } catch (err) {
      console.error('Error fetching animales:', err);
    } finally {
      setLoadingAnimales(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    (async () => {
      try {
        const config = await stripeApi.getConfig();
        if (config.publishableKey) {
          setStripePromise(loadStripe(config.publishableKey));
        }
      } catch (err) {
        console.error('Error loading Stripe:', err);
      }
    })();
  }, []);

  useEffect(() => {
    fetchAnimales();
  }, [fetchAnimales]);

  useEffect(() => {
    if (isAuthenticated && user) {
      (async () => {
        try {
          const result = await apadrinamientoApi.checkTuvoApadrinamientoPrevio();
          setApadrinamientoPrevio(result.tieneApadrinamientoPrevio);
        } catch (err) {
          console.error('Error checking apadrinamiento previo:', err);
        }
      })();
    }
  }, [isAuthenticated, user]);

  const validateImporte = (value) => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 1;
  };

  const getFieldErrors = (currentStep) => {
    const errors = {};

    if (currentStep === 1) {
      if (!selectedAnimal) {
        errors.selectedAnimal = 'Selecciona un animal para apadrinar';
      }
      return errors;
    }

    if (currentStep === 2) {
      if (!dniNie?.trim()) {
        errors.dniNie = 'El DNI/NIE es requerido';
      } else if (!validarDNI(dniNie)) {
        errors.dniNie = 'El DNI/NIE no es válido';
      }
      if (!telefono?.trim()) {
        errors.telefono = 'El teléfono es requerido';
      } else if (!validarTelefono(telefono)) {
        errors.telefono = 'El teléfono debe tener 9 dígitos';
      }
      return errors;
    }

    if (currentStep === 3) {
      if (!importe || !validateImporte(importe)) {
        errors.importe = 'El importe debe ser al menos 1€';
      }
      return errors;
    }

    return errors;
  };

  const handleNext = () => {
    const errors = getFieldErrors(step);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }
    setStep(step + 1);
    window.scrollTo(0, 0);
  };

  const handlePagoSuccess = async (paymentIntentId, customerId, paymentMethodId) => {
    setEnvioPagoIniciado(true);
    try {
      await apadrinamientoApi.crear({
        animal_id: selectedAnimal.id,
        stripe_payment_id: paymentIntentId,
        stripe_customer_id: customerId,
        stripe_payment_method_id: paymentMethodId,
        importe: parseFloat(importe),
        dni_nie: dniNie,
        telefono: telefono,
        mostrar_publico: mostrarPublico
      });
      setSuccess(true);
      refreshUser();
    } catch (err) {
      setPaymentError(err.message || 'Error al guardar el apadrinamiento');
      setEnvioPagoIniciado(false);
    }
  };

  if (success) {
    return (
      <>
        <PageHeader 
          title="¡Solicitud Enviada!"
          subtitle="Gracias por tu apoyo a Flacuchos" 
          variant="help"
        />
        <section className={styles.successSection}>
          <div className={styles.container}>
            <div className={styles.successMessage}>
              <span className="material-symbols-outlined" style={{ fontSize: '5rem', color: '#1976D2', display: 'block', marginBottom: '20px' }}>check_circle</span>
              <h3>Tu solicitud de apadrinamiento ha sido enviada</h3>
              <p>El administrador revisará tu solicitud y te notificaremos pronto.</p>
              <p>Mientras tanto, puedes ver el estado de tu solicitud en tu perfil.</p>
              <div className={styles.successLinks}>
                <Link to="/como-ayudar" className={styles.successBtnPrimary}>
                  Volver a Cómo Ayudar
                </Link>
                <Link to="/perfil" className={styles.successBtnSecondary}>
                  Ver mi perfil
                </Link>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  if (user?.rol === 'admin') {
    return (
      <>
        <PageHeader title="Eres administrador" variant="help" />
        <section className={styles.formSection}>
          <div className={styles.container}>
            <div className={styles.loginPrompt}>
              <span className="material-symbols-outlined">admin_panel_settings</span>
              <h3>Eres administrador</h3>
              <p>Los apadrinamientos se gestionan desde el panel de administración</p>
              <div className={styles.loginButtons}>
                <Link to="/admin/ayudas?tab=apadrinar" className={styles.btnPrimary}>
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

  return (
    <>
      <PageHeader 
        title="Apadrina un Animal"
        subtitle="Tu ayuda hace posible el cuidado de nuestros peludos" 
        variant="help"
      />

      <section className={styles.formSection}>
        <div className={styles.container}>
          <div className={styles.progressBar}>
            {PASOS.map((paso, i) => (
              <div key={i} className={`${styles.progressStep} ${i + 1 < step ? styles.completed : ''} ${i + 1 === step ? styles.active : ''} ${i + 1 === step ? styles.current : ''}`}>
                <div className={styles.progressIcon}>
                  <span className="material-symbols-outlined">{paso.icon}</span>
                </div>
                <span className={styles.progressLabel}>
                  <span className={styles.stepTitle}>{paso.titulo}</span>
                </span>
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className={styles.form}>
              <h3 className={styles.stepTitle}>
                <span className="material-symbols-outlined">pets</span> Selecciona un animal para apadrinar
              </h3>
              {loadingAnimales ? (
                <div className={styles.loading}>Cargando animales...</div>
              ) : animales.length === 0 ? (
                <div className={styles.empty}>
                  <p>No hay animales disponibles para apadrinar en este momento.</p>
                </div>
              ) : (
                <div className={styles.animalesGrid}>
                  {animales.map(animal => (
                    <div
                      key={animal.id}
                      className={`${styles.animalCard} ${selectedAnimal?.id === animal.id ? styles.selectedCard : ''}`}
                      onClick={() => {
                        setSelectedAnimal(animal);
                        setFieldErrors(prev => ({ ...prev, selectedAnimal: '' }));
                      }}
                    >
                      <img src={animal.imagen_url || '/img/default-animal.png'} alt={animal.nombre} className={styles.animalImage} />
                      <div className={styles.animalInfo}>
                        <h3>{animal.nombre}</h3>
                        <p>{animal.especie} • {animal.edad} • {animal.tamano}</p>
                        {animal.urgente && <span className={styles.urgenteBadge}>Urgente</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {fieldErrors.selectedAnimal && <span className={styles.errorText} style={{ textAlign: 'center', marginBottom: '15px' }}>{fieldErrors.selectedAnimal}</span>}
              <div className={styles.buttons}>
                <button onClick={handleNext} className={styles.btnPrimary}>
                  Siguiente
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className={styles.form}>
              <h3 className={styles.stepTitle}>
                <span className="material-symbols-outlined">person</span> Datos de contacto
              </h3>
              <div className={styles.field}>
                <label>DNI/NIE</label>
                <input
                  type="text"
                  value={dniNie}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9A-Z]/g, '').toUpperCase().slice(0, 9);
                    setDniNie(value);
                    if (fieldErrors.dniNie) setFieldErrors(prev => ({ ...prev, dniNie: '' }));
                  }}
                  placeholder="12345678A / X1234567L"
                  className={fieldErrors.dniNie ? styles.inputError : ''}
                />
                {fieldErrors.dniNie && <span className={styles.errorText}>{fieldErrors.dniNie}</span>}
              </div>
              <div className={styles.field}>
                <label>Teléfono</label>
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 9);
                    setTelefono(value);
                    if (fieldErrors.telefono) setFieldErrors(prev => ({ ...prev, telefono: '' }));
                  }}
                  placeholder="612345678"
                  className={fieldErrors.telefono ? styles.inputError : ''}
                />
                {fieldErrors.telefono && <span className={styles.errorText}>{fieldErrors.telefono}</span>}
              </div>
              <div className={styles.buttons}>
                <button type="button" onClick={() => { setStep(1); setFieldErrors({}); }} className={styles.btnSecondary}>Atrás</button>
                <button type="button" onClick={handleNext} className={styles.btnPrimary}>Siguiente</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className={styles.form}>
              <h3 className={styles.stepTitle}>
                <span className="material-symbols-outlined">euro_symbol</span> ¿Cuánto quieres aportar al mes?
              </h3>
              <div className={styles.importeWrapper}>
                <span className={styles.importeSymbol}>€</span>
                <input
                  type="number"
                  value={importe}
                  onChange={(e) => {
                    const value = e.target.value;
                    const cleaned = value.replace(/[^0-9.]/g, '');
                    const parts = cleaned.split('.');
                    if (parts.length > 2) return;
                    if (parts[1] && parts[1].length > 2) {
                      setImporte(parts[0] + '.' + parts[1].slice(0, 2));
                    } else {
                      setImporte(cleaned);
                    }
                    if (fieldErrors.importe) setFieldErrors(prev => ({ ...prev, importe: '' }));
                  }}
                  placeholder="10"
                  min="1"
                  step="0.01"
                  className={`${styles.importeInput} ${fieldErrors.importe ? styles.inputError : ''}`}
                />
                <span className={styles.importeLabel}>/mes</span>
              </div>
              {fieldErrors.importe && <span className={styles.errorText} style={{ textAlign: 'center', marginTop: '-10px', marginBottom: '20px' }}>{fieldErrors.importe}</span>}
              <p className={styles.importeHint}>Importe mínimo: 1€</p>
              {selectedAnimal && (
                <div className={styles.selectedAnimalSummary}>
                  <img src={selectedAnimal.imagen_url || '/img/default-animal.png'} alt={selectedAnimal.nombre} />
                  <div>
                    <strong>Apadrinarás a:</strong> {selectedAnimal.nombre}
                  </div>
                </div>
              )}
              <div className={styles.buttons}>
                <button type="button" onClick={() => setStep(2)} className={styles.btnSecondary}>Atrás</button>
                <button type="button" onClick={handleNext} className={styles.btnPrimary}>Siguiente</button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className={styles.form}>
              <h3 className={styles.stepTitle}>
                <span className="material-symbols-outlined">lock</span> Privacidad
              </h3>
              <div className={styles.privacyOption}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={mostrarPublico}
                    onChange={(e) => setMostrarPublico(e.target.checked)}
                  />
                  <span className={styles.checkboxCustom}></span>
                  <span>Quiero que mi nombre aparezca públicamente como padrino/a debajo de la ficha del animal en la web de adopciones</span>
                </label>
              </div>
              <p className={styles.privacyNote}>
                Si marcas esta opción, tu nombre se mostrará públicamente en la página de adopciones debajo del animal que apadrines, mientras el animal no sea adoptado.
              </p>
              <div className={styles.resumen}>
                <h3>Resumen de tu apadrinamiento</h3>
                <div className={styles.resumenItem}>
                  <span>Animal:</span>
                  <strong>{selectedAnimal?.nombre}</strong>
                </div>
                <div className={styles.resumenItem}>
                  <span>Aportación:</span>
                  <strong>{importe}€/mes</strong>
                </div>
                <div className={styles.resumenItem}>
                  <span>Privacidad:</span>
                  <strong>{mostrarPublico ? 'Público' : 'Privado'}</strong>
                </div>
              </div>
              <div className={styles.buttons}>
                <button type="button" onClick={() => setStep(3)} className={styles.btnSecondary}>Atrás</button>
                <button type="button" onClick={() => setStep(5)} className={styles.btnPrimary}>Ir a pagar</button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className={styles.form}>
              {apadrinamientoPrevio && (
                <div className={styles.warningBox}>
                  <span className="material-symbols-outlined">warning</span>
                  <div>
                    <p><strong>Atención:</strong> Has tenido un apadrinamiento anteriormente.</p>
                    <p>Al confirmar, se te cobrará inmediatamente el primer cobro.</p>
                  </div>
                </div>
              )}

              {stripePromise ? (
                <Elements stripe={stripePromise}>
                  <PaymentForms 
                    importe={importe}
                    metodoPago={metodoPago}
                    setMetodoPago={setMetodoPago}
                    user={user}
                    onSuccess={handlePagoSuccess}
                    onError={setPaymentError}
                    setLoading={setLoading}
                    loading={loading}
                    onBack={() => setStep(4)}
                    envioPagoIniciado={envioPagoIniciado}
                    paymentError={paymentError}
                  />
                </Elements>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <p>Cargando sistema de pago...</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default FormularioApadrinamiento;