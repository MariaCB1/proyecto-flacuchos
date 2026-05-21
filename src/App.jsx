import { lazy, Suspense, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import EmailVerificationRoute from './components/EmailVerificationRoute';
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
const Verificar = lazy(() => import('./pages/Verificar'));
const Perfil = lazy(() => import('./pages/Perfil'));
const Notificaciones = lazy(() => import('./pages/Notificaciones'));
const FormularioAdopcion = lazy(() => import('./pages/FormularioAdopcion'));
const FormularioAcogida = lazy(() => import('./pages/FormularioAcogida'));
const AdminSolicitudes = lazy(() => import('./pages/AdminSolicitudes'));
const AdminInscripciones = lazy(() => import('./pages/AdminInscripciones'));

const AdminAyudas = lazy(() => import('./pages/AdminAyudas'));
const FormularioSocio = lazy(() => import('./pages/FormularioSocio'));
const FormularioApadrinamiento = lazy(() => import('./pages/FormularioApadrinamiento'));
const FormularioVoluntario = lazy(() => import('./pages/FormularioVoluntario'));
const AdminVoluntarios = lazy(() => import('./pages/AdminVoluntarios'));
const AvisoLegal = lazy(() => import('./pages/AvisoLegal'));
const PoliticaPrivacidad = lazy(() => import('./pages/PoliticaPrivacidad'));
const PoliticaCookies = lazy(() => import('./pages/PoliticaCookies'));

const NotFound = lazy(() => import('./pages/NotFound'));
const Forbidden = lazy(() => import('./pages/Forbidden'));
const ServerError = lazy(() => import('./pages/ServerError'));
const ServiceUnavailable = lazy(() => import('./pages/ServiceUnavailable'));

function Loading() {
    return <div style={{ padding: '100px', textAlign: 'center' }}>Cargando...</div>;
}

function AppContent() {
  const location = useLocation();
  const isAuthPage = useMemo(() => 
    ['/login', '/registro', '/recuperar', '/verificar'].includes(location.pathname), 
    [location.pathname]
  );

  return (
    <>
      {!isAuthPage && <Header />}
      <main>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/adopciones" element={
              <EmailVerificationRoute>
                <Adopciones />
              </EmailVerificationRoute>
            } />
            <Route path="/adopcion/:animalId" element={
              <ProtectedRoute>
                <FormularioAdopcion />
              </ProtectedRoute>
            } />
            <Route path="/como-ayudar" element={<ComoAyudar />} />
            <Route path="/acogida" element={
              <ProtectedRoute>
                <FormularioAcogida />
              </ProtectedRoute>
            } />
            <Route path="/transparencia" element={<Transparencia />} />
            <Route path="/noticias" element={<Noticias />} />
            <Route path="/eventos" element={
              <EmailVerificationRoute>
                <Eventos />
              </EmailVerificationRoute>
            } />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/recuperar" element={<Recuperar />} />
            <Route path="/verificar" element={<Verificar />} />
            <Route path="/perfil" element={
              <EmailVerificationRoute>
                <ProtectedRoute>
                  <Perfil />
                </ProtectedRoute>
              </EmailVerificationRoute>
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
            
            <Route path="/admin/inscripciones" element={
              <AdminRoute>
                <AdminInscripciones />
              </AdminRoute>
            } />
            <Route path="/admin/ayudas" element={
              <AdminRoute>
                <AdminAyudas />
              </AdminRoute>
            } />
            <Route path="/socio" element={
              <EmailVerificationRoute>
                <ProtectedRoute>
                  <FormularioSocio />
                </ProtectedRoute>
              </EmailVerificationRoute>
            } />
            <Route path="/apadrinar" element={
              <EmailVerificationRoute>
                <ProtectedRoute>
                  <FormularioApadrinamiento />
                </ProtectedRoute>
              </EmailVerificationRoute>
            } />
            <Route path="/voluntario" element={
              <EmailVerificationRoute>
                <ProtectedRoute>
                  <FormularioVoluntario />
                </ProtectedRoute>
              </EmailVerificationRoute>
            } />
            <Route path="/admin/voluntarios" element={
              <AdminRoute>
                <AdminVoluntarios />
              </AdminRoute>
            } />
            <Route path="/aviso-legal" element={<AvisoLegal />} />
            <Route path="/politica-privacidad" element={<PoliticaPrivacidad />} />
            <Route path="/politica-cookies" element={<PoliticaCookies />} />
            
            <Route path="/404" element={<NotFound />} />
            <Route path="/403" element={<Forbidden />} />
            <Route path="/500" element={<ServerError />} />
            <Route path="/503" element={<ServiceUnavailable />} />
            <Route path="*" element={<NotFound />} />
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