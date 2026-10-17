import React from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { CustomCursor } from './components/common/CustomCursor';
import { NotificationToast } from './components/common/NotificationToast';
import { FloatingRoleSwitcher } from './components/common/FloatingRoleSwitcher';

// Tienda Features
import { LandingPage } from './features/tienda/LandingPage';
import { ProductDetailPage } from './features/tienda/ProductDetailPage';
import { CheckoutWizard } from './features/tienda/CheckoutWizard';
import { TrackingPage } from './features/tienda/TrackingPage';
import { CuentaPage } from './features/tienda/CuentaPage';
import { EyeLabPage } from './features/eyelab/EyeLabPage';

// Panel de Araceli Features
import { PanelLayout } from './features/panel/PanelLayout';
import { PanelDashboard } from './features/panel/PanelDashboard';
import { PanelInventario } from './features/panel/PanelInventario';
import { PanelPedidos } from './features/panel/PanelPedidos';
import { PanelCatalogo } from './features/panel/PanelCatalogo';
import { PanelClientas } from './features/panel/PanelClientas';
import { PanelMensajes } from './features/panel/PanelMensajes';
import { PanelAjustes } from './features/panel/PanelAjustes';

// Layout condicional para ocultar Navbar y Footer de la tienda en el Panel administrativo
const MainLayout = ({ children }) => {
  const location = useLocation();
  const esPanel = location.pathname.startsWith('/panel');

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100 selection:bg-amber-400 selection:text-neutral-950">
      <CustomCursor />
      <NotificationToast />
      {!esPanel && <Navbar />}
      <div className="flex-1">{children}</div>
      {!esPanel && <Footer />}
      <FloatingRoleSwitcher />
    </div>
  );
};

export function App() {
  return (
    <HashRouter>
      <MainLayout>
        <Routes>
          {/* Rutas de la Tienda de la Clienta */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/producto/:id" element={<ProductDetailPage />} />
          <Route path="/probador" element={<EyeLabPage />} />
          <Route path="/checkout" element={<CheckoutWizard />} />
          <Route path="/carrito" element={<CheckoutWizard />} />
          <Route path="/cuenta" element={<CuentaPage />} />
          <Route path="/seguimiento/:id" element={<TrackingPage />} />

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
      </MainLayout>
    </HashRouter>
  );
}

export default App;
