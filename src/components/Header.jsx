import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import styles from './Header.module.css';

function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [openDropdowns, setOpenDropdowns] = useState({});
    const menuRef = useRef(null);

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const toggleDropdown = (key) => {
        setOpenDropdowns(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMobileMenuOpen(false);
                setOpenDropdowns({});
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className={styles.header}>
            <div className="container">
                <nav className={styles.nav}>
                    <Link to="/" className={styles.logo}>
                        <div className={styles.logoIcon}>
                            <img src="/img/logo.png" alt="Logo Flacuchos" />
                        </div>
                        Flacuchos
                    </Link>
                    <ul ref={menuRef} className={`${styles.navLinks} ${mobileMenuOpen ? styles.active : ''}`}>
                        <li><Link to="/" onClick={() => setMobileMenuOpen(false)}>Quiénes Somos</Link></li>
                        <li className={styles.dropdown}>
                            <button className={styles.dropdownToggle} onClick={() => toggleDropdown('adopciones')}>
                                Adopciones <span className="material-symbols-outlined">expand_more</span>
                            </button>
                            <ul className={`${styles.dropdownMenu} ${openDropdowns.adopciones ? styles.open : ''}`}>
                                <li><Link to="/adopciones" onClick={() => setMobileMenuOpen(false)}>Ver animales</Link></li>
                                <li><Link to="/casos-urgentes" onClick={() => setMobileMenuOpen(false)}>Casos urgentes</Link></li>
                            </ul>
                        </li>
                        <li className={styles.dropdown}>
                            <button className={styles.dropdownToggle} onClick={() => toggleDropdown('ayudar')}>
                                Cómo Ayudar <span className="material-symbols-outlined">expand_more</span>
                            </button>
                            <ul className={`${styles.dropdownMenu} ${openDropdowns.ayudar ? styles.open : ''}`}>
                                <li><Link to="/como-ayudar#donar" onClick={() => setMobileMenuOpen(false)}>Haz un donativo</Link></li>
                                <li><Link to="/como-ayudar#socio" onClick={() => setMobileMenuOpen(false)}>Hazte socio</Link></li>
                                <li><Link to="/como-ayudar#voluntario" onClick={() => setMobileMenuOpen(false)}>Hazte voluntario</Link></li>
                                <li><Link to="/como-ayudar#acogida" onClick={() => setMobileMenuOpen(false)}>Casa de acogida</Link></li>
                                <li><Link to="/como-ayudar#apadrinar" onClick={() => setMobileMenuOpen(false)}>Apadrinamiento</Link></li>
                            </ul>
                        </li>
                        <li><Link to="/transparencia" onClick={() => setMobileMenuOpen(false)}>Transparencia</Link></li>
                        <li className={styles.dropdown}>
                            <button className={styles.dropdownToggle} onClick={() => toggleDropdown('novedades')}>
                                Novedades <span className="material-symbols-outlined">expand_more</span>
                            </button>
                            <ul className={`${styles.dropdownMenu} ${openDropdowns.novedades ? styles.open : ''}`}>
                                <li><Link to="/noticias" onClick={() => setMobileMenuOpen(false)}>Noticias</Link></li>
                                <li><Link to="/eventos" onClick={() => setMobileMenuOpen(false)}>Eventos</Link></li>
                            </ul>
                        </li>
                        <li><Link to="/contacto" onClick={() => setMobileMenuOpen(false)}>Contacto</Link></li>
                    </ul>
                    <div className={styles.mobileMenuBtn} onClick={toggleMobileMenu}>
                        {mobileMenuOpen ? <span className="material-symbols-outlined">close</span> : <span className="material-symbols-outlined">menu</span>}
                    </div>
                </nav>
            </div>
        </header>
    );
}

export default Header;
