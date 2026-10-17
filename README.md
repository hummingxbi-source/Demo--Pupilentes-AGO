# Pupilentes AGO · Tienda Online CDMX 👁️✨

> **Plataforma Digital de E-commerce & Centro de Control Operativo Boutique**
> Desarrollado para **Araceli Garrido Ortiz** (Fundadora de Pupilentes AGO).

---

## 🌟 Visión del Proyecto

Pupilentes AGO es una boutique especializada en lentes de contacto de color de alta gama con graduación personalizada por ojo en la Ciudad de México. Esta plataforma digital elimina por completo los procesos manuales por mensajes de WhatsApp e Instagram, unificando en una sola aplicación interactiva:

1. **La Tienda Online de la Clienta:** Catálogo interactivo con iris procedimentales, graduación mixta independiente por ojo (OD/OI), cotización automática de entregas (Metro CDMX gratis, DiDi y paqueterías) y checkout sin fricciones.
2. **Eye Lab (Laboratorio Óptico Virtual):** Probador en vivo con cámara y superposición de lentes, comparador antes/después, captura de foto con marco dorado para redes sociales y cuestionario recomendador de 5 pasos con cálculo de afinidad.
3. **Programa de Lealtad & Renovación:** Tarjeta de membresía holográfica 3D con Puntos AGO, canjes inmediatos y cuenta regresiva de reemplazo con recompra en 1 clic.
4. **Panel Operativo de Araceli:** Dashboard con métricas de ventas por canal (Instagram, WhatsApp, TikTok, Mercado Libre), matriz de inventario estilo Excel con heatmap editable y soporte para exportar/importar XLSX, tablero Kanban de pedidos con verificación de comprobantes y biblioteca de mensajes automatizados.
5. **Sincronización en Vivo:** Todo cambio en la tienda (compras, canjes) impacta al instante en el inventario y tablero del panel administrativo gracias a un store reactivo compartido.

---

## 🛠️ Stack Tecnológico

- **Framework:** React 18 + Vite (SPA ligera y veloz)
- **Enrutamiento:** React Router con `HashRouter` (permite ejecución estática en Netlify, Vercel o GitHub Pages sin configuración de servidor)
- **Estado Global:** Zustand con persistencia en `localStorage` y sincronización multi-pestaña
- **Diseño & Estilos:** Sistema propio *"Elegante Boutique"* (paleta Carbón profundo, Oro metálico de joyería, tipografías *Cormorant Garamond* y *Plus Jakarta Sans*)
- **Renderizado de Pupilentes:** Generador procedimental en SVG/Canvas con anillo limbal, fibras estromales radiales, dilatación de pupila al hover y reflejos especulares de luz
- **Manejo de Archivos Excel:** SheetJS (`xlsx`) para importar y exportar existencias con un clic
- **Micro-interacciones:** Lucide React, Canvas Confetti y transiciones fluidas a 60 fps

---

## 🚀 Cómo Correr el Proyecto Localmente

### Prerrequisitos
- Node.js (v18 o superior)
- npm o yarn

### Pasos de Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo local
npm run dev
```

Abre tu navegador en:
👉 `http://localhost:5173/#/`

### Generar Bundle de Producción

```bash
npm run build
```
La carpeta generada `dist/` está lista para desplegarse en cualquier hosting estático (GitHub Pages, Vercel, Netlify) sin dependencias de backend.

---

## 🔄 Cómo Resetear los Datos Demo a Fábrica

Para reiniciar todas las ventas, restablecer los stocks originales y limpiar las compras de prueba realizadas durante una presentación:

1. **Desde el selector flotante:** En la esquina inferior derecha encontrarás el widget *"Ver como: Clienta · Dueña (Araceli)"*. Haz clic en el botón circular de reinicio (🔄).
2. **Desde el Panel de Ajustes:** Ve a `/#/panel/ajustes` y haz clic en *"Resetear Toda la Demo"*.

---

## ⏱️ Guion de Demostración de Cierre de Venta (~5 Minutos)

Sigue este recorrido paso a paso para presentar la solución a Araceli:

### 1. El Impacto Visual & La Tienda Móvil (1:00 min)
- **Ruta:** `/#/`
- Muestra el **Hero con el medallón de Pupilentes AGO** y el ojo interactivo que cambia suavemente de color mientras el título rota (*"Mira el mundo en miel... en verde... en platino"*).
- Explica cómo este look editorial de lujo posiciona su marca por encima de cualquier competidor.
- Haz scroll hacia el **Catálogo interactivo**: filtra por la familia *"Miel & Dorado"* o *"Verdes"*, muestra cómo los iris reaccionan con dilatación de pupila y resalta los badges de stock en tiempo real.

### 2. El Eye Lab: Probador en Vivo & Recomendador (1:30 min)
- **Ruta:** `/#/probador`
- Pestaña **A) Probador en vivo:** Activa la cámara o muestra el modo ilustración interactivo. Cambia de modelo en el carrusel inferior para ver la transición fluida.
- Mueve el slider de **Intensidad** y **Apertura de pupila**.
- Presiona el botón de **Cámara**: muestra la foto capturada con el marco dorado boutique y la marca de agua lista para compartir en Instagram.
- Pestaña **B) Recomendador:** Completa las 5 preguntas visuales (tono de piel, ojos oscuros, ocasión de uso) y muestra el resultado con el porcentaje de match y la justificación editorial.

### 3. El Configurador & Checkout Sistematizado (1:00 min)
- **Ruta:** `/#/producto/miel-satin`
- Resuelve su dolor número uno: **Graduación independiente por ojo (OD/OI)**.
- Desmarca *"Misma graduación en ambos ojos"* y selecciona OD `-1.50` y OI `-1.75`. Destaca cómo el sistema valida el stock en tiempo real y evita tener que confirmar pieza por pieza por WhatsApp.
- Añade el estuche joyero y haz clic en *"Agregar al Carrito"*.
- En el checkout (Paso 2): muestra las tres opciones de entrega reales:
  - **Metro CDMX:** Pantitlán o Tepalcates sin costo ($0) o estación con costo extra.
  - **DiDi:** con aviso de pago previo.
  - **Paquetería:** cotizador simulado por Código Postal.
- Paso 4 y 5: muestra las cuentas bancarias con botón de copiar CLABE, sube el comprobante y genera la orden con el botón directo de **"Enviar mi Pedido por WhatsApp"**.

### 4. El Cerebro del Negocio: Panel de Araceli (1:00 min)
- Cambia a **"Dueña (Araceli)"** en el selector flotante inferior (`/#/panel`).
- Muestra el **Dashboard**: el pedido recién creado ya aparece reflejado y el inventario bajó automáticamente.
- Revisa la gráfica de ventas por canal (Instagram, WhatsApp, TikTok, Mercado Libre).
- Entra a **Pedidos (Kanban)**: abre el pedido recién hecho, valida el comprobante con un clic y presiona *"Generar Guía de Paquetería"*.
- Regresa a la tienda en otra pestaña a `/#/seguimiento/AGO-XXXX` para mostrarle cómo la clienta ve su tracking actualizado en tiempo real.

### 5. Inventario Excel & Cierre con Puntos AGO (0:30 min)
- Entra a **Inventario** (`/#/panel/inventario`): enséñale la matriz con heatmap por graduación y edita una celda con un doble clic. Presiona *"Exportar Todo a Excel"* para que vea cómo se descarga su archivo `.xlsx` listo para su proveedor.
- Muestra el botón **"Avanzar +20 días"**: simula el paso del tiempo y ve a **Mensajes** (`/#/panel/mensajes`) para mostrarle cómo se redacta solo el WhatsApp de recordatorio de renovación con el saldo de Puntos AGO de la clienta.
- **Frase de cierre:** *"Araceli, esto transforma tu negocio de contestar mensajes todo el día a tener una boutique digital automatizada que vende las 24 horas."*

---

## 📂 Estructura del Proyecto

```
├── public/
│   ├── logo-pupilentes-ago.png       # Logo oficial transparente alta resolución
│   └── logo-pupilentes-ago-512.png   # Medallón circular 512px
├── src/
│   ├── components/
│   │   └── common/
│   │       ├── CustomCursor.jsx          # Cursor dorado boutique para escritorio
│   │       ├── FloatingRoleSwitcher.jsx  # Selector flotante Clienta / Dueña
│   │       ├── Footer.jsx                # Footer con mapa de entregas y legal
│   │       ├── IrisRenderer.jsx          # Motor procedimental de iris en Canvas/SVG
│   │       ├── Navbar.jsx                # Navegación responsive con medallón
│   │       └── NotificationToast.jsx     # Alertas flotantes
│   ├── data/
│   │   ├── accesorios.js             # 6 accesorios y kits con reglas de descuento
│   │   ├── afinidad.js               # Algoritmo de afinidad de 5 preguntas
│   │   ├── ajustesIniciales.js       # Cuentas bancarias, estaciones y tarifas
│   │   ├── clientas.js               # 35 clientas con niveles y renovaciones
│   │   ├── pedidos.js                # 60 pedidos históricos en 60 días (5 canales)
│   │   ├── plantillas.js             # Biblioteca de respuestas rápidas para WhatsApp
│   │   └── productos.js              # 14 modelos en 5 familias con matriz 0.00 a -8.00
│   ├── features/
│   │   ├── eyelab/                   # Probador en vivo y cuestionario interactivo
│   │   ├── panel/                    # Dashboard, Inventario Excel, Kanban, Catálogo, Clientas, Mensajes, Ajustes
│   │   └── tienda/                   # Landing GSAP, Catálogo, Detalle OD/OI, Checkout 5 pasos, Tracking, Cuenta
│   ├── store/
│   │   └── useStore.js               # Store central Zustand con persistencia y sincronización
│   ├── styles/
│   │   └── index.css                 # Tokens Elegante Boutique y utilidades
│   ├── App.jsx                       # Rutas HashRouter
│   └── main.jsx                      # Entrada principal
├── DECISIONES.md                     # Bitácora de decisiones técnicas y simulaciones
└── package.json
```

---

Desarrollado con excelencia técnica por **HummingX BI**.
