import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Perfil.module.css';

const Perfil = () => {
  const { user, logout, updatePerfil } = useAuth();
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setNombre(user.nombre || '');
    setEmail(user.email || '');
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const datos = {};
      if (nombre !== user.nombre) datos.nombre = nombre;
      if (email !== user.email) datos.email = email;
      if (contrasena) datos.contrasena = contrasena;

      if (Object.keys(datos).length === 0) {
        setSuccess('No hay cambios que guardar');
        setLoading(false);
        return;
      }

      await updatePerfil(datos);
      setSuccess('Perfil actualizado correctamente');
      setContrasena('');
    } catch (err) {
      setError(err.message || 'Error al actualizar');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <main className={styles.container}>
      <div className="container">
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.userName}>{user.nombre || 'Usuario'}</h2>
            <p className={styles.userEmail}>{user.email}</p>
            <div className={styles.roleBadge}>
              <span className="material-symbols-outlined">
                {user.rol === 'admin' ? 'admin_panel_settings' : 'person'}
              </span>
              {user.rol}
            </div>
          </div>
          
          <div className={styles.cardBody}>
            {error && (
              <div className={styles.error}>
                <span className="material-symbols-outlined">error</span>
                {error}
              </div>
            )}
            {success && (
              <div className={styles.success}>
                <span className="material-symbols-outlined">check_circle</span>
                {success}
              </div>
            )}

            <h3 className={styles.title}>
              <span className="material-symbols-outlined">edit</span>
              Editar Información
            </h3>

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
                  Nueva contraseña (opcional)
                </label>
                <input
                  type="password"
                  id="contrasena"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  placeholder="Dejar vacío para mantener actual"
                />
              </div>

              <button type="submit" className={styles.button} disabled={loading}>
                {loading ? (
                  <>
                    <span className={styles.spinner}></span>
                    Guardando...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">save</span>
                    Guardar Cambios
                  </>
                )}
              </button>
            </form>

            <div className={styles.divider}></div>

            <button onClick={handleLogout} className={styles.logoutButton}>
              <span className="material-symbols-outlined">logout</span>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Perfil;