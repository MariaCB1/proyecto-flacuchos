import { lazy, Suspense, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import './index.css';

const Home = lazy(() => import('./pages/Home'));
const Adopciones = lazy(() => import('./pages/Adopciones'));
const ComoAyudar = lazy(() => import('./pages/ComoAyudar'));
const Transparencia = lazy(() => import('./pages/Transparencia'));
const Noticias = lazy(() => import('./pages/Noticias'));
const Eventos = lazy(() => import('./pages/Eventos'));
const Contacto = lazy(() => import('./pages/Contacto'));
const Login = lazy(() => import('./pages/LoginAuth'));
const Registro = lazy(() => import('./pages/RegistroAuth'));
const Recuperar = lazy(() => import('./pages/RecuperarContrasena'));
const Perfil = lazy(() => import('./pages/Perfil'));
const Notificaciones = lazy(() => import('./pages/Notificaciones'));
const FormularioAdopcion = lazy(() => import('./pages/FormularioAdopcion'));
const AdminSolicitudes = lazy(() => import('./pages/AdminSolicitudes'));

function Loading() {
    return <div style={{ padding: '100px', textAlign: 'center' }}>Cargando...</div>;
}

function AppContent() {
  const location = useLocation();
  const isAuthPage = useMemo(() => 
    ['/login', '/registro', '/recuperar'].includes(location.pathname), 
    [location.pathname]
  );

  return (
    <>
      {!isAuthPage && <Header />}
      <main>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/adopciones" element={<Adopciones />} />
            <Route path="/adopcion/:animalId" element={
              <ProtectedRoute>
                <FormularioAdopcion />
              </ProtectedRoute>
            } />
            <Route path="/como-ayudar" element={<ComoAyudar />} />
            <Route path="/transparencia" element={<Transparencia />} />
            <Route path="/noticias" element={<Noticias />} />
            <Route path="/eventos" element={<Eventos />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/recuperar" element={<Recuperar />} />
            <Route path="/perfil" element={
              <ProtectedRoute>
                <Perfil />
              </ProtectedRoute>
            } />
            <Route path="/notificaciones" element={
              <ProtectedRoute>
                <Notificaciones />
              </ProtectedRoute>
            } />
            <Route path="/admin/solicitudes" element={
              <AdminRoute>
                <AdminSolicitudes />
              </AdminRoute>
            } />
          </Routes>
        </Suspense>
      </main>
      {!isAuthPage && <Footer />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;