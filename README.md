# Pupilentes AGO · Tienda Online CDMX 👁️✨

> **Plataforma Digital de E-commerce & Centro de Control Operativo Boutique**  
> Desarrollado para **Araceli Garrido Ortiz** (Fundadora de Pupilentes AGO).  
> **Versión 2.0:** Rediseño *"Quiet Luxury"* con scroll cinemático GSAP, animaciones a sangre (100vw), probador en vivo real con MediaPipe Face Landmarker y división de código optimizada.

---

## 🌟 Visión del Proyecto y Novedades V2

Pupilentes AGO es una boutique especializada en lentes de contacto de color de alta gama con graduación personalizada por ojo en la Ciudad de México. Esta versión 2.0 eleva la experiencia visual y operativa eliminando la saturación artificial y adoptando un diseño editorial de lujo:

1. **Diseño "Quiet Luxury" a Pantalla Completa (100vw):**
   - Sin bandas laterales ni marcos artificiales. Secciones con ritmo de alternancia cromática entre oscuros cálidos (`ink`, `espresso`) y claros luminosos (`ivory`, `bone`).
   - Acento dorado sobrio (`brass` / `gilt`) reservado exclusivamente para detalles finos e interacciones de alto valor.
   - Tipografía de alta costura: *Cormorant Garamond* ligera para titulares de gran escala y *Plus Jakarta Sans* para legibilidad óptima.
2. **Scroll Cinemático Natural (GSAP + Lenis):**
   - Integración nativa de `Lenis` y `ScrollTrigger` con ticker sincronizado a 60 fps y soporte de `prefers-reduced-motion`.
   - **Hero Pinned Scrub:** Crossfade entre familias de color de iris, revelado tipográfico palabra por palabra y **zoom inmersivo a la pupila** que abre un portal circular hacia la colección.
   - **Galería Horizontal Pinned:** Desplazamiento panorámico suave con paneles de 8 familias de iris y entintado dinámico de fondo.
3. **Probador Virtual en Vivo Real (MediaPipe Face Landmarker):**
   - Detección biométrica local en tiempo real de 478 puntos faciales y 10 puntos de iris.
   - Recorte anatómico perfecto con el polígono de los párpados para que el lente se oculte naturalmente al parpadear.
   - Fusión fotorrealista con recorte de pupila real (`destination-out`), brillo especular corneal y suavizado anti-temblor EMA.
   - **Tres niveles de fallback en cascada:** Cámara en vivo → Foto subida por la clienta → Modo ilustración interactiva.
4. **Tarjeta de Membresía 3D Satinada Sin Jitter:**
   - Rediseño físico satinado de la tarjeta *AGO Privilège*. Separación arquitectónica del wrapper estático de eventos y el contenedor 3D con `gsap.quickTo` para rotación suave y reflejo `radial-gradient` en rAF sin parpadeos ni re-renders continuos.
5. **Configurador Óptico OD/OI & Checkout Boutique:**
   - Selección independiente de graduación por ojo (`0.00` a `-8.00`) con validación de inventario en tiempo real.
   - Tres métodos de entrega reales de CDMX: entrega personal gratis en Metro Pantitlán/Tepalcates, envío express en DiDi y paqueterías nacionales.
   - Generación de pedido formal formateado para WhatsApp y comprobante bancario.
6. **Centro de Mando Operativo de Araceli:**
   - Panel administrativo suavizado con paleta Quiet Luxury, 4 KPIs clave, gráfica de ventas por canal, matriz de existencias estilo Excel con importación/exportación a `.xlsx` mediante SheetJS y tablero Kanban de pedidos.

---

## 🛠️ Stack Tecnológico

- **Framework:** React 18 + Vite (SPA de alto rendimiento)
- **Animaciones & Scroll:** GSAP 3 (`ScrollTrigger`, `useGSAP`) + Lenis Smooth Scroll
- **Visión por Computadora & IA:** Google MediaPipe Face Landmarker (`@mediapipe/tasks-vision` local float16)
- **Enrutamiento:** React Router (`HashRouter`) con división de código por rutas (`React.lazy` + `Suspense`)
- **Estado Global:** Zustand con persistencia en `localStorage` y sincronización multi-pestaña
- **Estilos:** Tailwind CSS 3 con paleta personalizada Quiet Luxury (`ink`, `espresso`, `cocoa`, `taupe`, `stone`, `sand`, `champagne`, `ivory`, `bone`, `brass`, `bronze`, `gilt`)
- **Hojas de Cálculo:** SheetJS (`xlsx`) para exportación/importación inmediata de inventario

---

## 📦 Assets y Preparación de MediaPipe

Para garantizar que el probador en vivo funcione de forma 100% autónoma y privada sin depender de conexiones externas o CDNs, los binarios y modelos residen en `public/`:

```
public/
├── mediapipe/
│   └── wasm/                 # Binarios WebAssembly de @mediapipe/tasks-vision
├── models/
│   └── face_landmarker.task  # Red neuronal oficial MediaPipe Face Landmarker (3.6 MB)
├── img/
│   ├── iris/                 # 8 imágenes de iris macro (1400×1400 WebP)
│   ├── iris-tex/             # 8 texturas RGBA con pupila transparente para el probador (640×640 WebP)
│   └── fotos/                # Slots de reemplazo de fotografía de alta resolución (ver LEEME.md)
```

Si se clona en un nuevo entorno y se requiere reinstalar los binarios de MediaPipe:
```bash
# Copiar wasm desde node_modules
mkdir -p public/mediapipe/wasm
cp -r node_modules/@mediapipe/tasks-vision/wasm public/mediapipe/

# Descargar modelo oficial de MediaPipe
mkdir -p public/models
curl -L -o public/models/face_landmarker.task \
  https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task
```

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

### Generar Bundle de Producción Optimizado

```bash
npm run build
```
Gracias a la configuración de `manualChunks` y `React.lazy`, el bundle de la landing inicial pesa **< 87 kB** (~25 kB gzip), cargando `@mediapipe`, `xlsx` y el panel administrativo únicamente cuando el usuario navega a sus respectivas rutas.

### Procesamiento de Imágenes Fotográficas
Para optimizar automáticamente las fotos soltadas en `public/img/originales/`:
```bash
npm run fotos
```
Genera versiones optimizadas `-800.webp` y `-1600.webp` en `public/img/fotos/` mediante `sharp`.

---

## 🖼️ Sistema de Slots Fotográficos (`Foto.jsx`)

Para reemplazar los visuales por fotografías reales de clientas, producto o empaque sin tocar código, se cuenta con el componente `<Foto slot="identificador" />`:
1. Consulta la estructura en [`BRIEF_IMAGENES_PUPILENTES_AGO.md`](file:///Users/emmanuel/Desktop/HummingX%20BI/Demo%20Pupilentes%20AGO/BRIEF_IMAGENES_PUPILENTES_AGO.md) y [`CREDITOS-IMAGENES.md`](file:///Users/emmanuel/Desktop/HummingX%20BI/Demo%20Pupilentes%20AGO/CREDITOS-IMAGENES.md).
2. Coloca los archivos en formato WebP, JPG o PNG con el nombre del slot (ej. `macro/miel-01.webp`, `modelos/modelo-01.webp`, `producto/sku.webp`).
3. Si el archivo no existe, el componente renderiza automáticamente su arte de respaldo en alta definición con iris macro o texturas de la paleta.
4. Soporta almacenamiento de imágenes creadas o subidas desde el panel en **IndexedDB (`idb-keyval`)**, sin saturar el límite de 5 MB de `localStorage`.

---

## 🔄 Cómo Resetear los Datos Demo a Fábrica

Para reiniciar compras de prueba, pedidos en el Kanban y existencias antes de una reunión:
1. **Desde el widget flotante inferior derecho:** Haz clic en el botón circular de reinicio (🔄).
2. **Desde el Panel de Ajustes:** Ve a `/#/panel/ajustes` y selecciona *"Resetear Toda la Demo"*.

---

## ⏱️ Guion de Demostración de Cierre de Venta V2 (~5 Minutos)

Sigue este recorrido paso a paso para cautivar a Araceli:

### 1. El Impacto Visual & Scroll Cinemático (1:15 min)
- **Ruta:** `/#/`
- Muestra el **Hero con el iris gigante**: haz scroll suave hacia abajo y observa cómo el iris cambia suavemente de tono (miel → verde → azul → gris → violeta) coordinado con el título.
- Continúa el scroll para ver el **zoom inmersivo a la pupila**, atravesando el ojo hasta entrar al portal circular de color marfil (*ivory*).
- Deslízate por el **Manifiesto editorial** con revelado palabra por palabra.
- Disfruta de la **Galería Horizontal de Colecciones** pineada con los 8 tonos de iris a sangre.

### 2. El Eye Lab: Probador Real con MediaPipe (1:30 min)
- **Ruta:** `/#/probador`
- **Pestaña A — Probador en Vivo:**
  - Activa la cámara o haz clic en *"Subir Foto"* para seleccionar cualquier rostro.
  - Muestra cómo el modelo detecta el iris en milisegundos, recorta el lente exactamente dentro de los párpados y deja la pupila natural visible con reflejos de luz.
  - Desliza el carrusel inferior para cambiar de color con crossfade suave.
  - Usa el botón **"Comparar"** para arrastrar la línea divisoria antes/después.
  - Haz clic en **"Tomar Foto"**: muestra la captura resultante con marco boutique y logo lista para descargar o compartir.
- **Pestaña B — Recomendador:**
  - Responde el cuestionario de 5 preguntas rápidas para ver la afinidad de color con justificación de estilismo.

### 3. Catálogo, Graduación OD/OI & Checkout (1:00 min)
- **Ruta:** `/#/producto/miel-satin`
- Destaca la fotografía macro del iris a pantalla dividida (sticky).
- Desmarca *"Misma graduación en ambos ojos"* y elige graduaciones mixtas (ej. OD `-1.50`, OI `-2.25`). Resalta cómo el sistema avisa existencias al instante.
- Pasa al **Checkout** (5 pasos limpios): muestra la entrega gratis en Metro Pantitlán/Tepalcates, la opción de DiDi y las paqueterías nacionales.
- Completa el pedido con comprobante y presiona *"Enviar Pedido por WhatsApp"*.

### 4. Tarjeta de Membresía Holográfica Satinada (0:30 min)
- **Ruta:** `/#/cuenta`
- Pasa el cursor por las esquinas y bordes de la tarjeta **AGO Privilège**: demuestra el movimiento 3D suave a 60 fps con brillo satinado, **completamente libre de vibraciones o parpadeos**.
- Muestra el saldo de Puntos AGO y los canjes disponibles.

### 5. Centro de Mando Operativo de Araceli (0:45 min)
- En el selector inferior derecho, cambia a **"Dueña (Araceli)"** (`/#/panel`).
- Muestra el pedido recién creado en el **Kanban** y el descuento automático de stock.
- Entra a **Inventario**: muestra la matriz con heatmap y haz clic en *"Exportar Todo a Excel"* para descargar el archivo `.xlsx`.
- En **Mensajes**, abre la plantilla de renovación y demuestra cómo se redacta el recordatorio de WhatsApp en un solo clic.

---

Desarrollado con excelencia técnica por **HummingX BI**.
