import { useState } from 'react';
import { CardElement, useStripe, useElements, IbanElement } from '@stripe/react-stripe-js';
import { stripeApi, authApi } from '../api/api';
import styles from './Donacion.module.css';

const ibanOptions = { style: { base: { fontSize: '16px', color: '#424770' } }, supportedCountries: ['SEPA'] };

function CheckoutCard({ amount, email, nombre, datosPersonales, onSuccess, priceId, totalConComision }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pendingMessage, setPendingMessage] = useState('');
  const displayTotal = totalConComision || (amount === 5 ? 5.35 : 10.50);
  const comisionMostrar = displayTotal - amount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);
    setPendingMessage('');

    try {
      const result = await stripeApi.createSubscription(
        priceId,
        email,
        nombre,
        authApi.getCurrentUser()?.id,
        'card',
        datosPersonales
      );

      const { clientSecret } = result;

      if (!clientSecret) {
        setError('No se pudo iniciar el pago. Por favor, intenta de nuevo.');
        setLoading(false);
        return;
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) }
      });

      if (stripeError) {
        setError(stripeError.message || 'El pago no se ha completado. Por favor, intenta de nuevo.');
      } else if (paymentIntent?.status === 'succeeded') {
        const usuarioId = authApi.getCurrentUser()?.id;
        if (result.paymentIntentId && usuarioId) {
          try {
            await stripeApi.crearSuscripcionReal(result.paymentIntentId, usuarioId);
          } catch (subErr) {
            setError(subErr.message || 'Error al procesar el pago. Por favor, intenta de nuevo.');
            return;
          }
        }
        onSuccess();
      } else if (paymentIntent?.status === 'processing') {
        setPendingMessage('El pago se está procesando. Te notificaremos cuando se complete.');
        onSuccess();
      } else if (paymentIntent?.status === 'requires_payment_method') {
        setError('La tarjeta ha sido rechazada. Por favor, prueba con otra tarjeta.');
      } else {
        setError('El pago no se ha completado. Por favor, intenta de nuevo.');
      }
    } catch (err) {
      setError(err.message || 'Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.cardElement}>
        <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
      </div>
      {error && <div className={styles.error}>{error}</div>}
      {pendingMessage && <div className={styles.success}>{pendingMessage}</div>}
      <button type="submit" disabled={!stripe || loading} className={styles.submitBtn}>
        {loading ? 'Procesando...' : `Pagar ${displayTotal.toFixed(2).replace('.', ',')}€/mes (${amount}€ + ${comisionMostrar.toFixed(2).replace('.', ',')}€ comisión) y hacerme socio`}
      </button>
    </form>
  );
}

function CheckoutSEPA({ amount, email, nombre, datosPersonales, onSuccess, priceId, totalConComision }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pendingMessage, setPendingMessage] = useState('');
  const [step, setStep] = useState(1);
  const [setupData, setSetupData] = useState(null);
  const displayTotal = totalConComision || (amount === 5 ? 5.35 : 10.50);
  const comisionMostrar = displayTotal - amount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);

    try {
      if (step === 1) {
        const result = await stripeApi.createSubscription(priceId, email, nombre, authApi.getCurrentUser()?.id, 'sepa', datosPersonales);

        if (result.isSetupIntent && result.clientSecret) {
          setSetupData(result);
          setStep(2);
        } else if (!result.clientSecret) {
          setPendingMessage('¡Bienvenido/a socio! Tu domiciliación SEPA está activa desde este momento. El primer cobro se procesará en 1-2 días hábiles.');
          setTimeout(onSuccess, 2000);
        }
      } else if (step === 2 && setupData) {
        const ibanElement = elements.getElement('iban');
        if (!ibanElement) throw new Error('El elemento IBAN no está disponible');

        const { error: setupError, setupIntent } = await stripe.confirmSepaDebitSetup(setupData.clientSecret, {
          payment_method: {
            sepa_debit: ibanElement,
            billing_details: { name: nombre || 'Cliente', email: email || 'cliente@ejemplo.com' }
          }
        });

        if (setupError) {
          const errorMsg = setupError.message || 'El banco ha rechazado el pago';

          if (setupData.setupIntentId) {
            try {
              await stripeApi.marcarSocioFallido(
                setupData.setupIntentId,
                authApi.getCurrentUser()?.id,
                errorMsg
              );
            } catch (notifyErr) {
              console.error('Error notificando fallo al backend:', notifyErr);
            }
          }

          setError(errorMsg + '. Por favor, prueba con otro IBAN o método de pago.');
        } else if (setupIntent?.status === 'succeeded' || setupIntent?.status === 'pending' || setupIntent?.status === 'processing') {
          if (setupData.setupIntentId) {
            try {
              const setupResult = await stripeApi.confirmSepaSetup(setupData.setupIntentId, priceId, authApi.getCurrentUser()?.id, datosPersonales);

              if (setupResult.error) {
                setError(setupResult.error + ' Por favor, prueba con otro IBAN o método de pago.');
                try {
                  await stripeApi.marcarSocioFallido(
                    setupData.setupIntentId,
                    authApi.getCurrentUser()?.id,
                    setupResult.error
                  );
                } catch (notifyErr) {
                  console.error('Error notificando fallo al backend:', notifyErr);
                }
              } else if (setupResult.success) {
                setPendingMessage('¡Socio activado correctamente! Te redirigimos a tu perfil...');
                setTimeout(onSuccess, 2000);
              } else {
                setError('Error al procesar el pago. Por favor, prueba con otro IBAN o método de pago.');
                try {
                  await stripeApi.marcarSocioFallido(
                    setupData.setupIntentId,
                    authApi.getCurrentUser()?.id,
                    'Error inesperado del servidor'
                  );
                } catch (notifyErr) {
                  console.error('Error notificando fallo al backend:', notifyErr);
                }
              }
            } catch (backendErr) {
              const errMsg = backendErr.response?.data?.error || backendErr.message || 'Error al procesar el pago SEPA.';
              setError(errMsg + ' Por favor, prueba con otro IBAN o método de pago.');
              try {
                await stripeApi.marcarSocioFallido(
                  setupData.setupIntentId,
                  authApi.getCurrentUser()?.id,
                  errMsg
                );
              } catch (notifyErr) {
                console.error('Error notificando fallo al backend:', notifyErr);
              }
            }
          } else {
            setPendingMessage('¡Socio activado correctamente! Te redirigimos a tu perfil...');
            setTimeout(onSuccess, 2000);
          }
        } else if (['canceled', 'requires_payment_method'].includes(setupIntent?.status)) {
          const errMsg = setupIntent?.last_setup_error?.message || setupIntent?.last_setup_error?.code || 'El método de pago no es válido o ha sido rechazado por el banco. Por favor, prueba con otro IBAN o método de pago.';
          setError(errMsg);
        } else if (setupIntent?.last_setup_error) {
          const errMsg = setupIntent.last_setup_error.message || setupIntent.last_setup_error.code || 'El método de pago no es válido o ha sido rechazado por el banco. Por favor, prueba con otro IBAN o método de pago.';
          setError(errMsg);
        } else {
          setError('No se ha podido procesar el pago SEPA. Por favor, intenta de nuevo.');
        }
      }
    } catch (err) {
      setError(err.message || 'Error al procesar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {step === 1 && (
        <p className={styles.sepaMandate}>
          Autorizas a Flacuchos a realizar cobros recurrentes de {displayTotal.toFixed(2).replace('.', ',')}€/mes ({amount}€ + {comisionMostrar.toFixed(2).replace('.', ',')}€ comisión) de tu cuenta SEPA.
          <br /><small>El primer cobro se procesará en 1-2 días hábiles.</small>
        </p>
      )}
      {step === 2 && (
        <div className={styles.cardElement}>
          <IbanElement options={ibanOptions} />
        </div>
      )}
      {error && <div className={styles.error}>{error}</div>}
      {pendingMessage && <div className={styles.success}>{pendingMessage}</div>}
      <button type="submit" disabled={loading || !stripe || !elements} className={styles.submitBtn}>
        {loading ? 'Procesando...' : step === 1 ? 'Continuar con SEPA' : `Confirmar ${displayTotal.toFixed(2).replace('.', ',')}€/mes`}
      </button>
    </form>
  );
}

export default function CheckoutSocio({ amount, email, nombre, datosPersonales, onSuccess, onBack, priceId }) {
  const [method, setMethod] = useState('card');
  const totalConComision = amount === 5 ? 5.35 : 10.50;
  const comisionMostrar = totalConComision - amount;

  return (
    <div>
      <h3 className={styles.title}>Pago de cuota mensual</h3>

      <div className={styles.selectedAmount}>
        <span className={styles.amountLabel}>Cuota seleccionada:</span>
        <span className={styles.amountValue}>{totalConComision.toFixed(2).replace('.', ',')}€/mes</span>
      </div>
      <p style={{textAlign: 'center', color: '#666', fontSize: '0.85rem', margin: '-10px 0 15px', padding: '8px 12px', background: '#f5f5f5', borderRadius: '8px'}}>{amount}€ + {comisionMostrar.toFixed(2).replace('.', ',')}€ comisión</p>

      <div className={styles.methodSelector}>
        <p className={styles.methodLabel}>Método de pago:</p>
        <div className={styles.methodButtons}>
          <button
            type="button"
            onClick={() => setMethod('card')}
            className={`${styles.methodBtn} ${method === 'card' ? styles.active : ''}`}
          >
            Tarjeta
          </button>
          <button
            type="button"
            onClick={() => setMethod('sepa')}
            className={`${styles.methodBtn} ${method === 'sepa' ? styles.active : ''}`}
          >
            Domiciliación (SEPA)
          </button>
        </div>
      </div>

      <div className={styles.formInputs}>
        <div className={styles.inputGroup}>
          <label>Email:</label>
          <input type="email" value={email || ''} disabled className={styles.textInput} />
        </div>
        <div className={styles.inputGroup}>
          <label>Nombre:</label>
          <input type="text" value={nombre || ''} disabled className={styles.textInput} />
        </div>

        {method === 'card' && <CheckoutCard amount={amount} totalConComision={totalConComision} email={email} nombre={nombre} datosPersonales={datosPersonales} onSuccess={onSuccess} priceId={priceId} />}
        {method === 'sepa' && <CheckoutSEPA amount={amount} totalConComision={totalConComision} email={email} nombre={nombre} datosPersonales={datosPersonales} onSuccess={onSuccess} priceId={priceId} />}

        <button type="button" onClick={onBack} className={styles.backBtn}>Volver</button>
      </div>
    </div>
  );
}
