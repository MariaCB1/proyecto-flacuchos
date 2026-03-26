import PageHeader from '../components/PageHeader';
import styles from './Noticias.module.css';

const news = [
    { id: 1, emoji: '🐕', category: 'Final Feliz', title: 'Bruno encuentra su hogar definitivo después de 2 años en el refugio', content: 'Bruno llegó al refugio muy deteriorado, con problemas de salud y muy temeroso de las personas. Después de 2 años de rehabilitación, hoy vive feliz con una familia que lo adora. «Es el perro más bonito que hemos tenido», nos dicen sus nuevos dueños.', date: '10 Marzo 2026' },
    { id: 2, emoji: '🐈', category: 'Rescate', title: 'Salvados 12 gatos de una situación de abandono en Fuenlabrada', content: 'Gracias a la alerta de un vecino, nuestro equipo pudo rescatar a 12 gatos que vivían en condiciones muy precarias. Todos han sido atendidos, esterilizados y algunos ya están en adopción. ¡Gracias a tod@s los que colaboraron!', date: '5 Marzo 2026' },
    { id: 3, emoji: '🎉', category: 'Evento', title: 'Gran éxito del mercadillo solidario en Alcobendas', content: 'El pasado fin de semana celebramos nuestro mercadillo solidario en Alcobendas. ¡Recaudamos más de 3.000€ para costear tratamientos veterinarios de nuestros animales! Gracias a todos los voluntarios y asistentes.', date: '28 Febrero 2026' },
    { id: 4, emoji: '🏥', category: 'Veterinario', title: 'Max supera su operación con éxito', content: '¡Grandes noticias! Max, nuestro caso más urgente, ha superado la operación de tumor con éxito. Ahora necesita recuperarse y buscar una familia que lo cuida. ¡Ayúdanos a encontrarle hogar!', date: '25 Febrero 2026' },
    { id: 5, emoji: '🤝', category: 'Colaboración', title: 'Nueva alianza con clínicas veterinarias', content: 'Nos alegra anunciar que hemos llegado a acuerdos con varias clínicas veterinarias de Madrid para ofrecer descuentos a los animales de nuestra protectora. ¡Esto nos ayudará a ahorrar mucho en gastos médicos!', date: '20 Febrero 2026' },
    { id: 6, emoji: '🐾', category: 'Adopción', title: '5 cachorros encuentran hogar en una semana', content: 'Esta semana ha sido especialmente emotiva. 5 cachorros que nacieron en nuestro refugio han encontrado familias definitivas. ¡Estamos muy felices!', date: '15 Febrero 2026' },
];

function Noticias() {
    return (
        <>
            <PageHeader title="📰 Noticias" subtitle="Historias de rescate y adopción que nos alegran el corazón" variant="news" />

            <section className={styles.news}>
                <div className="container">
                    <div className="section-header">
                        <h2>Últimas Noticias</h2>
                    </div>
                    <div className={styles.newsList}>
                        {news.map(item => (
                            <article key={item.id} className={styles.newsItem}>
                                <div className={styles.newsImage}>{item.emoji}</div>
                                <div className={styles.newsContent}>
                                    <span className={styles.newsCategory}>{item.category}</span>
                                    <h3>{item.title}</h3>
                                    <p>{item.content}</p>
                                    <span className={styles.newsDate}>{item.date}</span>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}

export default Noticias;
