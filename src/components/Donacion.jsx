import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements, IbanElement } from '@stripe/react-stripe-js';
import { stripeApi, authApi } from '../api/api';
import styles from './Donacion.module.css';

const PREDEFINED_AMOUNTS = [5, 10, 25, 50];

function calcularTotalConComision(importeLimpio) {
  const totalCentavos = Math.ceil(((importeLimpio * 100 + 25) / 0.986));
  const comisionCentavos = totalCentavos - importeLimpio * 100;
  return { total: totalCentavos / 100, comision: comisionCentavos / 100, importeLimpio };
}
const METODOS_DONACION = [
    { id: 'card', label: 'Tarjeta', icon: '💳' }
];
const METODOS_SOCIO = [
    { id: 'card', label: 'Tarjeta', icon: '💳' },
    { id: 'sepa', label: 'SEPA', icon: '🏦' },
    { id: 'teaming', label: 'Teaming', icon: '🤝', url: 'https://www.teaming.net/group/list?q=flacuchos' }
];

const ibanOptions = { style: { base: { fontSize: '16px', color: '#424770' } }, supportedCountries: ['SEPA'] };

function CheckoutCard({ amount, email, nombre, onSuccess, priceId }) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pendingMessage, setPendingMessage] = useState('');
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;
        setLoading(true);
        setError(null);
        setPendingMessage('');
        
        try {
            const { clientSecret } = await stripeApi.createSubscription(
                priceId, 
                email, 
                nombre, 
                authApi.getCurrentUser()?.id, 
                'card'
            );
            
            if (clientSecret) {
                const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                    payment_method: { card: elements.getElement(CardElement) }
                });
                
                if (stripeError) {
                    if (stripeError.code === 'processing_error' || stripeError.code === 'temporary_service_error') {
                        setPendingMessage('El pago está siendo procesado. Te notificaremos cuando se complete.');
                    } else {
                        setError(stripeError.message);
                    }
                } else if (paymentIntent?.status === 'succeeded') {
                    onSuccess();
                } else if (paymentIntent?.status === 'processing') {
                    setPendingMessage('El pago se está procesando. Te notificaremos cuando se complete.');
                    onSuccess();
                } else if (paymentIntent?.status === 'requires_payment_method') {
                    setError('El pago no se ha completado. Por favor, intenta de nuevo.');
                }
            } else {
                setError('Error al iniciar el pago. Por favor, inténtalo de nuevo.');
            }
        } catch {
            setError('Error al procesar el pago');
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
                {loading ? 'Procesando...' : `Hacerme socio (${amount}€/mes)`}
            </button>
        </form>
    );
}

function CheckoutCardPuntual({ amount, email, nombre, onSuccess }) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pendingMessage, setPendingMessage] = useState('');
    const { total } = calcularTotalConComision(amount);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;
        if (!email || !nombre) {
            setError('Por favor, introduce tu nombre y email');
            return;
        }
        setLoading(true);
        setError(null);
        setPendingMessage('');
        
        try {
            const data = await stripeApi.createPaymentIntent(total, email, nombre, 'card', authApi.getCurrentUser()?.id);
            const clientSecret = data.clientSecret;
            const paymentId = data.paymentIntentId;
            
            if (!clientSecret || !paymentId) {
                setError('Error al iniciar el pago. Por favor, inténtalo de nuevo.');
                return;
            }

            const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: { card: elements.getElement(CardElement) }
            });
            
            if (stripeError) {
                if (stripeError.code === 'processing_error' || stripeError.code === 'temporary_service_error') {
                    setPendingMessage('El pago está siendo procesado. Te notificaremos cuando se complete.');
                    setTimeout(async () => {
                        try {
                            const result = await stripeApi.checkDonacion(paymentId);
                            if (result.donacion?.estado === 'completada') {
                                onSuccess();
                            }
                        } catch (e) {
                            console.error('Error checking donacion:', e);
                        }
                    }, 3000);
                } else {
                    try {
                        await stripeApi.cancelPaymentIntent(paymentId);
                    } catch (cancelErr) {
                        console.error('Error canceling payment:', cancelErr);
                    }
                    setError(stripeError.message);
                }
            } else if (paymentIntent?.status === 'succeeded') {
                try {
                    await stripeApi.checkDonacion(paymentId);
                } catch (e) {
                    console.error('Error checking donacion:', e);
                }
                onSuccess();
            } else if (paymentIntent?.status === 'processing') {
                setPendingMessage('El pago se está procesando. Te notificaremos cuando se complete.');
                setTimeout(async () => {
                    try {
                        const result = await stripeApi.checkDonacion(paymentId);
                        if (result.donacion?.estado === 'completada') {
                            onSuccess();
                        }
                    } catch (e) {
                        console.error('Error checking donacion:', e);
                    }
                }, 2000);
            } else if (paymentIntent?.status === 'canceled' || paymentIntent?.status === 'incomplete' || paymentIntent?.status === 'requires_payment_method') {
                try {
                    await stripeApi.cancelPaymentIntent(paymentId);
                } catch (cancelErr) {
                    console.error('Error canceling payment:', cancelErr);
                }
                setError('El pago no se ha completado. Por favor, verifica los datos de tu tarjeta e inténtalo de nuevo.');
            }
        } catch (err) {
            console.error('Error payment:', err);
            setError('Error al procesar el pago');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.cardElement}>
                <CardElement options={{ style: { base: { base: { fontSize: '16px', color: '#424770' } }, invalid: { color: '#9e2146' } } }} />
            </div>
            {error && <div className={styles.error}>{error}</div>}
            {pendingMessage && <div className={styles.success}>{pendingMessage}</div>}
            <button type="submit" disabled={!stripe || loading} className={styles.submitBtn}>
                {loading ? 'Procesando...' : `Donar ${amount}€ con tarjeta`}
            </button>
        </form>
    );
}

function SEPAForm({ amount, email, nombre, onSuccess, priceId }) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pendingMessage, setPendingMessage] = useState('');
    const [step, setStep] = useState(1);
    const [setupData, setSetupData] = useState(null);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;
        setLoading(true);
        setError(null);
        
        try {
            if (step === 1) {
                const result = await stripeApi.createSubscription(
                    priceId, 
                    email, 
                    nombre, 
                    authApi.getCurrentUser()?.id, 
                    'sepa'
                );
                
                if (result.isSetupIntent && result.clientSecret) {
                    setSetupData(result);
                    setStep(2);
                } else if (!result.clientSecret) {
                    setPendingMessage('Tu solicitud de socio SEPA ha sido creada. El primer cobro se procesará en 1-2 días hábiles.');
                    setTimeout(onSuccess, 2000);
                }
            } else if (step === 2 && setupData) {
                const ibanElement = elements.getElement('iban');
                if (!ibanElement) {
                    throw new Error('El elemento IBAN no está disponible');
                }
                
                const { error: setupError, setupIntent, redirect } = await stripe.confirmSepaDebitSetup(setupData.clientSecret, {
                    payment_method: {
                        sepa_debit: ibanElement,
                        billing_details: {
                            name: nombre || 'Cliente',
                            email: email || 'cliente@ejemplo.com'
                        }
                    }
                });
                
                if (redirect) {
                    setPendingMessage('Redirigiendo al banco...');
                    return;
                }
                
                if (setupError) {
                    const errorMsg = setupError.message || 'El banco ha rechazado el pago';
                    // Notificar al backend que el socio ha fallado
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
                } else if (setupIntent?.status === 'succeeded') {
                    await stripeApi.confirmSepaSetup(
                        setupData.setupIntentId,
                        priceId,
                        authApi.getCurrentUser()?.id
                    );
                    
                    setPendingMessage('¡Bienvenido socio! Tu pago SEPA se procesará el primer día hábil de cada mes.');
                    onSuccess();
                } else if (setupIntent?.status === 'pending' || setupIntent?.status === 'processing') {
                    await stripeApi.confirmSepaSetup(
                        setupData.setupIntentId,
                        priceId,
                        authApi.getCurrentUser()?.id
                    );
                    
                    setPendingMessage('Tu solicitud ha sido creada. El cobro se procesará automáticamente.');
                    onSuccess();
                } else {
                    setPendingMessage('Tu solicitud ha sido creada. Te notificaremos cuando se complete.');
                    onSuccess();
                }
            }
        } catch {
            setError('Error al procesar');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            {step === 1 && (
                <p className={styles.sepaMandate}>
                    Autorizas a Flacuchs a realizar cobros recurrentes de {amount}€/mes de tu cuenta SEPA.
                    <br /><small>El primer cobro se procesará en 1-2 días h��biles.</small>
                </p>
            )}
            {step === 2 && (
                <>
                    <div className={styles.cardElement}>
                        <IbanElement options={ibanOptions} />
                    </div>
                    <small style={{color: '#666', fontSize: '0.8rem', display: 'block', marginTop: '5px'}}>
                        Ejemplo IBAN prueba: DE89370400440532013000
                    </small>
                </>
            )}
            {error && <div className={styles.error}>{error}</div>}
            {pendingMessage && <div className={styles.success}>{pendingMessage}</div>}
            <button type="submit" disabled={loading || !stripe || !elements} className={styles.submitBtn}>
                {loading ? 'Procesando...' : step === 1 ? 'Continuar con SEPA' : `Confirmar ${amount}€/mes`}
            </button>
        </form>
    );
}

function TransferForm({ amount, nombre, onSuccess, usuarioId }) {
    const [loading, setLoading] = useState(false);
    const { total } = calcularTotalConComision(amount);
    
    const handleConfirm = async () => {
        setLoading(true);
        try {
            await stripeApi.createPaymentIntent(total, '', nombre || 'Donante', 'transfer', usuarioId);
            onSuccess();
        } catch {
            onSuccess();
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className={styles.transferBox}>
            <p>🏠 <strong>Transferencia Bancaria</strong></p>
            <p className={styles.transferInfo}>
                Ingresa {amount}€/mes a la cuenta de la protectora. 
                Después de hacer la transferencia, contacta con nosotros para confirmar.
            </p>
            <button onClick={handleConfirm} disabled={loading} className={styles.submitBtn}>
                {loading ? 'Procesando...' : 'Confirmar solicitud'}
            </button>
        </div>
    );
}

function DonacionPuntual({ stripePromise }) {
    const [amount, setAmount] = useState(10);
    const [customAmount, setCustomAmount] = useState('');
    const [step, setStep] = useState(1);
    const [metodoPago, setMetodoPago] = useState('card');
    const currentUser = authApi.getCurrentUser();
    const [email, setEmail] = useState(currentUser?.email || '');
    const [nombre, setNombre] = useState(currentUser?.nombre || '');
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleAmountSelect = (v) => { setAmount(v); setCustomAmount(''); };
    const handleCustomChange = (e) => { 
        const v = e.target.value.replace(/[^0-9]/g, ''); 
        setCustomAmount(v); 
        if (v && parseInt(v) >= 1) setAmount(parseInt(v)); 
    };

    const handleContinuar = () => {
        if (!amount || amount < 1) {
            setError('Selecciona una cantidad');
            return;
        }
        setError('');
        setStep(2);
    };

    if (success) return (
        <div className={styles.container}>
            <div className={styles.successBox}>
                <div className={styles.successIcon}>✓</div>
                <h3>¡Gracias!</h3>
                <p>Tu donativo de {amount}€ limpios se ha procesado correctamente.</p>
                <button onClick={() => { setSuccess(false); setStep(1); }} className={styles.submitBtn}>Nueva donación</button>
            </div>
        </div>
    );

    if (!stripePromise) return <div className={styles.container}><p>Cargando...</p></div>;

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>Haz una Donación</h3>
            
            {step === 1 && (
                <>
                    <div className={styles.amountOptions}>
                        {PREDEFINED_AMOUNTS.map(v => {
                            const { comision } = calcularTotalConComision(v);
                            return (
                            <button key={v} type="button" onClick={() => handleAmountSelect(v)} 
                                className={`${styles.amountBtn} ${amount === v ? styles.active : ''}`}>
                                {v}€{comision > 0 && <small className={styles.feeInfo}> (+{comision.toFixed(2).replace('.', ',')}€ com.)</small>}
                            </button>
                            );
                        })}
                        <div className={styles.customAmount}>
                            <span>Otro:</span>
                            <input type="number" min="1" value={customAmount} onChange={handleCustomChange} 
                                placeholder="€" className={styles.input} />
                        </div>
                        {customAmount && parseInt(customAmount) >= 1 && (() => {
                            const { total, comision } = calcularTotalConComision(parseInt(customAmount));
                            return <p className={styles.feeDetail}>Para Flacuchos: {customAmount}€ | Comisión: {comision.toFixed(2).replace('.', ',')}€ | Total: {total.toFixed(2).replace('.', ',')}€</p>;
                        })()}
                    </div>
                    {error && <div className={styles.error}>{error}</div>}
                    <button onClick={() => handleContinuar()} className={styles.mainBtn}>
                        Donar {amount}€{amount >= 1 && (() => { const { comision } = calcularTotalConComision(amount); return ` (${comision.toFixed(2).replace('.', ',')}€ comisión)`; })()}
                    </button>
                </>
            )}

            {step === 2 && (
                <>
                    <div className={styles.methodSelector}>
                        <p className={styles.methodLabel}>Elige método de pago:</p>
                        <div className={styles.methodButtons}>
                            {METODOS_DONACION.map(m => (
                                <button key={m.id} type="button" onClick={() => setMetodoPago(m.id)} 
                                    className={`${styles.methodBtn} ${metodoPago === m.id ? styles.active : ''}`}>
                                    <span>{m.icon}</span> {m.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.formInputs}>
                        <div className={styles.inputGroup}>
                            <label>Email *:</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} 
                                placeholder="tu@email.com" className={styles.textInput} required />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Nombre *:</label>
                            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} 
                                placeholder="Tu nombre" className={styles.textInput} required />
                        </div>

                        {error && <div className={styles.error}>{error}</div>}

                        <Elements stripe={stripePromise}>
                            {metodoPago === 'card' && <CheckoutCardPuntual amount={amount} email={email} nombre={nombre} onSuccess={() => setSuccess(true)} />}
                            {metodoPago === 'transfer' && <TransferForm amount={amount} nombre={nombre} usuarioId={currentUser?.id} onSuccess={() => setSuccess(true)} />}
                        </Elements>

                        <button type="button" onClick={() => setStep(1)} className={styles.backBtn}>Volver</button>
                    </div>
                </>
            )}
        </div>
    );
}

function DonacionSocioLoggedOut() {
    return (
        <div className={styles.container}>
            <h3 className={styles.title}>Hazte Socio</h3>
            <div className={styles.loginPrompt}>
                <p>🔒 Necesitas <Link to="/login">iniciar sesión</Link> o <Link to="/registro">registrarte</Link> para hacerte socio.</p>
            </div>
        </div>
    );
}

function DonacionSocioLoggedIn({ stripePromise, config }) {
    const [step, setStep] = useState(1);
    const [selectedMonthly, setSelectedMonthly] = useState('price_5');
    const [metodoPago, setMetodoPago] = useState('card');
    const currentUser = authApi.getCurrentUser();
    const email = currentUser?.email || '';
    const [nombre, setNombre] = useState(currentUser?.nombre || '');
    const [success, setSuccess] = useState(false);
    const amount = selectedMonthly === 'price_5' ? 5 : 10;
    const priceId = config?.monthlyPrices?.[selectedMonthly];

    if (success) return (
        <div className={styles.container}>
            <div className={styles.successBox}>
                <div className={styles.successIcon}>✓</div>
                <h3>¡Bienvenido Socio!</h3>
                <p>Tu ayuda mensual de {amount}€/mes es muy importante.</p>
                <button onClick={() => { setSuccess(false); setStep(1); }} className={styles.submitBtn}>Volver</button>
            </div>
        </div>
    );

    if (!stripePromise) return <div className={styles.container}><p>Cargando...</p></div>;

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>Hazte Socio</h3>
            
            {step === 1 && (
                <>
                    <div className={styles.monthlyOptions}>
                        <button type="button" onClick={() => setSelectedMonthly('price_5')} 
                            className={`${styles.monthlyBtn} ${selectedMonthly === 'price_5' ? styles.active : ''}`}>5€/mes</button>
                        <button type="button" onClick={() => setSelectedMonthly('price_10')} 
                            className={`${styles.monthlyBtn} ${selectedMonthly === 'price_10' ? styles.active : ''}`}>10€/mes</button>
                    </div>
                    <button onClick={() => setStep(2)} className={styles.mainBtn}>Hacerme socio ({amount}€/mes)</button>
                </>
            )}

            {step === 2 && (
                <>
                    <div className={styles.methodSelector}>
                        <p className={styles.methodLabel}>Elige método de pago:</p>
                        <div className={styles.methodButtons}>
                            {METODOS_SOCIO.map(m => (
                                <button key={m.id} type="button" onClick={() => setMetodoPago(m.id)} 
                                    className={`${styles.methodBtn} ${metodoPago === m.id ? styles.active : ''}`}>
                                    <span>{m.icon}</span> {m.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.formInputs}>
                        <div className={styles.inputGroup}>
                            <label>Email:</label>
                            <input type="email" value={email} className={styles.textInput} disabled />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Nombre:</label>
                            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} 
                                className={styles.textInput} />
                        </div>

                        <Elements stripe={stripePromise}>
                            {metodoPago === 'card' && <CheckoutCard amount={amount} email={email} nombre={nombre} onSuccess={() => setSuccess(true)} priceId={priceId} />}
                            {metodoPago === 'sepa' && <SEPAForm amount={amount} email={email} nombre={nombre} onSuccess={() => setSuccess(true)} priceId={priceId} />}
                            {metodoPago === 'transfer' && <TransferForm amount={amount} onSuccess={() => setSuccess(true)} />}
                        </Elements>

                        <button type="button" onClick={() => setStep(1)} className={styles.backBtn}>← Volver</button>
                    </div>
                </>
            )}
        </div>
    );
}

export default function Donacion({ tipo = 'puntual' }) {
    const [config, setConfig] = useState(null);
    const [stripePromise, setStripePromise] = useState(null);
    const isLoggedIn = !!authApi.getCurrentUser();

    useEffect(() => { 
        (async () => { 
            try { 
                const data = await stripeApi.getConfig();
                setConfig(data);
                if (data.publishableKey) setStripePromise(loadStripe(data.publishableKey));
            } catch (err) { console.error(err); } 
        })(); 
    }, []);

    if (tipo === 'mensual') return isLoggedIn ? <DonacionSocioLoggedIn config={config} stripePromise={stripePromise} /> : <DonacionSocioLoggedOut />;
    return <DonacionPuntual config={config} stripePromise={stripePromise} />;
}