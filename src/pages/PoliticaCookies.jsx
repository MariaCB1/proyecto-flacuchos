import PageHeader from '../components/PageHeader';
import styles from './PoliticaCookies.module.css';

export default function PoliticaCookies() {
    return (
        <>
            <PageHeader
                title="Política de Cookies"
                subtitle="Información sobre el uso de cookies en nuestra web"
            />
            <section className={styles.legalPage}>
                <div className={styles.content}>

                    <div className={styles.section}>
                        <h2>1. ¿Qué es una cookie?</h2>
                        <p>
                            Una <strong>cookie</strong> es un pequeño archivo de texto que un sitio web almacena en su
                            dispositivo (ordenador, tableta o móvil) cuando usted lo visita. Las cookies nos permiten
                            reconocer su dispositivo, recordar sus preferencias y mejorar su experiencia de navegación.
                        </p>
                        <p>
                            Una cookie <strong>NO es un programa ejecutable</strong> y no puede contener virus ni código
                            malicioso. No accede a información personal más allá de la que usted misma nos facilita
                            a través de formularios, ni puede dañar su dispositivo.
                        </p>
                    </div>

                    <div className={styles.section}>
                        <h2>2. Tipos de cookies que utilizamos</h2>

                        <div className={styles.cookieType}>
                            <h4>
                                <span className={styles.badge + ' ' + styles.badgeTeal}>Necesarias</span>
                                Cookies Técnicas
                            </h4>
                            <p>
                                Son esenciales para que el sitio web funcione correctamente. Permiten características
                                básicas como la navegación, el acceso a áreas seguras y la gestión de sesiones de usuario.
                                Sin estas cookies, el sitio web no puede funcionar de forma adecuada.
                            </p>
                            <ul>
                                <li>Cookies de sesión (inicio de sesión, carrito de donaciones)</li>
                                <li>Cookies de seguridad de la pasarela de pago</li>
                                <li>Cookies de preferencias de idioma y accesibilidad</li>
                            </ul>
                        </div>

                        <div className={styles.cookieType}>
                            <h4>
                                <span className={styles.badge + ' ' + styles.badgeBlue}>Analíticas</span>
                                Cookies de Rendimiento y Métricas
                            </h4>
                            <p>
                                Nos ayudan a entender cómo los visitantes interactúan con nuestro sitio web,
                                recopilando información de forma anónima. Esta información nos permite mejorar
                                la usabilidad y el contenido sin identificarle personalmente.
                            </p>
                            <ul>
                                <li>Cookies de Google Analytics o herramienta equivalente</li>
                                <li>Datos de páginas visitadas, tiempo de estancia y errores técnicos</li>
                                <li>Son cookies <strong>seudonimizadas</strong> — no usan su nombre real ni datos personales</li>
                            </ul>
                        </div>

                        <div className={styles.cookieType}>
                            <h4>
                                <span className={styles.badge + ' ' + styles.badgeOrange}>Funcionales</span>
                                Cookies de Redes Sociales y Contenido Embebido
                            </h4>
                            <p>
                                Se utilizan para mostrar contenido de redes sociales (vídeos, mapas, botones de "Me gusta")
                                o para integrar funcionalidades de terceros. Estas cookies pueden rastrear su navegación
                                en nuestro sitio y en otros.
                            </p>
                            <ul>
                                <li>Botones para compartir en redes sociales</li>
                                <li>Vídeos embebidos (YouTube, Vimeo u otros)</li>
                                <li>Mapas interactivos</li>
                            </ul>
                            <div className={styles.infoBox}>
                                <p>
                                    Las redes sociales que integramos (Facebook, Instagram, Twitter/X) tienen sus propias
                                    políticas de cookies. Le recomendamos revisarlas directamente en cada plataforma.
                                </p>
                            </div>
                        </div>

                        <div className={styles.cookieType}>
                            <h4>
                                <span className={styles.badge + ' ' + styles.badgePurple}>Seguridad</span>
                                Cookies de Pago
                            </h4>
                            <p>
                                Estas cookies son estrictamente necesarias para garantizar la seguridad de las transacciones
                                financieras realizadas a través de las pasarelas de pago integradas (Stripe, PayPal u otras).
                                Protegen sus datos financieros durante todo el proceso de pago.
                            </p>
                            <ul>
                                <li>Validación de seguridad de la transacción</li>
                                <li>Prevención de fraude en pagos</li>
                                <li>Cookies de Stripe / PayPal u otro procesador de pago</li>
                            </ul>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h2>3. Relación de cookies utilizadas</h2>

                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Tipo</th>
                                    <th>Finalidad</th>
                                    <th>Duración</th>
                                    <th>Tercero</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><code>session_token</code></td>
                                    <td><span className={styles.badge + ' ' + styles.badgeTeal}>Necesaria</span></td>
                                    <td>Gestión de sesión de usuario autenticado</td>
                                    <td>Sesión</td>
                                    <td>propia</td>
                                </tr>
                                <tr>
                                    <td><code>language_preference</code></td>
                                    <td><span className={styles.badge + ' ' + styles.badgeTeal}>Necesaria</span></td>
                                    <td>Recordar idioma seleccionado</td>
                                    <td>1 año</td>
                                    <td>propia</td>
                                </tr>
                                <tr>
                                    <td><code>_ga</code></td>
                                    <td><span className={styles.badge + ' ' + styles.badgeBlue}>Analítica</span></td>
                                    <td>Métrica de visitas (Google Analytics)</td>
                                    <td>2 años</td>
                                    <td>Google</td>
                                </tr>
                                <tr>
                                    <td><code>_gid</code></td>
                                    <td><span className={styles.badge + ' ' + styles.badgeBlue}>Analítica</span></td>
                                    <td>Distinguir usuarios (Google Analytics)</td>
                                    <td>24 h</td>
                                    <td>Google</td>
                                </tr>
                                <tr>
                                    <td><code>stripe.Session</code></td>
                                    <td><span className={styles.badge + ' ' + styles.badgePurple}>Pago</span></td>
                                    <td>Seguridad del proceso de pago</td>
                                    <td>Sesión</td>
                                    <td>Stripe</td>
                                </tr>
                                <tr>
                                    <td><code>paypal.Session</code></td>
                                    <td><span className={styles.badge + ' ' + styles.badgePurple}>Pago</span></td>
                                    <td>Seguridad del proceso de pago</td>
                                    <td>Sesión</td>
                                    <td>PayPal</td>
                                </tr>
                                <tr>
                                    <td><code>fbp</code></td>
                                    <td><span className={styles.badge + ' ' + styles.badgeOrange}>Redes</span></td>
                                    <td>Píxel de Facebook (si se utiliza)</td>
                                    <td>3 meses</td>
                                    <td>Meta/Facebook</td>
                                </tr>
                                <tr>
                                    <td><code>youtube.consent</code></td>
                                    <td><span className={styles.badge + ' ' + styles.badgeOrange}>Redes</span></td>
                                    <td>Consentimiento de vídeos embebidos</td>
                                    <td>1 año</td>
                                    <td>YouTube/Google</td>
                                </tr>
                            </tbody>
                        </table>

                        <div className={styles.infoBox}>
                            <p>
                                <strong>Nota:</strong> La lista de cookies puede actualizarse periódicamente según
                                las integraciones que la web utilice en cada momento. Le recomendamos visitar esta
                                página con cierta frecuencia para conocer los cambios.
                            </p>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h2>4. ¿Cómo desactivar las cookies?</h2>
                        <p>
                            Si desea gestionar o desactivar las cookies, puede hacerlo desde la configuración de su
                            navegador. A continuación, le indicamos los pasos para los navegadores más utilizados:
                        </p>

                        <div className={styles.browserSection}>

                            <div className={styles.browserCard}>
                                <h4>Google Chrome</h4>
                                <p>
                                    1. Acceda a <strong>Configuración</strong>.<br />
                                    2. Vaya a <strong>Privacidad y seguridad</strong> &gt; <strong>Configuración de sitios webs</strong> &gt; <strong>Cookies</strong>.<br />
                                    3. Active o desactive las opciones según sus preferencias. Para eliminarlas, acceda a
                                    <strong>Ver todas las cookies y datos de sitios</strong>.
                                </p>
                            </div>

                            <div className={styles.browserCard}>
                                <h4>Mozilla Firefox</h4>
                                <p>
                                    1. Vaya a <strong>Menú</strong> (≡) &gt; <strong>Configuración</strong>.<br />
                                    2. Seleccione <strong>Privacidad y seguridad</strong>.<br />
                                    3. En la sección "Cookies" puede bloquearlas, eliminarlas o configurar excepciones
                                    por sitio web.
                                </p>
                            </div>

                            <div className={styles.browserCard}>
                                <h4>Safari (macOS)</h4>
                                <p>
                                    1. Vaya a <strong>Safari</strong> &gt; <strong>Preferencias</strong>.<br />
                                    2. Seleccione la pestaña <strong>Privacidad</strong>.<br />
                                    3. Aquí podrá bloquear o permitir cookies, y gestionar las excepciones.
                                </p>
                            </div>

                            <div className={styles.browserCard}>
                                <h4>Microsoft Edge</h4>
                                <p>
                                    1. Acceda a <strong>Configuración</strong> (⚙️).<br />
                                    2. Vaya a <strong>Cookies y permisos del sitio</strong> &gt; <strong>Administrar y eliminar cookies</strong>.<br />
                                    3. Configure sus preferencias o elimine cookies existentes.
                                </p>
                            </div>

                        </div>

                        <div className={styles.infoBox}>
                            <p>
                                <strong>Importante:</strong> Si bloquea todas las cookies, es posible que algunas
                                funcionalidades del sitio web —como el inicio de sesión o la pasarela de pago—
                                no funcionen correctamente. Le recomendamos configurar la opción "permitir cookies
                                de sesión" para garantizar un uso básico del sitio.
                            </p>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h2>5. Consentimiento</h2>
                        <p>
                            Al navegar por primera vez por este sitio web, se le mostrará un aviso de cookies que le
                            permitirá aceptar o configurar sus preferencias. Si continúa navegando sin tomar acción,
                            entenderemos que consiente el uso de las cookies no estrictamente necesarias para el funcionamiento
                            del sitio.
                        </p>
                        <p>
                            Puede modificar sus preferencias de cookies en cualquier momento accediendo al panel de
                            configuración de cookies de la web (si está disponible) o desde la configuración de su
                            navegador.
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