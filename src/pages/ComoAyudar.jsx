import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { contactoApi } from '../api/api';
import PageHeader from '../components/PageHeader';
import Donacion from '../components/Donacion';
import styles from './ComoAyudar.module.css';

const SECTIONS = [
    {
        id: 'adoptar',
        icon: 'pets',
        title: 'Adoptando',
        text: 'Dar un hogar es la mejor ayuda posible, estás ofreciendo una segunda oportunidad a un animal que lo necesita y a la vez se crea otro hueco libre para otro que lo necesite.',
        link: '/adopciones',
        linkText: 'Ver animales'
    },
    {
        id: 'acogida',
        icon: 'home',
        title: 'Casa de Acogida',
        text: 'Acoger temporalmente en un hogar hasta que el animal encuentre una familia, donde la protectora suele cubrir los gastos veterinarios.',
        isAcogida: true,
        items: [
            'Ofrecemos un hogar temporal a un animal',
            'La protectora cubre los gastos veterinarios',
            'Ayudas a liberar espacio en la protectora',
            'El animal estará disponible para adopción'
        ]
    },
    {
        id: 'apadrinar',
        icon: 'favorite',
        title: 'Apadrinamiento',
        text: 'Apadrina a un animal y ayúdanos con los gastos de alimentación, veterinario y cuidados.',
        contactInfo: true,
        isApadrinamiento: true,
        items: [
            'Elige el animal que quieras apadrinar',
            'Aporta la cantidad que quieras mensualmente',
            'Aparece como padrino en la ficha del animal (si quieres)',
            'Recibe actualizaciones de tu ahijado'
        ]
    },
    {
        id: 'donar',
        icon: 'volunteer_activism',
        title: 'Donaciones',
        text: 'Aportaciones económicas para cubrir gastos: veterinarios, alimentación, medicación y limpieza.',
        isDonation: true
    },
    {
        id: 'socio',
        icon: 'group',
        title: 'Socio Mensual',
        text: 'Con una cuota mensual de 10€ (estudiantes 5€), o también haciéndote teaming por solo 1€/mes.',
        isSocio: true
    },
    {
        id: 'material',
        icon: 'inventory_2',
        title: 'Donando Material',
        items: [
            'Piensos, latas',
            'Mantas o camas',
            'Transportines o correas o arneses'
        ],
        contactInfo: true
    },
    {
        id: 'voluntario',
        icon: 'front_hand',
        title: 'Voluntariado',
        items: [
            'Con las tareas de limpieza de las instalaciones',
            'Pasear perros',
            'Ayuda en eventos',
            'Fotografía',
            'Redes sociales',
            'Llevarlos a la clínica o al transporte cuando se vayan adoptados',
            'Transporte o traslados',
            'Stand o en ferias para recaudación'
        ],
        isVoluntario: true
    },
    {
        id: 'difundir',
        icon: 'campaign',
        title: 'Difundiendo',
        text: 'Para que lleguen a cuanto más público mejor, es súper importante.',
        socialLinks: true
    }
];

function ComoAyudar() {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const [misAcogidas, setMisAcogidas] = useState([]);
    const [mostrarModalAcogida, setMostrarModalAcogida] = useState(false);

    useEffect(() => {
        if (isAuthenticated && user?.rol !== 'admin') {
            contactoApi.getMisAcogidas()
                .then(data => setMisAcogidas(data || []))
                .catch(err => console.error('Error fetching acogidas:', err));
        }
    }, [isAuthenticated, user]);

    const tieneAcogidaActiva = misAcogidas.some(a => 
        a.estado === 'pending' || a.estado === 'approved' || a.estado === 'asignado_pendiente' || a.estado === 'aceptado'
    );

    const handleAcogidaClick = (e) => {
        if (tieneAcogidaActiva) {
            e.preventDefault();
            setMostrarModalAcogida(true);
        } else if (!isAuthenticated) {
            e.preventDefault();
            navigate('/login?redirect=/acogida');
        } else {
            navigate('/acogida');
        }
    };

    const handleSocioClick = (e) => {
        if (!isAuthenticated) {
            e.preventDefault();
            navigate('/login?redirect=/socio');
        }
    };

    const renderSocioSection = () => {
        if (user?.rol === 'admin') {
            return (
                <div className={styles.adminBox}>
                    <span className="material-symbols-outlined">admin_panel_settings</span>
                    <p>Eres administrador</p>
                    <span>Puedes gestionar todas las solicitudes de socio</span>
                </div>
            );
        }

        if (!isAuthenticated) {
            return (
                <div className={styles.socioSection}>
                    <div className={styles.socioPrices}>
                        <div className={styles.socioPrice}>
                            <span className={styles.socioLabel}>Socio adulto</span>
                            <span className={styles.socioAmount}>10€/mes</span>
                        </div>
                        <div className={styles.socioPrice}>
                            <span className={styles.socioLabel}>Estudiante</span>
                            <span className={styles.socioAmount}>5€/mes</span>
                        </div>
                        <div className={styles.socioPrice}>
                            <span className={styles.socioLabel}>Teaming</span>
                            <span className={styles.socioAmount}>1€/mes</span>
                        </div>
                    </div>
                    <div className={styles.socioButtons}>
                        <Link to="/login?redirect=/socio" className={styles.btnSocio} onClick={handleSocioClick}>
                            Hacerme socio
                        </Link>
                        <a 
                            href="https://www.teaming.net/group/list?q=flacuchos" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className={styles.btnTeaming}
                        >
                            Hacerme Teaming
                        </a>
                    </div>
                </div>
            );
        }

        if (user?.es_socio) {
            return (
                <div className={styles.socioSection}>
                    <div className={styles.socioYaSocio}>
                        <p>Ya eres socio de Flacuchos</p>
                        <span className={styles.socioYaSocioText}>Gracias por tu apoyo!</span>
                    </div>
                    <div className={styles.socioButtons}>
                        <Link to="/perfil?tab=socio" className={styles.btnSecondary}>
                            Ver mi socio
                        </Link>
                        <a
                            href="https://www.teaming.net/group/list?q=flacuchos"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.btnTeaming}
                        >
                            Hacerme Teaming
                        </a>
                    </div>
                </div>
            );
        }

        return (
            <div className={styles.socioSection}>
                <div className={styles.socioPrices}>
                    <div className={styles.socioPrice}>
                        <span className={styles.socioLabel}>Socio adulto</span>
                        <span className={styles.socioAmount}>10€/mes</span>
                    </div>
                    <div className={styles.socioPrice}>
                        <span className={styles.socioLabel}>Estudiante</span>
                        <span className={styles.socioAmount}>5€/mes</span>
                    </div>
                    <div className={styles.socioPrice}>
                        <span className={styles.socioLabel}>Teaming</span>
                        <span className={styles.socioAmount}>1€/mes</span>
                    </div>
                </div>
                <div className={styles.socioButtons}>
                    <Link to="/socio" className={styles.btnSocio}>
                        Hacerme socio
                    </Link>
                    <a 
                        href="https://www.teaming.net/group/list?q=flacuchos" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className={styles.btnTeaming}
                    >
                        Hacerme Teaming
                    </a>
                </div>
            </div>
        );
    };

    const renderVoluntarioSection = () => {
        if (user?.rol === 'admin') {
            return (
                <div className={styles.adminBox}>
                    <span className="material-symbols-outlined">admin_panel_settings</span>
                    <p>Eres administrador</p>
                    <span>Puedes gestionar todas las solicitudes de voluntariado</span>
                </div>
            );
        }

        if (user?.es_voluntario) {
            return (
                <div className={styles.voluntarioYaBox}>
                    <p className={styles.voluntarioTitle}>Ya eres voluntario de Flacuchos</p>
                    <span className={styles.voluntarioSubtitle}>¡Gracias por tu dedicación!</span>
                    <Link to="/perfil?tab=voluntariado" className={styles.voluntarioBtn}>
                        Ver mi perfil
                    </Link>
                    <div className={styles.voluntarioContact}>
                        <p>Para coordinar las tareas, contacta con la protectora:</p>
                        <a href="tel:696951795" className={styles.voluntarioPhone}>
                            <span className="material-symbols-outlined">phone</span>
                            696 951 795
                        </a>
                    </div>
                </div>
            );
        }

        if (!isAuthenticated) {
            return (
                <Link to="/login?redirect=/voluntario" className={styles.cardLink}>
                    Ser voluntario
                </Link>
            );
        }

        return (
            <Link to="/voluntario" className={styles.cardLink}>
                Ser voluntario
            </Link>
        );
    };

    const renderApadrinarSection = () => {
        if (user?.rol === 'admin') {
            return (
                <div className={styles.adminBox}>
                    <span className="material-symbols-outlined">admin_panel_settings</span>
                    <p>Eres administrador</p>
                    <span>Puedes gestionar todas las solicitudes de apadrinamiento</span>
                </div>
            );
        }
    };

    const renderAcogidaSection = () => {
        if (user?.rol === 'admin') {
            return (
                <div className={styles.adminBox}>
                    <span className="material-symbols-outlined">admin_panel_settings</span>
                    <p>Eres administrador</p>
                    <span>Puedes gestionar todas las solicitudes de acogida</span>
                </div>
            );
        }

        return (
            <button onClick={handleAcogidaClick} className={styles.cardLink}>
                Solicitar acogida
            </button>
        );
    };

    return (
        <>
            <PageHeader 
                title="Cómo Ayudar" 
                subtitle="La protectora se puede ayudar de muchas formas, cada gesto por pequeño que sea ayuda a cambiar la vida de perros y gatos." 
                variant="help" 
            />

            <section className={styles.sectionsGrid}>
                <div className="container">
                    <div className={styles.grid}>
                        {SECTIONS.map((section) => (
                            <div key={section.id} className={styles.card} id={section.id}>
                                <div className={styles.cardIcon}>
                                    <span className="material-symbols-outlined">{section.icon}</span>
                                </div>
                                <h3 className={styles.cardTitle}>{section.title}</h3>
                                {section.text && (
                                    <p className={styles.cardText}>{section.text}</p>
                                )}
                                {section.items && (!section.isVoluntario || !user?.es_voluntario) && !(section.isApadrinamiento && user?.rol === 'admin') && !(section.isAcogida && user?.rol === 'admin') && (
                                    <ul className={styles.cardList}>
                                        {section.items.map((item, i) => (
                                            <li key={i}>{item}</li>
                                        ))}
                                    </ul>
                                )}
                                {section.contactInfo && user?.rol !== 'admin' && (
                                    <div className={styles.contactInfo}>
                                        <p className={styles.contactText}>
                                            {section.isApadrinamiento ? 'Para apadrinar un animal llame a este número para más información:' : 'Para coordinar la entrega, contacta con la protectora:'}
                                        </p>
                                        <a href="tel:696951795" className={styles.contactPhone}>
                                            <span className="material-symbols-outlined">phone</span>
                                            696 951 795
                                        </a>
                                        <p className={styles.contactOr}>o</p>
                                        <p className={styles.contactFormText}>
                                            {section.isApadrinamiento ? 'rellenando el siguiente formulario de apadrinamiento' : 'contactando una cita con la protectora a través del formulario de contacto'}
                                        </p>
                                        {section.isApadrinamiento ? (
                                            <Link to="/apadrinar" className={styles.cardLink}>
                                                Apadrinar un animal
                                            </Link>
                                        ) : (
                                            <Link to="/contacto" className={styles.cardLink}>
                                                Coordinar entrega
                                            </Link>
                                        )}
                                    </div>
                                )}
                                {section.isDonation && (
                                    <div className={`${styles.donationComponent} ${styles.donationBlue}`}>
                                        <Donacion tipo="puntual" />
                                    </div>
                                )}
                                {section.isSocio && renderSocioSection()}
                                {section.isVoluntario && renderVoluntarioSection()}
                                {section.isApadrinamiento && user?.rol === 'admin' && renderApadrinarSection()}
                                {section.isAcogida && renderAcogidaSection()}
                                {section.socialLinks && (
                                    <div className={styles.socialIcons}>
                                        <a href="https://www.instagram.com/ayudaunflacucho/" target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
                                            <picture>
                                              <source srcSet="/img/logo-instagram.webp" type="image/webp" />
                                              <img src="/img/logo-instagram.png" alt="Instagram" />
                                            </picture>
                                        </a>
                                        <a href="https://www.facebook.com/ayudaunflacucho" target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
                                            <picture>
                                              <source srcSet="/img/logo-facebook.webp" type="image/webp" />
                                              <img src="/img/logo-facebook.png" alt="Facebook" />
                                            </picture>
                                        </a>
                                        <a href="https://www.teaming.net/group/list?q=flacuchos" target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
                                            <picture>
                                              <source srcSet="/img/logo-teaming.webp" type="image/webp" />
                                              <img src="/img/logo-teaming.png" alt="Teaming" />
                                            </picture>
                                        </a>
                                    </div>
                                )}
                                {section.link && !section.isDonation && !section.isSocio && !section.socialLinks && (
                                    <Link to={section.link} className={styles.cardLink}>
                                        {section.linkText}
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {mostrarModalAcogida && (
                <div className={styles.modalOverlay} onClick={() => setMostrarModalAcogida(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#1976D2' }}>home</span>
                        <h3>Ya tienes una solicitud de acogida</h3>
                        <p>Tienes una solicitud en curso. ¿Quieres enviar otra?</p>
                        <div className={styles.modalButtons}>
                            <button onClick={() => setMostrarModalAcogida(false)} className={styles.btnCancel}>
                                Cancelar
                            </button>
                            <button onClick={() => { setMostrarModalAcogida(false); navigate('/acogida'); }} className={styles.btnConfirm}>
                                Sí, enviar otra
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default ComoAyudar;