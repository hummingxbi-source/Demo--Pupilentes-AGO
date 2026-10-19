# Bitácora de Decisiones Técnicas y Arquitectura V2 — Demo Pupilentes AGO

Este documento registra los supuestos arquitectónicos, decisiones de diseño y detalles de implementación de la **Versión 2.0 (Quiet Luxury + GSAP Cinemático + Probador Real MediaPipe)** desarrollada para **Araceli Garrido Ortiz**.

---

## 1. Arquitectura Frontend 100% Autónoma y Privada

- **Cero Dependencia de Servidores:** La aplicación completa corre en el navegador como SPA estática empaquetada con Vite y React 18.
- **Zustand + Persistencia Local (`localStorage`):** El estado global opera como una base de datos relacional compartida e instantánea entre la tienda pública y el panel operativo de la dueña.
- **HashRouter:** Garantiza navegación instantánea sin errores 404 en cualquier hosting estático (Netlify, Vercel, GitHub Pages) sin configuraciones de reescritura en servidor.
- **Selector Flotante "Ver como":** Permite al presentador alternar entre los roles de *Clienta* y *Dueña (Araceli)* sin formularios de autenticación.

---

## 2. Decisiones de Diseño V2 ("Quiet Luxury")

En respuesta a la retroalimentación del cliente sobre la sobrecarga visual de la versión inicial, se aplicaron los siguientes principios:

1. **Paleta Restringida y Sofisticada:**
   - Tonos de fondo y superficies: `ink` (#0E0D0C), `espresso` (#1A1613), `cocoa` (#2A231D), `champagne` (#E8DCC4), `ivory` (#F5EFE4) y `bone` (#FBF8F2).
   - Acentos dorados sobrios: `brass` (#B08D57) y `gilt` (#D9BE85), aplicando la regla 70/20/10 (máximo 10% de dorado en pantalla).
   - Eliminación de gradientes metálicos artificiales y brillos estridentes.
2. **Layout a 100vw y Eliminación de Márgenes Rígidos:**
   - Se eliminaron los contenedores centrados con anchos máximos angostos que generaban bandas negras en monitores medianos y anchos.
   - Utilidad `.gutter` (`padding-inline: clamp(20px, 4.5vw, 72px)`) para márgenes elásticos en pantallas desde 390px hasta 1920px (ultrawide).
3. **Tipografía Editorial:**
   - Titulares de gran impacto en *Cormorant Garamond* (pesos 300 y 400 con cursivas doradas).
   - Interfaz y cuerpo de lectura en *Plus Jakarta Sans* al 80% de opacidad para garantizar lectura descansada.
4. **Densidad de Información Calibrada:**
   - Cada bloque de la landing comunica una sola idea clara con un titular, una frase concisa y un CTA primario. La información técnica y operativa se distribuye con holgura en las páginas de detalle, probador y checkout.

---

## 3. Arquitectura de Movimiento e Interactividad (GSAP + Lenis)

1. **Sincronización de Scroll:**
   - Se integró `lenis` como motor de scroll suave (`lerp: 0.1`) vinculado al ticker de GSAP (`gsap.ticker.add((t) => lenis.raf(t * 1000))`).
   - El scroll suave se desactiva automáticamente en el panel administrativo (`/panel/*`) y cuando el usuario activa `prefers-reduced-motion`.
2. **Hero Pinned Scrub ("Zoom a la Pupila"):**
   - El contenedor del hero se fija durante +150% de scroll (`pin: true`, `scrub: 0.8`).
   - Encadena:
     a) Crossfade progresivo entre 5 iris reales (`miel` → `verde` → `azul` → `gris` → `violeta`) con rotación suave y cambio de titular.
     b) Escala progresiva del iris hasta cubrir la pantalla completa con la pupila negra central.
     c) Apertura de la siguiente sección clara (`ivory`) mediante un `clip-path: circle()` concéntrico desde la pupila.
3. **Galería Horizontal de Colecciones:**
   - 8 paneles fotográficos de gran formato (42vw x 78vh) con desplazamiento lateral pineado en escritorio y scroll horizontal táctil nativo en móvil.
4. **Solución del Bug de Hit-Testing en la Tarjeta 3D:**
   - En la V1, el evento `mousemove` residía en el mismo elemento sometido a `transform: rotate()`, provocando un bucle de desenganche del cursor (flicker/temblor).
   - **Solución V2:** El evento `pointermove` se escucha en un contenedor padre completamente estático (`perspective: 1100px`). Los ángulos de rotación están acotados a ±8° y se interpolan con `gsap.quickTo` sin ejecutar ningún `setState` durante el movimiento. El brillo especular se actualiza mediante variables CSS (`--gx`, `--gy`) en `requestAnimationFrame`.
5. **Cursor Personalizado Optimizado:**
   - Doble anillo boutique gestionado con `gsap.quickTo` delegando los estados hover mediante `mouseover`/`mouseout` sin listeners reactivos pesados.

---

## 4. Probador en Vivo Real (MediaPipe Face Landmarker)

En la V1 el probador era una maqueta SVG sin detección de iris. En la V2 se implementó un motor de visión por computadora real:

1. **Detección Biométrico-Anatómica:**
   - Se cargan localmente los binarios WebAssembly de `@mediapipe/tasks-vision` (`/mediapipe/wasm`) y el modelo neuronal `face_landmarker.task` (3.6 MB) alojado en `public/models/`.
   - Localiza 478 landmarks faciales. Para cada ojo extrae el centro del iris (puntos 468 y 473) y cuatro puntos limbales perimetrales (469–472 y 474–477) para calcular el diámetro real en píxeles.
2. **Recorte y Renderizado:**
   - Cada ojo se delimita con el polígono exacto de 16 puntos del párpado superior e inferior, garantizando que el pupilente se oculte de forma natural al parpadear.
   - La textura del lente (`public/img/iris-tex/*.webp`) se superpone con un factor de escala de 1.02.
   - El orificio pupilar se recorta con `globalCompositeOperation = 'destination-out'` para revelar la pupila real del usuario.
   - Suavizado temporal EMA (`alpha = 0.45`) para eliminar cualquier micro-temblor de la cámara web.
   - Síntesis de brillo corneal especular en modo `lighten`.
3. **Estrategia de Fallback en Cascada:**
   - Nivel 1: Cámara web en vivo vía `navigator.mediaDevices.getUserMedia`.
   - Nivel 2: Subida de fotografía del usuario (procesada con `runningMode: 'IMAGE'`).
   - Nivel 3: Modo ilustración interactivo guiado si no se detecta cámara o rostro.

---

## 5. Optimización de Carga y Code Splitting

Para cumplir con los estándares de rendimiento más estrictos:
- Las rutas del panel administrativo, el probador con MediaPipe y las herramientas de exportación (`xlsx`, `jspdf`) se cargan perezosamente mediante `React.lazy()` y `<Suspense>`.
- `vite.config.js` agrupa dependencias en chunks independientes (`vendor`, `gsap`, `mediapipe`, `export-tools`, `lucide-icons`).
- El bundle de aterrizaje inicial se redujo a **< 85 KB** (~23 KB comprimido con gzip).

---

## 6. Módulos Simulados vs. Producción

| Módulo | En la Demo V2 | En Producción |
| :--- | :--- | :--- |
| **Probador en Vivo** | 100% procesado en el navegador de la clienta mediante MediaPipe local; total privacidad. | Idéntico (arquitectura cliente óptima sin costo de servidor de video). |
| **Cotizador de Envíos** | Entrega personal gratis en Pantitlán/Tepalcates ($0), DiDi estimado ($85) y paqueterías por CP. | APIs de EnviaYa / Skydropx / DiDi Entrega con cotizaciones dinámicas. |
| **Comprobantes Bancarios** | Carga y previsualización de imagen en memoria con aprobación manual en Kanban. | Webhooks de Stripe / Mercado Pago o pasarela SPEI automatizada. |
| **Inventario XLSX** | Importación y exportación de hojas de cálculo con SheetJS en el cliente. | Base de datos PostgreSQL / Supabase con sincronización a ERP. |
| **Identificación Clientas** | WhatsApp / Teléfono OTP simulado con código demo `123456`, token guardado por 90 días. | Proveedor de mensajería (Twilio / WhatsApp Cloud API) con código OTP real por mensaje. |
| **Imágenes y Texturas** | Almacenamiento local de alta resolución en IndexedDB (`idb-keyval`). | Bucket Cloud Storage / AWS S3 con CDN y optimización WebP dinámica. |

---

## 7. Decisiones Técnicas y de Negocio V3.0 (Plan de Ajustes Post-Revisión)

1. **Hero Asimétrico y Tipografía Elástica:**
   - Para evitar que los textos invadan la pupila en resoluciones de MacBook y pantallas anchas, el iris se desplaza a la derecha (`x ≈ 66vw`) y el titular se contiene en una columna izquierda (`max-w: min(46vw, 40rem)`).
   - Tipografía adaptativa `font-size: clamp(2.6rem, min(6vw, 10.5svh), 6.75rem)` que considera tanto el ancho (`vw`) como la altura (`svh`) de la ventana.
   - Interpolación `x: 18vw → 0` del iris durante el tramo de zoom para centrar la pupila al final del scrub.

2. **Fusión Hero + Manifiesto en Escena Única:**
   - Se eliminó la sección Manifiesto separada con su padding de 1.8 pantallas vacías.
   - El portal marfil concéntrico contiene la frase "No cambia quién eres. Cambia la forma en que te miran." y "PUPILENTES AGO · CDMX" centradas, con revelado progresivo de palabras durante la apertura del círculo.

3. **Realismo Óptico en Eye Lab y Probador:**
   - La sección de landing reemplazó el diagrama SVG de óvalos por un split editorial con fotografía de modelo y slider antes/después interactivo.
   - En `/probador`, el estado inicial carga una foto modelo por defecto (sin pantalla negra ni solicitud brusca de permisos).
   - Diámetro del lente renderizado a `1.18 × radio del iris detectado` para cubrir el margen natural sin fugas.
   - Preservación anatómica: redibujado de pestañas y párpado superior mediante máscara de luminancia (< 0.28) y conservación de los reflejos especulares de luz auténtica (> 0.85).

4. **Catálogo de Negocio Real y Cuadrícula Uniforme:**
   - 4 categorías reales: *Graduados* (miopía −0.50 a −8.00 con OD/OI independiente), *Estéticos*, *Fantasía* y *Accesorios*.
   - Cuadrícula uniforme 4:5 en múltiplos de 8 tarjetas sin huecos ni asimetrías.
   - Nueva ruta `/catalogo` para exploración completa, filtrado por familia de color, tipo y graduación.

5. **Panel Operativo "Hoy / Qué Sigue":**
   - Sustitución del flujo rígido de arrastrar tarjetas por una cola de trabajo de un solo clic con toast de deshacer (5 s).
   - Tablero Kanban secundario corregido con `grid-template-columns: repeat(5, minmax(0, 1fr))` que previene el encimado de columnas.
   - Matriz de inventario graduado a ancho completo con navegación rápida de teclado.

6. **Imágenes en IndexedDB:**
   - Para no agotar el límite de 5 MB de `localStorage`, las fotos de producto y texturas del probador se almacenan como blobs en IndexedDB mediante `idb-keyval`, manteniendo el estado de Zustand ligero.

7. **Configuración de Preguntas Abiertas de Negocio:**
    - Las 5 preguntas operativas de Araceli no fueron asumidas, sino implementadas como parámetros interactivos en el panel de Ajustes:
      a) Paso de graduación (0.25 vs 0.50).
      b) Tipos de graduados disponibles (color, transparentes, ambos).
      c) Permitir graduación en estéticos/fantasía (interruptor global y por producto).
      d) Tarifa de entrega personal en Pantitlán/Tepalcates ($0 por defecto o configurable).
      e) Origen de fotos del catálogo (propias, proveedores, mixto).

---

## 8. Actualizaciones y Refinamientos V5.0 (Persistencia, Cámara, Eye Lab, Catálogo y Colección)

1. **Persistencia y Reinicio Limpio de Demo (Zustand `version: 5`):**
   - Clave de almacenamiento actualizada a `pupilentes_ago_storage_v5` con función `migrate` que descarta versiones obsoletas y rehidrata desde las semillas oficiales (`productos.js`, `pedidos.js`, `clientas.js`, `ajustesIniciales.js`).
   - Eliminación completa de pedidos de prueba huérfanos y restauración del stock de productos.
   - Rehidratación defensiva en `PanelInventario.jsx` si los productos carecen de `tipo` o llegan vacíos.
   - Botón "Resetear Demo" destacado en la barra lateral y superior de `PanelLayout` para reiniciar la demo en cualquier momento con limpieza de storage y recarga.

2. **Matriz de Inventario Dinámica por Graduación:**
   - Vista de matriz a pantalla completa con navegación por pestañas: *Graduado*, *Estético*, *Fantasía* y *Accesorio*.
   - Código de color por nivel de stock:
     - **Gris (`0`):** Sin existencias (`bg-neutral-800 text-stone-500`).
     - **Rojo (`≤ 2`):** Stock crítico (`bg-rose-500/25 text-rose-300`).
     - **Ámbar (`3–8`):** Stock preventivo (`bg-amber-500/25 text-amber-300`).
     - **Verde (`> 8`):** Stock óptimo (`bg-emerald-500/20 text-emerald-300`).
   - Edición rápida interactiva directa en celda con botones `+` / `−` y actualización de estado en tiempo real.

3. **Ciclo de Vida Robusto de Cámara en Eye Lab (`LiveTester.jsx`):**
   - **Canvas permanente:** El `<canvas>` permanece siempre montado en el DOM con `opacity-0` en inactividad, evitando condiciones de carrera donde `bucleVideo` iniciaba antes del montaje.
   - **Video invisible permanente:** `<video playsInline muted autoPlay>` con `className="absolute w-px h-px opacity-0 pointer-events-none"` que jamás se desmonta.
   - **Activación asíncrona segura:** `activarCamara` asigna `srcObject`, ejecuta `await video.play()` en `try/catch`, espera el evento `loadeddata` y activa `setCamaraActiva(true)`. El bucle se lanza mediante `useEffect` dependiente de `camaraActiva`.
   - **Bucle de renderizado continuo:** Si MediaPipe aún no está listo o no detecta rostro, el frame del video se dibuja directamente en el canvas y se solicita el siguiente `requestAnimationFrame(bucleVideo)` sin interrumpir la transmisión.
   - **Persistencia de Stream:** Cambiar de lente mantiene vivo el stream de la cámara web. Solo se detienen las pistas al pulsar "Detener cámara" o al desmontar el componente.
   - **Calidad visual y realismo óptico:**
     - Canvas adaptado al ancho completo disponible (`aspect-video`, eliminado `max-h-[460px]`).
     - Resolución ultra nítida calculada con `dpr = min(window.devicePixelRatio || 1, 2)`.
     - Diámetro del lente renderizado a `1.20 × radio del iris detectado` con borde difuminado (*feather* de 12%).
     - Preservación de pestañas/sombras oscuras y brillos especulares sobre la pupila.
     - Suavizado temporal de landmarks con media móvil exponencial (EMA `alpha = 0.5`) que elimina temblores entre frames.

4. **Bienvenida Cinematográfica al Eye Lab (`EyeLabPage.jsx`):**
   - Pantalla de bienvenida inmersiva `min-h-[100svh]` a ancho completo sin márgenes, con fondo oscuro e iris giratorio en bucle continuo de 60s.
   - Dos mitades interactivas con expansión dinámica al hover (`hover:flex-[1.25]`):
     - *"Pruébatelos en vivo"* (botón dorado con brillo, subtítulo "Con tu cámara o una foto").
     - *"¿Qué color es para ti?"* (botón contorno, subtítulo "Diagnóstico de 3 preguntas").
   - Animación de entrada con GSAP stagger (`0.12s`, `power2.out`).
   - Conmutador permanente en esquina inferior `"Probador ⇄ Diagnóstico"` y persistencia de elección en `sessionStorage`.
   - Quiz de afinidad finaliza con el botón *"Probármelo en vivo"* que transfiere el modelo recomendado directamente al probador.

5. **Catálogo con Expansión por Bloque de Color (`CatalogoPage.jsx`):**
   - Al hacer clic en una familia (*Azules*, *Verdes*, *Cafés*, *Grises*), los otros 3 bloques se desvanecen y colapsan (`opacity: 0, scale: 0.96, duration: 350ms`).
   - El bloque seleccionado se expande como cabecera a ancho completo y despliega con animación stagger (`0.06s`, `power2.out`, `y: 30 → 0`) la cuadrícula de modelos de ese tono.
   - Botón de retorno *"← Todos los colores"* para revertir la vista al mosaico general de 4 cuadrantes.
   - Implementación de `gsap.matchMedia` respetando estrictamente `prefers-reduced-motion`.
   - Base de datos en `productos.js` ampliada hasta 6 tonos por familia.

6. **Colección Selecta con Textura Realista (`LandingPage.jsx` #catalogo):**
   - Tarjetas de producto integradas con componente `<Foto>`: si existe `/img/fotos/producto/{id}.webp`, se despliega la fotografía real.
   - Si no existe, se activa el fallback de alta fidelidad: textura macro `iris-tex` en círculo sobre fondo espresso, aureola dorada sutil (`shadow-[0_0_32px_rgba(212,175,55,0.24)]`) y reflejo especular esférico mediante `radial-gradient`, erradicando el iris plano anterior.

