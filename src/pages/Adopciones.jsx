import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import styles from './Adopciones.module.css';

const pets = [
    { id: 1, name: 'Buddy', type: 'perro', age: '3 años', size: 'Mediano', status: 'available', traits: ['Juguetón', 'Cariñoso', 'Sociable'], health: 'Saludable - Vacunado', emoji: '🐕' },
    { id: 2, name: 'Mishi', type: 'gato', age: '2 años', size: 'Pequeño', status: 'available', traits: ['Tranquilo', 'Independiente'], health: 'Saludable - Vacunado - Esterilizado', emoji: '🐈' },
    { id: 3, name: 'Rocky', type: 'perro', age: '5 años', size: 'Grande', status: 'pending', traits: ['Protector', 'Leal', 'Educado'], health: 'Saludable - Vacunado', emoji: '🐕' },
    { id: 4, name: 'Pelusa', type: 'gato', age: '1 año', size: 'Pequeño', status: 'available', traits: ['Activo', 'Curioso'], health: 'Saludable - Vacunado', emoji: '🐈' },
    { id: 5, name: 'Luna', type: 'perro', age: '4 años', size: 'Mediano', status: 'available', traits: ['Cariñosa', 'Paciente', 'Buena con niños'], health: 'Saludable - Vacunada', emoji: '🐕' },
    { id: 6, name: 'Simba', type: 'gato', age: '6 meses', size: 'Pequeño', status: 'available', traits: ['Travieso', 'Juguetón'], health: 'Saludable - Vacunado', emoji: '🐈' },
    { id: 7, name: 'Thor', type: 'perro', age: '7 años', size: 'Grande', status: 'pending', traits: ['Tranquilo', 'Dócil'], health: '⚠️ Artritis - En tratamiento', emoji: '🐕' },
    { id: 8, name: 'Nala', type: 'gato', age: '3 años', size: 'Mediano', status: 'available', traits: ['Mimosa', 'Sociable'], health: 'Saludable - Vacunada - Esterilizada', emoji: '🐈' },
];

function Adopciones() {
    const [filter, setFilter] = useState('todos');

    const filteredPets = filter === 'todos' 
        ? pets 
        : filter === 'pequeños'
            ? pets.filter(p => p.type === 'gato')
            : pets.filter(p => p.type === filter);

    return (
        <>
            <PageHeader title="🐶 Adopciones" subtitle="Encuentra a tu nuevo mejor amigo" />

            <section className={styles.adoption}>
                <div className="container">
                    <div className={styles.filterButtons}>
                        <button className={`${styles.filterBtn} ${filter === 'todos' ? styles.active : ''}`} onClick={() => setFilter('todos')}>Todos</button>
                        <button className={`${styles.filterBtn} ${filter === 'perro' ? styles.active : ''}`} onClick={() => setFilter('perro')}>Perros</button>
                        <button className={`${styles.filterBtn} ${filter === 'gato' ? styles.active : ''}`} onClick={() => setFilter('gato')}>Gatos</button>
                        <button className={`${styles.filterBtn} ${filter === 'pequeños' ? styles.active : ''}`} onClick={() => setFilter('pequeños')}>Pequeños</button>
                    </div>

                    <div className={styles.petsGrid}>
                        {filteredPets.map(pet => (
                            <div key={pet.id} className={styles.petCard}>
                                <div className={styles.petImage}>
                                    {pet.emoji}
                                    <span className={`${styles.petStatus} ${styles[pet.status]}`}>
                                        {pet.status === 'available' ? 'Disponible' : 'Pendiente'}
                                    </span>
                                </div>
                                <div className={styles.petContent}>
                                    <h3>{pet.name}</h3>
                                    <div className={styles.petInfo}>
                                        <span>📅 {pet.age}</span>
                                        <span>📏 {pet.size}</span>
                                    </div>
                                    <div className={styles.petCharacter}>
                                        {pet.traits.map((trait, idx) => (
                                            <span key={idx} className={styles.characterTag}>{trait}</span>
                                        ))}
                                    </div>
                                    <div className={styles.petHealth}>{pet.health}</div>
                                    <Link to="/contacto" className="btn btn-primary" style={{width: '100%'}}>Formulario de adopción</Link>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.adoptionProcess}>
                        <h3>Proceso de Adopción</h3>
                        <div className={styles.processSteps}>
                            <div className={styles.processStep}>
                                <div className={styles.processStepIcon}>📝</div>
                                <h4>1. Rellena el formulario</h4>
                                <p>Completa nuestra solicitud de adopción</p>
                            </div>
                            <div className={styles.processStep}>
                                <div className={styles.processStepIcon}>🤝</div>
                                <h4>2. Entrevista</h4>
                                <p>Te contactaremos para una entrevista</p>
                            </div>
                            <div className={styles.processStep}>
                                <div className={styles.processStepIcon}>🐾</div>
                                <h4>3. Conoce al animal</h4>
                                <p>Ven a conocer a tu futuro compañero</p>
                            </div>
                            <div className={styles.processStep}>
                                <div className={styles.processStepIcon}>📄</div>
                                <h4>4. Contrato y seguimiento</h4>
                                <p>Firmamos el contrato y hacemos seguimiento</p>
                            </div>
                        </div>
                        <div className={styles.adoptionRequirements}>
                            <h4>Requisitos para adoptar:</h4>
                            <ul>
                                <li>✅ Ser mayor de edad</li>
                                <li>✅ Vivir en zona de actuación (Baena y Albendín)</li>
                                <li>✅ Disponer de tiempo para el animal</li>
                                <li>✅ Capacidad económica para sus cuidados</li>
                                <li>✅ Compromiso de esterilización si procede</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

export default Adopciones;
