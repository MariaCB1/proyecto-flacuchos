import { useState } from 'react';
import { CardElement, useStripe, useElements, IbanElement } from '@stripe/react-stripe-js';
import { stripeApi, authApi } from '../api/api';
import styles from './Donacion.module.css';

const STRIPE_PRICES = {
  price_5: 'price_1TTmVnFbcNKRoxlNXkxis3e5',
  price_10: 'price_1TTmXMFbcNKRoxlNCHPT8AFd'
};

const ibanOptions = { style: { base: { fontSize: '16px', color: '#424770' } }, supportedCountries: ['SEPA'] };

function CheckoutCard({ amount, email, nombre, datosPersonales, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pendingMessage, setPendingMessage] = useState('');

  const priceId = amount === 5 ? STRIPE_PRICES.price_5 : STRIPE_PRICES.price_10;

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

      console.log('DEBUG: createSubscription response:', result);

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
        {loading ? 'Procesando...' : `Pagar ${amount}€/mes y hacerme socio`}
      </button>
    </form>
  );
}

function CheckoutSEPA({ amount, email, nombre, datosPersonales, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pendingMessage, setPendingMessage] = useState('');
  const [step, setStep] = useState(1);
  const [setupData, setSetupData] = useState(null);

  const priceId = amount === 5 ? STRIPE_PRICES.price_5 : STRIPE_PRICES.price_10;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);

    try {
      if (step === 1) {
        const result = await stripeApi.createSubscription(priceId, email, nombre, authApi.getCurrentUser()?.id, 'sepa', datosPersonales);

        console.log('DEBUG SEPA step 1:', result);

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

        console.log('🔍 [DEBUG] SetupIntent completo:', JSON.stringify(setupIntent, null, 2));
        console.log('🔍 [DEBUG] setupIntent.status:', setupIntent?.status);
        console.log('🔍 [DEBUG] setupIntent.last_setup_error:', setupIntent?.last_setup_error);

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
              console.log('🔍 [DEBUG] Enviando al backend - setupIntentId:', setupData.setupIntentId);

              const setupResult = await stripeApi.confirmSepaSetup(setupData.setupIntentId, priceId, authApi.getCurrentUser()?.id, datosPersonales);

              console.log('🔍 [DEBUG] Respuesta backend confirmSepaSetup:', JSON.stringify(setupResult, null, 2));

              // Evaluar respuesta del backend - SI HAY ERROR, NO ejecutar onSuccess
              if (setupResult.error) {
                setError(setupResult.error + ' Por favor, prueba con otro IBAN o método de pago.');
                // Llamar a marcarSocioFallido para limpiar registros huérfanos
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
                // Solo ejecutar onSuccess si el backend confirma éxito
                setPendingMessage('¡Socio activado correctamente! Te redirigimos a tu perfil...');
                setTimeout(onSuccess, 2000);
              } else {
                // Respuesta inesperada del backend - tratar como error
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
              // También notificar al backend sobre el fallo
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
          Autorizas a Flacuchos a realizar cobros recurrentes de {amount}€/mes de tu cuenta SEPA.
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
        {loading ? 'Procesando...' : step === 1 ? 'Continuar con SEPA' : `Confirmar ${amount}€/mes`}
      </button>
    </form>
  );
}

export default function CheckoutSocio({ amount, email, nombre, datosPersonales, onSuccess, onBack }) {
  const [method, setMethod] = useState('card');

  return (
    <div>
      <h3 className={styles.title}>Pago de cuota mensual</h3>

      <div className={styles.selectedAmount}>
        <span className={styles.amountLabel}>Cuota seleccionada:</span>
        <span className={styles.amountValue}>{amount}€/mes</span>
      </div>

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

        {method === 'card' && <CheckoutCard amount={amount} email={email} nombre={nombre} datosPersonales={datosPersonales} onSuccess={onSuccess} />}
        {method === 'sepa' && <CheckoutSEPA amount={amount} email={email} nombre={nombre} datosPersonales={datosPersonales} onSuccess={onSuccess} />}

        <button type="button" onClick={onBack} className={styles.backBtn}>Volver</button>
      </div>
    </div>
  );
}