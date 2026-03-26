import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import styles from './Eventos.module.css';

const upcomingEvents = [
    { id: 1, day: 15, month: 'Abril', title: 'Jornada de Adopción', description: 'Ven a conocer a nuestros animales en adopción. Será una jornada especial donde podrás interactuar con ellos y find out más sobre el proceso de adopción.', info: ['📍 Plaza Mayor, Madrid', '🕘 11:00 - 18:00', '🎟️ Entrada libre'] },
    { id: 2, day: 22, month: 'Abril', title: 'Mercadillo Solidario', description: 'Venta de productos handmade, ropa de segunda mano y manualidades. Toda la recaudación irá íntegramente a los animales de la protectora.', info: ['📍 Parque de la Plaza', '🕘 10:00 - 15:00', '🎟️ Entrada libre'] },
    { id: 3, day: 5, month: 'Mayo', title: 'Charla Educativa: Responsabilidad Animal', description: 'Charla abierta a todos los públicos sobre tenencia responsable de mascotas. Aprenderemos sobre cuidado, alimentación y bienestar animal.', info: ['📍 Centro Cultural', '🕘 18:00 - 20:00', '🎟️ Entrada libre'] },
    { id: 4, day: 12, month: 'Mayo', title: 'Carrera Solidaria', description: '¡Apoya a los animales corriendo o caminando! Kilómetros solidarios cuyos beneficios irán destinados a costear tratamientos veterinarios.', info: ['📍 Parque Juan Carlos I', '🕘 09:00 - 14:00', '🎟️ 5€ (donativo)'] },
];

const pastEvents = [
    { date: '28 Feb 2026', title: 'Mercadillo Solidario Alcobendas', info: 'Recaudación: 3.000€' },
    { date: '15 Feb 2026', title: 'Charla de Adopción Responsable', info: 'Asistentes: 45 personas' },
    { date: '1 Feb 2026', title: 'Jornada de Adopción', info: '10 adopciones realizadas' },
];

function Eventos() {
    return (
        <>
            <PageHeader title="📅 Eventos" subtitle="Únete a nuestras actividades solidarias" variant="events" />

            <section className={styles.events}>
                <div className="container">
                    <div className="section-header">
                        <h2>Próximos Eventos</h2>
                    </div>
                    <div className={styles.eventsList}>
                        {upcomingEvents.map(event => (
                            <div key={event.id} className={styles.eventCardFull}>
                                <div className={styles.eventDateBadge}>
                                    <span className={styles.eventDay}>{event.day}</span>
                                    <span className={styles.eventMonth}>{event.month}</span>
                                </div>
                                <div className={styles.eventDetails}>
                                    <h3>{event.title}</h3>
                                    <p>{event.description}</p>
                                    <div className={styles.eventInfo}>
                                        {event.info.map((info, idx) => (
                                            <span key={idx}>{info}</span>
                                        ))}
                                    </div>
                                    <Link to="/contacto" className="btn btn-primary">Inscribirse</Link>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="section-header" style={{marginTop: '60px'}}>
                        <h2>Eventos Pasados</h2>
                    </div>
                    <div className={styles.pastEvents}>
                        {pastEvents.map((event, idx) => (
                            <div key={idx} className={styles.pastEvent}>
                                <span className={styles.pastDate}>{event.date}</span>
                                <h4>{event.title}</h4>
                                <p>{event.info}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}

export default Eventos;
