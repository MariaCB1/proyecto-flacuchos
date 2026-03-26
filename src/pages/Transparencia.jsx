import PageHeader from '../components/PageHeader';
import styles from './Transparencia.module.css';

function Transparencia() {
    const docs = [
        { icon: '📋', title: 'CIF', desc: 'G-56120157' },
        { icon: '📜', title: 'Estatutos', desc: 'Documento fundacional' },
        { icon: '📊', title: 'Memoria Anual', desc: 'Ejercicio 2025' },
        { icon: '💵', title: 'Justificación de Gastos', desc: 'Desglose detallado' },
        { icon: '📧', title: 'Certificado de Donación', desc: 'Para desgravar' },
    ];

    return (
        <>
            <PageHeader title="🔎 Transparencia" subtitle="Somos una asociación transparente y comprometida" variant="transparency" />

            <section className={styles.transparency}>
                <div className="container">
                    <div className="section-header">
                        <h2>Documentos Públicos</h2>
                        <p>Puedes consultar toda nuestra documentación</p>
                    </div>
                    <div className={styles.docsGrid}>
                        {docs.map((doc, idx) => (
                            <div key={idx} className={styles.docCard}>
                                <div className={styles.docIcon}>{doc.icon}</div>
                                <h4>{doc.title}</h4>
                                <p>{doc.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}

export default Transparencia;
