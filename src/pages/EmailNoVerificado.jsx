import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import styles from './EmailNoVerificado.module.css';

const EmailNoVerificado = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');

  const pendingEmail = localStorage.getItem('pendingVerificationEmail') || '';

  const handleReenviar = async () => {
    if (!pendingEmail) {
      setError('No hay email para reenviar');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/auth/reenviar-publico', { email: pendingEmail });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Error al reenviar el email');
    }
    setLoading(false);
  };

  const handleCambiarEmail = async (e) => {
    e.preventDefault();
    
    if (!newEmail || !newEmail.includes('@')) {
      setError('Introduce un email válido');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/auth/reenviar-publico', { email: newEmail });
      localStorage.setItem('pendingVerificationEmail', newEmail);
      setShowChangeEmail(false);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error al cambiar el email');
    }
    setLoading(false);
  };

  const handleVerificacionExitosa = () => {
    localStorage.removeItem('pendingVerificationEmail');
    navigate('/');
  };

  if (success) {
    const currentEmail = localStorage.getItem('pendingVerificationEmail') || pendingEmail;
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.iconSuccess}>
            <span className="material-symbols-outlined">mail</span>
          </div>
          <h1 className={styles.title}>Email reenviado</h1>
          <p className={styles.message}>
            Se ha enviado un nuevo email de verificación a <strong>{currentEmail}</strong>
          </p>
          <p className={styles.hint}>
            Revisa tu carpeta de spam si no lo recibes en unos minutos.
          </p>
          <div className={styles.actions}>
            <button onClick={() => setShowChangeEmail(true)} className={styles.linkBtn}>
              Cambiar email
            </button>
            <button onClick={handleReenviar} className={styles.primaryBtn} disabled={loading}>
              Reenviar otro email
            </button>
            <button onClick={handleVerificacionExitosa} className={styles.secondaryBtn}>
              Ya lo he verificado
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showChangeEmail) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.icon}>
            <span className="material-symbols-outlined">edit</span>
          </div>
          <h1 className={styles.title}>Cambiar email</h1>
          <p className={styles.message}>
            Introduce el nuevo email donde quieres recibir el enlace de verificación.
          </p>
          {error && <div className={styles.error}>{error}</div>}
          <form onSubmit={handleCambiarEmail} className={styles.form}>
            <div className={styles.field}>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="nuevo@email.com"
                required
                className={styles.input}
              />
            </div>
            <div className={styles.actions}>
              <button type="submit" className={styles.primaryBtn} disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar verificación'}
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setShowChangeEmail(false);
                  setError('');
                  setNewEmail('');
                }} 
                className={styles.secondaryBtn}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.icon}>
          <span className="material-symbols-outlined">mark_email_unread</span>
        </div>
        <h1 className={styles.title}>Verifica tu email</h1>
        <p className={styles.message}>
          Necesitas verificar tu email para acceder a todas las funciones de la web.
        </p>
        {pendingEmail && (
          <p className={styles.email}>
            Email: <strong>{pendingEmail}</strong>
          </p>
        )}
        {error && <div className={styles.error}>{error}</div>}
        <div className={styles.actions}>
          <button onClick={() => setShowChangeEmail(true)} className={styles.linkBtn}>
            Cambiar email
          </button>
          <button onClick={handleReenviar} className={styles.primaryBtn} disabled={loading}>
            {loading ? 'Enviando...' : 'Reenviar email de verificación'}
          </button>
          <Link to="/" className={styles.secondaryBtn}>
            Ir a inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmailNoVerificado;