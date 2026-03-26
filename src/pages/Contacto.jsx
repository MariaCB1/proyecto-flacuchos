import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import SocialLinks from '../components/SocialLinks';
import styles from './Contacto.module.css';

function Contacto() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        type: 'Información general',
        message: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('¡Gracias por tu mensaje! Te contactaremos pronto.');
        setFormData({ name: '', email: '', phone: '', type: 'Información general', message: '' });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <>
            <PageHeader title="Contacto" subtitle="Estamos aquí para ayudarte" variant="contact" />

            <section className={styles.contact}>
                <div className="container">
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
                                    <p>696 951 795</p>
                                </div>
                            </div>
                            <div className={styles.contactItem}>
                                <div className={styles.contactIcon}><span className="material-symbols-outlined">share_location</span></div>
                                <div>
                                    <h4>Dirección</h4>
                                    <p>Calle de los Animales, 123</p>
                                    <p>14850 Baena, Córdoba</p>
                                    <div className={styles.mapContainer}>
                                        <iframe 
                                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d198.34107469085436!2d-4.672211501384235!3d37.30799656432178!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd6d671c0747bc49%3A0xb0e66afbd40ecd09!2sParroquia%20Ntra.%20Sra.%20del%20Socorro!5e0!3m2!1ses!2ses!4v1774353520216!5m2!1ses!2ses" 
                                            title="Ubicación"
                                            width="100%" 
                                            height="200" 
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
                            <form onSubmit={handleSubmit}>
                                <div className={styles.formGroup}>
                                    <label>Nombre completo</label>
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
                                    <label>Email</label>
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
                                    <label>Tipo de consulta</label>
                                    <select 
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
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
                                    <label>Mensaje</label>
                                    <textarea 
                                        name="message"
                                        placeholder="¿En qué podemos ayudarte?"
                                        value={formData.message}
                                        onChange={handleChange}
                                    ></textarea>
                                </div>
                                <button type="submit" className="btn btn-primary" style={{width: '100%'}}>Enviar mensaje</button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

export default Contacto;
