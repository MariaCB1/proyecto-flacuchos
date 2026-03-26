import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import styles from './CasosUrgentes.module.css';

const cases = [
    { id: 1, name: 'Max', emoji: '🐕', title: 'Max - Operación necesaria', description: 'Max necesita una operación de urgencia debido a un tumor. Sin ella no podrá sobrevivir.', current: 1950, total: 3000 },
    { id: 2, name: 'Luna', emoji: '🐈', title: 'Luna - Tratamiento oncológico', description: 'Luna ha sido diagnosticada con cáncer. Necesita sesiones de quimioterapia.', current: 800, total: 2000 },
    { id: 3, name: 'Thor', emoji: '🐕', title: 'Thor - Rescate reciente', description: 'Thor fue encontrado en una carretera. Tiene fracturas múltiples y necesita cirugía.', current: 2400, total: 3000 },
    { id: 4, name: 'Copito', emoji: '🐈', title: 'Copito - Izquierda Urgentemente', description: 'Copito necesita cirugía ocular. Ha perdido la visión de un ojo y el otro está en riesgo.', current: 500, total: 2000 },
    { id: 5, name: 'Negro', emoji: '🐕', title: 'Negro - Accidentado', description: 'Negro fue atropellado. Necesita múltiples cirugías ortopédicas para poder caminar de nuevo.', current: 450, total: 3000 },
    { id: 6, name: 'Manchitas', emoji: '🐈', title: 'Manchitas - Intoxicación', description: 'Manchitas se intoxicó accidentalmente. Necesita tratamiento de urgencia y hospitalización.', current: 550, total: 1000 },
];

function CasosUrgentes() {
    return (
        <>
            <PageHeader title="🚨 Casos Urgentes" subtitle="Estos animales necesitan ayuda inmediata. Tu colaboración puede salvar vidas." variant="urgent" />

            <section className={styles.urgent}>
                <div className="container">
                    <div className={styles.casesGrid}>
                        {cases.map(c => (
                            <div key={c.id} className={styles.caseCard}>
                                <div className={styles.caseImage}>{c.emoji}</div>
                                <div className={styles.caseContent}>
                                    <span className={styles.caseTag}>Urgente</span>
                                    <h3>{c.title}</h3>
                                    <p>{c.description}</p>
                                    <div className={styles.caseCost}>
                                        <div className={styles.costBar}>
                                            <div className={styles.costProgress} style={{width: `${(c.current / c.total) * 100}%`}}></div>
                                        </div>
                                        <span className={styles.costText}>{c.current}€ / {c.total}€</span>
                                    </div>
                                    <Link to="/contacto" className="btn btn-primary" style={{width: '100%'}}>Ayudar a {c.name}</Link>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.urgentInfo}>
                        <h3>¿Cómo ayudar?</h3>
                        <p>Puedes contribuir de varias formas:</p>
                        <div className={styles.helpOptions}>
                            <div className={styles.helpOption}>
                                <span className={styles.helpOptionIcon}>💝</span>
                                <h4>Donación directa</h4>
                                <p>Realiza una donación para uno de estos casos</p>
                                <Link to="/como-ayudar#donar" className="btn btn-primary">Donar</Link>
                            </div>
                            <div className={styles.helpOption}>
                                <span className={styles.helpOptionIcon}>🤝</span>
                                <h4>Hazte socio</h4>
                                <p>Con tu cuota mensual nos ayudas a cubrir gastos veterinarios</p>
                                <Link to="/como-ayudar#socio" className="btn btn-primary">Ser socio</Link>
                            </div>
                            <div className={styles.helpOption}>
                                <span className={styles.helpOptionIcon}>🏠</span>
                                <h4>Casa de acogida</h4>
                                <p>Acoge temporalmente a uno de estos animales</p>
                                <Link to="/como-ayudar#acogida" className="btn btn-primary">Más info</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

export default CasosUrgentes;
