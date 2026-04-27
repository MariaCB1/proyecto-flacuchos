import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './RegistroAuth.module.css';

const RegistroAuth = () => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { registro } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (contrasena !== confirmarContrasena) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (contrasena.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      await registro(nombre, email, contrasena);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Error al registrar');
    } finally {
      setLoading(false);
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
          <h1 className={styles.title}>Crear Cuenta</h1>
          <p className={styles.subtitle}>Únete a la familia Flacuchos</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="nombre">
              <span className="material-symbols-outlined">badge</span>
              Nombre completo
            </label>
            <input
              type="text"
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              placeholder="Tu nombre y apellidos"
            />
          </div>

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
            <input
              type="password"
              id="contrasena"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
              minLength={6}
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="confirmarContrasena">
              <span className="material-symbols-outlined">lock_reset</span>
              Confirmar contraseña
            </label>
            <input
              type="password"
              id="confirmarContrasena"
              value={confirmarContrasena}
              onChange={(e) => setConfirmarContrasena(e.target.value)}
              required
              placeholder="Repite tu contraseña"
            />
          </div>

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? (
              <>
                <span className={styles.spinner}></span>
                Creando cuenta...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">how_to_reg</span>
                Crear Cuenta
              </>
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <p>¿Ya tienes cuenta?</p>
          <Link to="/login" className={styles.loginLink}>
            <span className="material-symbols-outlined">login</span>
            Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegistroAuth;