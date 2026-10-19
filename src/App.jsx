import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { CustomCursor } from './components/common/CustomCursor';
import { NotificationToast } from './components/common/NotificationToast';
import { FloatingRoleSwitcher } from './components/common/FloatingRoleSwitcher';
import { SmoothScrollProvider } from './lib/smoothScroll';

// Landing page cargada de inmediato (critical path para First Contentful Paint)
import { LandingPage } from './features/tienda/LandingPage';

// Rutas de tienda lazy loaded
const ProductDetailPage = lazy(() =>
  import('./features/tienda/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage || m.default }))
);
const EyeLabPage = lazy(() =>
  import('./features/eyelab/EyeLabPage').then((m) => ({ default: m.EyeLabPage || m.default }))
);
const CheckoutWizard = lazy(() =>
  import('./features/tienda/CheckoutWizard').then((m) => ({ default: m.CheckoutWizard || m.default }))
);
const TrackingPage = lazy(() =>
  import('./features/tienda/TrackingPage').then((m) => ({ default: m.TrackingPage || m.default }))
);
const CuentaPage = lazy(() =>
  import('./features/tienda/CuentaPage').then((m) => ({ default: m.CuentaPage || m.default }))
);
const CatalogoPage = lazy(() =>
  import('./features/tienda/CatalogoPage').then((m) => ({ default: m.CatalogoPage || m.default }))
);
const PhoneFrame = lazy(() =>
  import('./components/common/PhoneFrame').then((m) => ({ default: m.PhoneFrame || m.default }))
);

// Panel de Araceli lazy loaded (para no incluir xlsx, jspdf, recharts en la landing)
const PanelLayout = lazy(() =>
  import('./features/panel/PanelLayout').then((m) => ({ default: m.PanelLayout || m.default }))
);
const PanelDashboard = lazy(() =>
  import('./features/panel/PanelDashboard').then((m) => ({ default: m.PanelDashboard || m.default }))
);
const PanelInventario = lazy(() =>
  import('./features/panel/PanelInventario').then((m) => ({ default: m.PanelInventario || m.default }))
);
const PanelPedidos = lazy(() =>
  import('./features/panel/PanelPedidos').then((m) => ({ default: m.PanelPedidos || m.default }))
);
const PanelCatalogo = lazy(() =>
  import('./features/panel/PanelCatalogo').then((m) => ({ default: m.PanelCatalogo || m.default }))
);
const PanelClientas = lazy(() =>
  import('./features/panel/PanelClientas').then((m) => ({ default: m.PanelClientas || m.default }))
);
const PanelMensajes = lazy(() =>
  import('./features/panel/PanelMensajes').then((m) => ({ default: m.PanelMensajes || m.default }))
);
const PanelAjustes = lazy(() =>
  import('./features/panel/PanelAjustes').then((m) => ({ default: m.PanelAjustes || m.default }))
);

// Fallback visual minimalista Quiet Luxury
const RouteLoading = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 bg-ink text-sand">
    <div className="relative w-10 h-10 flex items-center justify-center">
      <div className="absolute inset-0 rounded-full border border-brass/20 animate-ping opacity-75" />
      <div className="w-6 h-6 rounded-full border-2 border-brass/40 border-t-brass animate-spin" />
    </div>
    <span className="text-[11px] font-sans uppercase tracking-[0.25em] text-stone">
      Cargando experiencia
    </span>
  </div>
);

// Layout condicional para ocultar Navbar y Footer de la tienda en el Panel administrativo o modo embed
const MainLayout = ({ children }) => {
  const location = useLocation();
  const esPanel = location.pathname.startsWith('/panel');
  const esMovil = location.pathname === '/movil';
  const esEmbed =
    location.search.includes('embed=1') || window.location.hash.includes('embed=1');

  return (
    <SmoothScrollProvider>
      <div className="min-h-screen flex flex-col bg-ink text-champagne selection:bg-brass selection:text-ink">
        {!esEmbed && !esMovil && <CustomCursor />}
        <NotificationToast />
        {!esPanel && !esEmbed && !esMovil && <Navbar />}
        <main className="flex-1">{children}</main>
        {!esPanel && !esEmbed && !esMovil && <Footer />}
        {!esEmbed && !esMovil && <FloatingRoleSwitcher />}
      </div>
    </SmoothScrollProvider>
  );
};

export function App() {
  return (
    <HashRouter>
      <MainLayout>
        <Suspense fallback={<RouteLoading />}>
          <Routes>
            {/* Rutas de la Tienda de la Clienta */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/catalogo" element={<CatalogoPage />} />
            <Route path="/producto/:id" element={<ProductDetailPage />} />
            <Route path="/probador" element={<EyeLabPage />} />
            <Route path="/eyelab" element={<EyeLabPage />} />
            <Route path="/checkout" element={<CheckoutWizard />} />
            <Route path="/carrito" element={<CheckoutWizard />} />
            <Route path="/cuenta" element={<CuentaPage />} />
            <Route path="/seguimiento/:id" element={<TrackingPage />} />
            <Route path="/movil" element={<PhoneFrame />} />

            {/* Rutas del Panel de Araceli */}
            <Route path="/panel" element={<PanelLayout />}>
              <Route index element={<PanelDashboard />} />
              <Route path="inventario" element={<PanelInventario />} />
              <Route path="pedidos" element={<PanelPedidos />} />
              <Route path="catalogo" element={<PanelCatalogo />} />
              <Route path="clientas" element={<PanelClientas />} />
              <Route path="mensajes" element={<PanelMensajes />} />
              <Route path="ajustes" element={<PanelAjustes />} />
            </Route>

            {/* Ruta fallback a inicio */}
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </Suspense>
      </MainLayout>
    </HashRouter>
  );
}

export default App;
