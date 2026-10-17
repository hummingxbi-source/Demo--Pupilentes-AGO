# Bitácora de Decisiones y Simulaciones — Demo Pupilentes AGO

Este documento registra los supuestos arquitectónicos, decisiones de producto y los módulos simulados en el frontend para la presentación a **Araceli Garrido**, detallando cómo se conectarían a servicios reales en la fase de producción.

---

## 1. Arquitectura Frontend 100% Autónoma

- **SPA sin Backend:** Para garantizar que la demo funcione en cualquier entorno (red local, offline, Netlify, Vercel o GitHub Pages) sin fallos de base de datos o latencias, se implementó una arquitectura 100% frontend.
- **Zustand + Persistencia Local (`localStorage`):** El store central emula una base de datos relacional compartida entre la tienda pública y el panel administrativo. Si la clienta compra un producto o canjea puntos, el stock disminuye y el pedido aparece inmediatamente en el tablero Kanban de Araceli.
- **HashRouter:** Se eligió `HashRouter` (`/#/...`) para permitir el acceso directo a cualquier ruta (`/#/producto/miel-satin`, `/#/panel/inventario`, etc.) en servidores estáticos sin necesidad de reescrituras de URL tipo `.htaccess` o reglas de servidor nginx.
- **Selector Flotante "Ver como: Clienta · Dueña":** Permite al presentador alternar instantáneamente entre la experiencia de compra y el panel administrativo sin requerir credenciales ni formularios de login reales.

---

## 2. Declaración de Módulos Simulados (Fase Demo vs. Producción)

Conforme a las reglas de calidad del proyecto (§8.3), todas las simulaciones operan con datos realistas deterministas y están identificadas:

| Módulo | Comportamiento en la Demo | Conexión en Producción (Backend Real) |
| :--- | :--- | :--- |
| **Cotizador de Paquetería** | Calcula tarifas estimadas con base en el Código Postal (CDMX local ~$95-$125 MXN, resto del país ~$145-$185 MXN) con simulación de delay y skeleton. | API agregadora de envíos como **EnviaYa**, **Skydropx** o **99Minutos**, consultando tarifas oficiales de FedEx, Estafeta y DHL en tiempo real. |
| **Cotización de DiDi Express** | Muestra tarifa calculada fija estimada ($85.00 MXN) y recordatorio de prepago. | API de **DiDi Entrega** o **Uber Direct** con cotización de mensajería urbana inmediata por geolocalización. |
| **Validación de Comprobantes de Pago** | Permite subir capturas/fotos JPG/PNG que se almacenan en memoria y `localStorage` en Base64. En el panel, Araceli tiene botones directos para *"Aprobar Pago"* o *"Rechazar"*. | Integración con **Stripe México** / **Mercado Pago Checkout Pro** / **Openpay** para confirmación bancaria automática vía Webhooks SPEI, o servicio OCR de verificación de comprobantes. |
| **Generación de Guías de Envío** | Asigna un folio oficial simulado (ej. `EST-8812903MX`), actualiza el tracking y permite imprimir el ticket de compra. | Generación de PDF con etiqueta térmica (etiqueta ZPL/PDF oficial) devuelta por la API de la paquetería seleccionada. |
| **Seguimiento de Paquete (`/#/seguimiento/:id`)** | Timeline de 5 fases sincronizado de forma reactiva con la columna del tablero Kanban en el panel de Araceli. | Webhooks de estado de entrega de la paquetería o actualización manual en base de datos PostgreSQL/Supabase. |
| **Integración con WhatsApp** | Genera enlaces universales `https://wa.me/525571113508?text=...` con el resumen del pedido o la plantilla de renovación prellenada. | API de **WhatsApp Business Cloud API** (Meta) para envío automático de mensajes transaccionales y notificaciones de guía. |
| **Eye Lab (Probador en Vivo)** | Procesa la cámara en el navegador y cuenta con dos fallbacks obligatorios: *"Subir una foto"* y *"Modo Ilustración"* interactivo con iris procedimental. | Se mantiene 100% en el cliente por privacidad (MediaPipe Face Landmarker local sin enviar video a servidores). |

---

## 3. Supuestos de Datos y Parámetros del Negocio

1. **Volumen de Pedidos Históricos:** Araceli reportó un volumen de 20 a 50 pedidos al mes. Para alimentar las gráficas del dashboard con datos realistas, se precargaron **~60 pedidos en los últimos 60 días** (promedio de 35 pedidos/mes), con un ticket promedio de $617 MXN y distribuidos proporcionalmente entre sus 5 canales declarados (Instagram 35%, WhatsApp 28%, TikTok 16%, Mercado Libre 12%, Entrega personal / Tienda 9%).
2. **Matriz de Graduación:** Se implementó el rango solicitado de **0.00 (cosmético) a -8.00 (miopía)** en pasos de 0.25. Se configuró intencionalmente mayor stock en graduaciones intermedias (-1.00 a -3.50) y se dejaron algunas en stock 0 (como -3.25 en Miel Satín) para demostrar las alertas de reabasto y validación de stock en vivo.
3. **Puntos AGO:** Regla establecida en 1 punto por cada $10 MXN gastados. Niveles: Bronce (0-299 pts), Plata (300-599 pts) y Oro VIP (600+ pts).
4. **Logística de Metro CDMX:** Metro Pantitlán (Líneas 1, 5, 9, A) y Metro Tepalcates (Línea A) configuradas con costo $0 MXN; otras estaciones con costo extra configurable de $45 MXN.

---

## 4. Notas sobre el Motor Procedimental de Iris

Para no depender de fotografías de catálogo planas y ofrecer una experiencia interactiva superior:
- Cada lente de contacto se dibuja de forma algorítmica con capas de:
  1. Fondo estromal con gradiente radial de 4 paradas.
  2. 48 fibras radiales orgánicas estromales con variación de opacidad y acentos peripupilares.
  3. Anillos concéntricos de contracción.
  4. Anillo limbal perimetral oscuro de alta definición.
  5. Pupila central con micro-animación de dilatación al hacer hover.
  6. Reflejos especulares naturales de luz esférica.
- Se dejó habilitada la propiedad `imagen?: string` en la estructura de productos para que, cuando Araceli suba fotografías reales en el panel, el sistema las soporte sin cambios de código.
