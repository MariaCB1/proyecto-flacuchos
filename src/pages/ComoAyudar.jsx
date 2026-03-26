import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import styles from './ComoAyudar.module.css';

function ComoAyudar() {
    return (
        <>
            <PageHeader title="❤️ Cómo Ayudar" subtitle="Existen muchas formas de colaborar con nosotros" variant="help" />

            <section id="donar" className={styles.helpSection}>
                <div className="container">
                    <div className={styles.helpCardLarge}>
                        <div className={styles.helpIconLarge}>💝</div>
                        <h2>Haz un Donativo</h2>
                        <p>Tu donativo, por pequeño que sea, contribuye a pagar tratamientos veterinarios, alimentos y cuidados de los animales.</p>
                        <div className={styles.donationOptions}>
                            <div className={styles.donationAmount}>
                                <button className={styles.donationBtn} data-amount="10">10€</button>
                                <button className={styles.donationBtn} data-amount="25">25€</button>
                                <button className={styles.donationBtn} data-amount="50">50€</button>
                                <button className={styles.donationBtn} data-amount="other">Otra cantidad</button>
                            </div>
                            <Link to="/contacto" className="btn btn-primary">Donar ahora</Link>
                        </div>
                        <div className={styles.teamingBox}>
                            <h3>💰 Plataforma Teaming</h3>
                            <p>Únete a nuestro grupo de Teaming y dona solo 1€ al mes. ¡Entre todos hacemos mucho!</p>
                            <a href="https://www.teaming.net/group/list?q=flacuchos" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">Unirse a Teaming</a>
                        </div>
                    </div>
                </div>
            </section>

            <section id="socio" className={`${styles.helpSection} ${styles.alt}`}>
                <div className="container">
                    <div className={styles.helpCardLarge}>
                        <div className={styles.helpIconLarge}>🤝</div>
                        <h2>Hazte Socio</h2>
                        <p>Con una cuota mensual única de 10€, estarás ayudando de forma continua a los animales.</p>
                        <div className={styles.benefitsList}>
                            <div className={styles.benefit}>
                                <span>✓</span>
                                <p>Ayudas a cubrir gastos veterinarios fijos</p>
                            </div>
                            <div className={styles.benefit}>
                                <span>✓</span>
                                <p>Recibes noticias exclusivas de los animales</p>
                            </div>
                            <div className={styles.benefit}>
                                <span>✓</span>
                                <p>Descuentos en eventos solidarios</p>
                            </div>
                            <div className={styles.benefit}>
                                <span>✓</span>
                                <p>Certificado de donación para desgravar</p>
                            </div>
                        </div>
                        <Link to="/contacto" className="btn btn-primary">Hacerme socio</Link>
                    </div>
                </div>
            </section>

            <section id="voluntario" className={styles.helpSection}>
                <div className="container">
                    <div className={styles.helpCardLarge}>
                        <div className={styles.helpIconLarge}>🙋</div>
                        <h2>Hazte Voluntario</h2>
                        <p>Únete a nuestro equipo de voluntarios. Puedes ayudar en el refugio, eventos o labores de difusión.</p>
                        <div className={styles.volunteerTypes}>
                            <div className={styles.volunteerType}>
                                <h4>🐕 Paseos</h4>
                                <p>Saca a los perros a pasear</p>
                            </div>
                            <div className={styles.volunteerType}>
                                <h4>🏠 Acogida</h4>
                                <p>Acoge animales temporalmente</p>
                            </div>
                            <div className={styles.volunteerType}>
                                <h4>🎉 Eventos</h4>
                                <p>Ayuda en mercadillos y jornadas</p>
                            </div>
                            <div className={styles.volunteerType}>
                                <h4>📱 Redes Sociales</h4>
                                <p>Ayuda con difusión online</p>
                            </div>
                        </div>
                        <Link to="/contacto" className="btn btn-primary">Ser voluntario</Link>
                    </div>
                </div>
            </section>

            <section id="acogida" className={`${styles.helpSection} ${styles.alt}`}>
                <div className="container">
                    <div className={styles.helpCardLarge}>
                        <div className={styles.helpIconLarge}>🏡</div>
                        <h2>Casa de Acogida</h2>
                        <p>Acoge temporalmente a un animal mientras encuentra su hogar definitivo. Es fundamental para animales que no pueden estar en el refugio.</p>
                        <div className={styles.requirementsBox}>
                            <h4>Requisitos:</h4>
                            <ul>
                                <li>Tiempo disponible para el animal</li>
                                <li>Espacio adecuado en el hogar</li>
                                <li>Compromiso de cuidado</li>
                                <li>Transporte al veterinario si es necesario</li>
                            </ul>
                        </div>
                        <Link to="/contacto" className="btn btn-primary">Ofrecerse como acogida</Link>
                    </div>
                </div>
            </section>

            <section id="apadrinar" className={styles.helpSection}>
                <div className="container">
                    <div className={styles.helpCardLarge}>
                        <div className={styles.helpIconLarge}>🏠</div>
                        <h2>Apadrinamiento</h2>
                        <p>Apadrina a un animal que no puede ser adoptado y ayúdanos a cubrir sus gastos mensuales.</p>
                        <p>El apadrinamiento es perfecto para personas que no pueden tener una mascota en casa pero quieren ayudar de forma continuada.</p>
                        <div className={styles.sponsorInfo}>
                            <p><strong>Cuota mensual:</strong> 30€ (perros) / 15€ (gatos)</p>
                            <p><strong>Incluye:</strong> alimentos, medicamentos, vacunas y revisiones veterinarias</p>
                        </div>
                        <Link to="/contacto" className="btn btn-primary">Apadrinar un animal</Link>
                    </div>
                </div>
            </section>
        </>
    );
}

export default ComoAyudar;
