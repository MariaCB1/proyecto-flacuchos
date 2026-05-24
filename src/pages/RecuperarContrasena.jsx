import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/api';
import styles from './RecuperarContrasena.module.css';

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

const RecuperarContrasena = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [contrasena, setContrasena] = useState('');
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const strength = calculateStrength(contrasena);

  const handleRestablecer = async (e) => {
    e.preventDefault();
    setError('');

    if (strength.score < 4) {
      setError('La contraseña debe ser más fuerte (al menos 4 requisitos)');
      return;
    }

    if (contrasena !== confirmarContrasena) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/recuperar-restablecer', {
        token,
        contrasena,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al restablecer la contraseña');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.logoIcon}>
              <picture>
                <source srcSet="/img/logo.webp" type="image/webp" />
                <img src="/img/logo.png" alt="Flacuchos" />
              </picture>
            </div>
            <h1 className={styles.title}>Enlace inválido</h1>
            <p className={styles.subtitle}>El enlace de recuperación no es válido o ha expirado</p>
          </div>
          <div className={styles.footer}>
            <Link to="/login" className={styles.button}>
              Volver al login
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
            <div className={styles.logoIcon}>
              <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--primary)' }}>check_circle</span>
            </div>
            <h1 className={styles.title}>¡Contraseña actualizada!</h1>
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
          <h1 className={styles.title}>Nueva contraseña</h1>
          <p className={styles.subtitle}>Ingresa tu nueva contraseña</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleRestablecer} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="contrasena">
              <span className="material-symbols-outlined">lock</span>
              Nueva contraseña
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
              <span className="material-symbols-outlined">lock</span>
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
                Restableciendo...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">save</span>
                Restablecer contraseña
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RecuperarContrasena;