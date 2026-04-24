import { useState, useEffect } from 'react';
import { notificationApi } from '../api/api';
import PageHeader from '../components/PageHeader';
import styles from './Notificaciones.module.css';

function Notificaciones() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotificaciones();
  }, []);

  const fetchNotificaciones = async () => {
    try {
      setLoading(true);
      const data = await notificationApi.getAll();
      setNotificaciones(data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarcarLeida = async (id) => {
    try {
      await notificationApi.marcarLeida(id);
      await fetchNotificaciones();
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const formatFecha = (fecha) => {
    const d = new Date(fecha);
    const now = new Date();
    const diff = now - d;
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(diff / 3600000);
    const dias = Math.floor(diff / 86400000);

    if (minutos < 1) return 'Ahora';
    if (minutos < 60) return `Hace ${minutos}m`;
    if (horas < 24) return `Hace ${horas}h`;
    if (dias < 7) return `Hace ${dias}d`;
    return d.toLocaleDateString();
  };

  const getTipoLabel = (tipo) => {
    const labels = {
      solicitud_adopcion: 'Nueva adopción',
      cambio_estado: 'Estado actualizado',
      solicitud_socio: 'Nuevo socio',
      solicitud_acogida: 'Nueva acogida',
      mensaje_contacto: 'Nuevo mensaje',
      sistema: 'Sistema',
    };
    return labels[tipo] || tipo;
  };

  const getTipoIcon = (tipo) => {
    const icons = {
      solicitud_adopcion: 'pets',
      cambio_estado: 'swap_horiz',
      solicitud_socio: 'card_membership',
      solicitud_acogida: 'home',
      mensaje_contacto: 'email',
      sistema: 'info',
    };
    return icons[tipo] || 'notifications';
  };

  if (loading) {
    return (
      <>
        <PageHeader title="🔔 Notificaciones" subtitle="Tu historial de actividad" variant="default" />
        <section className={styles.container}>
          <div className="container">
            <div className={styles.loading}>Cargando...</div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader title="🔔 Notificaciones" subtitle="Tu historial de actividad" variant="default" />

      <section className={styles.container}>
        <div className="container">
          {notificaciones.length === 0 ? (
            <div className={styles.empty}>
              <span className="material-symbols-outlined">notifications_off</span>
              <p>No tienes notificaciones</p>
            </div>
          ) : (
            <div className={styles.list}>
              {notificaciones.map((notif) => (
                <div
                  key={notif.id}
                  className={`${styles.item} ${!notif.leido ? styles.noLeida : ''}`}
                  onClick={() => !notif.leido && handleMarcarLeida(notif.id)}
                >
                  <div className={styles.itemIcon}>
                    <span className="material-symbols-outlined">{getTipoIcon(notif.tipo)}</span>
                  </div>
                  <div className={styles.itemContent}>
                    <div className={styles.itemHeader}>
                      <span className={styles.tipo}>{getTipoLabel(notif.tipo)}</span>
                      <span className={styles.fecha}>{formatFecha(notif.created_at)}</span>
                    </div>
                    <p className={styles.mensaje}>{notif.mensaje}</p>
                    {!notif.leido && <span className={styles.noLeidaBadge}>Nueva</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default Notificaciones;