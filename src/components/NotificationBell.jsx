import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { notificationApi } from '../api/api';
import styles from './NotificationBell.module.css';

const NotificationBell = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [abierto, setAbierto] = useState(false);

  const fetchNotificaciones = async () => {
    try {
      const [all, count] = await Promise.all([
        notificationApi.getAll(),
        notificationApi.getNoLeidas(),
      ]);
      setNotificaciones(all);
      setNoLeidas(count.count);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    const loadNotificaciones = async () => {
      try {
        const [all, count] = await Promise.all([
          notificationApi.getAll(),
          notificationApi.getNoLeidas(),
        ]);
        setNotificaciones(all);
        setNoLeidas(count.count);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };
    loadNotificaciones();
  }, []);

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

  return (
    <div className={styles.container}>
      <button className={styles.bellButton} onClick={() => setAbierto(!abierto)}>
        <svg
          className={styles.icon}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.659 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {noLeidas > 0 && (
          <span className={styles.badge}>{noLeidas > 9 ? '9+' : noLeidas}</span>
        )}
      </button>

      {abierto && (
        <div className={styles.dropdown}>
          <div className={styles.header}>
            <span>Notificaciones</span>
            <button onClick={fetchNotificaciones} className={styles.refresh}>
              ↻
            </button>
          </div>

          <div className={styles.list}>
            {notificaciones.length === 0 ? (
              <div className={styles.empty}>Sin notificaciones</div>
            ) : (
              notificaciones.slice(0, 10).map((notif) => (
                <div
                  key={notif.id}
                  className={`${styles.item} ${!notif.leido ? styles.noLeida : ''}`}
                  onClick={() => !notif.leido && handleMarcarLeida(notif.id)}
                >
                  <div className={styles.itemHeader}>
                    <span className={styles.tipo}>{getTipoLabel(notif.tipo)}</span>
                    <span className={styles.fecha}>
                      {formatFecha(notif.created_at)}
                    </span>
                  </div>
                  <p className={styles.mensaje}>{notif.mensaje}</p>
                </div>
              ))
            )}
          </div>

          <Link to="/notificaciones" className={styles.viewAll} onClick={() => setAbierto(false)}>
            Ver todas las notificaciones
          </Link>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;