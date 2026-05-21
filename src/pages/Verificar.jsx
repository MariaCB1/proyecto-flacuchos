import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { authApi } from '../api/api';
import styles from './Verificar.module.css';

const Verificar = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [emailVerificado, setEmailVerificado] = useState(false);

  useEffect(() => {
    const verificarToken = async () => {
      if (!token) {
        setError('El enlace de verificación no es válido');
        setLoading(false);
        return;
      }

      try {
        await authApi.verificarEmail(token);
        localStorage.removeItem('pendingVerificationEmail');
        setSuccess(true);
        setLoading(false);
        setTimeout(() => navigate('/login'), 3000);
      } catch (err) {
        setError(err.message || 'El token de verificación es inválido o ha expirado');
        setLoading(false);
      }
    };

    verificarToken();
  }, [token, navigate]);

  const handleReenviar = async () => {
    setLoading(true);
    setError('');
    try {
      await authApi.reenviarVerificacion();
      setSuccess(true);
      setEmailVerificado(true);
    } catch (err) {
      setError(err.message || 'Error al reenviar el email');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.spinnerContainer}>
            <div className={styles.spinner}></div>
            <p>Verificando tu email...</p>
          </div>
        </div>
      </div>
    );
  }

  if (success && emailVerificado) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>Email reenviado</h1>
            <p className={styles.subtitle}>Se ha enviado un nuevo email de verificación a tu correo.</p>
          </div>
          <div className={styles.footer}>
            <Link to="/" className={styles.button}>
              Volver a inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>¡Email verificado!</h1>
            <p className={styles.subtitle}>Serás redirigido al login en unos segundos...</p>
          </div>
          <div className={styles.footer}>
            <Link to="/login" className={styles.button}>
              Ir al login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Verificación fallida</h1>
          <p className={styles.subtitle}>{error}</p>
        </div>
        <div className={styles.footer}>
          <button onClick={handleReenviar} className={styles.button} disabled={loading}>
            {loading ? 'Enviando...' : 'Reenviar email de verificación'}
          </button>
          <Link to="/" className={styles.link}>
            Volver a inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Verificar;