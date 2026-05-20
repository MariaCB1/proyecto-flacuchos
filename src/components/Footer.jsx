import { Link } from 'react-router-dom';
import SocialLinks from './SocialLinks';
import styles from './Footer.module.css';

function Footer() {
    return (
        <footer className={styles.footer}>
            <div className="container">
                <div className={styles.footerContent}>
                    <div className={styles.footerLogo}>
                        <Link to="/" className={styles.logo}>
                            <div className={styles.logoIcon}>
                                <img src="/img/logo.png" alt="Logo Flacuchos" />
                            </div>
                            <span>Flacuchos</span>
                        </Link>
                        <p>Protectora de animales sin ánimo de lucro</p>
                    </div>
                    <div className={styles.footerColabora}>
                        <h4>Colabora</h4>
                        <ul>
                            <li><Link to="/como-ayudar#donar">Haz un donativo</Link></li>
                            <li><Link to="/como-ayudar#socio">Hazte socio</Link></li>
                            <li><Link to="/como-ayudar#voluntario">Hazte voluntario</Link></li>
                        </ul>
                    </div>
                    <div className={styles.footerSocial}>
                        <h4>Síguenos</h4>
                        <SocialLinks />
                    </div>
                </div>
                <div className={styles.footerBottom}>
                    <p>© 2026 Protectora de Animales Flacuchos - CIF: G-56120157</p>
                    <div className={styles.legalLinks}>
                        <Link to="/aviso-legal">Aviso Legal</Link>
                        <Link to="/politica-privacidad">Política de Privacidad</Link>
                        <Link to="/politica-cookies">Política de Cookies</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
