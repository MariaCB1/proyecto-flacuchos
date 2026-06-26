import PageHeader from '../components/PageHeader';
import styles from './PoliticaPrivacidad.module.css';

export default function PoliticaPrivacidad() {
    return (
        <>
            <PageHeader
                title="Política de Privacidad"
                subtitle="Protección de datos personales"
            />
            <section className={styles.legalPage}>
                <div className={styles.content}>

                    <div className={styles.section}>
                        <h2>1. Responsable del tratamiento</h2>
                        <div className={styles.contactBox}>
                            <p><strong>Denominación:</strong> Protectora de Animales Flacuchos</p>
                            <p><strong>CIF:</strong> G-56120157</p>
                            <p><strong>Domicilio:</strong> Diseminado Diseminados, 822, 14850 Baena, Córdoba</p>
                            <p><strong>Correo electrónico:</strong> flacuchosbaena@gmail.com</p>
                            <p><strong>Teléfono:</strong> 614 41 68 51</p>
                        </div>
                        <p>
                            La Protectora de Animales Flacuchos, como entidad responsable de este sitio web, se compromete
                            a tratar sus datos personales con pleno respeto a la normativa vigente en materia de
                            protección de datos, concretamente el <strong>Reglamento (UE) 2016/679, de 27 de abril (RGPD)</strong>,
                            y la <strong>Ley Orgánica 3/2018, de 5 de diciembre, de Protección de Datos Personales y
                            garantía de los derechos digitales (LOPDGDD)</strong>.
                        </p>
                    </div>

                    <div className={styles.section}>
                        <h2>2. Finalidades y base jurídica del tratamiento</h2>
                        <p>
                            Recogemos y tratamos sus datos personales únicamente para las finalidades que se detallan a
                            continuación, indicando igualmente la base jurídica que legitima cada tratamiento:
                        </p>

                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Finalidad</th>
                                    <th>Datos tratados</th>
                                    <th>Base jurídica</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Gestión de consultas y mensajes de contacto</td>
                                    <td>Nombre, email, teléfono (opcional), contenido del mensaje</td>
                                    <td>Consentimiento del interesado (art. 6.1.a RGPD)</td>
                                </tr>
                                <tr>
                                    <td>Gestión de solicitudes de adopción</td>
                                    <td>Nombre, apellidos, email, teléfono, datos de vivienda, composición familiar, experiencia con animales, declaraciones obligatorias</td>
                                    <td>Consentimiento del interesado (art. 6.1.a RGPD)</td>
                                </tr>
                                <tr>
                                    <td>Gestión de solicitudes de casa de acogida</td>
                                    <td>Nombre, apellidos, email, teléfono, datos de vivienda, experiencia con animales</td>
                                    <td>Consentimiento del interesado (art. 6.1.a RGPD)</td>
                                </tr>
                                <tr>
                                    <td>Gestión de solicitudes de voluntariado</td>
                                    <td>Nombre, apellidos, email, teléfono, motivación, disponibilidad, habilidades</td>
                                    <td>Consentimiento del interesado (art. 6.1.a RGPD)</td>
                                </tr>
                                <tr>
                                    <td>Gestión de altas como socio / apadrinamiento</td>
                                    <td>Nombre, apellidos, email, teléfono, datos de pago (procesados por pasarela segura)</td>
                                    <td>Ejecución de un contrato en el que el interesado es parte (art. 6.1.b RGPD)</td>
                                </tr>
                                <tr>
                                    <td>Gestión de donaciones y donativos</td>
                                    <td>Datos identificativos, datos de pago (procesados por pasarela segura)</td>
                                    <td>Consentimiento del interesado (art. 6.1.a RGPD)</td>
                                </tr>
                                <tr>
                                    <td>Emisión de certificados y justificantes de donación</td>
                                    <td>Nombre, apellidos, NIF/CIF, importe donado, fecha</td>
                                    <td>Cumplimiento de obligación legal (art. 6.1.c RGPD — Ley 49/2002, de mecenazgo)</td>
                                </tr>
                                <tr>
                                    <td>Envío de notificaciones personalizadas del usuario (no newsletters)</td>
                                    <td>Nombre, email, tipo de notificación, estado de solicitudes</td>
                                    <td>Consentimiento del interesado (art. 6.1.a RGPD)</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className={styles.section}>
                        <h2>3. Plataforma externa: Teaming</h2>
                        <div className={styles.attentionBox}>
                            <p>
                                <strong>Plataforma Teaming:</strong> Las donaciones a través de la plataforma Teaming se rigen
                                íntegramente por la política de privacidad y los términos y condiciones de Teaming, disponibles
                                en <a href="https://www.teaming.net" target="_blank" rel="noopener noreferrer" style={{color: 'var(--secondary)'}}>www.teaming.net</a>.
                                La Protectora de Animales Flacuchos no tiene acceso ni responsabilidad sobre los datos
                                personales que usted facilite directamente a Teaming.
                            </p>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h2>4. Comunicaciones comerciales</h2>
                        <div className={styles.infoBox}>
                            <p>
                                <strong>Nuestra web NO envía boletines informativos (newsletters) ni comunicaciones
                                comerciales masivas.</strong> No le enviaremos correos promocionales, newsletters,
                                boletines periódicos ni ninguna otra comunicación comercial no solicitada.
                            </p>
                        </div>
                        <p>
                            Únicamente recibirá comunicaciones transaccionales relacionadas con su actividad en la web
                            (confirmación de solicitud de adopción, cambio de estado de una solicitud, recordatorios de
                            inscripción a eventos, etc.) y notificaciones personalizadas activadas por su propio uso
                            de la plataforma. Estas comunicaciones son necesarias para la prestación del servicio.
                        </p>
                    </div>

                    <div className={styles.section}>
                        <h2>5. Destinatarios de los datos</h2>
                        <p>Sus datos personales podrán ser comunicados a los siguientes destinatarios, exclusivamente para las finalidades indicadas:</p>
                        <ul>
                            <li><strong>Administración Pública competente:</strong> cuando así lo exija la normativa fiscal, laboral o de cualquier otro orden legal.</li>
                            <li><strong>Proveedores de servicios de pago (pasarela Stripe / PayPal u otros):</strong> para la gestión de cobros y pagos de cuotas, donaciones y apadrinamientos. Dichos proveedores actúan como encargados del tratamiento conforme a sus propias políticas de privacidad.</li>
                            <li><strong>Teaming:</strong> en caso de donaciones realizadas a través de su plataforma, conforme a la política de privacidad de Teaming.</li>
                            <li><strong>Plataforma de email (si aplicable):</strong> proveedores de servicios de correo electrónico que actúan como encargados del tratamiento con estricto contrato de confidencialidad.</li>
                        </ul>
                        <p>
                            No se realizan transferencias internacionales de datos fuera del Espacio Económico Europeo (EEE),
                            salvo que los proveedores de servicios de pago así lo requieran, en cuyo caso se garantizará
                            un nivel de protección de datos adecuado.
                        </p>
                    </div>

                    <div className={styles.section}>
                        <h2>6. Conservación de los datos</h2>
                        <p>
                            Los datos personales se conservarán durante el tiempo estrictamente necesario para cumplir
                            con la finalidad para la que fueron recogidos. Transcurrido dicho plazo, los datos serán
                            suprimidos o anonimizados, salvo que resulten necesarios para el cumplimiento de obligaciones
                            legales:
                        </p>
                        <ul>
                            <li>Datos de donantes y socios: se conservarán durante al menos 4 años conforme a la normativa fiscal española.</li>
                            <li>Datos de solicitudes de adopción, acogida o voluntariado: se conservarán durante 2 años desde la resolución de la solicitud.</li>
                            <li>Datos de consultas de contacto: se conservarán durante 1 año desde la recepción del mensaje.</li>
                            <li>Datos de notificaciones personalizadas: mientras el usuario mantenga su cuenta activa en la plataforma.</li>
                        </ul>
                    </div>

                    <div className={styles.section}>
                        <h2>7. Derechos del interesado (ARCO-POL)</h2>
                        <p>
                            En cualquier momento, usted puede ejercer los siguientes derechos frente a la Protectora
                            de Animales Flacuchos:
                        </p>

                        <div className={styles.rightsList}>
                            <div className={styles.rightItem}>
                                <strong>Acceso</strong>
                                Conocer qué datos personales suyos estamos tratando.
                            </div>
                            <div className={styles.rightItem}>
                                <strong>Rectificación</strong>
                                Corregir datos inexactos o incompletos.
                            </div>
                            <div className={styles.rightItem}>
                                <strong>Supresión (cancelación)</strong>
                                Solicitar la eliminación de sus datos cuando ya no sean necesarios.
                            </div>
                            <div className={styles.rightItem}>
                                <strong>Oposición</strong>
                                Oponerse al tratamiento en aquellos casos que lo permita la ley.
                            </div>
                            <div className={styles.rightItem}>
                                <strong>Limitación</strong>
                                Solicitar que limitemos el uso de sus datos en determinadas circunstancias.
                            </div>
                            <div className={styles.rightItem}>
                                <strong>Portabilidad</strong>
                                Recibir sus datos en un formato estructurado y de uso común.
                            </div>
                        </div>

                        <div className={styles.contactBox}>
                            <p><strong>Para ejercer sus derechos, puede dirigirse por escrito a:</strong></p>
                            <p>Correo electrónico: <strong>flacuchosbaena@gmail.com</strong></p>
                            <p>Correo postal: Protectora de Animales Flacuchos — Diseminado Diseminados, 822, 14850 Baena, Córdoba</p>
                            <p style={{marginTop: '10px', fontSize: '0.9rem', color: 'var(--gray)'}}>
                                Le solicitaremos que acredite su identidad para garantizar que sus datos no son accesibles a terceros no autorizados.
                            </p>
                        </div>

                        <p>
                            Asimismo, tiene usted derecho a presentar una reclamación ante la autoridad de control
                            competente —la <strong>Agencia Española de Protección de Datos (AEPD)</strong>—
                            si considera que el tratamiento de sus datos no es acorde a la normativa vigente.
                            Puede obtener más información en <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" style={{color: 'var(--primary)'}}>www.aepd.es</a>.
                        </p>
                    </div>

                    <div className={styles.section}>
                        <h2>8. Medidas de seguridad</h2>
                        <p>
                            La Protectora de Animales Flacuchos ha implementado las medidas técnicas y organizativas
                            adecuadas para garantizar un nivel de seguridad adecuado al riesgo del tratamiento,
                            protegiendo la confidencialidad, integridad y disponibilidad de sus datos personales.
                            Entre otras, se contemplan medidas de control de acceso, cifrado de comunicaciones,
                            políticas de contraseñas y formación del personal con acceso a datos.
                        </p>
                    </div>

                    <p className={styles.lastUpdate}>
                        Última actualización: mayo de 2026
                    </p>
                </div>
            </section>
        </>
    );
}