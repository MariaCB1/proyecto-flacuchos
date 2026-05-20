import { Link } from 'react-router-dom';
import styles from './ErrorPage.module.css';

const icons = {
    404: (
        <svg viewBox="0 0 200 200" className={styles.iconSvg}>
            <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.2"/>
            <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.15"/>
            <path d="M70 70 L130 130 M130 70 L70 130" stroke="currentColor" strokeWidth="6" strokeLinecap="round" opacity="0.6"/>
            <circle cx="85" cy="80" r="8" fill="currentColor" opacity="0.5"/>
            <circle cx="115" cy="80" r="8" fill="currentColor" opacity="0.5"/>
        </svg>
    ),
    403: (
        <svg viewBox="0 0 200 200" className={styles.iconSvg}>
            <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.2"/>
            <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.15"/>
            <rect x="60" y="60" width="80" height="80" rx="8" fill="none" stroke="currentColor" strokeWidth="4" opacity="0.6"/>
            <path d="M85 100 L90 130 L115 95" fill="currentColor" opacity="0.8"/>
            <circle cx="100" cy="75" r="10" fill="currentColor" opacity="0.8"/>
        </svg>
    ),
    500: (
        <svg viewBox="0 0 200 200" className={styles.iconSvg}>
            <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.2"/>
            <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.15"/>
            <text x="100" y="115" textAnchor="middle" fontSize="40" fontWeight="bold" fill="currentColor" opacity="0.6">!</text>
            <path d="M70 55 L130 55" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.4"/>
            <path d="M70 145 L130 145" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.4"/>
        </svg>
    ),
    503: (
        <svg viewBox="0 0 200 200" className={styles.iconSvg}>
            <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.2"/>
            <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.15"/>
            <rect x="70" y="50" width="60" height="80" rx="4" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.6"/>
            <line x1="75" y1="65" x2="125" y2="65" stroke="currentColor" strokeWidth="2" opacity="0.4"/>
            <line x1="75" y1="80" x2="125" y2="80" stroke="currentColor" strokeWidth="2" opacity="0.4"/>
            <line x1="75" y1="95" x2="100" y2="95" stroke="currentColor" strokeWidth="2" opacity="0.4"/>
            <path d="M60 140 Q100 120 140 140" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.6"/>
        </svg>
    )
};

function ErrorPage({ code, title, message }) {
    const icon = icons[code] || icons[404];

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.iconWrapper}>
                    {icon}
                </div>
                
                <div className={styles.errorCode}>{code}</div>
                
                <h1 className={styles.title}>{title}</h1>
                
                <p className={styles.message}>{message}</p>
                
                <div className={styles.actions}>
                    <Link to="/" className={`btn btn-primary ${styles.primaryBtn}`}>
                        Volver al inicio
                    </Link>
                    <Link to="/contacto" className={`btn btn-secondary ${styles.secondaryBtn}`}>
                        Contactar soporte
                    </Link>
                </div>
            </div>
            
            <div className={styles.decoration}>
                <div className={styles.circle1}></div>
                <div className={styles.circle2}></div>
                <div className={styles.circle3}></div>
            </div>
        </div>
    );
}

export default ErrorPage;