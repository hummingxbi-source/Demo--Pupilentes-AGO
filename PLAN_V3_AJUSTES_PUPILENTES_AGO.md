# PLAN V3 — Ajustes post-revisión (hero, transición, Eye Lab, catálogo, Cómo funciona, cuenta, panel)
**Proyecto:** Demo Pupilentes AGO · estado de partida = V2 ya aplicada (GSAP + Lenis + MediaPipe funcionando)
**Para:** agente de código. Ejecuta por fases, valida con capturas, no avances si la fase anterior está rota.
**Complemento:** `BRIEF_IMAGENES_PUPILENTES_AGO.md` (qué fotos, dónde van y cómo nombrarlas). Léelo antes de la Fase 2.

> Todo lo de abajo parte de **capturas reales tomadas del build actual a 1280×800 y 1440×900** (tamaños de MacBook) y de lo que Juan reportó. Donde dice "verificado" lo comprobé en pantalla; donde dice "hipótesis" revísalo en el código antes de actuar.

---

## 0. Diagnóstico (verificado en el build actual)

| # | Hallazgo | Evidencia |
|---|---|---|
| 1 | **Hero:** el titular "Mira el mundo en *miel*" invade la pupila a 1280×800: el texto termina en x≈603 px y la pupila empieza en x≈495 px ("mund" queda encima de la pupila). El subtítulo cae sobre el iris brillante y casi no se lee. Causa: tamaño en `vw` (`7.5vw`) sin considerar la altura, y el iris centrado detrás del texto. | `LandingPage.jsx` líneas del hero (`text-[clamp(2.75rem,7.5vw,7.5rem)]`, iris `left-1/2`) |
| 2 | **Pantalla en blanco tras el hero:** la capa portal (`ivory`) se abre vacía y, al terminar el pin, la sección Manifiesto tiene `py-[clamp(100px,14vw,220px)]` y palabras en `opacity .18` con `start:'top 75%'`. Resultado medido: **≈1.3 a 1.8 pantallas de crema vacía** antes de que aparezca "PUPILENTES AGO · CDMX" y la frase. | Capturas a scrollY 1040, 1280 y 1520 (a 1280×800): vacío; el texto aparece hasta ~1520 y abajo |
| 3 | **Eye Lab (sección de la landing):** el "ojo en óvalos" es un SVG de contorno (elipse + almendra) con un iris encima. Se ve como diagrama, no como producto. | Captura de la sección "Simulador en tiempo real" |
| 4 | **Probador (`/probador`):** el motor SÍ funciona (MediaPipe carga, detecta rostro y pinta el lente en ambos ojos). Pero el resultado se ve "fake" por 4 causas verificadas: (a) la textura es un iris generado por código, muy uniforme; (b) el lente es **más chico que el iris real**, por lo que asoma el color natural del contorno; (c) el brillo especular se pinta como una mancha blanca grande (se ve un círculo blanco en el ojo izquierdo); (d) las pestañas que cruzan el iris quedan **tapadas** por el lente. Además, el estado inicial es un recuadro negro esperando la cámara y la página usa un contenedor angosto (~1020 px) con el botón "Volver" encimado en el nav. | Prueba con foto de rostro tomada de las capturas de Instagram de la marca: rostro detectado, lente miel aplicado |
| 5 | **Modelos destacados:** primera fila = 1 tarjeta grande (6 col) + 2 chicas (3 col) y debajo queda un hueco enorme; filas siguientes de 3. Parece carrusel pero no lo es. | Captura de la sección |
| 6 | **Cómo funciona:** lista de 3 renglones de texto con subtítulos; márgenes de ~144 px que no coinciden con el resto. | Captura |
| 7 | **Márgenes:** `/cuenta` y `/probador` usan contenedor angosto (~208 px por lado a 1440). | Capturas |
| 8 | **Kanban de pedidos:** las 6 columnas **se encimaban**: las tarjetas se salen de su columna y se montan sobre la columna vecina (no solo "pegaditas"). Causa probable: columnas con ancho menor al contenido (hipótesis: `w-*`/`min-w` fijos sin `grid`/`flex-1 min-w-0`). Texto en `font-mono` pequeño, selector "MOVER:" en cada tarjeta. | Captura de `/panel/pedidos` |
| 9 | **Panel:** dashboard con 4 KPIs + checklist + gráficas en una sola pantalla; el inventario solo ocupa el ancho disponible sin aprovecharlo bien; el catálogo del panel muestra un **dibujo de iris**, no foto del producto. | Capturas |
| 10 | **Datos del negocio (dicho por la clienta, vía Juan):** vende **lentes graduados para miopía de −0.50 a −8.00, estéticos, de fantasía y accesorios.** El demo hoy modela solo "familias de color" con graduación 0.00–−8.00 para todo. | Mensaje de Juan |

---

## 1. Hero (arregla tamaño, legibilidad y composición)

**Objetivo:** que ninguna letra toque la pupila en ninguna pantalla, y que el texto siempre se lea.

1. **Composición asimétrica:** en escritorio el iris se **desplaza a la derecha** (centro del iris en `x ≈ 66vw`) y el texto vive en la columna izquierda con `max-width: min(46vw, 40rem)`.
2. **Tamaño tipográfico basado en ancho Y alto:** `font-size: clamp(2.6rem, min(6vw, 10.5svh), 6.75rem)`. (A 1280×800 → ~77 px; a 1440×900 → ~86 px; a 1920×1080 → ~108 px.) `line-height: .98`. "Mira el mundo" en **una** línea y "en *color*" en la segunda; nunca más de 2 líneas.
3. **Scrim de lectura:** degradado horizontal detrás del bloque de texto `linear-gradient(90deg, rgba(14,13,12,.82) 0%, rgba(14,13,12,.55) 38%, transparent 62%)` y `text-shadow` suave; subtítulo con `color: champagne` al 90 % (no `stone` al 60 %).
4. **El zoom a la pupila sigue igual**, pero ahora la animación incluye `x: 18vw → 0` del contenedor del iris durante el tramo del zoom, para que la pupila quede centrada al final y el portal se abra desde el centro de pantalla (hoy el portal abre desde `50% 50%`; mantenlo).
5. **Verificación obligatoria:** capturas del hero (estado inicial, color violeta a mitad de scroll, justo antes del zoom) en **1280×800, 1440×900, 1512×982, 1728×1117, 1920×1080, 2560×1440 y 390×844**. Prueba automática: con Playwright mide `getBoundingClientRect()` del `h1` y del centro del iris; falla si el `right` del h1 > `(centro iris − radio pupila − 24px)` en escritorio.
6. El cambio de color con giro **se queda tal cual** (a Juan le gusta). No toques la lógica del crossfade ni el cambio de palabra.

---

## 2. Transición hero → blanco (que no haya "pantalla vacía")

**Principio:** el portal blanco debe abrirse **ya con el contenido adentro**, y no debe existir scroll sin contenido.

1. **Fusiona hero + manifiesto en UNA sola escena pineada** (un solo `ScrollTrigger` con `pin`). Mueve la etiqueta "PUPILENTES AGO · CDMX" y la frase al interior de la capa portal (`heroPortalRef`), centradas.
2. Línea de tiempo (progreso 0–1, `end: '+=230%'` en escritorio):
   - `0 – 0.50` cambio de colores con giro (igual que hoy).
   - `0.50 – 0.74` zoom a la pupila (+ `x → 0`).
   - `0.66 – 0.86` el portal crece (`clip-path circle`) **y a la vez** la etiqueta y las palabras de la frase aparecen (`opacity .15 → 1`, `y: 18 → 0`, `stagger .035`, `ease: 'power2.out'`) — empiezan cuando el círculo ya cubre ~40 % de la pantalla.
   - `0.86 – 1.0` pausa corta con la frase completa legible (esto da tiempo de leer antes de soltar el pin).
3. **Elimina** la sección `Manifiesto` separada y su `padding` gigante; tras el pin sigue directo la sección Colecciones (oscura) con un `margin-top: 0`. Si quieres una respiración, máximo `pt-[12svh]`.
4. Frase: añade espacios reales entre palabras (texto normal con `' '`, no solo márgenes) para que al copiar/seleccionar no salga "Nocambiaquiéneres." y para accesibilidad (`aria-label` en el h2 con la frase completa y `aria-hidden` en los spans).
5. Móvil (<1024 px): pin de `+=170%`, mismos 3 tramos recortados; en `prefers-reduced-motion`: hero estático y frase visible debajo, sin pins.
6. Criterio: **ningún punto del scroll entre hero y colecciones muestra más de 0.3 pantallas sin texto o imagen** (mídelo con capturas cada 150 px de scroll).

---

## 3. Colecciones (se queda el scroll horizontal; Juan lo aprobó)
- Conserva el pin y la mecánica. Cambia el **contenido**: cada panel usa una **foto real de ojo en macro con ese color** (`/img/fotos/macro/{color}-01.webp`); si no existe, cae al iris generado. Añade el nombre del color y un punto de color (como hoy) — nada más.
- Reduce la distancia total de scroll si hay más de 6 vistas de la pista (`scrollDistance` hoy ≈ 4100 px a 1440 → apunta a ≤ 3 pantallas).

---

## 4. Eye Lab

### 4.1 Sección de la landing — reemplazar el "ojo en óvalos"
- **Quita el SVG de óvalos por completo.** Nueva sección a sangre (100vw × 100svh), oscura:
  - Fondo: **retrato frontal real** (slot `modelos/modelo-01`) ocupando la mitad derecha, recortado a la zona de los ojos con `object-position` para que los ojos queden centrados, de arriba a abajo sin marco redondeado.
  - **Antes/después automático:** sobre esa foto, la mitad derecha del retrato muestra el ojo con lente y la izquierda el natural, con una **línea divisoria dorada** que se mueve con el scroll (scrub) y cambia entre 4–5 colores (imágenes **pre-renderizadas**, ver 4.3).
  - Texto a la izquierda: "Pruébatelos en vivo" (serif grande), una frase (≤12 palabras) y botón "Abrir probador". Quita "tecnología milimétrica", ya que es una afirmación que no podemos garantizar.
- No cargar MediaPipe en la landing (solo imágenes). MediaPipe solo en `/probador`.

### 4.2 Página `/probador` — rediseño de pantalla completa
**Layout (a sangre, sin `max-w`; gutter 24–40 px):**
- Escenario a la izquierda (≈ 8/12), alto `calc(100svh - nav)`; panel de control a la derecha (4/12), sin bordes pesados.
- **Estado inicial = foto modelo, no cámara.** Carga por defecto un retrato de ejemplo (de `modelos/`), ejecuta la detección en modo IMAGE y hace una **animación de entrada** que cicla 3 colores. Así la pantalla nunca está vacía ni pide cámara de golpe.
- Fila "Probar en": miniaturas redondas de 4–6 **modelos** (distintos tonos de piel), + botón "Usar mi cámara" + "Subir mi foto". Solo la cámara pide permiso, al presionar.
- Panel derecho: lista vertical de lentes con **foto del producto** (no el iris dibujado) + nombre + precio; al elegir, crossfade 300 ms sobre el escenario. Sliders: Intensidad y Tamaño de pupila (finos, sin cajas). Botones: Comparar, Foto, Agregar al carrito.
- Quita el SVG "modo ilustración" como estado visible. Déjalo **solo como último fallback de error** (si el modelo no carga) con mensaje claro.
- Corrige: el botón "Volver" debajo del nav no debe encimarse; usa `padding-top` igual a la altura del nav.
- La pestaña "Recomendador" se mantiene, pero a pantalla completa y con las mismas fotos de modelos en la pregunta de tono de piel/ojos (no círculos de color).

### 4.3 Realismo del lente (arreglos concretos en `LiveTester.jsx`)
1. **Tamaño:** pinta la textura a **1.15–1.22 × el radio del iris detectado** (los lentes de color son más grandes que el iris; el catálogo ya registra 14.2–14.5 mm de diámetro, y el iris humano ronda ~12 mm — calibra a ojo con 5 fotos). Mantén el recorte por párpado.
2. **Borde suave:** feather del 5–7 % del radio en el borde del lente + un anillo oscuro delgado (limbal) a 0.97 R para que no parezca sticker.
3. **Pestañas y sombras por encima:** después de pintar el lente, vuelve a dibujar los píxeles **oscuros** del original dentro del recorte (máscara por luminancia < umbral, suavizada) → las pestañas y la sombra del párpado quedan sobre el lente.
4. **Brillos reales:** quita la mancha especular procedural. Redibuja los píxeles **muy claros** del original (luminancia > ~0.85) con máscara suave, para conservar el reflejo auténtico de cada foto.
5. **Mezcla por tipo de ojo:** ya existe la rama por luminancia; ajusta a `multiply` + `source-over` parcial para ojos claros y `source-over` alto para café oscuro. Expón `intensidad` por defecto en 0.8.
6. **Textura real:** el motor debe poder usar **texturas hechas desde fotos reales del lente** (ver §9.3). Prioridad: textura subida por Araceli > `iris-tex/{color}.webp` generada.
7. **Fotos sin rostro (macro de ojo):** MediaPipe Face Landmarker no detecta rostro en acercamientos extremos (verificado con un macro de ojo de las redes de la marca). No uses macros en el probador; para macros usa solo la galería. Si el usuario sube una foto sin rostro, muestra: "Sube una foto donde se vea tu cara completa".
8. **Pre-render para la landing (Fase 4):** agrega una herramienta de desarrollo `/probador?export=1` que, con un retrato de `modelos/`, **exporta WebP** del resultado para cada color a `public/img/fotos/modelos/{modelo}-{color}.webp`. La landing usa esos estáticos (cero costo en runtime).
9. Documenta en `DECISIONES.md` que es una **simulación visual** y que el resultado depende de luz y ángulo. En la UI usa "Simulación aproximada" (no "precisión milimétrica").

---

## 5. Modelos destacados (cuadrícula uniforme)
- **Elimina la tarjeta "grande + 2 chicas".** Usa una **cuadrícula pareja**: 4 columnas en ≥1280 px, 3 en 1024, 2 en tablet/móvil, **todas las tarjetas del mismo tamaño** (relación 4:5), a sangre con gutter. Muestra **8 modelos** (2 filas completas) — nunca filas incompletas ni huecos.
- Tarjeta: foto de producto (o iris generado si falta), nombre (serif 22 px), precio, punto de stock. Hover (solo escritorio): leve zoom de imagen + aparece "Elegir".
- Filtros de la sección: **solo las 4 categorías del negocio** (ver §7) como pestañas grandes + chip de color opcional. "Filtrar" abre un drawer con lo demás. Botón "Ver todo el catálogo" → ruta nueva `/catalogo` (grid completa con paginación o scroll infinito).
- Si el filtro deja menos de 8 productos, rellena con "También te puede gustar" para no dejar huecos, o centra la fila con `justify-center` en lugar de dejar vacío un lado.

---

## 6. "Cómo funciona" — storyboard fijado (rediseño)
Reemplaza la lista de 3 renglones por una **escena pineada con 4 pasos** (`pin`, `end: '+=320%'` en escritorio; en móvil, tarjetas apiladas con reveals).

- **Izquierda (sticky, 40 %):** los 4 pasos en serif grande con numeración; el activo en `champagne`, los demás en `taupe`; una **línea vertical de progreso** (`scaleY` con scrub). Una frase de ≤10 palabras bajo el paso activo.
- **Derecha (60 %, a sangre hasta el borde):** un "escenario" que cambia con crossfade+máscara por paso, usando **mini-UI real** (mismos componentes visuales de la tienda, no íconos):
  1. **Elige tu tipo** — 4 mosaicos con foto: *Graduados · Estéticos · Fantasía · Accesorios*.
  2. **Gradúa cada ojo** — dos selectores tipo rueda (OD/OI) cuyos números **ruedan** de −0.50 a −3.25 / −2.75 con GSAP; leyenda "Miopía de −0.50 a −8.00" (dato de la clienta). Solo aplica a *Graduados*.
  3. **Cotiza tu envío** — campo de CP que se "escribe" solo (`06600`), aparecen 3 tarjetas de paquetería con precio que cuenta hacia arriba; chip "Entrega personal en Pantitlán o Tepalcates".
  4. **Paga y recibe** — comprobante + guía ticket + línea de seguimiento que se completa.
- Copy en `src/data/copy.js`. Sin párrafos largos. Acentos dorados mínimos.
- Accesible: cada paso es un `<li>` con `aria-current`; con `prefers-reduced-motion` se muestran los 4 pasos uno bajo otro, sin pin.

---

## 7. Catálogo según el negocio real (cambio de modelo de datos)
La clienta vende: **graduados (miopía −0.50 a −8.00), estéticos, fantasía y accesorios.**
- Añade a cada producto: `tipo: 'graduado' | 'estetico' | 'fantasia' | 'accesorio'`, `permiteGraduacion`, `graduacionMin`, `graduacionMax`, `graduacionPaso`, `foto`, `fotoLente` (opcional), `texturaPrueba` (opcional), `sku`.
- **Graduación:** rango por defecto `−0.50 … −8.00`; el **paso debe ser configurable** (Ajustes) porque no sabemos si Araceli maneja pasos de 0.25 o 0.50 (**pregunta pendiente para ella**). `0.00` (plano) solo existe para estéticos/fantasía.
- Estéticos y fantasía: sin selector de graduación por defecto ("Sin graduación (plano)"). Si Araceli confirma que también los hace graduados, se activa `permiteGraduacion` por producto.
- Accesorios: sin graduación, stock simple.
- Tienda: pestañas por tipo en el catálogo y en Colecciones; filtro de graduación solo visible en *Graduados*.
- Panel: el inventario se organiza por tipo (ver §9.2).
- Migra `productos.js` (los 14 modelos de ejemplo) asignándoles tipos variados (p. ej. 6 graduados de color, 4 estéticos, 2 fantasía) + 6 accesorios, y ajusta pedidos/clientas de ejemplo para que no se rompan.

---

## 8. Márgenes y aprovechamiento de pantalla
- Elimina `max-w-*`/`.container-custom` en **todas** las rutas de tienda y panel. Gutter único: `clamp(20px, 3.5vw, 56px)`.
- Corrige `/cuenta`, `/probador`, `/checkout`, `/seguimiento` y la sección Cómo funciona. Contenido en rejilla de 12 col a ancho completo; solo bloques de texto de lectura llevan `max-w-[60ch]`.
- Puntos AGO (`/cuenta`): conserva el diseño (a Juan le gusta). Solo: ancho completo, tarjeta más grande a la izquierda (5/12), progreso y renovaciones a la derecha (7/12), pedidos debajo en tabla limpia.
- Panel: sidebar colapsable (solo íconos) y contenido a todo el ancho restante, `padding` 24–32 px.
- Verifica 1280, 1440, 1920 y 2560: sin franjas vacías laterales.

---

## 9. Panel de Araceli (simple, rápido, a pantalla completa)

### 9.1 Pedidos — de "Kanban" a **"Hoy / Qué sigue"** (más práctico)
**Problema real:** Araceli no necesita arrastrar tarjetas; necesita saber **qué hacer ahora con cada pedido** (su flujo: confirmar stock → cotizar → cobrar → verificar → guía → entregar).

- Vista por defecto **"Hoy"**: una **lista vertical** de pedidos ordenada por urgencia, cada fila con: foto del producto, clienta, resumen (p. ej. "Miel Satín · OD −1.50 / OI −1.75"), canal (ícono), método de entrega (ícono), total y **UN botón principal de siguiente acción**:
  | Etapa | Botón principal | Acción secundaria |
  |---|---|---|
  | Nuevo (confirmar stock) | **Confirmar stock** → abre plantilla "pide CP y colonia" | Sin stock |
  | Por pagar | **Enviar cuentas** (plantilla WhatsApp) | Recordar pago |
  | Por verificar | **Ver comprobante → Verificado** | Rechazar |
  | Por enviar | **Generar guía** / **Entregar hoy (Pantitlán 17:00)** | Copiar datos |
  | En camino | **Marcar entregado** | Copiar rastreo |
- Cada botón avanza la etapa, actualiza stock/tracking de la tienda y muestra un toast con "Deshacer" (5 s).
- Franja superior **"Entregas de hoy"** agrupada por estación (Pantitlán / Tepalcates / DiDi / Paquetería) para planear la ruta.
- Filtros rápidos por canal (Instagram, TikTok, WhatsApp, Mercado Libre, Personal) y búsqueda. "Pedido manual" visible.
- Conserva una vista **Tablero** (opcional, pestaña secundaria) **arreglada**: 5 columnas (*Nuevos · Por cobrar · Por verificar · Por enviar · En camino*; "Entregado" se archiva), `display:grid; grid-template-columns: repeat(5, minmax(0,1fr)); gap: 16px`; columnas `min-w-0`, cada tarjeta `p-4`, separación `gap-3` entre tarjetas, texto 14 px (nada de `font-mono` pequeño), un solo botón de acción por tarjeta en lugar del `<select> MOVER`. Arrastrar es opcional.
- Móvil: lista a una columna; acciones con botones grandes (≥44 px).

### 9.2 Dashboard e inventario
- **Dashboard:** 3 KPIs (Ventas del mes, Pedidos por atender, Stock crítico) + bloque "Hoy" (reutiliza la lista corta del §9.1) + una gráfica de ventas por canal. El resto (top modelos, embudo, tendencias) pasa a una pestaña "Reportes".
- **Inventario por tipo:** pestañas *Graduados · Estéticos · Fantasía · Accesorios*.
  - *Graduados:* matriz modelo × graduación (−0.50 … −8.00), **a todo el ancho**, celdas más grandes, cabecera y primera columna fijas (sticky), edición rápida con +/− y teclado (↑↓←→, Enter), modo **"Contar stock"** (recorre celdas con Tab).
  - *Estéticos/Fantasía/Accesorios:* tabla simple SKU/foto/nombre/stock con stepper +/−.
  - Alertas de bajo stock con umbral por producto y botón "Lista de reabasto" (se mantiene). Importar/Exportar Excel se mantienen.

### 9.3 Catálogo del panel **por imagen** (cómo sería con fotos reales)
- La tarjeta del producto muestra **su foto real** (relación 4:5) en lugar del iris dibujado.
- **Alta de producto en 1 pantalla:** arrastra una o varias fotos → se recortan a 4:5 (herramienta de recorte con zoom) → se comprimen a WebP (lado largo 1200 px, calidad .8) → se completan campos (nombre, tipo, familia de color, diámetro, duración, precio, stock, graduaciones). **Carga masiva:** arrastrar 20 fotos crea 20 borradores con el nombre del archivo como nombre.
- **Almacenamiento (importante):** `localStorage` tiene tope de unos 5 MB y se llenaría con fotos. **Guarda las imágenes en IndexedDB** (p. ej. con `idb-keyval`) y en el store de Zustand solo la referencia (`fotoId`). Excluye las imágenes de `persist` (`partialize`). Usa `URL.createObjectURL` para mostrarlas y revoca al desmontar. Botón "Resetear demo" borra también IndexedDB.
- **Herramienta "Textura de prueba"** (esto vuelve realista el probador): si Araceli sube una foto del lente **visto desde arriba** (como sus fotos del lente en el estuche), se abre un editor con un círculo ajustable (arrastrar centro, escalar radio) y un slider para el **hueco de pupila**; al aceptar genera un **PNG/WebP RGBA 640×640** (círculo recortado, hueco transparente, borde suavizado) y lo guarda en IndexedDB como `texturaPrueba` del producto. El probador usa esa textura en lugar de la generada. Muestra vista previa en vivo sobre un retrato modelo.
- Editar/duplicar/desactivar/eliminar con confirmación; cambios reflejados al instante en la tienda.

---

## 10. Identificación de clientas **sin usuario ni contraseña** (lógica propuesta)
**Idea:** el teléfono (WhatsApp) es la identidad; se verifica solo cuando hay algo de valor en juego.

1. **Comprar = sin cuenta.** En el checkout se piden nombre y **WhatsApp (10 dígitos, +52)**; el sistema normaliza el número y **crea o encuentra a la clienta por teléfono**. Nada de contraseñas ni registro previo. La cuenta "nace" con el primer pedido.
2. **Rastrear un pedido:** con *número de pedido + últimos 4 dígitos del teléfono* (sin verificación; solo muestra estatus, no datos sensibles).
3. **Entrar a "Mi cuenta" (puntos, historial, recompra, renovaciones):** ingresa su número → recibe un **código de 6 dígitos por WhatsApp** → lo escribe → sesión recordada **90 días en ese dispositivo** (token). Reglas: el código expira en 5 min, máximo 5 intentos, reenvío cada 30 s.
4. **Canjear puntos** (tiene valor) exige sesión verificada; **comprar** no.
5. **En producción** esto requiere un backend y un proveedor de mensajería que envíe el código por WhatsApp/SMS (el costo por mensaje depende del proveedor; hay que cotizarlo antes de ofrecerlo como parte del presupuesto). **Alternativa sin proveedor:** botón "Entrar con WhatsApp" que abre un chat con el número de Araceli con un código ya escrito, y ella (o un bot sencillo) confirma — más manual, pero sin costo por mensaje.
6. **En el demo (solo frontend):** simula todo. Pantalla "Entrar" con el teléfono; al enviar, muestra un toast **"Código demo: 123456"** con etiqueta clara *DEMO* y valida ese código; guarda la sesión en `localStorage`. Crea `src/lib/auth.js` con `normalizarTelefono`, `solicitarCodigo`, `verificarCodigo`, `cerrarSesion`, y reemplaza `clientaActual` fijo por la sesión (si no hay sesión, `/cuenta` muestra el login). Selector de rol "Clienta/Dueña" se mantiene para la demo.
7. Privacidad: muestra el teléfono enmascarado (`•• •••• 8831`), no pongas teléfonos en la URL, y documenta que en producción se necesita aviso de privacidad y consentimiento para mensajes.

---

## 11. Imágenes
Ejecuta lo indicado en `BRIEF_IMAGENES_PUPILENTES_AGO.md`. Resumen para ti:
- Estructura bajo `public/img/fotos/` con subcarpetas (`hero/`, `macro/`, `modelos/`, `producto/`, `accesorios/`, `empaque/`, `entregas/`, `fondos/`). Componente `Foto.jsx` (ya existe) debe resolver rutas por slot con **fallback automático** al iris generado; nunca recuadro roto.
- Script `scripts/optimizar-fotos.mjs` (con `sharp`): toma `public/img/originales/**` (en `.gitignore`) y genera `-800.webp` y `-1600.webp` en `public/img/fotos/**`; ejecuta con `npm run fotos`.
- Si las carpetas están vacías el sitio debe verse completo con el arte generado; al soltar fotos reales, se reemplazan solas.
- Registra créditos/permiso en `CREDITOS-IMAGENES.md` por cada archivo (origen, permiso de la persona retratada si aplica).

---

## 12. Orden de ejecución y criterios
| Fase | Trabajo | Aceptación |
|---|---|---|
| 1 | Hero (§1) + transición/manifiesto fusionados (§2) | capturas en 7 resoluciones; ninguna letra sobre la pupila; ≤0.3 pantallas sin contenido entre hero y colecciones |
| 2 | `Foto.jsx` + estructura de carpetas + script de optimización (§11) | build ok con carpetas vacías; con 3 fotos de prueba se ven bien |
| 3 | Modelo de datos por tipo (§7) + catálogo/destacados uniformes (§5) + `/catalogo` | 8 tarjetas parejas, sin huecos, en 1280/1440/1920 y móvil |
| 4 | Eye Lab sección landing (§4.1) + `/probador` rediseño (§4.2) | estado inicial con modelo; sin SVG de óvalos; sin recuadro negro |
| 5 | Realismo del lente (§4.3) | comparar 6 capturas antes/después con ojos claros y oscuros; sin mancha blanca; pestañas visibles sobre el lente; sin borde natural asomando |
| 6 | Cómo funciona storyboard (§6) | 4 pasos con mini-UI, 60 fps, versión móvil y reduced-motion |
| 7 | Márgenes a ancho completo (§8) + cuenta | sin franjas laterales en ninguna ruta |
| 8 | Panel: pedidos "Hoy" + tablero arreglado (§9.1) | sin encimado; cada etapa avanza con 1 clic y "Deshacer"; stock/tracking sincronizados con la tienda |
| 9 | Panel: dashboard, inventario por tipo, catálogo por foto + textura (§9.2–9.3) | alta de producto con foto en < 30 s; imágenes en IndexedDB; textura usable en el probador |
| 10 | Login por teléfono simulado (§10) | flujo comprar sin cuenta; entrar con código demo; puntos solo con sesión |
| 11 | QA final | `npm run build` limpio; consola sin errores; capturas de todas las rutas en 3 tamaños; Lighthouse móvil ≥ 80 en la home; actualizar README/DECISIONES |

## 13. Reglas
- No rompas lo que ya funciona (GSAP/Lenis, checkout, cotizador, import/export Excel, sincronía tienda↔panel).
- Textos en español de México en `src/data/copy.js`. Nada de afirmaciones que no podamos sostener ("precisión milimétrica", "tecnología avanzada").
- No inventes reseñas ni cifras reales. Datos de panel = ejemplo y rotulados así.
- Cualquier foto de personas en el sitio requiere permiso de la persona retratada; anótalo en `CREDITOS-IMAGENES.md`.
- No hagas commit/push salvo que Juan lo pida. Al cerrar cada fase, reporta en 3–5 líneas y adjunta capturas.
- **Preguntas abiertas para Araceli (déjalas como configurables, no las supongas):** (1) ¿graduación en pasos de 0.25 o 0.50? (2) ¿los graduados son de color, transparentes o ambos? (3) ¿estéticos y fantasía también existen graduados? (4) ¿costo de entrega en Pantitlán/Tepalcates? (5) ¿cuáles fotos de su Instagram son suyas y cuáles son material de proveedores?
