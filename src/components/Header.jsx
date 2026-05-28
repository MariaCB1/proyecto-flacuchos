import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import styles from './Header.module.css';

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState({});
  const menuRef = useRef(null);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

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
        const closeBtn = document.querySelector('button[class*="mobileMenuBtn"]');
        if (closeBtn && closeBtn.contains(event.target)) {
          return;
        }
        setMobileMenuOpen(false);
        setOpenDropdowns({});
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1000) {
        setMobileMenuOpen(false);
        setOpenDropdowns({});
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className={styles.header}>
      <div className="container">
        <nav className={styles.nav}>
          <Link to="/" className={styles.logo}>
            <div className={styles.logoIcon}>
              <picture>
                        <source srcSet="/img/logo.webp" type="image/webp" />
                        <img src="/img/logo.png" alt="Logo Flacuchos" fetchpriority="high" />
                      </picture>
            </div>
            Flacuchos
          </Link>
          <ul ref={menuRef} className={`${styles.navLinks} ${mobileMenuOpen ? styles.active : ''}`}>
            <li><Link to="/" onClick={() => setMobileMenuOpen(false)}>Quiénes Somos</Link></li>
            <li><Link to="/adopciones" onClick={() => setMobileMenuOpen(false)}>Adopciones</Link></li>
            <li><Link to="/como-ayudar" onClick={() => setMobileMenuOpen(false)}>Cómo Ayudar</Link></li>
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
{mobileMenuOpen && (
              <li className={styles.mobileAuthRow}>
                {isAuthenticated ? (
                  <div className={styles.mobileAuthButtons}>
                    <Link to="/perfil" className={styles.userBadge} onClick={() => setMobileMenuOpen(false)}>
                      <span className={styles.userAvatar}>
                        <span className="material-symbols-outlined">person</span>
                      </span>
                      <span className={styles.userName} title={user?.nombre || 'Mi Perfil'}>{user?.nombre || 'Mi Perfil'}</span>
                    </Link>
                    <Link to="/notificaciones" className={styles.mobileAuthLinkIcon} onClick={() => setMobileMenuOpen(false)}>
                      <NotificationBell />
                    </Link>
                    <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className={styles.logoutBtn}>
                      <span className="material-symbols-outlined">logout</span>
                      <span className={styles.logoutText}>Salir</span>
                    </button>
                  </div>
                ) : (
                  <div className={styles.mobileAuthButtons}>
                    <Link to="/login" className={styles.loginBtn} onClick={() => setMobileMenuOpen(false)}>
                      Iniciar Sesión
                    </Link>
                    <Link to="/registro" className={styles.registerBtn} onClick={() => setMobileMenuOpen(false)}>
                      Regístrate
                    </Link>
                  </div>
                )}
              </li>
            )}
          </ul>

          <div className={styles.authSectionDesktop}>
            {isAuthenticated ? (
              <>
                <Link to="/perfil" className={styles.userBadge}>
                  <span className={styles.userAvatar}>
                    <span className="material-symbols-outlined">person</span>
                  </span>
                  <span className={styles.userName} title={user?.nombre || 'Mi Perfil'}>{user?.nombre || 'Mi Perfil'}</span>
                </Link>
                <NotificationBell />
                <button onClick={handleLogout} className={styles.logoutBtn}>
                  <span className="material-symbols-outlined">logout</span>
                  <span className={styles.logoutText}>Salir</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={styles.loginBtn}>
                  Iniciar Sesión
                </Link>
                <Link to="/registro" className={styles.registerBtn}>
                  Regístrate
                </Link>
              </>
            )}
          </div>

          <button className={styles.mobileMenuBtn} onClick={toggleMobileMenu}>
            {mobileMenuOpen ? <span className="material-symbols-outlined">close</span> : <span className="material-symbols-outlined">menu</span>}
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Header;