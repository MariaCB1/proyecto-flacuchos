import styles from './PageHeader.module.css';

const variantClass = {
    urgent: styles.urgent,
    help: styles.help,
    transparency: styles.transparency,
    news: styles.news,
    events: styles.events,
    contact: styles.contact,
};

function PageHeader({ title, subtitle, variant = 'default' }) {
    return (
        <section className={`${styles.pageHeader} ${variantClass[variant] || ''}`}>
            <div className="container">
                <h1>{title}</h1>
                {subtitle && <p>{subtitle}</p>}
            </div>
        </section>
    );
}

export default PageHeader;
