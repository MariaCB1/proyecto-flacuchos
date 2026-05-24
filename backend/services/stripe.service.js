const stripe = require('../config/stripe');
const pool = require('../config/db');
const emailTransporter = require('../config/email');

const LOGO_URL = process.env.APP_LOGO_URL || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQj4k24WBr9WJDfNaTU7KK-y0C3nBEr5_Q79g&s';

const STRIPE_PRICE_5 = process.env.STRIPE_MONTHLY_PRICE_ID_5;
const STRIPE_PRICE_10 = process.env.STRIPE_MONTHLY_PRICE_ID_10;

async function getOrCreateCustomer(email, nombre, datosPersonales = null, usuarioId = null) {
    let customerId = null;
    
    if (email && email.includes('@')) {
        const existingCustomers = await stripe.customers.list({
            email: email,
            limit: 1
        });
        if (existingCustomers.data.length > 0) {
            customerId = existingCustomers.data[0].id;

            if (usuarioId && !existingCustomers.data[0].metadata?.usuarioId) {
                await stripe.customers.update(customerId, {
                    metadata: { usuarioId: usuarioId.toString() }
                });
            }
            return existingCustomers.data[0];
        }
    }

    const customer = await stripe.customers.create({
        email: email && email.includes('@') ? email : undefined,
        name: nombre || 'Socio Flacchos',
        metadata: usuarioId ? { usuarioId: usuarioId.toString() } : {}
    });
    return customer;
}

async function createPaymentIntent(amount, email, nombre, metodoPago = 'card', usuarioId = null, metadata = null, setup_future_usage = null) {
    const customer = await stripe.customers.create({
        email: email && email.includes('@') ? email : undefined,
        name: nombre || 'Donante Flacuchos'
    });

    const isApadrinamiento = metadata?.tipo === 'apadrinamiento';
    
    const paymentIntentParams = {
        amount: Math.round(amount * 100),
        currency: 'eur',
        payment_method_types: ['card'],
        customer: customer.id,
        description: isApadrinamiento 
            ? `Apadrinamiento mensual - ${nombre || 'Padrino'}` 
            : `Donación a Flacuchos - ${nombre || 'Donante'}`,
        metadata: {
            tipo: metadata?.tipo || (isApadrinamiento ? 'apadrinamiento' : 'donacion_puntual'),
            nombre: nombre || '',
            email: email || '',
            usuarioId: usuarioId || '',
            ...metadata
        },
        ...(email && email.includes('@') && { receipt_email: email }),
        ...(setup_future_usage && { setup_future_usage: 'off_session' })
    };

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

    if (!isApadrinamiento) {
        await saveDonacion(paymentIntent, 'pending', usuarioId, nombre, email);
    }

    return paymentIntent;
}

async function ejecutarCobroDirecto(customerId, paymentMethodId, amount, description = 'Cobro Flacuchos') {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency: 'eur',
            payment_method: paymentMethodId,
            customer: customerId,
            description: description,
            confirm: true,
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: 'never'
            }
        });
        return paymentIntent;
    } catch (error) {
        console.error('Error executing direct charge:', error.message);
        throw error;
    }
}

async function cancelPaymentIntent(paymentId) {
    try {
        await stripe.paymentIntents.cancel(paymentId);
        await pool.query('DELETE FROM donaciones WHERE stripe_payment_id = $1', [paymentId]);
    } catch (error) {
        console.error('Error canceling payment intent:', error.message);
        throw error;
    }
}

async function createSepaMandate(email, nombre) {
    try {
        const customer = await stripe.customers.create({
            email: email && email.includes('@') ? email : undefined,
            name: nombre || 'Nuevo Socio Flacuchos'
        });

        const setupIntent = await stripe.setupIntents.create({
            customer: customer.id,
            payment_method_types: ['sepa_debit'],
            usage: 'off_session'
        });

        return { success: true, setupIntent, customerId: customer.id };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function createSubscription(priceId, email, nombre, usuarioId = null, metodoPago = 'card', datosPersonales = null) {
    // Limpiar suscripciones canceladas y pendientes anteriores del usuario
    if (usuarioId) {
        await limpiarSuscripcionesCanceladas(usuarioId);
    }

    const customer = await getOrCreateCustomer(email, nombre, datosPersonales, usuarioId);

    if (metodoPago === 'sepa') {
        const setupIntent = await stripe.setupIntents.create({
            customer: customer.id,
            payment_method_types: ['sepa_debit'],
            usage: 'off_session'
        });

        const aportacion = priceId === STRIPE_PRICE_5 ? 5 : 10;
        
        // GUARDAR EN BD CON ESTADO 'iniciando' - NO se considera socio hasta que se confirme el pago
        // Este estado evita que el usuario acceda a pantalla de bienvenida
        if (usuarioId) {
            await saveSocioTemporal(usuarioId, 'pending_setup_' + setupIntent.id, customer.id, priceId, metodoPago, email, datosPersonales);
        }
        
        return {
            id: 'pending_setup_' + setupIntent.id,
            setupIntentId: setupIntent.id,
            customerId: customer.id,
            clientSecret: setupIntent.client_secret,
            priceId: priceId,
            pendingSetup: true
        };
    }

    // Crear PaymentIntent para la primera cuota (NO guardar en BD, se guarda después del pago exitoso)
    const price = priceId === STRIPE_PRICE_5 ? 500 : 1000;
    const paymentIntent = await stripe.paymentIntents.create({
        amount: price,
        currency: 'eur',
        customer: customer.id,
        payment_method_types: ['card'],
        setup_future_usage: 'off_session',
        description: 'Primera cuota de socio Flacucos',
        metadata: {
            tipo: 'socio_primera_cuota',
            priceId: priceId,
            usuarioId: usuarioId || '',
            nombre: nombre || '',
            email: email || ''
        }
    });

    return {
        subscriptionId: null,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        customerId: customer.id,
        priceId: priceId,
        isFirstPayment: true
    };
}

// Función para crear la suscripción real después del pago exitoso
async function crearSuscripcionReal(usuarioId, paymentIntentId) {
    try {
        // Obtener el payment intent para saber el customer y priceId
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
        throw new Error('El pago no ha sido completado');
    }

    const invalidPaymentStatuses = ['incomplete', 'requires_confirmation', 'requires_payment_method', 'canceled', 'failed'];
    if (invalidPaymentStatuses.includes(paymentIntent.status)) {
        throw new Error('El método de pago no es válido o está incompleto. Por favor, intenta con otra tarjeta.');
    }

        const customerId = paymentIntent.customer;
        const priceId = paymentIntent.metadata?.priceId;
        
        if (!priceId) {
            throw new Error('No se encontró el priceId en el payment intent');
        }

        // Obtener el payment method usado en el pago
        const paymentMethodId = paymentIntent.payment_method;
        
        if (!paymentMethodId) {
            throw new Error('No se encontró el payment method');
        }

        // Actualizar el cliente para guardar el payment method como predeterminado
        await stripe.customers.update(customerId, {
            invoice_settings: { default_payment_method: paymentMethodId }
        });

        // Calcular anchor para el primer día del mes que viene
        const now = new Date();
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const anchorTimestamp = Math.floor(nextMonth.getTime() / 1000);

        // Crear la suscripción real en Stripe (sin cobrar inmediatamente)
        const subscription = await stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: priceId }],
            default_payment_method: paymentMethodId,
            billing_cycle_anchor: anchorTimestamp,
            proration_behavior: 'none'
        });

        await pool.query(
            `UPDATE socios SET
                stripe_subscription_id = $1,
                stripe_customer_id = $2,
                stripe_price_id = $3,
                estado = 'active'
             WHERE usuario_id = $4 AND stripe_subscription_id = $5`,
            [subscription.id, customerId, priceId, usuarioId, 'pending_' + paymentIntentId]
        );

        // Activar es_socio en la tabla de usuarios
        await pool.query(
            `UPDATE usuarios SET es_socio = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
            [usuarioId]
        );

        // Enviar notificación al socio
        const aportacion = priceId === STRIPE_PRICE_5 ? 5 : 10;
        await pool.query(
            `INSERT INTO notificaciones (usuario_id, tipo, mensaje, referencia_id)
             VALUES ($1, 'socio_aprobado', $2, NULL)`,
            [usuarioId, `¡Bienvenido/a Socio! Tu pago de ${aportacion}€/mes ha sido procesado correctamente.`]
        );

        // Enviar email de bienvenida
        try {
            const emailService = require('./email.service');
            const usuario = await pool.query('SELECT email, nombre FROM usuarios WHERE id = $1', [usuarioId]);
            if (usuario.rows[0]?.email) {
                await emailService.enviarEmailSocioRegistrado({
                    email: usuario.rows[0].email,
                    nombre: usuario.rows[0].nombre,
                    aportacion: aportacion
                });
            }
        } catch (emailErr) {
            console.error('Error enviando email de socio:', emailErr.message);
        }

        return { success: true, subscriptionId: subscription.id };
    } catch (error) {
        throw error;
    }
}

async function createSubscriptionFromSetup(setupIntentId, priceId, usuarioId = null, metodoPago = 'sepa', datosPersonales = null) {
    const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);
    const aportacion = priceId === STRIPE_PRICE_5 ? 5 : 10;

    console.log('🔍 [DEBUG BACKEND] SetupIntent desde Stripe:', JSON.stringify(setupIntent, null, 2));
    console.log('🔍 [DEBUG BACKEND] setupIntent.status:', setupIntent.status);
    console.log('🔍 [DEBUG BACKEND] setupIntent.last_setup_error:', setupIntent.last_setup_error);
    console.log('🔍 [DEBUG BACKEND] setupIntent.latest_attempt:', setupIntent.latest_attempt);

    // EVALUAR EL LATEST ATTEMPT PARA DETECTAR FALLOS EN LA VALIDACIÓN DEL IBAN
    if (setupIntent.latest_attempt) {
        try {
            // Usar axios para hacer la llamada directa a la API de Stripe
            // Endpoint correcto: GET /v1/setup_attempts?setup_intent=seti_xxx
            const axios = require('axios');
            const response = await axios.get(
                'https://api.stripe.com/v1/setup_attempts',
                {
                    params: { setup_intent: setupIntentId },
                    headers: {
                        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`
                    }
                }
            );
            
            const attempts = response.data;
            console.log('🔍 [DEBUG BACKEND] Attempts list:', JSON.stringify(attempts, null, 2));
            
            // El último attempt es el más reciente
            const attempt = attempts.data[0];
            if (attempt) {
                console.log('🔍 [DEBUG BACKEND] Attempt status:', attempt.status);
                console.log('🔍 [DEBUG BACKEND] Attempt setup_error:', attempt.setup_error);

                // Si el attempt falló, rechazar el registro
                if (attempt.status === 'failed' || attempt.setup_error) {
                    const errorMessage = attempt.setup_error?.message || 'El banco ha rechazado el IBAN. Por favor, prueba con otro.';
                    
                    if (usuarioId) {
                        await pool.query(
                            `UPDATE socios SET estado = 'payment_failed', canceled_at = CURRENT_TIMESTAMP 
                             WHERE stripe_subscription_id = $1 AND estado = 'iniciando'`,
                            ['pending_setup_' + setupIntentId]
                        );
                        await pool.query(
                            `UPDATE usuarios SET es_socio = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
                            [usuarioId]
                        );
                    }
                    
                    throw new Error(errorMessage);
                }
            }
        } catch (attemptErr) {
            console.error('Error al recuperar el attempt:', attemptErr.message);
        }
    }

    // EVALUAR ESTADO DEL SETUPINTENT INMEDIATAMENTE
    // Estados que indican pago FALLIDO/CANCELADO - NO registrar como socio
    const failedStatuses = ['canceled', 'failed', 'requires_payment_method'];
    
    // Validar que el estado no sea null/undefined (tratar como error)
    if (!setupIntent.status || setupIntent.status === null || setupIntent.status === undefined) {
        if (usuarioId) {
            await pool.query(
                `UPDATE socios SET estado = 'payment_failed', canceled_at = CURRENT_TIMESTAMP 
                 WHERE stripe_subscription_id = $1 AND estado = 'iniciando'`,
                ['pending_setup_' + setupIntentId]
            );
            await pool.query(
                `UPDATE usuarios SET es_socio = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
                [usuarioId]
            );
        }
        throw new Error('No se pudo obtener el estado del pago. Por favor, intenta de nuevo.');
    }
    
    if (failedStatuses.includes(setupIntent.status) || setupIntent.last_setup_error) {
        // El pago ha fallado - actualizar el registro temporal a 'payment_failed' y NO marcar como socio
        if (usuarioId) {
            await pool.query(
                `UPDATE socios SET estado = 'payment_failed', canceled_at = CURRENT_TIMESTAMP 
                 WHERE stripe_subscription_id = $1 AND estado = 'iniciando'`,
                ['pending_setup_' + setupIntentId]
            );
            
            // Asegurar que NO está marcado como socio
            await pool.query(
                `UPDATE usuarios SET es_socio = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
                [usuarioId]
            );
        }
        
        const errorMsg = setupIntent.last_setup_error?.message || 'El método de pago no es válido o ha sido rechazado por el banco. Por favor, intenta con otro IBAN.';
        throw new Error(errorMsg);
    }

    // El setupIntent está en estado 'succeeded', 'processing' o 'pending'
    // Procedemos con la creación de la suscripción
    const customerId = setupIntent.customer;
    const paymentMethodId = setupIntent.payment_method;

    const customer = await stripe.customers.retrieve(customerId);
    const email = customer.email;
    const nombreSocio = datosPersonales?.nombre_apellidos || customer.name || 'Socio';

    const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        default_payment_method: paymentMethodId,
        expand: ['latest_invoice.payment_intent']
    });

    console.log('🔍 [DEBUG BACKEND] Subscription creada:', JSON.stringify(subscription, null, 2));
    console.log('🔍 [DEBUG BACKEND] subscription.status:', subscription.status);

    const invalidSubscriptionStatuses = ['incomplete', 'past_due', 'unpaid', 'canceled'];
    
    // Validar que el estado de la suscripción no sea null/undefined
    if (!subscription.status || subscription.status === null || subscription.status === undefined) {
        await stripe.subscriptions.cancel(subscription.id);
        if (usuarioId) {
            await pool.query(
                `UPDATE socios SET estado = 'payment_failed', canceled_at = CURRENT_TIMESTAMP 
                 WHERE stripe_subscription_id = $1 AND estado = 'iniciando'`,
                ['pending_setup_' + setupIntentId]
            );
            await pool.query(
                `UPDATE usuarios SET es_socio = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
                [usuarioId]
            );
        }
        throw new Error('No se pudo obtener el estado de la suscripción. Por favor, intenta de nuevo.');
    }
    
    if (invalidSubscriptionStatuses.includes(subscription.status)) {
        // La suscripción tiene estado inválido - marcar como fallido
        await stripe.subscriptions.cancel(subscription.id);
        
        if (usuarioId) {
            await pool.query(
                `UPDATE socios SET estado = 'payment_failed', canceled_at = CURRENT_TIMESTAMP 
                 WHERE stripe_subscription_id = $1 AND estado = 'iniciando'`,
                ['pending_setup_' + setupIntentId]
            );
            await pool.query(
                `UPDATE usuarios SET es_socio = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
                [usuarioId]
            );
        }
        
        throw new Error('El pago no se ha completado correctamente. Por favor, intenta de nuevo con otro método de pago.');
    }

    // Verificar el mandato SEPA
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    if (paymentMethod.type === 'sepa_debit' && paymentMethod.sepa_debit) {
        const mandateReference = paymentMethod.sepa_debit.mandate_reference;
        if (mandateReference) {
            const mandate = await stripe.mandates.retrieve(mandateReference);
            if (mandate.status !== 'active') {
                // El mandato no está activo - el IBAN fue rechazado
                await stripe.subscriptions.cancel(subscription.id);
                
                if (usuarioId) {
                    await pool.query(
                        `UPDATE socios SET estado = 'payment_failed', canceled_at = CURRENT_TIMESTAMP 
                         WHERE stripe_subscription_id = $1 AND estado = 'iniciando'`,
                        ['pending_setup_' + setupIntentId]
                    );
                    await pool.query(
                        `UPDATE usuarios SET es_socio = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
                        [usuarioId]
                    );
                }
                
                throw new Error('Tu IBAN ha sido rechazado por el banco. Por favor, prueba con otro método de pago.');
            }
        }
    }

    // Actualizar el socio temporal a 'pending' (el primer cobro se procesará en 1-2 días)
    // IMPORTANTE: NO marcamos es_socio = TRUE todavía - esperaremos a que el pago se confirme
    if (datosPersonales) {
        await updateSocioCompleto(usuarioId, 'pending_setup_' + setupIntentId, subscription.id, customerId, priceId, metodoPago, datosPersonales);
    } else {
        await saveSocio(usuarioId, subscription.id, customerId, priceId, metodoPago);
    }

    if (usuarioId) {
        // Registrar al socio pero mantener es_socio = FALSE hasta que el pago se confirme
        // Esto impide que acceda a la pantalla de bienvenida todavía
        // NOTA: Por ahora mantenemos es_socio = TRUE porque el flujo actual lo requiere
        // pero el estado 'pending' en la tabla socios indica que el pago aún no está confirmado
        
        await pool.query(
            `UPDATE usuarios SET es_socio = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
            [usuarioId]
        );

        await pool.query(
            `INSERT INTO notificaciones (usuario_id, tipo, mensaje, referencia_id)
             VALUES ($1, 'socio_aprobado', $2, NULL)`,
            [usuarioId, `¡Bienvenido/a socio! Tu domiciliación SEPA está activa desde este momento. El primer cobro se procesará en 1-2 días hábiles. Si el pago es rechazado o cancelado, dejarás de ser socio y te informaremos.`]
        );

        try {
            const emailService = require('./email.service');
            await emailService.enviarEmailSocioRegistrado({
                email: email,
                nombre: nombreSocio,
                aportacion: aportacion
            });
        } catch (emailErr) {
            console.error('Error enviando email de socio SEPA:', emailErr.message);
        }
    }

    return { ...subscription, socioActivado: true };
}

async function handleWebhook(body, signature) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
        throw new Error(`Webhook signature verification failed: ${err.message}`);
    }

    switch (event.type) {
        case 'payment_intent.succeeded':
            await handlePagoExitoso(event.data.object);
            break;
        case 'payment_intent.payment_failed':
            await handlePagoFallido(event.data.object);
            break;
        case 'payment_intent.canceled':
            await handlePagoCancelado(event.data.object);
            break;
        case 'customer.subscription.created':
            await saveSuscripcion(event.data.object);
            break;
        case 'customer.subscription.updated':
            await updateSuscripcion(event.data.object);
            break;
        case 'customer.subscription.deleted':
            await deleteSuscripcion(event.data.object);
            break;
        case 'invoice.paid':
            await handleInvoicePaid(event.data.object);
            break;
        case 'invoice.payment_failed':
            await handleInvoicePaymentFailed(event.data.object);
            break;
        case 'mandate.updated':
            await handleMandateUpdated(event.data.object);
            break;
        case 'payment_method.failed':
            await handlePaymentMethodFailed(event.data.object);
            break;
    }

    return event;
}

async function handlePagoExitoso(paymentIntent) {
    const paymentId = paymentIntent.id;
    const monto = Math.round(paymentIntent.amount / 100);
    const metadata = paymentIntent.metadata || {};
    const usuarioId = metadata.usuarioId || null;
    const tipoPago = metadata.tipo || '';
    const priceId = metadata.priceId || '';
    let nombreDonante = metadata.nombre || '';
    let emailDonante = metadata.email || '';

    // Si no hay metadata, buscar en la base de datos
    if (!emailDonante) {
        const donacionData = await pool.query(
            'SELECT nombre, email FROM donaciones WHERE stripe_payment_id = $1',
            [paymentId]
        );
        if (donacionData.rows.length > 0) {
            nombreDonante = nombreDonante || donacionData.rows[0].nombre || '';
            emailDonante = donacionData.rows[0].email || '';
        }
    }

    const result = await pool.query(
        `UPDATE donaciones SET estado = 'completada', usuario_id = COALESCE(usuario_id, $1), nombre = $2, email = $3 
         WHERE stripe_payment_id = $4 RETURNING id`,
        [usuarioId, nombreDonante, emailDonante, paymentId]
    );
    
    const donacionId = result.rows[0]?.id || null;

    // Si es un pago de socio (primera cuota), crear la suscripción real en Stripe
    if (tipoPago === 'socio_primera_cuota' && priceId) {
        try {
            let customerId = paymentIntent.customer;
            
            // Agregar usuarioId a la metadata del cliente para el webhook
            if (usuarioId) {
                await stripe.customers.update(customerId, {
                    metadata: { usuarioId: usuarioId.toString() }
                });
            }
            
            // Crear la suscripción real en Stripe
            const subscription = await stripe.subscriptions.create({
                customer: customerId,
                items: [{ price: priceId }],
                payment_behavior: 'default_incomplete',
                payment_settings: { save_default_payment_method: 'on_subscription' },
                expand: ['latest_invoice.payment_intent']
            });



            // Actualizar el registro del socio con el subscription_id real y marcar como activo
            if (usuarioId) {
                await pool.query(
                    `UPDATE socios SET 
                        stripe_subscription_id = $1,
                        stripe_customer_id = COALESCE($2, stripe_customer_id),
                        stripe_price_id = COALESCE($3, stripe_price_id),
                        estado = 'active'
                     WHERE usuario_id = $4 AND stripe_subscription_id LIKE 'pending_%' AND estado = 'pending'`,
                    [subscription.id, customerId, priceId, usuarioId]
                );

                // Marcar al usuario como socio
                await pool.query(
                    `UPDATE usuarios SET es_socio = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
                    [usuarioId]
                );

                const aportacion = priceId === STRIPE_PRICE_5 ? 5 : 10;
                await notificarSocioCreado(usuarioId, 'Socio', aportacion);
            }
        } catch (err) {
            console.error('ERROR al crear suscripción:', err.message);
        }
    }

    if (usuarioId) {
        await pool.query(
            `INSERT INTO notificaciones (usuario_id, tipo, mensaje, referencia_id)
             VALUES ($1, 'donacion_exitosa', '¡Gracias por tu donacion de ${monto}€! Tu ayuda es muy importante para nuestros animales.', $2)`,
            [usuarioId, donacionId]
        );
    }

    await enviarEmailDonacionEstado(nombreDonante, emailDonante, monto, 'completada');
    await enviarNotificacionAdmin(nombreDonante, emailDonante, monto, 'completada', donacionId);
}

async function handlePagoCancelado(paymentIntent) {
    const paymentId = paymentIntent.id;
    const metadata = paymentIntent.metadata || {};
    const usuarioId = metadata.usuarioId || null;
    let nombreDonante = metadata.nombre || '';
    let emailDonante = metadata.email || '';
    const monto = Math.round(paymentIntent.amount / 100);

    // Si no hay metadata, buscar en la base de datos
    if (!emailDonante) {
        const donacionData = await pool.query(
            'SELECT nombre, email FROM donaciones WHERE stripe_payment_id = $1',
            [paymentId]
        );
        if (donacionData.rows.length > 0) {
            nombreDonante = nombreDonante || donacionData.rows[0].nombre || '';
            emailDonante = donacionData.rows[0].email || '';
        }
    }

    const result = await pool.query(
        `UPDATE donaciones SET estado = 'cancelada' WHERE stripe_payment_id = $1 RETURNING id`,
        [paymentId]
    );
    
    const donacionId = result.rows[0]?.id || null;

    if (usuarioId) {
        await pool.query(
            `INSERT INTO notificaciones (usuario_id, tipo, mensaje, referencia_id)
             VALUES ($1, 'donacion_cancelada', 'Tu donacion de ${monto}€ ha sido cancelada. Puedes intentarlo de nuevo cuando quieras.', $2)`,
            [usuarioId, donacionId]
        );
    }

    await enviarEmailDonacionEstado(nombreDonante, emailDonante, monto, 'cancelada');
}

async function handlePagoFallido(paymentIntent) {
    const paymentId = paymentIntent.id;
    const metadata = paymentIntent.metadata || {};
    const usuarioId = metadata.usuarioId || null;
    const tipoPago = metadata.tipo || '';
    const monto = Math.round(paymentIntent.amount / 100);

    if (tipoPago === 'socio_primera_cuota' && usuarioId) {
        const socioResult = await pool.query(
            `UPDATE socios SET
                estado = 'payment_failed'
             WHERE stripe_subscription_id LIKE 'pending_' || $1 AND estado = 'pending'
             RETURNING usuario_id`,
            [paymentId]
        );

        if (socioResult.rows.length > 0) {
            await pool.query(
                `UPDATE usuarios SET es_socio = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
                [usuarioId]
            );

            await pool.query(
                `INSERT INTO notificaciones (usuario_id, tipo, mensaje, referencia_id)
                 VALUES ($1, 'solicitud_rechazada', $2, NULL)`,
                [usuarioId, 'Tu pago ha sido rechazado. Has dejado de ser socio. Por favor, regístrate de nuevo con otro método de pago si quieres seguir contribuyendo.']
            );
        }
    }

    await pool.query(
        `UPDATE donaciones SET estado = 'cancelada' WHERE stripe_payment_id = $1`,
        [paymentId]
    );
}

async function handleMandateUpdated(mandate) {
    if (mandate.status === 'inactive') {
        const paymentMethodId = mandate.payment_method;
        const customerId = mandate.customer;

        if (customerId) {
            const socioResult = await pool.query(
                `UPDATE socios SET
                    estado = 'payment_failed',
                    canceled_at = CURRENT_TIMESTAMP
                 WHERE stripe_customer_id = $1 AND estado IN ('pending', 'active')
                 RETURNING usuario_id, stripe_subscription_id, nombre_apellidos`,
                [customerId]
            );

            if (socioResult.rows.length > 0) {
                const { usuario_id, stripe_subscription_id, nombre_apellidos } = socioResult.rows[0];

                if (stripe_subscription_id && !stripe_subscription_id.startsWith('pending')) {
                    try {
                        await stripe.subscriptions.cancel(stripe_subscription_id);
                    } catch (cancelErr) {
                        console.error('Error cancelando subscription:', cancelErr.message);
                    }
                }

                await pool.query(
                    `UPDATE usuarios SET es_socio = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
                    [usuario_id]
                );

                const socioInfo = await pool.query(
                    `SELECT email FROM usuarios WHERE id = $1`,
                    [usuario_id]
                );
                const email = socioInfo.rows[0]?.email;

                await pool.query(
                    `INSERT INTO notificaciones (usuario_id, tipo, mensaje, referencia_id)
                     VALUES ($1, 'solicitud_rechazada', $2, NULL)`,
                    [usuario_id, 'Tu pago ha sido rechazado. Has dejado de ser socio. Por favor, regístrate de nuevo con otro método de pago si quieres seguir contribuyendo.']
                );

                if (email) {
                    try {
                        const emailService = require('./email.service');
                        await emailService.enviarEmailSocioCancelado({
                            email: email,
                            nombre: nombre_apellidos || 'Socio'
                        });
                    } catch (emailErr) {
                        console.error('Error enviando email de rechazo:', emailErr.message);
                    }
                }
            }
        }
    }
}

async function handlePaymentMethodFailed(paymentMethod) {
    if (paymentMethod.type === 'sepa_debit') {
        const customerId = paymentMethod.customer;

        if (customerId) {
            const socioResult = await pool.query(
                `UPDATE socios SET
                    estado = 'payment_failed',
                    canceled_at = CURRENT_TIMESTAMP
                 WHERE stripe_customer_id = $1 AND estado IN ('pending', 'active')
                 RETURNING usuario_id, stripe_subscription_id`,
                [customerId]
            );

            if (socioResult.rows.length > 0) {
                const { usuario_id, stripe_subscription_id } = socioResult.rows[0];

                if (stripe_subscription_id && !stripe_subscription_id.startsWith('pending')) {
                    try {
                        await stripe.subscriptions.cancel(stripe_subscription_id);
                    } catch (cancelErr) {
                        console.error('Error cancelando subscription:', cancelErr.message);
                    }
                }

                await pool.query(
                    `UPDATE usuarios SET es_socio = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
                    [usuario_id]
                );

                await pool.query(
                    `INSERT INTO notificaciones (usuario_id, tipo, mensaje, referencia_id)
                     VALUES ($1, 'solicitud_rechazada', $2, NULL)`,
                    [usuario_id, 'Tu pago ha sido rechazado. Has dejado de ser socio. Por favor, regístrate de nuevo con otro método de pago si quieres seguir contribuyendo.']
                );
            }
        }
    }
}

async function handleInvoicePaymentFailed(invoice) {
    const customerId = invoice.customer;
    const subscriptionId = invoice.subscription;

    if (customerId || subscriptionId) {
        const socioResult = await pool.query(
            `UPDATE socios SET
                estado = 'payment_failed'
             WHERE stripe_customer_id = $1 AND estado IN ('pending', 'active')
             RETURNING usuario_id, stripe_subscription_id`,
            [customerId]
        );

        if (socioResult.rows.length > 0) {
            const { usuario_id, stripe_subscription_id } = socioResult.rows[0];

            // Desactivar el socio
            await pool.query(
                `UPDATE usuarios SET es_socio = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
                [usuario_id]
            );

            await pool.query(
                `INSERT INTO notificaciones (usuario_id, tipo, mensaje, referencia_id)
                 VALUES ($1, 'solicitud_rechazada', $2, NULL)`,
                [usuario_id, 'Tu pago ha sido rechazado. Has dejado de ser socio. Por favor, regístrate de nuevo con otro método de pago si quieres seguir contribuyendo.']
            );
        }
    }
}

async function handleInvoicePaid(invoice) {
    const customerId = invoice.customer;
    const subscriptionId = invoice.subscription;
    const monto = Math.round((invoice.amount_paid || 0) / 100);

    if (customerId) {
        const socioExistente = await pool.query(
            `SELECT id, usuario_id, aportacion FROM socios
             WHERE stripe_customer_id = $1 AND estado = 'active'
             ORDER BY started_at DESC LIMIT 1`,
            [customerId]
        );

        if (socioExistente.rows.length > 0) {
            return;
        }

        const socioPendiente = await pool.query(
            `SELECT id, usuario_id, aportacion FROM socios
             WHERE stripe_customer_id = $1 AND estado IN ('pending', 'payment_failed')
             ORDER BY started_at DESC LIMIT 1`,
            [customerId]
        );

        if (socioPendiente.rows.length > 0) {
            const { id: socioId, usuario_id, aportacion } = socioPendiente.rows[0];

            await pool.query(
                `UPDATE socios SET estado = 'active', stripe_subscription_id = $1 WHERE id = $2`,
                [subscriptionId, socioId]
            );

            await pool.query(
                `UPDATE usuarios SET es_socio = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
                [usuario_id]
            );

            await pool.query(
                `INSERT INTO notificaciones (usuario_id, tipo, mensaje, referencia_id)
                 VALUES ($1, 'socio_aprobado', $2, NULL)`,
                [usuario_id, `¡Bienvenido/a Socio! Tu pago de ${aportacion}€/mes ha sido procesado correctamente.`]
            );

            try {
                const emailService = require('./email.service');
                const usuario = await pool.query('SELECT email, nombre FROM usuarios WHERE id = $1', [usuario_id]);
                if (usuario.rows[0]?.email) {
                    await emailService.enviarEmailSocioRegistrado({
                        email: usuario.rows[0].email,
                        nombre: usuario.rows[0].nombre,
                        aportacion: aportacion
                    });
                }
            } catch (emailErr) {
                console.error('Error enviando email de socio:', emailErr.message);
            }
        }
    }
}

async function enviarEmailDonacionEstado(nombre, email, monto, estado) {
    if (!email || !email.includes('@')) {
        try {
            await pool.query(
                `INSERT INTO notificaciones (usuario_id, tipo, mensaje)
                 SELECT id, 'sistema', $1 FROM usuarios WHERE rol = 'admin'`,
                [`ERROR: Email de donation vacío. Nombre: ${nombre}, Monto: ${monto}€, Estado: ${estado}`]
            );
        } catch (err) {
            console.error('Error enviando notificación de error:', err);
        }
        return;
    }

    let asunto = '';
    let mensaje = '';
    let color = '#00897B';

    if (estado === 'completada') {
        asunto = `¡Gracias por tu donacion de ${monto}€!`;
        mensaje = `Tu donacion de <strong>${monto}€</strong> ha sido procesada correctamente.`;
    } else if (estado === 'cancelada') {
        asunto = `Tu donacion de ${monto}€ ha sido cancelada`;
        mensaje = `Tu donacion de <strong>${monto}€</strong> ha sido cancelada. Puedes intentarlo de nuevo cuando quieras.`;
        color = '#e53935';
    } else {
        asunto = `Tu donacion de ${monto}€ está siendo procesada`;
        mensaje = `Tu donacion de <strong>${monto}€</strong> está siendo procesada. Te notificaremos cuando se complete.`;
        color = '#f9a825';
    }

    try {
        if (!emailTransporter) {
            console.error('ERROR: emailTransporter no está definido');
            return;
        }
        
        const tituloEstado = estado === 'completada' ? '¡Gracias por tu donación!' : estado === 'cancelada' ? 'Donación cancelada' : 'Donación en proceso';
        const tituloSecundario = estado === 'completada' ? 'Tu donación ha sido procesada correctamente' : estado === 'cancelada' ? 'Tu donación ha sido cancelada' : 'Tu donación está siendo procesada';
        
        const info = await emailTransporter.sendMail({
            from: process.env.SMTP_USER,
            to: email,
            subject: asunto,
            html: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; padding: 20px; }
    .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .email-header { background: linear-gradient(135deg, ${color} 0%, ${color}cc 100%); padding: 30px 40px; text-align: center; }
    .email-header img { width: 80px; height: 80px; border-radius: 50%; margin-bottom: 10px; background: #ffffff; }
    .email-header h1 { color: #ffffff; font-size: 24px; font-weight: 700; margin-bottom: 5px; }
    .email-header p { color: rgba(255,255,255,0.9); font-size: 14px; }
    .email-body { padding: 30px 40px; }
    .section { margin-bottom: 25px; }
    .section-title { color: ${color}; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
    .info-card { background: #F5F9F8; border-radius: 12px; padding: 20px; border-left: 4px solid ${color}; }
    .info-row { display: flex; margin-bottom: 12px; }
    .info-row:last-child { margin-bottom: 0; }
    .info-label { font-weight: 600; color: ${color}; width: 120px; flex-shrink: 0; font-size: 13px; }
    .info-value { color: #333333; font-size: 14px; word-break: break-word; }
    .message-text { color: #333333; font-size: 14px; line-height: 1.6; }
    .email-footer { background: ${color}; padding: 20px 40px; text-align: center; }
    .email-footer p { color: rgba(255,255,255,0.9); font-size: 12px; }
    .email-footer a { color: #ffffff; text-decoration: none; }
    @media (max-width: 600px) {
      body { padding: 10px; }
      .email-container { border-radius: 0; }
      .email-header, .email-body, .email-footer { padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <img src="${LOGO_URL}" alt="Flacuchos Baena" />
      <h1>Flacuchos Baena</h1>
      <p>${tituloEstado}</p>
    </div>
    <div class="email-body">
      <div class="section">
        <div class="section-title">Detalles de tu donación</div>
        <div class="info-card">
          <div class="info-row">
            <span class="info-label">Nombre</span>
            <span class="info-value">${nombre || 'Amigo de los animales'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Monto</span>
            <span class="info-value">${monto}€</span>
          </div>
          <div class="info-row">
            <span class="info-label">Estado</span>
            <span class="info-value">${estado === 'completada' ? 'Completado' : estado === 'cancelada' ? 'Cancelado' : 'Pendiente'}</span>
          </div>
        </div>
      </div>
      <div class="section">
        <p class="message-text">${mensaje}</p>
        <p class="message-text" style="margin-top: 15px;">Con tu ayuda, podemos seguir cuidando de los animales que más lo necesitan.</p>
      </div>
    </div>
    <div class="email-footer">
      <p>Equipo de Flacuchos Baena</p>
    </div>
  </div>
</body>
</html>
            `
        });

    } catch (err) {
        console.error('ERROR enviando email de donacion:', err.message);
    }
}

async function enviarNotificacionAdmin(nombre, email, monto, estado, donacionId = null) {
    const tipo = estado === 'completada' ? 'donacion_exitosa' : 'donacion_cancelada';
    const mensaje = estado === 'completada' 
        ? `Nueva donacion recibida: ${monto}€ de ${nombre} (${email})`
        : `Donación cancelada: ${monto}€ de ${nombre} (${email})`;

    try {
        await pool.query(
            `INSERT INTO notificaciones (usuario_id, tipo, mensaje, referencia_id)
             SELECT id, $1, $2, $3
             FROM usuarios WHERE rol = 'admin'`,
            [tipo, mensaje, donacionId]
        );
    } catch (err) {
        console.error(`Error notifying admin: ${err.message}`);
    }
}

async function saveDonacion(paymentIntent, estadoInicial = 'pending', usuarioId = null, nombre = null, email = null) {
    try {
        const stripePaymentId = paymentIntent.id;
        const monto = Math.round(paymentIntent.amount / 100);
        const tipo = 'puntual';
        const estado = estadoInicial;
        const nombreDonante = nombre || paymentIntent.metadata?.nombre || '';
        const emailDonante = email || paymentIntent.metadata?.email || '';

        const result = await pool.query(
            `INSERT INTO donaciones (usuario_id, stripe_payment_id, nombre, email, monto, tipo, estado)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
            [usuarioId, stripePaymentId, nombreDonante, emailDonante, monto, tipo, estado]
        );
        
        return result.rows[0]?.id || null;
    } catch (error) {
        console.error('Error guardando donacion:', error.message);
        return null;
    }
}

async function getUltimaDonacion(amount) {
    const result = await pool.query(
        `SELECT * FROM donaciones WHERE monto = $1 ORDER BY created_at DESC LIMIT 1`,
        [amount]
    );
    return result.rows;
}

async function getDonacionByPaymentId(paymentIntentId) {
    const result = await pool.query(
        `SELECT * FROM donaciones WHERE stripe_payment_id = $1`,
        [paymentIntentId]
    );
    return result.rows;
}

async function updateDonacionEstado(paymentIntentId, estado) {
    await pool.query(
        `UPDATE donaciones SET estado = $1, updated_at = CURRENT_TIMESTAMP WHERE stripe_payment_id = $2`,
        [estado, paymentIntentId]
    );
}

async function saveSuscripcion(subscription) {
    const customer = await stripe.customers.retrieve(subscription.customer);
    await pool.query(
        `INSERT INTO donaciones (usuario_id, stripe_subscription_id, monto, tipo, estado)
         VALUES ($1, $2, $3, $4, $5)`,
        [null, subscription.id, 0, 'mensual', subscription.status]
    );

    // Si el cliente tiene usuario_id en nuestra base de datos, actualizar el socio
    if (customer.metadata?.usuarioId) {
        await pool.query(
            `UPDATE socios SET
                stripe_subscription_id = $1,
                stripe_customer_id = COALESCE($2, stripe_customer_id),
                estado = 'active'
             WHERE usuario_id = $3 AND (stripe_subscription_id LIKE 'pending_%' OR stripe_subscription_id IS NULL OR stripe_subscription_id = '')`,
            [subscription.id, subscription.customer, customer.metadata.usuarioId]
        );

        // Marcar al usuario como socio
        await pool.query(
            `UPDATE usuarios SET es_socio = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
            [customer.metadata.usuarioId]
        );


    }
}

async function updateSuscripcion(subscription) {
    const subId = subscription.id;
    const customerId = subscription.customer;
    const subStatus = subscription.status;

    const socioResult = await pool.query(
        `SELECT usuario_id, stripe_subscription_id, nombre_apellidos FROM socios WHERE stripe_subscription_id = $1`,
        [subId]
    );

    if (socioResult.rows.length > 0) {
        const { usuario_id, stripe_subscription_id } = socioResult.rows[0];

        if (['past_due', 'unpaid', 'canceled', 'incomplete'].includes(subStatus)) {
            await pool.query(
                `UPDATE socios SET estado = 'payment_failed', canceled_at = CURRENT_TIMESTAMP WHERE stripe_subscription_id = $1`,
                [subId]
            );

            try {
                await stripe.subscriptions.cancel(subId);
            } catch (cancelErr) {
                console.error('Error cancelando subscription:', cancelErr.message);
            }

            await pool.query(
                `UPDATE usuarios SET es_socio = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
                [usuario_id]
            );

            await pool.query(
                `INSERT INTO notificaciones (usuario_id, tipo, mensaje, referencia_id)
                 VALUES ($1, 'solicitud_rechazada', $2, NULL)`,
                [usuario_id, 'Tu pago ha sido rechazado. Has dejado de ser socio. Por favor, regístrate de nuevo con otro método de pago si quieres seguir contribuyendo.']
            );
        } else if (subStatus === 'active') {
            await pool.query(
                `UPDATE socios SET estado = 'active', canceled_at = NULL WHERE stripe_subscription_id = $1 AND estado = 'pending'`,
                [subId]
            );
        }

        return;
    }

    await pool.query(
        `UPDATE donaciones SET estado = $1 WHERE stripe_subscription_id = $2`,
        [subStatus, subId]
    );
}

async function deleteSuscripcion(subscription) {
    await pool.query(
        `UPDATE donaciones SET estado = 'canceled' WHERE stripe_subscription_id = $1`,
        [subscription.id]
    );
}

async function saveSocio(usuarioId, subscriptionId, customerId, priceId, metodoPago) {
    try {
        const aportacion = priceId === STRIPE_PRICE_5 ? 5 : (priceId === STRIPE_PRICE_10 ? 10 : 10);

        await pool.query(
            `INSERT INTO socios (usuario_id, stripe_subscription_id, stripe_customer_id, stripe_price_id, aportacion, metodo_pago, estado)
             VALUES ($1, $2, $3, $4, $5, $6, 'pending')`,
            [usuarioId, subscriptionId, customerId, priceId,aportacion, metodoPago]
        );
    } catch (error) {
        console.error('Error guardando socio:', error.message);
    }
}

async function updateSocioCompleto(usuarioId, oldSubscriptionId, newSubscriptionId, customerId, priceId, metodoPago, datosPersonales) {
    try {
        const aportacion = priceId === STRIPE_PRICE_5 ? 5 : (priceId === STRIPE_PRICE_10 ? 10 : 10);
        const nombreSocio = datosPersonales?.nombre_apellidos || datosPersonales?.nombre || 'Socio';
        
        await pool.query(
            `UPDATE socios SET 
                stripe_subscription_id = $1,
                stripe_customer_id = $2,
                stripe_price_id = $3,
                nombre_apellidos = COALESCE($4, nombre_apellidos),
                dni_nie = COALESCE($5, dni_nie),
                telefono = COALESCE($6, telefono),
                direccion = COALESCE($7, direccion),
                codigo_postal = COALESCE($8, codigo_postal),
                ciudad_provincia = COALESCE($9, ciudad_provincia),
                aportacion = $10,
                metodo_pago = $11,
                estado = 'pending'
             WHERE usuario_id = $12 AND stripe_subscription_id = $13`,
            [
                newSubscriptionId,
                customerId,
                priceId,
                datosPersonales?.nombre_apellidos || null,
                datosPersonales?.dni_nie || null,
                datosPersonales?.telefono || null,
                datosPersonales?.direccion || null,
                datosPersonales?.codigo_postal || null,
                datosPersonales?.ciudad_provincia || null,
                aportacion,
                metodoPago || 'tarjeta',
                usuarioId,
                oldSubscriptionId
            ]
        );
        

        
    } catch (error) {
        console.error('Error actualizando socio completo:', error.message);
    }
}

async function saveSocioTemporal(usuarioId, subscriptionId, customerId, priceId, metodoPago, email, datosPersonales) {
    try {
        const aportacion = priceId === STRIPE_PRICE_5 ? 5 : 10;
        
        // Guardar con estado 'iniciando' - NO se considera socio hasta confirmarse el pago
        // Este estado bloquea el acceso a pantalla de bienvenida
        await pool.query(
            `INSERT INTO socios (
                usuario_id, stripe_subscription_id, stripe_customer_id, stripe_price_id,
                email, aportacion, metodo_pago, estado
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'iniciando')`,
            [
                usuarioId,
                subscriptionId,
                customerId,
                priceId,
                email || null,
                aportacion,
                metodoPago || 'card'
            ]
        );
    } catch (error) {
        console.error('Error guardando socio temporal:', error.message);
    }
}

async function saveSocioCompleto(usuarioId, subscriptionId, customerId, priceId, metodoPago, datosPersonales) {
    try {
        const aportacion = priceId === STRIPE_PRICE_5 ? 5 : 10;
        const nombreSocio = datosPersonales?.nombre_apellidos || 'Socio';
        
        await pool.query(
            `INSERT INTO socios (
                usuario_id, stripe_subscription_id, stripe_customer_id, stripe_price_id,
                nombre_apellidos, dni_nie, telefono,
                direccion, codigo_postal, ciudad_provincia, aportacion,
                metodo_pago, estado
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'pending')`,
            [
                usuarioId,
                subscriptionId,
                customerId,
                priceId,
                datosPersonales?.nombre_apellidos || null,
                datosPersonales?.dni_nie || null,
                datosPersonales?.telefono || null,
                datosPersonales?.direccion || null,
                datosPersonales?.codigo_postal || null,
                datosPersonales?.ciudad_provincia || null,
                aportacion,
                metodoPago || 'card'
            ]
        );
        

        
    } catch (error) {
        console.error('Error guardando socio completo:', error.message);
    }
}

async function notificarSocioCreado(usuarioId, nombreSocio, aportacion) {
    try {
        // Notificación al socio
        await pool.query(
            `INSERT INTO notificaciones (usuario_id, tipo, mensaje, referencia_id)
             VALUES ($1, 'socio_aprobado', $2, $3)`,
            [usuarioId, `¡Bienvenido/a Socio! Tu aportacion de ${aportacion}€/mes ha sido registrada correctamente.`, null]
        );
        
        // Enviar email al socio
        const emailService = require('./email.service');
        const usuario = await pool.query('SELECT email FROM usuarios WHERE id = $1', [usuarioId]);
        
        if (usuario.rows[0]?.email) {
            await emailService.enviarEmailSocioRegistrado({
                nombre: nombreSocio || 'Socio',
                email: usuario.rows[0].email,
                aportacion: aportacion
            });
        }
        
        // Notificación al admin (sin email)
        const admins = await pool.query("SELECT id FROM usuarios WHERE rol = 'admin'");
        for (const admin of admins.rows) {
            await pool.query(
                `INSERT INTO notificaciones (usuario_id, tipo, mensaje, referencia_id)
                 VALUES ($1, 'solicitud_socio', $2, $3)`,
                [admin.id, `Nuevo socio: ${nombreSocio || 'Socio'} (${aportacion}€/mes)`, null]
            );
        }
        
    } catch (error) {
        console.error('Error en notificación de socio:', error.message);
    }
}

async function updateSocioEstado(subscriptionId, estado) {
    await pool.query(
        `UPDATE socios SET estado = $1, canceled_at = CURRENT_TIMESTAMP WHERE stripe_subscription_id = $2`,
        [estado, subscriptionId]
    );
}

async function getSocioByUsuario(usuarioId) {
    const result = await pool.query(
        `SELECT * FROM socios WHERE usuario_id = $1 AND estado = 'active' ORDER BY started_at DESC LIMIT 1`,
        [usuarioId]
    );
    return result.rows;
}

async function confirmPaymentIntent(paymentIntentId) {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
}

async function getAllDonaciones() {
    const result = await pool.query(
        `SELECT d.id, d.usuario_id, d.nombre, d.email, d.monto, d.estado, d.tipo, d.stripe_payment_id, d.created_at,
                u.nombre as usuario_nombre, u.email as usuario_email
         FROM donaciones d
         LEFT JOIN usuarios u ON d.usuario_id = u.id
         ORDER BY d.created_at DESC`
    );
    return result.rows;
}

async function getMisDonaciones(usuarioId) {
    const result = await pool.query(
        `SELECT id, nombre, email, monto, estado, stripe_payment_id, created_at
         FROM donaciones 
         WHERE usuario_id = $1
         ORDER BY created_at DESC`,
        [usuarioId]
    );
    return result.rows;
}

async function getTotalDonaciones() {
    const result = await pool.query(
        `SELECT COALESCE(SUM(monto), 0) as total FROM donaciones WHERE estado = 'completada'`
    );
    return result.rows[0].total;
}

module.exports = {
    createPaymentIntent,
    ejecutarCobroDirecto,
    cancelPaymentIntent,
    createSepaMandate,
    createSubscription,
    createSubscriptionFromSetup,
    handleWebhook,
    saveDonacion,
    getUltimaDonacion,
    getDonacionByPaymentId,
    updateDonacionEstado,
    saveSocio,
    updateSocioEstado,
    getSocioByUsuario,
    confirmPaymentIntent,
    getAllDonaciones,
    getTotalDonaciones,
    getMisDonaciones,
    enviarEmailDonacionEstado,
    STRIPE_PRICE_5,
    STRIPE_PRICE_10,
    limpiarSuscripcionesIncompletas,
    limpiarSuscripcionesCanceladas,
    crearSuscripcionReal,
    marcarSocioFallido,
    cancelarSuscripcionStripe
};

async function cancelarSuscripcionStripe(subscriptionId) {
    try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        if (subscription.status !== 'canceled') {
            const canceled = await stripe.subscriptions.cancel(subscriptionId);

            return canceled;
        }
        return subscription;
    } catch (error) {
        console.error('Error cancelando suscripción en Stripe:', error.message);
        throw error;
    }
}

async function limpiarSuscripcionesIncompletas(usuarioId) {
    try {
        // Obtener socios con subscription_ids que empiezan por sub_ (suscripciones de Stripe)
        const sociosIncompletos = await pool.query(
            `SELECT id, stripe_subscription_id, stripe_customer_id 
             FROM socios 
             WHERE usuario_id = $1 AND estado = 'active' AND stripe_subscription_id LIKE 'sub_%'`,
            [usuarioId]
        );

        for (const socio of sociosIncompletos.rows) {
            try {
                const subscription = await stripe.subscriptions.retrieve(socio.stripe_subscription_id);
                
                // Si la suscripción está incomplete, cancelarla
                if (subscription.status === 'incomplete' || subscription.status === 'incomplete_expired') {
                    await stripe.subscriptions.cancel(socio.stripe_subscription_id);

                }
            } catch (err) {
                // La suscripción puede no existir en Stripe, ignoramos el error

            }
        }
    } catch (error) {
        console.error('Error limpiando suscripciones:', error.message);
    }
}

async function limpiarSuscripcionesCanceladas(usuarioId) {
    try {
        // Buscar suscripciones activas o pendientes del usuario
        const sociosAnteriores = await pool.query(
            `SELECT id, stripe_subscription_id, stripe_customer_id, estado
             FROM socios
             WHERE usuario_id = $1 AND estado IN ('active', 'pending')`,
            [usuarioId]
        );

        for (const socio of sociosAnteriores.rows) {
            // Si tiene una suscripción real en Stripe, cancelarla
            if (socio.stripe_subscription_id && socio.stripe_subscription_id.startsWith('sub_')) {
                try {
                    const subscription = await stripe.subscriptions.retrieve(socio.stripe_subscription_id);
                    if (subscription.status !== 'canceled') {
                        await stripe.subscriptions.cancel(socio.stripe_subscription_id);

                    }
                } catch (err) {

                }
            }
        }
    } catch (error) {
        console.error('Error limpiando suscripciones activas:', error.message);
    }
}

async function marcarSocioFallido(setupIntentId, usuarioId, errorMessage) {
    try {
        // Buscar socio por setupIntentId pendiente (estado 'pending' o 'iniciando')
        const socioResult = await pool.query(
            `UPDATE socios SET 
                estado = 'payment_failed',
                canceled_at = CURRENT_TIMESTAMP
             WHERE stripe_subscription_id LIKE 'pending_setup_' || $1 AND estado IN ('pending', 'iniciando')
             RETURNING usuario_id`,
            [setupIntentId]
        );

        if (socioResult.rows.length > 0) {
            const socioUsuarioId = socioResult.rows[0].usuario_id;

            // Desactivar el socio en usuarios
            await pool.query(
                `UPDATE usuarios SET es_socio = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
                [socioUsuarioId]
            );

            // Notificar al usuario con el mensaje de error específico
            await pool.query(
                `INSERT INTO notificaciones (usuario_id, tipo, mensaje, referencia_id)
                 VALUES ($1, 'solicitud_rechazada', $2, NULL)`,
                [socioUsuarioId, `Tu solicitud de socio no pudo ser procesada: ${errorMessage}. Por favor, intenta de nuevo con otro método de pago.`]
            );

            return { success: true };
        }

        // Si no se encontró por setupIntentId, intentar por usuarioId (limpiar registros huérfanos)
        if (usuarioId) {
            const socioByUser = await pool.query(
                `UPDATE socios SET 
                    estado = 'payment_failed',
                    canceled_at = CURRENT_TIMESTAMP
                 WHERE usuario_id = $1 AND estado IN ('pending', 'iniciando')
                 RETURNING id`,
                [usuarioId]
            );

            if (socioByUser.rows.length > 0) {
                // Desactivar el socio
                await pool.query(
                    `UPDATE usuarios SET es_socio = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
                    [usuarioId]
                );

                // Notificar al usuario
                await pool.query(
                    `INSERT INTO notificaciones (usuario_id, tipo, mensaje, referencia_id)
                     VALUES ($1, 'solicitud_rechazada', $2, NULL)`,
                    [usuarioId, `Tu solicitud de socio no pudo ser procesada: ${errorMessage}. Por favor, intenta de nuevo con otro método de pago.`]
                );

                return { success: true };
            }
        }

        return { success: false, message: 'Socio no encontrado' };
    } catch (error) {
        console.error('Error marcando socio como fallido:', error.message);
        throw error;
    }
}