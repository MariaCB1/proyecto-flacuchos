import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CookieConsent from '../components/CookieConsent';
import styles from './Home.module.css';

function Home() {
    const [showEasterEgg, setShowEasterEgg] = useState(false);

    useEffect(() => {
        const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'f', 'm'];
        let input = [];

        const handler = (e) => {
            const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
            input.push(key);
            input = input.slice(-10);
            if (input.length === 10 && input.every((k, i) => k === konamiCode[i])) {
                setShowEasterEgg(prev => !prev);
                input = [];
            }
        };

        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    return (
        <>
            <section className={styles.hero}>
                <div className="container">
                    <div className={styles.heroContent}>
                        <h1>Protectora de Animales Flacuchos</h1>
                        <p>Desde 2019 luchando por el bienestar de los animales abandonados. Cada vida merece una segunda oportunidad.</p>
                        <div className={styles.heroButtons}>
                            <Link to="/adopciones" className="btn btn-primary">Adopta</Link>
                            <Link to="/como-ayudar#donar" className="btn btn-secondary">Haz un donativo</Link>
                            <Link to="/como-ayudar#socio" className="btn btn-primary">Hazte socio</Link>
                            <Link to="/como-ayudar#voluntario" className="btn btn-primary">Hazte voluntario</Link>
                        </div>
                    </div>
                </div>
            </section>

            <div className={styles.stats}>
                <div className="container">
                    <div className={styles.statsGrid}>
                        <div className={styles.statItem}>
                            <h3>6</h3>
                            <p>Años de experiencia</p>
                        </div>
                        <div className={styles.statItem}>
                            <h3>150+</h3>
                            <p>Animales rescatados</p>
                        </div>
                        <div className={styles.statItem}>
                            <h3>120+/año</h3>
                            <p>Adopciones exitosas</p>
                        </div>
                        <div className={styles.statItem}>
                            <h3>20+</h3>
                            <p>Socios activos</p>
                        </div>
                    </div>
                </div>
            </div>

            <section id="quienes-somos" className={styles.mainContent}>
                <div className="container">
                    <div className={styles.mainArea}>
                        <div className={styles.aboutSection}>
                            <h2>Quiénes Somos</h2>
                            <div className={styles.aboutCentered}>
                                <div className={styles.aboutImage}>
                                    <picture>
                                      <source srcSet="/img/portada-historia.webp" type="image/webp" />
                                      <img src="/img/portada-historia.jpeg" alt="Perro con logo de Flacuchos en el fondo" loading="lazy" />
                                    </picture>
                                </div>
                                <div className={styles.aboutContent}>
                                    <h3>Nuestra Historia</h3>
                                    <p>La Asociación Protectora de Animales <strong>Flacuchos</strong> nació <i>el 11 de julio de 2019</i> en Baena gracias a la iniciativa de un grupo de personas comprometidas con la defensa y el bienestar animal. Desde su creación, la asociación trabaja sin ánimo de lucro para luchar contra el abandono y el maltrato animal en la localidad y sus alrededores.</p>
                                    <p>Nuestra labor se centra principalmente en el rescate de perros y gatos en situación de abandono o riesgo, a los que proporcionamos atención veterinaria, alimentación, cuidados y la búsqueda de un hogar definitivo mediante adopciones responsables.</p>
                                    <p>Un hecho que forma parte de nuestra identidad es que el primer animal rescatado por la asociación fue un caballo. Por este motivo, nuestro logo representa un caballo, como símbolo del inicio de esta labor solidaria y del compromiso que mantenemos con todos los animales.</p>
                                    <p>Gracias al esfuerzo de personas voluntarias, socios y colaboradores, participamos además en campañas de concienciación, actividades solidarias y eventos comunitarios para fomentar el respeto y la protección animal.</p>
                                    <p><strong>Zona de actuación:</strong> Baena y Albendín</p>
                                    <p className={styles.textHistoryCenter}>"Trabajamos cada día para darles la vida que merecen."</p>
                                    
                                    <h3>Nuestro Equipo</h3>
                                    <p>Contamos con un equipo de más de 15 voluntarios comprometidos que trabajan día a día para cuidar de nuestros animales. Desde estudiantes colaboradores hasta familias de acogida, cada persona aporta su granito de arena.</p>
                                    
                                    <div className={styles.valuesGrid}>
                                        <div className={styles.valueCard}>
                                            <div className={styles.valueCardIcon}><span className="material-symbols-outlined">partner_heart</span></div>
                                            <h4>Compromiso</h4>
                                            <p>Dedicación total a cada animal</p>
                                        </div>
                                        <div className={styles.valueCard}>
                                            <div className={styles.valueCardIcon}><span className="material-symbols-outlined">find_in_page</span></div>
                                            <h4>Transparencia</h4>
                                            <p>Gestión clara y abierta</p>
                                        </div>
                                        <div className={styles.valueCard}>
                                            <div className={styles.valueCardIcon}><span className="material-symbols-outlined">health_and_safety</span></div>
                                            <h4>Protección</h4>
                                            <p>Defensa activa de los animales</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <CookieConsent active={showEasterEgg} />
        </>
    );
}

export default Home;
