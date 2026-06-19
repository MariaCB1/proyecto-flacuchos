const TZ = 'Europe/Madrid';

export function formatDate(dateString, options = {}) {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-ES', {
    timeZone: TZ,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...options,
  });
}

export function formatDateShort(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-ES', { timeZone: TZ });
}

export function formatDateTime(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-ES', {
    timeZone: TZ,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateForInput(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatRelative(fecha) {
  if (!fecha) return '';
  const d = new Date(fecha);
  if (isNaN(d.getTime())) return '';
  const now = new Date();
  const diff = now - d;
  const minutos = Math.floor(diff / 60000);
  if (minutos < 1) return 'Ahora';
  if (minutos < 60) return `Hace ${minutos}m`;
  const horas = Math.floor(diff / 3600000);
  if (horas < 24) return `Hace ${horas}h`;
  const dias = Math.floor(diff / 86400000);
  if (dias < 7) return `Hace ${dias}d`;
  return d.toLocaleDateString('es-ES', { timeZone: TZ });
}

export function getCountdown(fecha, hora) {
  if (!fecha) return null;
  const eventoDate = new Date(fecha);
  if (isNaN(eventoDate.getTime())) return null;
  if (hora) {
    const startHour = hora.split(' - ')[0].trim();
    const [hours, minutes] = startHour.split(':').map(Number);
    if (!isNaN(hours)) {
      eventoDate.setHours(hours, minutes || 0, 0, 0);
    }
  }
  const now = new Date();
  const diff = eventoDate - now;
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hoursLeft = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { days, hours: hoursLeft, minutes };
}

export function getDay(dateString) {
  const d = new Date(dateString);
  return isNaN(d.getTime()) ? '' : d.getDate();
}

export function getMonthShort(dateString) {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-ES', { timeZone: TZ, month: 'short' });
}
