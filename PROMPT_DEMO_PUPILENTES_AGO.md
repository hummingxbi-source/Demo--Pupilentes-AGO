# PROMPT PARA EL AGENTE DE CÓDIGO — Demo "Pupilentes AGO · Tienda online CDMX"

> Pega todo este documento a tu agente. Es un encargo completo: contexto del negocio, diseño, módulos, datos de ejemplo, arquitectura y criterios de aceptación. Si algo no está definido, el agente decide con criterio de producto premium y lo anota en `DECISIONES.md`.

---

## 0. Rol y objetivo

Eres un desarrollador frontend senior con ojo de diseñador. Vas a construir un **demo 100 % frontend** (sin backend, sin base de datos, sin login real) de una plataforma de e-commerce + panel de operación para **Pupilentes AGO**, una tienda online de lentes de contacto de color en CDMX.

El demo se presenta a la dueña (Araceli Garrido) para cerrar la venta. Debe provocar la reacción *"quiero esto ya"*. Todo vive en **un solo link / una sola app**: la tienda pública, el panel de la dueña y los módulos extra. Lo que la clienta haga en la tienda (comprar, canjear puntos) **debe reflejarse en vivo en el panel** (stock baja, aparece el pedido), para que el demo cuente la historia completa.

Entregables:
1. Proyecto Vite listo para `npm run dev` y `npm run build` (carpeta `dist` desplegable en Netlify/Vercel/GitHub Pages sin configuración extra).
2. `README.md` con cómo correrlo, cómo resetear los datos demo y un guion de demo de 5 minutos.
3. `DECISIONES.md` con supuestos y cosas simuladas.

---

## 1. Contexto del negocio (fuente: formulario de diagnóstico llenado por Araceli el 16-oct-2026)

- **Marca:** Pupilentes AGO — "Tienda online CDMX". Logo: medallón circular negro con aro dorado, un ojo con pupila dorada y una "A" detrás, texto "PUPILENTES" en arco y "AGO" debajo. Archivos incluidos: `logo-pupilentes-ago.png` (transparente, alta resolución) y `logo-pupilentes-ago-512.png`. **Usa el logo tal cual; no lo redibujes ni lo recolorees.**
- **Equipo:** Araceli (fundadora) + 1 o 2 colaboradoras. **Volumen:** 20–50 pedidos/mes.
- **Canales de venta hoy:** mensajes de Instagram/TikTok, WhatsApp, Mercado Libre y entregas personales en CDMX.
- **Entregas:** personal en metro **Pantitlán y Tepalcates**; otras estaciones con costo extra; **envío por DiDi**; y **paquetería** con guía.
- **Inventario hoy:** Excel / Google Sheets (miopía). **Graduación mixta por ojo:** hoy la confirma "caso por caso por mensaje".
- **Flujo actual (manual, y es el dolor que vamos a eliminar):**
  1. Cliente escribe por IG/WA/TikTok → recibe mensaje predeterminado con catálogo, precios y qué incluye.
  2. Elige modelo → ella revisa en Excel si hay stock.
  3. Si hay: pide código postal y colonia → cotiza en una plataforma de envíos → manda opciones.
  4. Cliente elige → ella arma el total **a mano** → manda mensaje con cuentas de pago.
  5. Cliente envía comprobante → ella entra a su banca móvil a verificar → confirma.
  6. Manda link para que el cliente llene datos de la guía → ella genera la guía, la envía, lleva a paquetería y monitorea.
  - **Entrega personal:** igual hasta confirmar stock, luego pactan fecha/hora/lugar.
  - **DiDi:** igual hasta stock, pide dirección completa para cotizar el DiDi, el cliente deposita **antes** de pedirlo, se verifica y se envía.
- **Lo que ella pidió explícitamente:**
  - Estilo **Elegante Boutique**: tipografías **Cormorant Garamond** (serif, títulos) + **Plus Jakarta Sans** (UI/texto); paleta **carbón/negro, gris/beige y dorado metálico**. Conservar esa gama.
  - **Catálogo interactivo con filtros que pueda actualizar fácilmente.**
  - **"Sistematizar todo"**: que el cliente escoja solo modelo, piezas, accesorios y **cotice su envío por paquetería** y genere su guía/orden de compra.
  - Módulos de interés marcados: **Programa de puntos/lealtad**, **Recordatorio de renovación**, **Recomendador interactivo**.
  - Presupuesto contemplado: $10,000 MXN → el demo debe mostrar valor claramente por encima de eso (es nuestra carta de cierre).

---

## 2. Stack y arquitectura

- **Vite + React 18 + React Router (`HashRouter`)** — así todo funciona en un solo link estático sin configurar servidor.
- **GSAP 3** (`gsap`, `ScrollTrigger`, `Flip`, `SplitText` si está disponible; si no, divide texto a mano) + `@gsap/react`. **Lenis** para smooth scroll integrado con ScrollTrigger.
- **Zustand con `persist` (localStorage)** como "base de datos" falsa compartida entre tienda y panel. Botón oculto/visible en el panel: **"Resetear demo"**.
- **Estilos:** CSS Modules o Tailwind (tú eliges, pero con tokens de diseño centralizados, ver §3). Sin librerías de UI genéricas (nada de MUI/Chakra): todo con look propio.
- **Gráficas:** SVG propio o `chart.js`; que respeten la paleta (ver §3).
- **Probador en vivo:** `@mediapipe/tasks-vision` (Face Landmarker, incluye iris). Descarga el modelo `face_landmarker.task` a `/public/models/` para no depender de CDN; si no puedes descargarlo, carga desde el CDN oficial y documéntalo. Requiere HTTPS o localhost para la cámara.
- **Excel/CSV:** `xlsx` (SheetJS) para importar/exportar inventario en el panel.
- Todo en español de México. Moneda `MXN` con formato `$1,299.00`. Sin dependencias de red para datos (todo local). Fuentes: Google Fonts (Cormorant Garamond 500/600/700 + italic, Plus Jakarta Sans 400/500/600/700).
- **Rendimiento:** Lighthouse móvil ≥ 85 en la home. Imágenes en WebP/SVG, lazy loading, `prefers-reduced-motion` respetado (animaciones reducidas, nunca rotas).
- **Mobile-first**: ~80 % de su tráfico vendrá de IG/TikTok/WhatsApp, o sea celular. Diseña primero a 390 px y luego escritorio. El panel debe ser usable en tablet y celular.

Rutas:
```
/#/                  Tienda (landing larga con scroll animado + catálogo)
/#/producto/:id      Detalle de modelo
/#/probador          Eye Lab (probador + recomendador)
/#/carrito → /#/checkout   Flujo de compra completo
/#/cuenta            Cuenta de la clienta: puntos, pedidos, renovaciones
/#/seguimiento/:id   Tracking de pedido
/#/panel             Panel de Araceli (dashboard)
/#/panel/inventario  /pedidos  /catalogo  /clientas  /mensajes  /ajustes
```
Un **selector flotante discreto "Ver como: Clienta · Dueña"** (esquina inferior) permite saltar entre tienda y panel durante el demo. El panel muestra un "login" fake de un clic (botón "Entrar como Araceli").

---

## 3. Sistema de diseño ("Elegante Boutique")

**Dirección:** lujo sobrio de joyería/óptica boutique. Mucho negro profundo, oro que *brilla de verdad* (gradientes metálicos, no amarillo plano), aire generoso, tipografía grande y editorial. Nada de look "plantilla de Shopify". Referencia emocional: el medallón del logo — negro satinado + aro dorado.

Tokens (ajusta finamente, pero respeta la familia):
```
--ink-950:#0B0B0C   --ink-900:#121214   --ink-800:#1A1A1D   --ink-700:#26262A
--stone-500:#8A857C  --stone-300:#C9C2B6  --beige-200:#E6DDCF  --beige-100:#F3EDE3
--gold-300:#E8CE8F  --gold-500:#C9A24B  --gold-700:#8F6B23
--gold-metal: linear-gradient(135deg,#8F6B23 0%,#E8CE8F 35%,#C9A24B 55%,#F5E3B0 70%,#8F6B23 100%)
--ok:#6FAE8B  --warn:#E0A23B  --bad:#C96A5E  (solo para estados del panel; atenuados)
```
- Tienda: fondo negro/carbón con secciones alternadas en beige claro para ritmo. Panel: **modo oscuro elegante** con tarjetas `--ink-800`, bordes finos dorados al 15 % de opacidad.
- Títulos en Cormorant Garamond (grandes, `clamp()`, cursiva dorada para énfasis); UI, precios y datos en Plus Jakarta Sans. Números tabulares en tablas.
- Detalles distintivos: bordes de 1 px dorado degradado, "foil shimmer" que cruza botones al hover, cursor personalizado (anillo dorado que se agranda sobre elementos clicables, solo en escritorio), grano sutil de fondo (SVG noise ~4 %).
- **Pupilentes ≠ productos planos:** cada modelo se representa con un **iris generado en SVG/Canvas** (anillos, fibras radiales, limbo oscuro, pupila) en el color del modelo, con micro-animación de dilatación de pupila al hover. Así no dependemos de fotos y se ve premium. Deja un hook (`imagen?: string`) para que luego ella suba fotos reales.
- Accesibilidad: contraste AA, foco visible dorado, labels reales, navegación por teclado en filtros/carrito/panel.

---

## 4. La experiencia de la clienta (tienda)

### 4.1 Landing con scroll cinematográfico (GSAP + ScrollTrigger) — el "wow" inicial
Secuencia (todo con `scrub` y `pin` donde aplique):
1. **Hero:** pantalla negra; el logo-medallón aparece con *reveal* (clip-path circular + brillo metálico recorriendo el aro). Un **ojo enorme en SVG** ocupa el fondo; al hacer scroll la pupila se contrae/dilata y el iris **cambia de color** gradualmente (café → miel → verde → azul → gris → violeta) mientras el título cambia de palabra: *"Mira el mundo en [miel]"*. Subtítulo: "Pupilentes de color · Entregas en CDMX y todo México".
2. **Manifiesto** (pin): texto en 3 líneas que se revela palabra por palabra con scrub: elige tu mirada → elige tus piezas → recíbelo hoy.
3. **Cómo comprar en 4 pasos** (pin horizontal): Elige modelo → Gradúa cada ojo → Cotiza tu envío → Paga y recibe tu guía. Cada paso con ilustración animada.
4. **Colecciones**: tarjetas que se expanden con `Flip` al hacer clic en una familia de color.
5. **Catálogo** (ver 4.2).
6. **Eye Lab teaser**: sección con un ojo que sigue al cursor y botón "Pruébatelos en vivo".
7. **Puntos AGO + recordatorio** (teaser animado de la tarjeta de lealtad).
8. **Entregas**: mapa esquemático de metro CDMX (SVG estilizado, no mapa real) con **Pantitlán y Tepalcates** resaltados en dorado, línea que se dibuja con scroll; chips "DiDi", "Paquetería", "Otra estación (+costo)".
9. **Footer** con WhatsApp, IG, TikTok, Mercado Libre (links placeholder), horario y mensaje legal breve.
Cuida que sea **fluido a 60 fps**: transforms/opacity, `will-change` solo donde hace falta, `ScrollTrigger.refresh` tras cargar fuentes, `matchMedia` para versión móvil (menos pins, animaciones más cortas).

### 4.2 Catálogo interactivo (corazón comercial)
- Grid con **filtros animados** (Flip): color/familia, tonalidad (natural, intenso, cosmético), **graduación** (sin graduación / miopía con rango), duración (mensual/trimestral/anual), rango de precio, "solo disponibles", orden (popular, precio, novedades).
- Tarjeta: iris animado, nombre, tono, precio, **badge de disponibilidad real** (`En stock` / `Últimas N piezas` / `Agotado — avísame`) leído del stock que Araceli edita en el panel.
- **Búsqueda** con sugerencias.
- Todo el catálogo sale de la misma "base" que edita el panel → **si Araceli agrega o edita un modelo en el panel, aparece en la tienda al instante** (esto responde directo a "actualizarlo más fácilmente").

### 4.3 Detalle de modelo + configurador (aquí se elimina su ida y vuelta por mensajes)
- Selector de **tipo de compra**: par individual / **kit** (par + estuche + solución) / pack de N pares (descuento por volumen configurable).
- **Graduación por ojo independiente (OD / OI)**: dos selectores (de 0.00 a −8.00 en pasos de 0.25 para el demo), con toggle "Mismo valor en ambos ojos". Esto resuelve su punto "graduación mixta: confirmo caso por caso por mensaje". Valida contra stock **por modelo × graduación × ojo** y avisa en el momento ("OI −3.25 sin stock, te avisamos o elige −3.00 / −3.50").
- **Accesorios** como add-ons con miniatura: estuche, solución multiusos, pinzas, gotas lubricantes, kit viaje.
- Resumen flotante con total que se anima al cambiar. Botón "Agregar al carrito".
- Mini-simulación de **disponibilidad de entrega**: "Si pides hoy antes de las X, entrega personal mañana en Pantitlán" (lógica simple por reloj del navegador).

### 4.4 Carrito y checkout — replica y automatiza SU flujo real
Wizard de 5 pasos con barra de progreso animada, todo en una página:
1. **Carrito:** editar piezas, accesorios, graduaciones; cupón de ejemplo (`AGOPRIMERA`) y **canje de puntos**.
2. **Método de entrega** (tres tarjetas, como hoy):
   - **Entrega personal:** elegir estación entre **Pantitlán / Tepalcates** (costo configurable en ajustes; por defecto $0) u **Otra estación** (costo extra configurable) → calendario con fecha y franja horaria disponibles.
   - **DiDi:** capturar dirección completa; muestra **cotización simulada** y aviso claro *"El pago se realiza antes de solicitar el DiDi"* (tal como ella opera).
   - **Paquetería:** capturar **CP + colonia** → **cotizador simulado** que devuelve 3–4 opciones (paquetería económica / estándar / express) con precio y días estimados, calculados por una función determinista según zona del CP (CDMX < Edomex < resto del país) con un pequeño `delay` y skeleton para que se sienta real. Etiqueta interna en el código: `// SIMULADO — en producción conectar a agregador de paquetería vía API`.
3. **Datos para la guía:** formulario (nombre, teléfono, calle/num, colonia, CP autocompletado, referencias, correo). Validaciones elegantes.
4. **Pago:** muestra **cuentas bancarias** (datos de ejemplo claramente falsos, editables en Ajustes) con botón copiar CLABE, resumen del total y **subida de comprobante** (input de archivo o drag-and-drop; solo se guarda la miniatura en localStorage). Estado "Comprobante recibido — en verificación".
5. **Confirmación:** animación de éxito (el ojo parpadea y un destello dorado), **orden de compra / guía simulada** en formato de ticket descargable (genera PDF con `jspdf` o imprime vía CSS print), número de pedido `AGO-0001…`, **botón "Enviar mi pedido por WhatsApp"** que abre `https://wa.me/525571113508?text=…` con el resumen precargado (puente con su canal actual), y link a seguimiento.
- Al confirmar: **crea el pedido en el store** (estado "Verificando pago"), **descuenta stock** (apartado), suma puntos pendientes, y programa recordatorio de renovación. El panel lo refleja en vivo (usa `storage` event / suscripción de Zustand para que si el panel está abierto en otra pestaña se actualice).

### 4.5 Seguimiento `/seguimiento/:id`
Línea de tiempo animada: Pedido recibido → Pago verificado → Guía generada → En camino → Entregado. Para entrega personal/DiDi, variantes del timeline. El estado sale del Kanban del panel (si Araceli mueve la tarjeta, la clienta ve el cambio).

---

## 5. Módulos extra (la diferencia frente a los $10k "normales")

### 5.1 ⭐ **Eye Lab** — probador en vivo + recomendador de color (la pieza WOW)
Una sola pantalla inmersiva en dos pestañas:

**A) Probador en vivo con cámara ("Pruébatelos")**
- Pide permiso de cámara con mensaje elegante y claro de privacidad: *"Tu imagen se procesa en tu dispositivo; no se guarda ni se envía a ningún lado."*
- Con MediaPipe Face Landmarker (landmarks de iris: puntos 468–477) detecta **ambos iris en tiempo real**.
- Dibuja sobre cada iris el lente seleccionado: un **canvas con máscara circular al radio del iris**, patrón de iris del modelo (anillos + fibras generadas procedimentalmente), mezclado con `globalCompositeOperation` (`color`/`soft-light`/`overlay`) para que respete luz y reflejos naturales; **recorta con el párpado** (usa landmarks de contorno de ojo como máscara) para que el color no se salga; respeta la pupila (círculo negro central ~35 % del radio, con leve dilatación animada); conserva el brillo especular original mezclando por luminancia.
- Carrusel inferior con todos los modelos: tocar uno **cambia el color con transición suave** (crossfade ~300 ms). Slider de **intensidad** (natural ↔ intenso) y de **tamaño de pupila**.
- Botón **"Comparar"**: arrastrar una línea divisoria antes/después sobre el video.
- Botón **foto**: captura un frame con marco dorado y marca de agua del logo; **descargar / compartir** (Web Share API con fallback a descarga). Ideal para que la clienta lo suba a IG → marketing gratis.
- Botón "Agregar este modelo al carrito" directo desde el probador.
- **Fallbacks obligatorios** (no debe fallar nunca en una demo): (1) si no hay cámara o permiso → botón **"Subir una foto"** y corre la misma detección sobre la imagen; (2) si MediaPipe no carga → **"Modo ilustración"**: un ojo grande en SVG dibujado con parámetros (tono de piel, forma de ojo) sobre el que se previsualiza el lente. La demo nunca debe quedar en blanco.

**B) Recomendador interactivo ("Encuentra tu mirada")**
- Cuestionario visual de 5 pasos en pantalla completa con transiciones GSAP: (1) **tono de piel** (escala de 8 tonos con círculos), (2) **color natural de ojos** (iris ilustrados), (3) **efecto deseado** (natural, glam, mirada intensa, cosplay/fantasía), (4) **ocasión** (diario, fiesta, trabajo, fotos), (5) **intensidad** (slider).
- Un algoritmo de puntaje transparente (tabla de afinidades en `/src/data/afinidad.js`, sin ML) devuelve **Top 3 con % de match** y una frase de por qué ("Contrasta con tu tono cálido y suma luz en fotos").
- Resultado con animación: el ojo del hero se transforma al iris ganador; botones "Probármelo en vivo" (abre pestaña A con ese modelo ya seleccionado) y "Agregar al carrito".
- Guarda la preferencia en el perfil de la clienta para el **panel** (ver 6.5 "Tendencias de color").

### 5.2 **Puntos AGO (lealtad)**
- Regla configurable en Ajustes (por defecto: 1 punto por cada $10; niveles **Bronce / Plata / Oro** con beneficios y barra de progreso animada).
- En `/cuenta`: tarjeta de membresía con efecto holográfico dorado que sigue el giroscopio/mouse, historial de puntos, **catálogo de canjes** (estuche gratis, solución, $100 de descuento…).
- Canje funcional en checkout (descuenta puntos y total).
- En el panel: lista de clientas con puntos, nivel y opción de **ajustar puntos manualmente** + **regalar puntos**.

### 5.3 **Recordatorio de renovación**
- Al comprar, cada ítem lleva su **duración** (mensual / trimestral / anual / solución) y se calcula la fecha de caducidad/renovación.
- En `/cuenta`: "Tus pupilentes AGO" con **cuenta regresiva** circular por producto ("te quedan 12 días") y botón **"Recomprar en 1 clic"** (precarga carrito igual al anterior).
- En el panel: **bandeja "Renovaciones próximas"** (7/15/30 días) con botón que **abre WhatsApp con mensaje listo** ("Hola Ana 👋 tus pupilentes Miel Satín están por vencer en 5 días. ¿Te preparo el mismo pedido? Tienes 120 puntos 💛"). Esto reemplaza trabajo manual de Araceli y aumenta recompra.
- Simulador para la demo: botón "Avanzar el tiempo +20 días" (solo en panel) para mostrar cómo se disparan los recordatorios.

---

## 6. Panel de Araceli (`/#/panel`) — el cerebro del negocio

Diseño: sidebar fija con logo, topbar con búsqueda global (⌘K), notificaciones y avatar. Modo oscuro elegante. Todas las vistas con micro-animaciones GSAP de entrada y contadores que "corren" al cargar.

### 6.1 Dashboard
- KPIs animados: ventas del mes, pedidos, ticket promedio, **pedidos por verificar**, **stock crítico**, renovaciones próximas.
- Gráfica de ventas diarias/semanales, **ventas por canal** (Instagram / TikTok / WhatsApp / Mercado Libre / Entrega personal — los 5 canales que ella declaró), **embudo de conversión**, **top modelos** y **mapa de calor de graduaciones más pedidas**.
- Tarjeta "Acciones de hoy" con checklist generado (verificar 3 comprobantes, generar 2 guías, reabastecer 4 modelos, 5 recordatorios por enviar).
- Pre-carga **datos demo realistas de ~60 días** (≈35 pedidos/mes, dentro del rango 20–50 que ella dio) para que las gráficas se vean vivas desde el primer segundo.

### 6.2 Inventario ("lo que hoy hace en Excel")
- **Tabla tipo hoja de cálculo** (edición en línea, atajos de teclado, filtros, orden) por modelo.
- **Matriz de existencias modelo × graduación (0.00 a −8.00)** con **heatmap** (verde/ámbar/rojo) y edición rápida por celda; agrupa OD/OI por separado si hace falta.
- **Alertas de stock bajo** con umbral configurable por modelo y botón "Generar lista de reabasto".
- **Importar desde Excel/CSV** (con vista previa y mapeo de columnas) y **exportar** (xlsx/csv). Incluye plantilla descargable. Así migra su Excel actual sin fricción.
- Movimientos de inventario (entrada, venta, apartado, ajuste) con historial.

### 6.3 Pedidos (Kanban que refleja SU flujo exacto)
Columnas: **Cotizando → Esperando pago → Verificar comprobante → Generar guía → En camino / Por entregar → Entregado** (+ "Cancelado").
- Tarjetas arrastrables (drag & drop con animación Flip), con canal de origen, método de entrega, total y alerta de tiempo.
- Detalle de pedido en panel lateral: productos con graduación OD/OI, datos de envío, **comprobante** (vista ampliada con botones "Marcar como verificado / Rechazar"), botón **"Generar guía"** (simulado: crea PDF/ticket y número de guía falso con tracking), copiar datos para la paquetería.
- **Pedido manual**: botón "Nuevo pedido" para capturar ventas que llegan por IG/WA/Mercado Libre (con canal) → así consolida los 5 canales en un solo lugar y el stock se descuenta siempre.
- Vista alterna en tabla con filtros y exportación.

### 6.4 Catálogo / Productos (alta fácil)
- CRUD de modelos con **formulario guiado** y **vista previa en vivo de la tarjeta** y del iris (selector de color, patrón, tono, intensidad); también permite subir foto real.
- Edición masiva de precios y activar/desactivar disponibilidad; accesorios y kits configurables.
- **Todo cambio se publica instantáneamente en la tienda.**

### 6.5 Clientas y Tendencias
- Lista de clientas con historial, puntos, nivel, próximas renovaciones, notas y etiquetas.
- **Tendencias de color:** qué tonos prefieren según el recomendador y el probador (datos demo), y recomendaciones de compra de stock ("el miel satín subió 28 % esta semana" — datos demo etiquetados como ejemplo).

### 6.6 Mensajes (sus mensajes predeterminados, automatizados)
- Biblioteca de **plantillas WhatsApp/IG** que ella ya usa: catálogo y precios, qué incluye, pedir CP y colonia, cuentas de pago, confirmación de pago, link para datos de guía, aviso de envío, recordatorio de renovación.
- Variables `{nombre} {modelo} {total} {guia}`; **botón "Copiar" y "Abrir en WhatsApp"** que arma el texto con los datos reales del pedido seleccionado. Editor de plantillas.

### 6.7 Ajustes
Cuentas de pago, costos de entrega personal / otra estación, estaciones habilitadas, horarios, reglas de puntos, umbrales de stock, umbral de recordatorios, datos del negocio, **tema** (paleta bloqueada a la marca; solo toggles). Botón **Resetear demo**.

---

## 7. Datos de ejemplo (`/src/data/`)

> **Todos los nombres, precios, CLABEs y cifras son ejemplos para el demo** y deben marcarse así en `DECISIONES.md`. No inventes testimonios ni reseñas de clientas reales; si usas reseñas, etiquétalas claramente "ejemplo" o no las uses.

- **~14 modelos en 5 familias de color** (ej.: *Miel*, *Avellana*, *Verde*, *Azul*, *Gris/Plata*, *Violeta* y alguno *Café intenso*) con nombres elegantes y propios (evita marcas reales). Cada modelo: `id, nombre, familia, tono, hex principal/secundario, duracion, precio, stock por graduación, popularidad`.
- Graduaciones: 0.00 (cosmético) y −0.50 a −8.00. Genera stock con distribución realista (más piezas en −1.00 a −4.00, poco en extremos) y deja **algunos agotados y otros críticos a propósito** para que las alertas se vean.
- 6 accesorios, 3 kits, reglas de descuento por volumen.
- ~35 clientas con nombres comunes mexicanos genéricos, ~60 pedidos distribuidos en 60 días, con canales y estados variados.
- Pedidos de ejemplo en cada columna del Kanban.

---

## 8. Reglas de calidad y "no negociables"

1. **Nada roto en demo:** todo flujo debe completar de punta a punta sin errores, sin consola roja y sin dependencias que fallen offline (excepto cámara/MediaPipe, que tiene fallbacks).
2. **Coherencia viva:** tienda ↔ panel comparten estado; comprar descuenta stock, mover el Kanban cambia el tracking, editar un producto cambia la tienda.
3. **Las simulaciones se declaran:** cotizador de paquetería, DiDi, verificación de pago, generación de guía y WhatsApp son simulados/placeholder; marca cada uno en el código con `// SIMULADO` y en `DECISIONES.md` con qué se conectaría en producción. En UI no pongas texto que prometa algo falso (usa "Cotización estimada").
4. **Privacidad:** el probador procesa todo local; no envíes imágenes a ningún servidor; no uses analytics de terceros.
5. **Marca:** paleta y tipografías de ella, logo intacto, nunca fotos de stock de personas con derechos dudosos (usa ilustraciones generadas).
6. **Rendimiento y accesibilidad** como en §2–§3. Prueba en 390×844, 768×1024 y 1440×900.
7. **Código limpio:** estructura por features (`/features/tienda`, `/features/panel`, `/features/eyelab`, `/features/lealtad`), tipos con JSDoc o TypeScript, componentes pequeños, datos separados, comentarios donde haya lógica no obvia (afinidades, compositing del iris).

---

## 9. Plan de trabajo sugerido (hazlo por fases y valida cada una antes de seguir)

1. **Base:** Vite, tokens, fuentes, layout, router, store con datos demo, logo, selector "Clienta/Dueña".
2. **Landing GSAP** (hero con ojo cambiante, manifiesto, pasos, entregas) — afinar fluidez móvil.
3. **Catálogo + detalle + configurador** (graduación OD/OI, accesorios, kits).
4. **Carrito + checkout 5 pasos** (entrega personal / DiDi / paquetería, comprobante, guía, WhatsApp).
5. **Panel:** dashboard, inventario (matriz + import/export), Kanban, catálogo CRUD, ajustes.
6. **Eye Lab:** recomendador primero (más rápido), luego probador en vivo con fallbacks.
7. **Lealtad + renovaciones + mensajes + seguimiento.**
8. **Pulido:** micro-interacciones, estados vacíos, loading skeletons, `prefers-reduced-motion`, Lighthouse, pruebas manuales de los 3 caminos de compra, README con guion de demo.

**Al terminar de cada fase** reporta en 3–5 líneas qué quedó y qué decisiones tomaste. No avances si algo de la fase anterior está roto.

## 10. Guion de demo (para el README, ~5 min)
1. Abrir en el celular: scroll de la landing (hero con ojo que cambia de color).
2. Eye Lab → probador en vivo con la cámara → foto con marca de agua.
3. Recomendador → resultado → agregar al carrito.
4. Checkout con graduación mixta OD/OI + cotización de paquetería + comprobante → ticket/guía + WhatsApp.
5. Cambiar a "Dueña": el pedido recién hecho está en el Kanban y el stock bajó. Mover a "Verificado", ver tracking actualizado en la tienda.
6. Inventario: importar el Excel, heatmap y alertas. Alta de un modelo nuevo → aparece en la tienda.
7. Renovaciones: "Avanzar +20 días" → bandeja de recordatorios → WhatsApp precargado. Cerrar con Puntos AGO.
