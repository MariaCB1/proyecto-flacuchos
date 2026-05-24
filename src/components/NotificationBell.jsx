import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationApi } from '../api/api';
import { formatRelative } from '../utils/dateUtils';
import styles from './NotificationBell.module.css';

const NotificationBell = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [abierto, setAbierto] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.rol === 'admin';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setAbierto(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // formatRelative imported from utils/dateUtils

  const getTipoLabel = (tipo) => {
    const labels = {
      solicitud_adopcion: 'Nueva adopción',
      cambio_estado: 'Estado actualizado',
      solicitud_socio: 'Nuevo socio',
      solicitud_acogida: 'Nueva acogida',
      solicitud_acogida_recibida: 'Acogida recibida',
      solicitud_acogida_aprobada: 'Acogida aprobada',
      solicitud_acogida_rechazada: 'Acogida rechazada',
      solicitud_acogida_asignada: 'Animal asignado',
      solicitud_acogida_aceptada: 'Acogida confirmada',
      mensaje_contacto: 'Nuevo mensaje',
      solicitud_eliminada: 'Animal eliminado',
      solicitud_rechazada: 'Solicitud rechazada',
      solicitud_aprobada: 'Solicitud aprobada',
      sistema: 'Sistema',
      nueva_noticia: 'Nueva noticia',
      nuevo_evento: 'Nuevo evento',
      evento_cancelado: 'Evento cancelado',
      evento_modificado: 'Evento modificado',
      solicitud_inscripcion: 'Nueva inscripción',
      inscripcion_cancelada: 'Inscripción cancelada',
      donacion_exitosa: 'Nueva donación',
      donacion_cancelada: 'Donación cancelada',
      donacion_pending: 'Donación pendiente',
      solicitud_voluntario: 'Nuevo voluntario',
      voluntario_registrado: 'Registro completado',
      socio_aprobado: 'Socio aprobado',
      nuevo_socio: 'Nuevo socio',
      socio_cancelado: 'Baja de socio',
      socio_caido: 'Socio dado de baja',
      solicitud_apadrinamiento: 'Nueva solicitud de apadrinamiento',
      apadrinamiento_aprobado: 'Apadrinamiento aprobado',
      apadrinamiento_rechazado: 'Apadrinamiento rechazado',
      apadrinamiento_cancelado: 'Apadrinamiento cancelado',
      cobro_apadrinamiento: 'Cobro apadrinamiento',
    };
    return labels[tipo] || tipo.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getTipoIcon = (tipo) => {
    const icons = {
      solicitud_adopcion: 'pets',
      cambio_estado: 'swap_horiz',
      solicitud_socio: 'person_add',
      solicitud_acogida: 'home',
      solicitud_acogida_recibida: 'check_circle',
      solicitud_acogida_aprobada: 'check_circle',
      solicitud_acogida_rechazada: 'cancel',
      solicitud_acogida_asignada: 'pets',
      solicitud_acogida_aceptada: 'celebration',
      mensaje_contacto: 'mail',
      solicitud_eliminada: 'delete',
      solicitud_rechazada: 'cancel',
      solicitud_aprobada: 'check_circle',
      sistema: 'settings',
      nueva_noticia: 'newspaper',
      nuevo_evento: 'event_available',
      evento_cancelado: 'event_busy',
      evento_modificado: 'sync',
      solicitud_inscripcion: 'how_to_reg',
      inscripcion_cancelada: 'person_remove',
      donacion_exitosa: 'volunteer_activism',
      donacion_cancelada: 'cancel',
      donacion_pending: 'hourglass_empty',
      solicitud_voluntario: 'person_add',
      voluntario_registrado: 'how_to_reg',
      socio_aprobado: 'card_membership',
      nuevo_socio: 'person_add',
      socio_cancelado: 'person_remove',
      socio_caido: 'person_remove',
      solicitud_apadrinamiento: 'pets',
      apadrinamiento_aprobado: 'celebration',
      apadrinamiento_rechazado: 'cancel',
      apadrinamiento_cancelado: 'heart_broken',
      cobro_apadrinamiento: 'payments',
    };
    return icons[tipo] || 'notifications';
  };

  const handleClickNotif = async (notif) => {
    if (!notif.leido) {
      await handleMarcarLeida(notif.id);
    }
    if (notif.tipo === 'solicitud_adopcion' || notif.tipo === 'solicitud_rechazada' || notif.tipo === 'solicitud_aprobada' || notif.tipo === 'cambio_estado') {
      navigate(isAdmin ? '/admin/solicitudes' : '/perfil?tab=solicitudes');
    } else if (notif.tipo === 'solicitud_socio' || notif.tipo === 'solicitud_acogida' || notif.tipo === 'solicitud_acogida_recibida' || notif.tipo === 'solicitud_acogida_aprobada' || notif.tipo === 'solicitud_acogida_rechazada' || notif.tipo === 'solicitud_acogida_asignada' || notif.tipo === 'solicitud_acogida_aceptada') {
      navigate(isAdmin ? '/admin/ayudas?tab=acogidas' : '/perfil?tab=acogidas');
    } else if (notif.tipo === 'solicitud_eliminada') {
      navigate('/adopciones');
    } else if (notif.tipo === 'mensaje_contacto') {
      navigate('/contacto');
    } else if (notif.tipo === 'nueva_noticia' && notif.referencia_id) {
      navigate(`/noticias?noticia=${notif.referencia_id}`);
    } else if (notif.tipo === 'nueva_noticia') {
      navigate('/noticias');
    } else if ((notif.tipo === 'nuevo_evento' || notif.tipo === 'evento_cancelado') && notif.referencia_id) {
      navigate(`/eventos?evento=${notif.referencia_id}`);
    } else if (notif.tipo === 'nuevo_evento' || notif.tipo === 'evento_cancelado') {
      navigate('/eventos');
    } else if (notif.tipo === 'solicitud_inscripcion' || notif.tipo === 'inscripcion_cancelada') {
      navigate(isAdmin ? '/admin/inscripciones' : '/perfil?tab=inscripciones');
    } else if (notif.tipo === 'donacion_exitosa' || notif.tipo === 'donacion_cancelada' || notif.tipo === 'donacion_pending') {
      navigate(isAdmin ? '/admin/ayudas' : '/perfil?tab=donaciones');
    } else if (notif.tipo === 'solicitud_voluntario') {
      navigate('/admin/ayudas?tab=voluntarios');
    } else if (notif.tipo === 'solicitud_apadrinamiento' || notif.tipo === 'apadrinamiento_aprobado' || notif.tipo === 'apadrinamiento_rechazado' || notif.tipo === 'apadrinamiento_cancelado' || notif.tipo === 'cobro_apadrinamiento') {
      navigate(isAdmin ? '/admin/ayudas?tab=apadrinar' : '/perfil?tab=apadrinamientos');
    } else if (notif.tipo === 'voluntario_registrado') {
      navigate('/perfil?tab=datos');
    } else if (notif.tipo === 'nuevo_socio' || notif.tipo === 'socio_caido') {
      navigate('/admin/ayudas?tab=socios');
    } else if (notif.tipo === 'socio_aprobado' || notif.tipo === 'socio_cancelado') {
      navigate('/perfil?tab=socio');
    }
    setAbierto(false);
  };

  return (
    <div className={styles.container} ref={containerRef}>
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
                  onClick={() => handleClickNotif(notif)}
                >
                  <div className={styles.itemHeader}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', marginRight: '6px' }}>
                        {getTipoIcon(notif.tipo)}
                      </span>
                      <span className={styles.tipo}>{getTipoLabel(notif.tipo)}</span>
                    </div>
                    <span className={styles.fecha}>
                      {formatRelative(notif.created_at)}
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