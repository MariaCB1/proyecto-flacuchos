import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationApi } from '../api/api';
import PageHeader from '../components/PageHeader';
import { formatRelative } from '../utils/dateUtils';
import styles from './Notificaciones.module.css';

function Notificaciones() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.rol === 'admin';

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

  const handleEliminar = async (e, id) => {
    e.stopPropagation();
    if (!confirm('¿Eliminar esta notificación?')) return;
    try {
      await notificationApi.eliminar(id);
      await fetchNotificaciones();
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const handleEliminarTodas = async () => {
    if (!confirm('¿Eliminar todas las notificaciones?')) return;
    try {
      await notificationApi.eliminarTodas();
      await fetchNotificaciones();
    } catch (err) {
      console.error('Error deleting all notifications:', err);
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
      solicitud_socio: 'card_membership',
      solicitud_acogida: 'home',
      solicitud_acogida_recibida: 'check_circle',
      solicitud_acogida_aprobada: 'check_circle',
      solicitud_acogida_rechazada: 'cancel',
      solicitud_acogida_asigned: 'pets',
      solicitud_acogida_aceptada: 'celebration',
      mensaje_contacto: 'email',
      solicitud_eliminada: 'delete',
      solicitud_rechazada: 'cancel',
      solicitud_aprobada: 'check_circle',
      sistema: 'info',
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

  if (loading) {
    return (
      <>
        <PageHeader title="Notificaciones" subtitle="Tu historial de actividad" variant="notifications" />
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
      <PageHeader title="Notificaciones" subtitle="Tu historial de actividad" variant="notifications" />

      <section className={styles.container}>
        <div className="container">
          {notificaciones.length > 0 && (
            <button className={styles.deleteAllBtn} onClick={handleEliminarTodas}>
              <span className="material-symbols-outlined">delete_sweep</span>
              Borrar todas
            </button>
          )}
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
                  onClick={async () => {
                    if (!notif.leido) {
                      await handleMarcarLeida(notif.id);
                    }
                    if (notif.tipo === 'solicitud_adopcion' || notif.tipo === 'solicitud_rechazada' || notif.tipo === 'solicitud_aprobada' || notif.tipo === 'cambio_estado') {
                      navigate(isAdmin ? '/admin/solicitudes' : '/perfil?tab=solicitudes');
                    } else if (notif.tipo === 'solicitud_socio' || notif.tipo === 'solicitud_acogida' || notif.tipo === 'solicitud_acogida_recibida' || notif.tipo === 'solicitud_acogida_aprobada' || notif.tipo === 'solicitud_acogida_rechazada') {
                      navigate(isAdmin ? '/admin/ayudas?tab=acogidas' : '/perfil?tab=acogidas');
                    } else if (notif.tipo === 'solicitud_acogida_asignada' || notif.tipo === 'solicitud_acogida_aceptada') {
                      navigate(isAdmin ? '/admin/ayudas?tab=acogidas' : '/perfil?tab=acogidas');
                    } else if (notif.tipo === 'solicitud_eliminada') {
                      navigate('/adopciones');
                    } else if (notif.tipo === 'mensaje_contacto') {
                      navigate('/contacto');
                    } else if (notif.tipo === 'nueva_noticia' && notif.referencia_id) {
                      navigate(`/noticias?noticia=${notif.referencia_id}`);
                    } else if ((notif.tipo === 'nuevo_evento' || notif.tipo === 'evento_cancelado') && notif.referencia_id) {
                      navigate(`/eventos?evento=${notif.referencia_id}`);
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
                    } else {
                      navigate('/noticias');
                    }
                  }}
                >
                  <div className={styles.itemIcon}>
                    <span className="material-symbols-outlined">{getTipoIcon(notif.tipo)}</span>
                  </div>
                  <div className={styles.itemContent}>
                    <div className={styles.itemHeader}>
                      <span className={styles.tipo}>{getTipoLabel(notif.tipo)}</span>
                      <span className={styles.fecha}>{formatRelative(notif.created_at)}</span>
                    </div>
                    <p className={styles.mensaje}>{notif.mensaje}</p>
                    {!notif.leido && <span className={styles.noLeidaBadge}>Nueva</span>}
                  </div>
                  <button 
                    className={styles.deleteBtn}
                    onClick={(e) => handleEliminar(e, notif.id)}
                    title="Eliminar notificación"
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
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