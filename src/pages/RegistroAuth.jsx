import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './RegistroAuth.module.css';

const calculateStrength = (password) => {
  const result = {
    score: 0,
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
    hasSpecial: false,
    hasLength: false,
  };

  if (!password) return result;

  result.hasLength = password.length >= 8;
  result.hasUpper = /[A-Z]/.test(password);
  result.hasLower = /[a-z]/.test(password);
  result.hasNumber = /[0-9]/.test(password);
  result.hasSpecial = /[!@#$%^&*()_+\-=[\]{}|',.<>/?]/.test(password);

  if (result.hasLength) result.score++;
  if (result.hasUpper) result.score++;
  if (result.hasLower) result.score++;
  if (result.hasNumber) result.score++;
  if (result.hasSpecial) result.score++;

  return result;
};

const RegistroAuth = () => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registroExitoso, setRegistroExitoso] = useState(false);
  const { registro } = useAuth();
  const navigate = useNavigate();

  const strength = calculateStrength(contrasena);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (contrasena !== confirmarContrasena) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (strength.score < 4) {
      setError('La contraseña debe ser más fuerte (al menos 4 requisitos)');
      return;
    }

    setLoading(true);

    try {
      await registro(nombre, email, contrasena);
      setRegistroExitoso(true);
    } catch (err) {
      setError(err.message || 'Error al registrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {registroExitoso ? (
          <>
            <div className={styles.header}>
              <div className={styles.logoIcon}>
                <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--primary)' }}>email</span>
              </div>
              <h1 className={styles.title}>¡Registro completado!</h1>
              <p className={styles.subtitle}>Se ha enviado un email de verificación a tu correo. Por favor, verificalo antes de continuar.</p>
            </div>
            <div className={styles.footerSuccess}>
              <button onClick={() => navigate('/')} className={styles.buttonSuccess}>
                Ir a la página principal
              </button>
              <Link to="/login" className={styles.linkSuccess}>
                ¿Ya verificado? Iniciar sesión
              </Link>
            </div>
          </>
        ) : (
          <>
            <Link to="/" className={styles.backBtn}>
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <div className={styles.header}>
              <div className={styles.logoIcon}>
                <picture>
                  <source srcSet="/img/logo.webp" type="image/webp" />
                  <img src="/img/logo.png" alt="Flacuchos" />
                </picture>
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
            <div className={styles.passwordWrapper}>
              <input
                type={mostrarContrasena ? 'text' : 'password'}
                id="contrasena"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
                minLength={8}
                placeholder="Mínimo 8 caracteres"
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

          {contrasena && (
            <div className={styles.requirements}>
              <div className={styles.strengthBar}>
                <div 
                  className={styles.strengthFill} 
                  style={{ 
                    width: `${(strength.score / 5) * 100}%`,
                    backgroundColor: strength.score <= 1 ? '#ef5350' : strength.score <= 2 ? '#ff9800' : strength.score <= 3 ? '#ffca28' : '#66bb6a'
                  }}
                />
              </div>
              <p className={styles.strengthText}>
                {strength.score === 0 && 'Débil'}
                {strength.score === 1 && 'Muy débil'}
                {strength.score === 2 && 'Débil'}
                {strength.score === 3 && 'Media'}
                {strength.score === 4 && 'Fuerte'}
                {strength.score === 5 && 'Muy fuerte'}
              </p>
              <ul className={styles.requirementsList}>
                <li className={strength.hasLength ? styles.met : ''}>
                  <span className="material-symbols-outlined">{strength.hasLength ? 'check_circle' : 'radio_button_unchecked'}</span>
                  Mínimo 8 caracteres
                </li>
                <li className={strength.hasUpper ? styles.met : ''}>
                  <span className="material-symbols-outlined">{strength.hasUpper ? 'check_circle' : 'radio_button_unchecked'}</span>
                  Una mayúscula (A-Z)
                </li>
                <li className={strength.hasLower ? styles.met : ''}>
                  <span className="material-symbols-outlined">{strength.hasLower ? 'check_circle' : 'radio_button_unchecked'}</span>
                  Una minúscula (a-z)
                </li>
                <li className={strength.hasNumber ? styles.met : ''}>
                  <span className="material-symbols-outlined">{strength.hasNumber ? 'check_circle' : 'radio_button_unchecked'}</span>
                  Un número (0-9)
                </li>
                <li className={strength.hasSpecial ? styles.met : ''}>
                  <span className="material-symbols-outlined">{strength.hasSpecial ? 'check_circle' : 'radio_button_unchecked'}</span>
                  Un carácter especial (!@#$...)
                </li>
              </ul>
            </div>
          )}

          <div className={styles.field}>
            <label htmlFor="confirmarContrasena">
              <span className="material-symbols-outlined">lock_reset</span>
              Confirmar contraseña
            </label>
            <div className={styles.passwordWrapper}>
              <input
                type={mostrarConfirmar ? 'text' : 'password'}
                id="confirmarContrasena"
                value={confirmarContrasena}
                onChange={(e) => setConfirmarContrasena(e.target.value)}
                required
                placeholder="Repite tu contraseña"
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
              >
                <span className="material-symbols-outlined">
                  {mostrarConfirmar ? 'visibility' : 'visibility_off'}
                </span>
              </button>
            </div>
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
          </>
        )}
      </div>
    </div>
  );
};

export default RegistroAuth;