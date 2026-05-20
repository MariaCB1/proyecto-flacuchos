import PageHeader from '../components/PageHeader';
import styles from './AvisoLegal.module.css';

export default function AvisoLegal() {
    return (
        <>
            <PageHeader
                title="Aviso Legal"
                subtitle="Información legal sobre la Protectora de Animales Flacuchos"
            />
            <section className={styles.legalPage}>
                <div className={styles.content}>

                    <div className={styles.section}>
                        <h2>1. Datos identificativos del responsable</h2>
                        <div className={styles.dataBox}>
                            <p><strong>Denominación social:</strong> Protectora de Animales Flacuchos</p>
                            <p><strong>CIF:</strong> G-56120157</p>
                            <p><strong>Fecha de inscripción:</strong> 11 de julio de 2019</p>
                            <p><strong>Registro:</strong> Registro Provincial de Asociaciones de Córdoba (número pendiente de formalización)</p>
                            <p><strong>Domicilio social:</strong> Diseminado Diseminados, 822, 14850 Baena, Córdoba, España</p>
                            <p><strong>Zona de actuación:</strong> Baena y Albendín</p>
                            <p><strong>Correo electrónico:</strong> flacuchosbaena@gmail.com</p>
                            <p><strong>Teléfono:</strong> 696 951 795</p>
                        </div>
                        <p>
                            La Protectora de Animales Flacuchos (en adelante, "la asociación") es una entidad sin ánimo de lucro
                            constituida conforme a la legislación española, cuyo objeto social es la protección y defensa de los
                            animales, así como la promoción de la adopción responsable.
                        </p>
                    </div>

                    <div className={styles.section}>
                        <h2>2. Propiedad intelectual de los contenidos</h2>
                        <p>
                            Todos los contenidos publicados en este sitio web —incluidos, a título enunciativo y no limitativo,
                            textos, fotografías, imágenes, gráficos, logos, iconos, diseño, estructura de navegación, bases de
                            datos y cualquier otro material— están protegidos por derechos de propiedad intelectual e industrial
                            que pertenecen a la asociación o sobre los que esta ostenta las oportunas licencias de uso.
                        </p>
                        <p>Queda expresamente prohibido:</p>
                        <ul>
                            <li>La reproducción, distribución, comunicación pública o transformación de cualquier contenido del sitio web sin autorización expresa y por escrito de la asociación.</li>
                            <li>La utilización de las fotografías y fichas de los animales publicados para fines comerciales, publicitarios o cualquier otro distinto de la consulta informativa.</li>
                            <li>La extracción o reutilización de la base de datos del sitio web.</li>
                        </ul>
                        <div className={styles.infoBox}>
                            <p>
                                Las imágenes de los animales que aparecen en esta web son propiedad de la asociación o cuentan
                                con autorización de sus autores para su uso en el contexto de la protectora. Su uso sin
                                autorización será tratado como una infracción de derechos de propiedad intelectual.
                            </p>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h2>3. Condiciones de uso del sitio web</h2>
                        <p>
                            El acceso y la navegación por este sitio web implican la aceptación expresa de las presentes condiciones.
                            La asociación se reserva el derecho a modificar, en cualquier momento y sin previo aviso, la
                            configuración del sitio, las presentes condiciones o cualquiera de sus contenidos.
                        </p>
                        <p>El usuario se compromete a hacer un uso lícito del sitio web, respetando en todo momento la normativa aplicable y los derechos de terceros. En particular, el usuario se abstendrá de:</p>
                        <ul>
                            <li>Utilizar el sitio web para fines ilícitos, contrarios a la buena fe, al orden público o a las presentes condiciones.</li>
                            <li>Realizar cualquier acción que pueda dañar, sobrecargar o deteriorar el sitio web o impedir su normal utilización.</li>
                            <li>Introducir virus informáticos, troyanos o cualquier otro material tecnológicamente perjudicial.</li>
                            <li>Intentar acceder de forma no autorizada a sistemas o cuentas vinculadas al sitio web.</li>
                        </ul>
                    </div>

                    <div className={styles.section}>
                        <h2>4. Exención de responsabilidad</h2>
                        <h3>4.1. Enlaces externos</h3>
                        <p>
                            Este sitio web puede contener enlaces a páginas web de terceros. La asociación no se responsabiliza
                            del contenido, políticas de privacidad ni prácticas de los sitios web enlazados. El usuario accede
                            a estos enlaces bajo su propia responsabilidad y queda sujeto a las condiciones de uso propias de
                            cada sitio web externo, incluyendo —pero no limitado a— la plataforma <strong>Teaming</strong>,
                            utilizada para la gestión de donaciones colectivas, cuya política de privacidad es independiente
                            y ajena a la de esta web.
                        </p>
                        <h3>4.2. Información contenida en el sitio</h3>
                        <p>
                            La asociación se esfuerza por mantener la información del sitio web actualizada y precisa.
                            No obstante, no garantiza la exactitud, completitud o actualidad de todos los contenidos.
                            Los animales presentados como disponibles para adopción pueden haber encontrado un hogar con
                            posterioridad a la última actualización. Se recomienda contactar directamente con la asociación
                            para confirmar la disponibilidad de un animal.
                        </p>
                        <h3>4.3. Fallos técnicos</h3>
                        <p>
                            La asociación no será responsable de los daños o perjuicios derivados de interrupciones temporales,
                            errores técnicos o desconexiones del sitio web que respondan a causas ajenas a su voluntad.
                        </p>
                    </div>

                    <div className={styles.section}>
                        <h2>5. Ley aplicable y jurisdicción competente</h2>
                        <p>
                            Las presentes condiciones se rigen por la legislación española vigente. Para cualquier controversia
                            derivada del uso de este sitio web,                             las partes se someten a los Juzgados y Tribunales de <strong>Priego, Córdoba</strong>, salvo que la normativa de consumo aplicable disponga otra cosa.
                        </p>
                        <p>
                            En cumplimiento de la normativa de resolución alternativa de litigios, le informamos de que,
                            como entidad sin ánimo de lucro, la asociación no está obligada a adherirse a ninguna
                            plataforma de resolución de disputas de consumo. No obstante, estamos abiertos a buscar
                            soluciones amistosas ante cualquier reclamación.
                        </p>
                    </div>

                    <div className={styles.section}>
                        <h2>6. Plataformas externas de pago</h2>
                        <p>
                            Los pagos de cuotas de socio, donaciones y aportaciones económicas se procesan a través de
                            pasarelas de pago seguras (Stripe, PayPal u otras equivalentes) integradas en este sitio web.
                            La asociación no almacena datos de pago de los usuarios. Los datos financieros se procesan
                            directamente por el proveedor de la pasarela de pago, sujeto a su propia política de privacidad.
                        </p>
                        <div className={styles.attention}>
                            <p>
                                <strong>Plataforma Teaming:</strong> Las donaciones colectivas gestionadas a través de la
                                plataforma Teaming están sujetas a los términos y condiciones y política de privacidad de
                                dicha plataforma. Le recomendamos revisar la información disponible en
                                <a href="https://www.teaming.net" target="_blank" rel="noopener noreferrer" style={{color: 'var(--secondary)', marginLeft: '5px'}}>www.teaming.net</a>.
                            </p>
                        </div>
                    </div>

                    <p className={styles.lastUpdate}>
                        Última actualización: mayo de 2026
                    </p>
                </div>
            </section>
        </>
    );
}