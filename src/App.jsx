import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import './index.css';

const Home = lazy(() => import('./pages/Home'));
const Adopciones = lazy(() => import('./pages/Adopciones'));
const CasosUrgentes = lazy(() => import('./pages/CasosUrgentes'));
const ComoAyudar = lazy(() => import('./pages/ComoAyudar'));
const Transparencia = lazy(() => import('./pages/Transparencia'));
const Noticias = lazy(() => import('./pages/Noticias'));
const Eventos = lazy(() => import('./pages/Eventos'));
const Contacto = lazy(() => import('./pages/Contacto'));

function Loading() {
    return <div style={{ padding: '100px', textAlign: 'center' }}>Cargando...</div>;
}

function App() {
  return (
    <Router>
      <Header />
      <main>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/adopciones" element={<Adopciones />} />
            <Route path="/casos-urgentes" element={<CasosUrgentes />} />
            <Route path="/como-ayudar" element={<ComoAyudar />} />
            <Route path="/transparencia" element={<Transparencia />} />
            <Route path="/noticias" element={<Noticias />} />
            <Route path="/eventos" element={<Eventos />} />
            <Route path="/contacto" element={<Contacto />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
