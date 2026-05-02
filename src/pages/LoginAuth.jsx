import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import styles from './LoginAuth.module.css';

const LoginAuth = () => {
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mostrarRecuperar, setMostrarRecuperar] = useState(false);
  const [emailRecuperar, setEmailRecuperar] = useState('');
  const [loadingRecuperar, setLoadingRecuperar] = useState(false);
  const [successRecuperar, setSuccessRecuperar] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, contrasena);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleRecuperar = async (e) => {
    e.preventDefault();
    setError('');
    setLoadingRecuperar(true);

    try {
      await api.post('/auth/recuperar-solicitud', { email: emailRecuperar });
      setSuccessRecuperar(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al solicitar recuperación');
    } finally {
      setLoadingRecuperar(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <Link to="/" className={styles.backBtn}>
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div className={styles.header}>
          <div className={styles.logoIcon}>
            <img src="/img/logo.png" alt="Flacuchos" />
          </div>
          {mostrarRecuperar ? (
            <>
              <h1 className={styles.title}>Recuperar Contraseña</h1>
              <p className={styles.subtitle}>Ingresa tu email para recibir el enlace</p>
            </>
          ) : (
            <>
              <h1 className={styles.title}>Iniciar Sesión</h1>
              <p className={styles.subtitle}>Accede a tu cuenta de Flacuchos</p>
            </>
          )}
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {!mostrarRecuperar ? (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="email">
                <span className="material-symbols-outlined">mail</span>
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@email.com"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="contrasena">
                <span className="material-symbols-outlined">lock</span>
                Contraseña
              </label>
              <div className={styles.passwordWrapper}>
                <input
                  type={mostrarContrasena ? 'text' : 'password'}
                  id="contrasena"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  required
                  placeholder="Tu contraseña"
                />
                <button
                  type="button"
                  className={styles.togglePassword}
                  onClick={() => setMostrarContrasena(!mostrarContrasena)}
                >
                  <span className="material-symbols-outlined">
                    {mostrarContrasena ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>

            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? (
                <>
                  <span className={styles.spinner}></span>
                  Iniciando...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">login</span>
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>
        ) : successRecuperar ? (
          <div className={styles.success}>
            <span className="material-symbols-outlined">email</span>
            <p>Si el email existe, recibirás un enlace para recuperar tu contraseña.</p>
          </div>
        ) : (
          <form onSubmit={handleRecuperar} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="emailRecuperar">
                <span className="material-symbols-outlined">mail</span>
                Email
              </label>
              <input
                type="email"
                id="emailRecuperar"
                value={emailRecuperar}
                onChange={(e) => setEmailRecuperar(e.target.value)}
                required
                placeholder="tu@email.com"
              />
            </div>

            <button type="submit" className={styles.button} disabled={loadingRecuperar}>
              {loadingRecuperar ? (
                <>
                  <span className={styles.spinner}></span>
                  Enviando...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">send</span>
                  Enviar enlace
                </>
              )}
            </button>
          </form>
        )}

        <div className={styles.footer}>
          {!mostrarRecuperar ? (
            <>
              <p>¿No tienes cuenta?</p>
              <Link to="/registro" className={styles.registerLink}>
                <span className="material-symbols-outlined">how_to_reg</span>
                Regístrate gratis
              </Link>
              <button 
                type="button" 
                className={styles.forgotLink}
                onClick={() => {
                  setMostrarRecuperar(true);
                  setError('');
                }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </>
          ) : (
            <button 
              type="button" 
              className={styles.forgotLink}
              onClick={() => {
                setMostrarRecuperar(false);
                setSuccessRecuperar(false);
                setError('');
              }}
            >
              Volver al login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginAuth;