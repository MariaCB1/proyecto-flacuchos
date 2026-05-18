const stripeService = require('../services/stripe.service');
const pool = require('../config/db');

async function cancelPaymentIntent(req, res) {
    try {
        const { paymentId } = req.body;
        
        if (!paymentId) {
            return res.status(400).json({ error: 'paymentId requerido' });
        }

        await stripeService.cancelPaymentIntent(paymentId);
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error canceling payment intent:', error);
        res.status(500).json({ error: error.message });
    }
}

async function createPaymentIntent(req, res) {
    try {
        const { amount, email, nombre, metodoPago, usuarioId, metadata, setup_future_usage } = req.body;
        
        if (!amount || amount < 1) {
            return res.status(400).json({ error: 'El amount mínimo es 1€' });
        }

        const paymentIntent = await stripeService.createPaymentIntent(
            amount, 
            email, 
            nombre, 
            metodoPago, 
            usuarioId || null,
            metadata,
            setup_future_usage
        );
        
        res.json({ 
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            customerId: paymentIntent.customer
        });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ error: error.message });
    }
}

async function checkDonacion(req, res) {
    try {
        const { paymentId } = req.query;
        
        if (!paymentId) {
            return res.status(400).json({ error: 'paymentId requerido' });
        }
        
        // Verificar estado en Stripe
        const stripe = require('../config/stripe');
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);
        
        // Obtener donation actual
        const donations = await stripeService.getDonacionByPaymentId(paymentId);
        
        if (donations.length === 0) {
            return res.json({ success: false, error: 'Donación no encontrada' });
        }
        
        const donacion = donations[0];
        
        // Verificar y actualizar estado según Stripe
        let nuevoEstado = donacion.estado;
        if (paymentIntent.status === 'succeeded' && donacion.estado === 'pending') {
            await stripeService.updateDonacionEstado(paymentId, 'completada');
            nuevoEstado = 'completada';
        } else if ((paymentIntent.status === 'canceled' || paymentIntent.status === 'incomplete') && donacion.estado === 'pending') {
            await stripeService.updateDonacionEstado(paymentId, 'cancelada');
            nuevoEstado = 'cancelada';
        }
        
        // Obtener datos del pago
        const metadata = paymentIntent.metadata || {};
        const usuarioId = metadata.usuarioId || null;
        
        const nombreDonante = metadata.nombre || donacion.nombre || '';
        const emailDonante = metadata.email || donacion.email || '';
        
        const monto = Math.round(paymentIntent.amount / 100);
        
        // Determinar tipo de notificación según el estado de Stripe
        let tipoNotif = 'donacion_pending';
        let msgNotif = `Tu donacion de ${monto}€ está siendo procesada. Te notificaremos cuando se complete.`;
        let estadoEmail = 'pending';
        
        if (paymentIntent.status === 'succeeded') {
            tipoNotif = 'donacion_exitosa';
            msgNotif = `¡Gracias por tu donacion de ${monto}€! Tu ayuda es muy importante para nuestros animales.`;
            estadoEmail = 'completada';
        } else if (paymentIntent.status === 'canceled' || paymentIntent.status === 'incomplete') {
            tipoNotif = 'donacion_cancelada';
            msgNotif = `Tu donacion de ${monto}€ ha sido cancelada. Puedes intentarlo de nuevo cuando quieras.`;
            estadoEmail = 'cancelada';
        }
        
        // Notificación al usuario solo si hay cambios en el estado y tiene usuarioId
        if (nuevoEstado !== donacion.estado && usuarioId) {
            try {
                await pool.query(
                    `INSERT INTO notificaciones (usuario_id, tipo, mensaje)
                     VALUES ($1, $2, $3)`,
                    [usuarioId, tipoNotif, msgNotif]
                );
            } catch (err) {
                console.error('Error creando notificación usuario:', err.message);
            }
        }
        
        // Notificar al admin siempre que el pago sea exitoso
        if (paymentIntent.status === 'succeeded') {
            try {
                await pool.query(
                    `INSERT INTO notificaciones (usuario_id, tipo, mensaje)
                     SELECT id, 'donacion_exitosa', $1
                     FROM usuarios WHERE rol = 'admin'`,
                    [`Nueva donacion recibida: ${monto}€ de ${nombreDonante} (${emailDonante})`]
                );
            } catch (err) {
                console.error('Error creando notificación admin:', err.message);
            }
        }
        
        // SIEMPRE enviar email al donante (para cualquier estado)
        try {
            await stripeService.enviarEmailDonacionEstado(nombreDonante, emailDonante, monto, estadoEmail);
        } catch (err) {
            console.error('Error enviando email:', err.message);
        }
        
        donacion.estado = nuevoEstado;
        
        res.json({ success: true, donacion: { ...donacion, estado: paymentIntent.status === 'succeeded' ? 'completada' : donacion.estado } });
    } catch (error) {
        console.error('Error checking donacion:', error);
        res.status(500).json({ error: error.message });
    }
}

async function createSepaMandate(req, res) {
    try {
        const { email, nombre } = req.body;

        const result = await stripeService.createSepaMandate(email, nombre);
        
        if (result.success) {
            // Devolver el clientSecret del SetupIntent para confirmar en frontend
            res.json({ 
                success: true,
                clientSecret: result.setupIntent?.client_secret
            });
        } else {
            res.status(400).json({ error: result.error });
        }
    } catch (error) {
        console.error('Error creating SEPA mandate:', error);
        res.status(500).json({ error: error.message });
    }
}

async function createSubscription(req, res) {
    try {
        const { priceId, email, nombre, usuarioId, metodoPago, datosPersonales } = req.body;

        if (!priceId) {
            return res.status(400).json({ error: 'Price ID requerido' });
        }

        const result = await stripeService.createSubscription(priceId, email, nombre, usuarioId, metodoPago, datosPersonales);

        if (result.pendingSetup) {
            res.json({
                subscriptionId: null,
                clientSecret: result.clientSecret,
                setupIntentId: result.setupIntentId,
                customerId: result.customerId,
                isSetupIntent: true,
                priceId: result.priceId
            });
            return;
        }

        if (result.isFirstPayment) {
            res.json({
                subscriptionId: result.subscriptionId,
                clientSecret: result.clientSecret,
                paymentIntentId: result.paymentIntentId,
                customerId: result.customerId,
                priceId: result.priceId,
                isFirstPayment: true,
                subscriptionStatus: result.subscriptionStatus
            });
            return;
        }

        const latestInvoice = result.latest_invoice;
        const paymentIntent = latestInvoice?.payment_intent;
        
        res.json({
            subscriptionId: result.id,
            clientSecret: paymentIntent?.client_secret || null,
            paymentIntentId: paymentIntent?.id || null
        });
    } catch (error) {
        console.error('Error creating subscription:', error);
        res.status(500).json({ error: error.message });
    }
}

async function confirmSepaSetup(req, res) {
    try {
        const { setupIntentId, priceId, usuarioId, datosPersonales } = req.body;

        if (!setupIntentId || !priceId) {
            return res.status(400).json({ error: 'setupIntentId y priceId requeridos' });
        }

        const subscription = await stripeService.createSubscriptionFromSetup(setupIntentId, priceId, usuarioId, 'sepa', datosPersonales);
        
        res.json({
            subscriptionId: subscription.id,
            success: true,
            socioActivado: subscription.socioActivado || false
        });
    } catch (error) {
        console.error('Error confirming SEPA setup:', error);
        res.status(500).json({ error: error.message });
    }
}

async function marcarSocioFallido(req, res) {
    try {
        const { setupIntentId, usuarioId, errorMessage } = req.body;

        if (!setupIntentId && !usuarioId) {
            return res.status(400).json({ error: 'setupIntentId o usuarioId requerido' });
        }

        const result = await stripeService.marcarSocioFallido(setupIntentId, usuarioId, errorMessage || 'Pago rechazado por el banco');
        
        res.json(result);
    } catch (error) {
        console.error('Error marcando socio fallido:', error);
        res.status(500).json({ error: error.message });
    }
}

async function handleWebhook(req, res) {
    try {
        const signature = req.headers['stripe-signature'];
        const event = await stripeService.handleWebhook(req.body, signature);
        res.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(400).json({ error: error.message });
    }
}

async function getConfig(req, res) {
    try {
        res.json({
            publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
            monthlyPrices: {
                price_5: process.env.STRIPE_MONTHLY_PRICE_ID_5,
                price_10: process.env.STRIPE_MONTHLY_PRICE_ID_10
            }
        });
    } catch (error) {
        console.error('Error in getConfig:', error);
        res.status(500).json({ error: error.message });
    }
}

async function confirmSubscriptionPayment(req, res) {
    try {
        const { paymentIntentId, subscriptionId } = req.body;

        if (!paymentIntentId) {
            return res.status(400).json({ error: 'paymentIntentId requerido' });
        }

        const stripeService = require('../services/stripe.service');
        const result = await stripeService.confirmPaymentIntent(paymentIntentId);

        res.json({
            success: true,
            paymentIntent: result
        });
    } catch (error) {
        console.error('Error confirming payment:', error);
        res.status(500).json({ error: error.message });
    }
}

async function getDonaciones(req, res) {
    try {
        const donaciones = await stripeService.getAllDonaciones();
        const total = await stripeService.getTotalDonaciones();
        res.json({ donaciones, total });
    } catch (error) {
        console.error('Error getting donaciones:', error);
        res.status(500).json({ error: error.message });
    }
}

async function actualizarDonaciones(req, res) {
    try {
        const stripe = require('../config/stripe');
        const donaciones = await stripeService.getAllDonaciones();
        
        let actualizadas = 0;
        
        for (const donacion of donaciones) {
            if (!donacion.stripe_payment_id) continue;
            
            try {
                const paymentIntent = await stripe.paymentIntents.retrieve(donacion.stripe_payment_id);
                
                let nuevoEstado = null;
                
                // Determinar nuevo estado basado en Stripe
                if (paymentIntent.status === 'succeeded') {
                    nuevoEstado = 'completada';
                } else if (paymentIntent.status === 'canceled' || paymentIntent.status === 'incomplete') {
                    nuevoEstado = 'cancelada';
                } else if (paymentIntent.status === 'processing' || paymentIntent.status === 'requires_action') {
                    nuevoEstado = 'pending';
                }
                
                // Actualizar si el estado es diferente
                if (nuevoEstado && nuevoEstado !== donacion.estado) {
                    await stripeService.updateDonacionEstado(donacion.stripe_payment_id, nuevoEstado);
                    actualizadas++;
                }
            } catch (err) {
                console.error('Error verificando donation:', err.message);
            }
        }
        
        // Obtener donaciones actualizadas
        const donacionesActualizadas = await stripeService.getAllDonaciones();
        const total = await stripeService.getTotalDonaciones();
        
        res.json({ 
            donaciones: donacionesActualizadas, 
            total,
            mensaje: `${actualizadas} donation(es) actualizada(s)`
        });
    } catch (error) {
        console.error('Error actualizando donaciones:', error);
        res.status(500).json({ error: error.message });
    }
}

async function getMisDonaciones(req, res) {
    try {
        const usuarioId = req.user?.id;
        
        if (!usuarioId) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }
        
        const donaciones = await stripeService.getMisDonaciones(usuarioId);
        res.json({ donaciones });
    } catch (error) {
        console.error('Error getting mis donaciones:', error);
        res.status(500).json({ error: error.message });
    }
}

async function crearSuscripcionReal(req, res) {
    try {
        const { paymentIntentId, usuarioId } = req.body;

        if (!paymentIntentId || !usuarioId) {
            return res.status(400).json({ error: 'paymentIntentId y usuarioId requeridos' });
        }

        const result = await stripeService.crearSuscripcionReal(usuarioId, paymentIntentId);
        res.json(result);
    } catch (error) {
        console.error('Error creando suscripción real:', error);
        res.status(500).json({ error: error.message });
    }
}

async function createSetupIntent(req, res) {
    try {
        const { email, metadata } = req.body;

        const stripe = require('../config/stripe');

        const customer = await stripe.customers.create({
            email: email && email.includes('@') ? email : undefined,
            metadata: metadata || {}
        });

        const setupIntent = await stripe.setupIntents.create({
            payment_method_types: ['sepa_debit'],
            usage: 'off_session',
            customer: customer.id,
            metadata: metadata || {}
        });

        res.json({
            clientSecret: setupIntent.client_secret,
            setupIntentId: setupIntent.id,
            customerId: customer.id
        });
    } catch (error) {
        console.error('Error creating setup intent:', error);
        res.status(500).json({ error: error.message });
    }
}

async function createSetupIntentCard(req, res) {
    try {
        const { email, nombre, metadata } = req.body;

        const stripe = require('../config/stripe');

        const customer = await stripe.customers.create({
            email: email && email.includes('@') ? email : undefined,
            name: nombre || 'Padrino Flacuchos',
            metadata: metadata || {}
        });

        const setupIntent = await stripe.setupIntents.create({
            payment_method_types: ['card'],
            usage: 'off_session',
            customer: customer.id,
            metadata: metadata || {}
        });

        res.json({
            clientSecret: setupIntent.client_secret,
            setupIntentId: setupIntent.id,
            customerId: customer.id
        });
    } catch (error) {
        console.error('Error creating setup intent card:', error);
        res.status(500).json({ error: error.message });
    }
}

async function createPaymentIntentSEPA(req, res) {
    try {
        const { amount, email, nombre, setup_intent_id, metadata } = req.body;

        if (!amount || amount < 1) {
            return res.status(400).json({ error: 'El amount mínimo es 1€' });
        }

        if (!setup_intent_id) {
            return res.status(400).json({ error: 'setup_intent_id requerido' });
        }

        const stripe = require('../config/stripe');
        
        const setupIntent = await stripe.setupIntents.retrieve(setup_intent_id);
        
        if (!setupIntent.payment_method) {
            return res.status(400).json({ error: 'No se encontró el método de pago' });
        }

        let customerId = null;
        try {
            const customer = await stripe.customers.create({
                email: email,
                name: nombre,
                metadata: { tipo: 'apadrinamiento' }
            });
            customerId = customer.id;
        } catch (e) {
            console.log('Customer creation skipped:', e.message);
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'eur',
            payment_method: setupIntent.payment_method,
            customer: customerId,
            confirm: true,
            off_session: true,
            return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/apadrinar`,
            metadata: {
                ...metadata,
                tipo: metadata?.tipo || 'apadrinamiento'
            },
            description: metadata?.tipo === 'apadrinamiento' ? 'Apadrinamiento mensual' : 'Pago'
        });

        res.json({
            paymentIntentId: paymentIntent.id,
            paymentIntent: paymentIntent,
            customerId: customerId,
            paymentMethodId: setupIntent.payment_method
        });
    } catch (error) {
        console.error('Error creating payment intent SEPA:', error);
        res.status(500).json({ error: error.message });
    }
}

async function getCustomerPaymentMethods(req, res) {
    try {
        const { customerId } = req.query;

        if (!customerId) {
            return res.status(400).json({ error: 'customerId requerido' });
        }

        const stripe = require('../config/stripe');
        
        const paymentMethods = await stripe.paymentMethods.list({
            customer: customerId,
            type: 'card'
        });

        res.json({
            paymentMethods: paymentMethods.data.map(pm => ({
                id: pm.id,
                brand: pm.card?.brand,
                last4: pm.card?.last4,
                exp_month: pm.card?.exp_month,
                exp_year: pm.card?.exp_year
            }))
        });
    } catch (error) {
        console.error('Error getting customer payment methods:', error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    createPaymentIntent,
    checkDonacion,
    createSepaMandate,
    createSubscription,
    confirmSepaSetup,
    confirmSubscriptionPayment,
    handleWebhook,
    getConfig,
    getDonaciones,
    actualizarDonaciones,
    getMisDonaciones,
    cancelPaymentIntent,
    crearSuscripcionReal,
    marcarSocioFallido,
    createSetupIntent,
    createSetupIntentCard,
    createPaymentIntentSEPA,
    getCustomerPaymentMethods
};