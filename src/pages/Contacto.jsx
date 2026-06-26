import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import SocialLinks from '../components/SocialLinks';
import { contactoApi } from '../api/api';
import styles from './Contacto.module.css';

function Contacto() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        type: 'Información general',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState({ type: '', message: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.email || !formData.type || !formData.message) {
            setFeedback({ type: 'error', message: 'Todos los campos son requeridos' });
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setFeedback({ type: 'error', message: 'Introduce un email válido' });
            return;
        }

        const phoneClean = formData.phone.replace(/[\s-]/g, '');
        const phoneRegex = /^(\+34)?[6789]\d{8}$/;
        if (phoneClean && !phoneRegex.test(phoneClean)) {
            setFeedback({ type: 'error', message: 'Introduce un teléfono español válido (9 dígitos empezando por 6, 7, 8 o 9)' });
            return;
        }

        setLoading(true);
        setFeedback({ type: '', message: '' });

        try {
            await contactoApi.enviarMensaje({
                nombre: formData.name,
                email: formData.email,
                telefono: formData.phone,
                tipo: formData.type,
                mensaje: formData.message
            });
            setFeedback({ type: 'success', message: '¡Gracias por tu mensaje! Te contactaremos pronto.' });
            setFormData({ name: '', email: '', phone: '', type: 'Información general', message: '' });
        } catch (error) {
            setFeedback({ type: 'error', message: error.message || 'Error al enviar el mensaje. Inténtalo de nuevo.' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <>
            <PageHeader title="Contacto" subtitle="Estamos aquí para ayudarte" variant="contact" />

            <section className={styles.contact}>
                    <div className={styles.contactGrid}>
                        <div className={styles.contactInfoBox}>
                            <h3>¡Escríbenos!</h3>
                            <div className={styles.contactItem}>
                                <div className={styles.contactIcon}><span className="material-symbols-outlined">mail</span></div>
                                <div>
                                    <h4>Email</h4>
                                    <p>flacuchosbaena@gmail.com</p>
                                </div>
                            </div>
                            <div className={styles.contactItem}>
                                <div className={styles.contactIcon}><span className="material-symbols-outlined">call</span></div>
                                <div>
                                    <h4>Teléfono</h4>
                                    <p>614 41 68 51</p>
                                </div>
                            </div>
                            <div className={styles.contactItem}>
                                <div className={styles.contactIcon}><span className="material-symbols-outlined">share_location</span></div>
                                <div>
                                    <h4>Dirección</h4>
                                    <p>Diseminado Diseminados, 822</p>
                                    <p>14850 Baena, Córdoba</p>
<div className={styles.mapContainer}>
                                        <iframe 
                                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d712.6627617171671!2d-4.278751818061184!3d37.634503812148424!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd6da3974e41f4f5%3A0x78820a68e0d04d5d!2sPunto%20Limpio%20Baena!5e1!3m2!1ses!2ses!4v1777548964147!5m2!1ses!2ses" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade" 
                                                title="Ubicación"
                                                width="100%" 
                                                height="250" 
                                                style={{border: 0}} 
                                                allowFullScreen="" 
                                                loading="lazy" 
                                                referrerPolicy="no-referrer-when-downgrade"
                                        ></iframe>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.contactItem}>
                                <div className={styles.contactIcon}><span className="material-symbols-outlined">globe</span></div>
                                <div>
                                    <h4>Zona de actuación</h4>
                                    <p>Baena y Albendín</p>
                                </div>
                            </div>
                            <div>
                                <h4 className={styles.contactSocial}>Síguenos en redes</h4>
                                <SocialLinks className={styles.socialLinks} />
                            </div>
                        </div>
                        <div className={styles.contactForm}>
                            <h3>Formulario de Contacto</h3>
                            {feedback.message && (
                                <div className={`${styles.feedback} ${styles[feedback.type]}`}>
                                    {feedback.message}
                                </div>
                            )}
                            <form onSubmit={handleSubmit}>
                                <div className={styles.formGroup}>
                                    <label>Nombre completo *</label>
                                    <input 
                                        type="text" 
                                        name="name"
                                        placeholder="Tu nombre" 
                                        value={formData.name}
                                        onChange={handleChange}
                                        required 
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Email *</label>
                                    <input 
                                        type="email" 
                                        name="email"
                                        placeholder="tu@email.com" 
                                        value={formData.email}
                                        onChange={handleChange}
                                        required 
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Teléfono</label>
                                    <input 
                                        type="tel" 
                                        name="phone"
                                        placeholder="Tu teléfono"
                                        value={formData.phone}
                                        onChange={handleChange} 
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Tipo de consulta *</label>
                                    <select 
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option>Información general</option>
                                        <option>Adopción</option>
                                        <option>Voluntariado</option>
                                        <option>Donación</option>
                                        <option>Casa de acogida</option>
                                        <option>Otro</option>
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Mensaje *</label>
                                    <textarea 
                                        name="message"
                                        placeholder="¿En qué podemos ayudarte?"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                    ></textarea>
                                </div>
                                <button type="submit" className="btn btn-primary" style={{width: '100%'}} disabled={loading}>
                                    {loading ? 'Enviando...' : 'Enviar mensaje'}
                                </button>
                            </form>
                        </div>
                    </div>
                </section>
        </>
    );
}

export default Contacto;