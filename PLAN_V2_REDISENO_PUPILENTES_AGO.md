# PLAN V2 — Rediseño "Quiet Luxury" + GSAP real + Probador en vivo
**Proyecto:** Demo Pupilentes AGO (Vite + React + Tailwind 3 ya funcionando)
**Para:** agente de código. Ejecuta por fases, valida cada una, no avances si algo anterior está roto.

> Contexto: la V1 ya corre y todas las rutas cargan. El cliente (Juan, de HummingX BI) la siente **saturada, "de IA", con márgenes enormes a los lados, sin imágenes y sin buen hero**. Pidió: más sutil, más imágenes, pantalla completa de lado a lado, otros tonos de la misma gama, mejor hero, **efectos de scroll con GSAP que se sientan naturales**, mejor nav, arreglar la tarjeta (errores al pasar el mouse) y confirmar si el **probador en vivo** es posible. Tú decides el "cómo"; aquí está todo decidido.

---

## 0. Diagnóstico del código actual (verificado leyendo el repo)

1. **GSAP no se usa en ningún archivo** (`grep gsap src` = 0 resultados) aunque está en `package.json`. Todas las animaciones son clases CSS (`animate-ping`, `animate-pulse`). Por eso no hay efectos de scroll.
2. **El probador NO detecta el iris.** `LiveTester.jsx` solo muestra el video de la cámara; `@mediapipe/tasks-vision` está instalado pero nunca se importa. El "modo ilustración" es un SVG. Hay que escribir el probador real (Fase 8). **Sí es factible** con MediaPipe Face Landmarker (da 478 puntos, incluidos 10 del iris).
3. **Saturación:** la landing tiene 7 secciones, cada una con título + badge + párrafo + tarjetas + `border-amber-500/..`; abundan `text-xs`, `text-[10px]`, `font-mono`, pills, `animate-ping`, "WOW" parpadeando en el nav.
4. **Márgenes:** `.container-custom { max-width:1280px; padding:0 1.5rem }` limita todo; en pantallas anchas sobran bandas negras a los lados.
5. **Bug de la tarjeta** (`CuentaPage.jsx`, tarjeta "AGO Privilège"): el `onMouseMove` y el `transform` están **en el mismo elemento**. Al inclinarse, el borde se aleja del cursor → dispara `mouseleave`/`mouseenter` en bucle (parpadeo/temblor). Además usa `useState` en cada `mousemove` (re-render continuo) y `transition: .15s` que pelea con el tilt. `CustomCursor.jsx` tiene el mismo patrón (setState en cada movimiento). `IrisRenderer` usa `onMouseEnter` con estado.
6. **Nav:** el link `"/#catalogo"` bajo `HashRouter` produce `#/#catalogo` y no hace scroll de forma confiable; `isActive` nunca es verdadero para ese link; el enlace "Rastreo" apunta a un ID fijo falso; el badge "WOW" parpadea; mezcla navegación de clienta con botón de Panel.
7. **Imágenes:** no existe ninguna foto/imagen en `public/` salvo el logo.

---

## 1. Decisiones de diseño (sistema nuevo)

### 1.1 Concepto
**Quiet luxury / editorial:** poco texto, mucho aire *dentro* de la pantalla, imágenes grandes a sangre (edge-to-edge), tipografía grande y ligera, un solo acento dorado usado con **mucha** moderación (hilos finos, un botón, un detalle). Cero pills, cero badges decorativos, cero bordes dorados en todo. Referencia emocional: joyería/óptica de boutique, revista de moda en papel.

### 1.2 Paleta (misma gama negro/gris-beige/dorado, otros tonos; define en `tailwind.config.js` bajo `theme.extend.colors` y como CSS vars)
```
ink:       #0E0D0C   (negro cálido, fondo principal oscuro)
espresso:  #1A1613   (superficies oscuras)
cocoa:     #2A231D   (bordes/superficies elevadas)
taupe:     #5C5247   (texto secundario sobre claro, líneas)
stone:     #9A8F82   (texto secundario sobre oscuro)
sand:      #CDBBA2   (acento suave, hover)
champagne: #E8DCC4   (secciones claras / texto sobre oscuro)
ivory:     #F5EFE4   (fondo de secciones claras)
bone:      #FBF8F2   (tarjetas sobre ivory)
brass:     #B08D57   (dorado apagado: acento principal, hilos)
bronze:    #8A6B3F   (dorado oscuro: texto de acento sobre ivory)
gilt:      #D9BE85   (dorado claro: solo detalles y énfasis cursivo)
```
- **Regla 70/20/10:** 70 % ink/espresso/ivory, 20 % sand/champagne/taupe, **10 % máx. brass/gilt**.
- Alterna secciones **oscuras (ink) y claras (ivory)** para dar ritmo; sin `border-y` entre ellas.
- Los colores saturados (azul, verde, violeta…) viven **solo dentro de las imágenes de iris**; la UI nunca los usa.
- Elimina `bg-gradient` metálico del botón principal: botón sólido `brass` → hover `gilt`, texto `ink`, radio pequeño (`rounded-full` solo en el botón primario del hero); botón secundario = texto con subrayado animado (hilo `brass` que escala en X).
- Elimina el grano a z-index 9999 si afecta rendimiento; si se queda, 2 % de opacidad, `pointer-events:none`.
- Deja el remapeo de `amber` actual **solo para el panel**; la tienda usa los tokens nuevos. Migra el panel al final (Fase 9).

### 1.3 Tipografía (mantiene las fuentes de Araceli)
- Display: **Cormorant Garamond 300/400 y cursiva 400**, `clamp(3.5rem, 9vw, 10rem)` en hero; `clamp(2.5rem, 5.5vw, 6rem)` en títulos de sección. `line-height:.95–1.05`, `letter-spacing:-0.02em`. Énfasis en *cursiva `gilt`*.
- UI/texto: **Plus Jakarta Sans 400/500**, cuerpo `15–17px`, color `stone`/`champagne` al 80 %.
- Etiquetas pequeñas: **11–12px, uppercase, `tracking-[0.22em]`**, usarlas solo 1 por sección como máximo.
- **Prohibido** en la tienda: `text-xs`/`text-[10px]` para contenido, `font-mono`, `font-bold` en títulos serif.
- Añade `font-display: swap` y `<link rel="preload">` de las dos fuentes.

### 1.4 Layout a todo lo ancho
- Elimina `.container-custom` (max-width) de la tienda. Crea utilidad `.gutter { padding-inline: clamp(20px, 4.5vw, 72px) }`.
- Las **secciones y las imágenes van a sangre (100vw)**; solo los bloques de texto de lectura llevan `max-w-[38ch]` (párrafos) o `max-w-[18ch]` (titulares) para controlar saltos.
- Grid de 12 columnas **sobre el ancho completo**; composición asimétrica (imagen grande 7–8 col + texto 3–4 col, desfasado), no tarjetas centradas.
- Alturas generosas: secciones `min-h-[100svh]` o `py-[clamp(96px,14vw,220px)]`.
- Usa `svh/dvh` en móvil; mobile-first (390 px); probar 390, 768, 1440 y **1920** (ultrawide: nada de bandas laterales vacías).

### 1.5 Densidad de información (regla de oro)
Cada sección de la landing = **1 titular + máximo 1 frase corta + 1 CTA**. Nada de listas de beneficios, KPIs, badges ni microtextos. Todo lo informativo se mueve a páginas internas (detalle de producto, checkout, cuenta).

---

## 2. Dependencias y base técnica (Fase 1)

```bash
npm install gsap @gsap/react lenis
```
- GSAP: usa `gsap`, `gsap/ScrollTrigger`; `SplitText` y demás plugins vienen en el paquete `gsap` actual; si algún import falla en la versión instalada, divide texto manualmente (función `splitWords`/`splitChars` que envuelve en `<span class="inline-block overflow-hidden">` + hijo animable).
- Registra plugins **una sola vez** en `src/lib/gsap.js` (`gsap.registerPlugin(ScrollTrigger, useGSAP)`), exporta `gsap` y `ScrollTrigger`.
- **Lenis** para scroll suave, integrado con GSAP (receta oficial):
  ```js
  const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  ```
  Crea `src/lib/smoothScroll.jsx` (provider) y expón `useLenis()` / `scrollToId(id)`. **Desactiva Lenis** en `/panel/*` y cuando `prefers-reduced-motion`. Resetea scroll a 0 y `ScrollTrigger.refresh()` en cada cambio de ruta.
- Hooks base en `src/lib/`:
  - `useReveal(ref, opts)`: fade+translateY(24px→0) con `ease:'power3.out'`, `duration:1.1`, `ScrollTrigger start:'top 85%'`, `once:true`.
  - `useParallax(ref, speed)`: `yPercent` con scrub `true`.
  - `splitWords` / `RevealText` (componente): titulares que entran palabra por palabra (`yPercent:110→0`, stagger `0.06`, `power4.out`, `duration:1.2`) dentro de máscara `overflow-hidden`.
- Todo con **`useGSAP({ scope, dependencies, revertOnUpdate: true })`** (limpia timelines/triggers al desmontar o cambiar de ruta; evita duplicados de StrictMode). `gsap.matchMedia()` para separar `(min-width: 1024px)`, `(max-width: 1023px)` y `(prefers-reduced-motion: reduce)`.
- Tras cargar fuentes e imágenes: `document.fonts.ready.then(() => ScrollTrigger.refresh())`.

### 2.1 Reglas para que se sienta **natural** (no "efecto por efecto")
1. Easings suaves: `power3.out`/`power4.out` para entradas, `power2.inOut` para transiciones; **sin** `back`, `elastic` ni `bounce`.
2. Duraciones 0.9–1.4 s en entradas; scrub con `scrub: 0.8` (suavizado) y no `true` en los movimientos grandes.
3. **Una** idea de movimiento por sección. Máximo 2 elementos animándose a la vez.
4. Desplazamientos pequeños (16–40 px) en reveals; los grandes (zoom, parallax) solo en piezas hero/imagen.
5. Solo `transform` y `opacity` (+ `clip-path` en máscaras). Nada de animar `width/height/top/left`. `will-change: transform` solo en elementos pineados/parallax y se quita al terminar.
6. `pin` solo en 2 lugares (hero y galería horizontal). `anticipatePin: 1`, `invalidateOnRefresh: true`.
7. Móvil: sin parallax pesado, pins reducidos o reemplazados por reveals simples.
8. `prefers-reduced-motion`: contenido visible estático, sin pins ni scrub.

---

## 3. Imágenes (Fase 2) — tema crítico

### 3.1 Qué YA existe (te lo dejo hecho)
En `public/img/` están **16 imágenes generadas por código** (iris en macro, estilo editorial, fondo negro cálido):
- `public/img/iris/{miel,avellana,verde,azul,gris,violeta,cafe,aqua}.webp` — 1400×1400, iris completo centrado. **Geometría para animar:** el iris ocupa **80 % del ancho** de la imagen (radio = 0.40 × ancho) y la **pupila mide 24 % del ancho** (diámetro = 0.24 × ancho), centro exacto de la imagen.
- `public/img/iris-tex/{...}.webp` — 640×640 **RGBA**: solo el iris con **pupila transparente** y borde suave, **para el probador en vivo** (Fase 8). Radio del iris = 0.5 × ancho; radio del hueco de pupila ≈ 0.30 × radio del iris.
- Mapea familia de color → archivo en `src/data/imagenes.js` (Miel→`miel`, Avellana→`avellana`, Verde→`verde`, Azul→`azul`, Gris/Plata→`gris`, Violeta→`violeta`, Café→`cafe`, y `aqua` para tonos turquesa). Cada modelo del catálogo usa su imagen de iris **como foto del producto**; deja el SVG de `IrisRenderer` solo como fallback si falla la imagen.

### 3.2 Fotografía real (lo que realmente hará ver premium el sitio)
Las imágenes generadas **no sustituyen** fotos reales de ojos/personas/producto. Implementa un sistema de "slots" para que se puedan reemplazar sin tocar código:
- `src/components/common/Foto.jsx`: `<Foto slot="editorial1" ratio="4/5" className="..."/>` intenta cargar `/img/fotos/{slot}.webp|jpg|png`; si no existe, usa el **arte de respaldo** de ese slot (iris macro recortado, o gradiente texturizado de la paleta nueva con grano) — nunca un recuadro roto ni gris. Con `loading="lazy"`, `decoding="async"`, `aspect-ratio`, `object-fit:cover`, `srcset` si hay variantes, y un leve *blur-up*.
- Slots mínimos: `heroRetrato`, `editorial1..4` (retratos/ojos), `producto1..3` (estuche, solución, blíster), `entrega1` (metro/mensajería), `cta`.
- Crea `public/img/fotos/LEEME.md` con la lista de slots, proporción y tamaño recomendado (≥1600 px lado largo, WebP ≤ 250 KB).
- **Qué debe conseguir Juan** (no lo inventes tú): fotos reales que Araceli ya tenga (producto, empaque, entregas, clientas con su permiso) o fotografía de stock gratuita de ojos en macro, retratos editoriales oscuros y empaque de lujo (Unsplash/Pexels u otra con licencia verificada; guarda créditos en `CREDITOS-IMAGENES.md`). No uses imágenes de personas sin licencia.
- Tamaños: genera versiones `-800` y `-1600` con `sharp` si hay fotos; todo WebP.

### 3.3 Imágenes en cada sección (ver Fase 5): hero = iris macro a pantalla completa; colores = 8 iris; catálogo = iris como foto de producto; editorial = slots de fotografía.

---

## 4. NAV nuevo (Fase 3) — `src/components/common/Navbar.jsx`

**Comportamiento**
- `position: fixed`, ancho completo, `padding-inline: var(--gutter)`, altura 72 px.
- **Transparente sobre el hero**, sin borde. Tras 80 px de scroll: fondo `ink/70` + `backdrop-blur-xl` + hilo inferior `brass/15`. Sobre secciones claras cambia a texto `ink` (usa `ScrollTrigger` con `onToggle` por sección con `data-nav-theme="light|dark"`).
- **Se oculta al bajar y reaparece al subir** (`ScrollTrigger.create({ onUpdate: self => self.direction === 1 ? hide : show })` con `gsap.to(nav, {yPercent: -100})`, `0.5s power3.out`). Siempre visible si el menú móvil está abierto.
- Entrada: al cargar, el nav baja con fade (0.9 s, `delay:.4`) coordinado con el hero.

**Contenido (menos es más)**
- Izquierda: medallón del logo **36 px** (sin marco dorado ni glow) + wordmark `PUPILENTES AGO` en Plus Jakarta 12px uppercase `tracking-[0.3em]` (oculto bajo 480 px; solo medallón).
- Centro (≥1024 px): **Colecciones · Eye Lab · Puntos**. Sin badge "WOW", sin `animate-pulse`. Hover: hilo `brass` que escala de 0→1 en X (origen izquierda), 0.4 s. Link activo con hilo fijo.
- Derecha: ícono de carrito (con punto/contador discreto `brass`) y botón texto "Mi cuenta". **Quita "Panel Araceli" y "Rastreo" del nav** (el panel ya está en el `FloatingRoleSwitcher`; rastreo va en la cuenta y el footer).
- **Arregla navegación a secciones:** `Colecciones` = `scrollToId('colecciones')` con Lenis si estás en `/`; si estás en otra ruta, navega a `/` y luego hace scroll. Calcula `isActive` con `useLocation` + scroll-spy simple.
- **Móvil:** botón de menú (dos líneas que se cruzan en X con GSAP) → **overlay a pantalla completa** `ink` con links enormes en serif (`clamp(2.5rem,10vw,4.5rem)`), entrada escalonada (`yPercent:100→0`, stagger .08), cierra con ESC y al navegar. Bloquea scroll de fondo (`lenis.stop()`).
- Accesibilidad: `aria-expanded`, foco atrapado en el overlay, `focus-visible` con hilo `brass`.

---

## 5. Landing nueva (Fase 4 y 5) — `src/features/tienda/LandingPage.jsx`
Reescribe la página con **7 bloques**, a sangre, ritmo oscuro/claro. Quita el resto de secciones actuales (beneficios, tarjetas informativas, mapa de metro, teaser de puntos largo).

### 5.1 HERO — "Zoom a la pupila" (la pieza firma)
**Estructura:** `<section data-nav-theme="dark" class="relative h-[100svh] overflow-hidden bg-ink">` envuelta en un contenedor de pin de **+150 % de scroll**.
- **Capas (de atrás hacia adelante):**
  1. Fondo `ink` con degradado radial muy sutil `espresso` al centro.
  2. **Iris macro enorme y centrado:** `<img src="/img/iris/miel.webp">` con `width: max(120vh, 90vw)` (la pupila queda visible en el centro; escala respecto al origen centro).
  3. Cuatro iris más apilados (`verde`, `azul`, `gris`, `violeta`) con `opacity:0`, mismas dimensiones, para el cambio de color.
  4. Viñeta oscura (radial `transparent→ink 85%`) para que el texto se lea; `pointer-events:none`.
  5. Texto del hero (abajo-izquierda, **no centrado**): etiqueta 11px "TIENDA ONLINE CDMX", titular gigante **"Mira el mundo / en *miel*"** (la palabra final cambia con el color), una sola frase de apoyo (≤12 palabras) y un botón primario "Ver colecciones" + link subrayado "Probar en vivo".
  6. Indicador de scroll mínimo (línea vertical animada 40 px) abajo-centro.
- **Animación de entrada (timeline, ~2.2 s, sin scroll):**
  - Iris: `scale 1.35→1`, `opacity 0→1`, `filter blur(14px)→0`, `duration 2.2`, `ease power3.out`.
  - Titular: `RevealText` por palabras (máscara), `delay .5`.
  - Frase y botones: fade + `y:20`, `delay 1.1`, stagger .12.
  - Nav (ver §4) entra a `delay .4`.
- **Con scroll (pin + scrub 0.8) — 3 movimientos encadenados, en este orden:**
  1. **Cambio de color (0→60 %):** crossfade entre los 5 iris (cada uno ocupa ~12 % del progreso; opacidad solapada) y cambio de la palabra del titular (`yPercent` dentro de máscara: sale hacia arriba, entra desde abajo). Rotación mínima del iris (`rotation 0→25°`) para dar vida.
  2. **Zoom a la pupila (60→100 %):** el contenedor de iris escala de 1 hasta `S = diagonalViewport / (0.24 × anchoDeImagen)` (para que la pupila negra **cubra por completo la pantalla**; calcula S en `invalidateOnRefresh`), con `ease:'power2.in'`. El texto del hero se desvanece y sube en el primer 30 % del zoom.
  3. **Portal a la siguiente sección:** la siguiente sección (ivory) aparece **dentro de un `clip-path: circle()`** que crece desde el centro (`circle(0% at 50% 50%) → circle(150% at 50% 50%)`) mientras termina el zoom; la sensación es "entrar por la pupila" hacia la página clara. Implementa el reveal con una capa `ivory` posicionada sobre el hero que se descubre con el clip-path.
- **Interacción extra (solo escritorio, `pointer:fine`):** parallax del iris con el mouse (`gsap.quickTo` en `x`,`y`, ±14 px, `duration .8`, `power3.out`) y una **pupila-overlay** (div circular negro con `radial-gradient` suave sobre el centro) que se dilata/contrae `±6 %` en un loop lento `sine.inOut` (4 s) para que el ojo "respire". Sin `setState`.
- **Móvil:** misma narrativa pero pin de +100 %, iris `width:140vw`, texto abajo con safe-area, sin parallax de mouse.
- **Reduced motion:** hero estático con iris `miel`, sin pin ni zoom.

### 5.2 Manifiesto (ivory, `data-nav-theme="light"`)
- Una frase gigante serif (≈10–14 palabras, ejemplo editable: *"No cambia quién eres. Cambia la forma en que te miran."*), a todo lo ancho con `gutter`, color `ink`, palabras en `taupe/30 %`.
- **Scrub por palabra:** cada palabra pasa de `opacity .18` a `1` conforme se hace scroll (`stagger`, `scrub:true`, `start:'top 70%'`, `end:'bottom 40%'`). Sin pin, sin imágenes aquí. Es el respiro de calma.

### 5.3 Colecciones — galería horizontal (id `colecciones`)
- Sección pineada (`end: '+=' + (scrollWidth - innerWidth)`), fila horizontal de **8 paneles altos** (≈ `42vw` × `78vh` escritorio, `80vw` móvil) a sangre, cada uno con su iris (`object-cover`) y **solo**: nombre del color en serif grande + un punto de color. Sin precios, sin texto de producto.
- `gsap.to(track, { x: -(scrollWidth - innerWidth), ease:'none', scrollTrigger:{ pin:true, scrub:0.8, anticipatePin:1, invalidateOnRefresh:true }})`. Imagen interior con parallax contrario (`xPercent` ±8 con `containerAnimation`). Escala sutil 1.12→1 al entrar al viewport.
- **El fondo de la sección se tiñe** suavemente al color del panel activo (mezcla 10 % del color con `ink`), tween `background-color` 0.6 s.
- Móvil: scroll horizontal nativo con `scroll-snap-x`, sin pin.
- Clic en panel → filtra el catálogo por esa familia y hace scroll a `#catalogo`.

### 5.4 Eye Lab — invitación al probador (oscura)
- Layout dividido: izquierda titular **"Pruébatelos en vivo"** + una frase + botón "Abrir probador"; derecha un **marco grande** con un ojo ilustrado (SVG de ojo a sangre del marco) donde el iris es una de las imágenes y **sigue el cursor** (`quickTo`) y cambia de color cada ~2.5 s con crossfade; en móvil, el iris se mueve con auto-animación suave.
- Al hacer scroll: el marco hace `clip-path` inset → pantalla completa (`inset(12% 8% round 24px)` → `inset(0)`), mientras el texto sube. Al hacer clic, transición a `/probador`.

### 5.5 Catálogo editorial (id `catalogo`, ivory)
- Titular "Colección" + **una sola fila de filtros**: chips de color (máx. 5 + "Todos") y selector discreto "Graduación". Los filtros avanzados (duración, precio, orden, búsqueda) pasan a un **drawer lateral** ("Filtrar") y a la ruta nueva `/catalogo` (catálogo completo, reutiliza la lógica actual de `CatalogoSection`).
- **Grid asimétrica a sangre** (12 col): fila 1 → una tarjeta grande (6 col) + dos medianas (3 col c/u); luego patrón repetido. Muestra **solo 6 modelos destacados** en la landing + botón "Ver todo el catálogo".
- **Tarjeta de producto minimalista:** la **imagen domina** (relación 4:5, iris sobre `ink`/`espresso`), debajo solo `nombre` (serif 22–26px) y `precio` (sans 14px). Estado de stock = **punto de 6 px** (`brass` en stock, `stone` agotado) + texto solo si es "últimas N piezas". Sin botones permanentes: al hover (escritorio) aparece un botón "Elegir" que sube 8 px y la imagen hace `scale 1.04` (CSS transition 0.8 s `cubic-bezier(.2,.7,.2,1)`). En móvil el botón no se muestra; toda la tarjeta es link.
- Entrada: `ScrollTrigger.batch('.card', { onEnter: batch => gsap.from(batch, { y:40, opacity:0, stagger:.1, duration:1.1, ease:'power3.out' }) , start:'top 88%' })`.
- Filtrado con **`Flip`** (reordenar con transición suave 0.7 s), sin saltos.

### 5.6 Cómo funciona + Entregas (una sola sección, oscura)
- Tres líneas gigantes en serif, a todo lo ancho, numeradas (`01 Elige tu color`, `02 Gradúa cada ojo`, `03 Recíbelo en CDMX o todo México`). Cada una revela con `RevealText` y una **línea hairline** `brass/40` que se dibuja (`scaleX 0→1`, origen izquierda) al entrar.
- Debajo, **una sola línea** de texto pequeño: "Entrega personal en Metro Pantitlán y Tepalcates · DiDi · Paquetería" (fuente: diagnóstico de Araceli). Sin mapa, sin tarjetas.
- Opcional sutil: SVG de una línea punteada horizontal que se dibuja con scroll (`strokeDashoffset`) conectando los tres métodos.

### 5.7 Cierre + footer
- Titular enorme **"Elige tu mirada"** sobre una imagen de iris a sangre, muy oscurecida (60 % `ink`), con el botón primario "Ver colecciones".
- **Marquee lento** (40 s, lineal) con los nombres de los colores en serif cursiva `stone/40`, pausa al hover. Solo CSS/GSAP `x`, sin saturar.
- Footer minimalista: 3 columnas (marca + redes / contacto WhatsApp / "Mi cuenta · Seguimiento · Panel"), 13px, sin bordes pesados.

> **Puntos AGO y recordatorios** salen de la landing (quedan en nav y en `/cuenta`). Menos información en portada.

---

## 6. Arreglo de tarjetas y cursor (Fase 6)

### 6.1 Tarjeta de membresía (`CuentaPage.jsx`) — reescribir
Estructura **sin el bug de hit-testing**:
```jsx
<div ref={wrapRef} className="[perspective:1100px] w-full max-w-md">   {/* ESTÁTICO: escucha eventos */}
  <div ref={cardRef} className="relative aspect-[1.586/1] rounded-[22px] ...">  {/* se transforma */}
    <div ref={glareRef} className="absolute inset-0 pointer-events-none ..."/>
    ...contenido...
  </div>
</div>
```
- Eventos `pointermove`/`pointerleave` **en el wrapper**, nunca en el elemento que rota.
- `gsap.quickTo(card, 'rotationY', {duration:.7, ease:'power3.out'})` y `rotationX`; amplitud máx. **±8°** (no `/15` sin límite). Calcula con coordenadas normalizadas −1…1 y `clamp`.
- Brillo (glare): actualizar CSS vars `--mx`/`--my` en rAF (sin `setState`) para un `radial-gradient` que sigue el cursor; opacidad 0→.35 al entrar, 0 al salir.
- `pointerleave` → `gsap.to(card, {rotationX:0, rotationY:0, duration:.9, ease:'power3.out'})`.
- `will-change: transform` solo durante la interacción. `transform-style: preserve-3d`, `backface-visibility:hidden`.
- Móvil/táctil: sin tilt; en su lugar un brillo que se desplaza al hacer scroll. `prefers-reduced-motion`: sin animación.
- Rediseño visual: tarjeta `ink` → `espresso` con acabado "satin" (degradado muy sutil), hilo `brass/30`, tipografía serif pequeña para "AGO PRIVILÈGE", sin `Sparkles`, sin sombra dorada pesada; puntos en serif grande.

### 6.2 Tarjetas del catálogo y `IrisRenderer`
- Quita `onMouseEnter` con `useState`; el hover se resuelve **solo con CSS** (`group-hover`) o GSAP directo al DOM. Cero re-renders por movimiento de mouse.
- Revisa que ningún overlay (grano, glow, brillo) intercepte el puntero (`pointer-events:none`) y que el hover no cambie el layout (no animes `width/height/margin`; solo `transform/opacity`).

### 6.3 `CustomCursor.jsx` — simplificar
- Reemplaza `useState` por refs + `gsap.quickTo` (`x`, `y`) con `duration .25`. Un **punto de 6 px** que sigue exacto y un **anillo de 34 px** que sigue con retraso; el anillo crece a 56 px sobre `a, button, [data-cursor]` usando **delegación en `mouseover/mouseout`** (no en cada `mousemove`).
- Solo `pointer:fine`; se oculta sobre `iframe`/video y en `/panel` y `/checkout` (donde estorba). Colores `brass`/`champagne`, `mix-blend-mode: difference` opcional.
- Mantén el cursor nativo visible (no ocultes `cursor:none` globalmente).

---

## 7. Resto de la tienda (Fase 7) — alinear con el nuevo sistema, sin rehacer lógica
- **Detalle de producto:** imagen del iris a sangre a la izquierda (50 % de pantalla, sticky), configuración a la derecha en una sola columna limpia; título serif grande; el resto de campos (graduación OD/OI, accesorios) conservados pero con inputs de línea inferior (`border-b`) en vez de cajas con borde dorado; menos texto auxiliar.
- **Checkout:** layout a todo lo ancho (formulario 7 col + resumen 5 col sticky), barra de progreso fina (hilo `brass`), tipografía y paleta nuevas. **Conserva toda la lógica** (cotizador, entrega, comprobante, guía, WhatsApp).
- **Cuenta / Seguimiento:** misma limpieza (menos bordes y pills, más aire).
- Reemplaza todos los `border-amber-*` y `text-amber-*` decorativos por tokens nuevos; objetivo: **≤ 3 elementos dorados por pantalla**.

---

## 8. PROBADOR EN VIVO REAL (Fase 8) — reescribe `src/features/eyelab/LiveTester.jsx`

**Respuesta a Juan: sí es posible**, 100 % en el navegador. Se detecta el iris y se pinta encima la textura del lente, recortada por los párpados. Es una **simulación visual**, no una prueba clínica; depende de luz y ángulo.

### 8.1 Recursos (descarga/copia — deben ir dentro de `public/` para no depender de CDN)
```bash
mkdir -p public/models public/mediapipe
cp -r node_modules/@mediapipe/tasks-vision/wasm public/mediapipe/wasm
curl -L -o public/models/face_landmarker.task \
  https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task
```
(El URL del modelo es el oficial de la documentación de MediaPipe Face Landmarker. Si cambia, descárgalo desde su página oficial. Agrega un script `postinstall` o instrucciones en el README para repetir estos pasos.) Texturas de lente: `public/img/iris-tex/*.webp` (ya incluidas).

### 8.2 Pipeline
1. **Carga perezosa** del modelo al hacer hover/clic en "Probar en vivo" (precarga con skeleton elegante "Preparando tu probador…"). Un solo `FaceLandmarker` singleton:
   ```js
   const fileset = await FilesetResolver.forVisionTasks('/mediapipe/wasm');
   landmarker = await FaceLandmarker.createFromOptions(fileset, {
     baseOptions: { modelAssetPath: '/models/face_landmarker.task', delegate: 'GPU' },
     runningMode: 'VIDEO', numFaces: 1,
     outputFaceBlendshapes: false, outputFacialTransformationMatrixes: false });
   ```
   Si `GPU` falla, reintenta con `'CPU'`. Para fotos subidas usa `runningMode:'IMAGE'` (`setOptions`).
2. **Cámara:** `getUserMedia({ video:{ facingMode:'user', width:{ideal:1280}, height:{ideal:720} }, audio:false })`. Solo funciona en HTTPS o `localhost`; si no, mostrar mensaje claro y ofrecer subir foto.
3. **Bucle:** `requestAnimationFrame`; llama `detectForVideo(video, performance.now())` **solo cuando `video.currentTime` cambió**. Canvas del tamaño del video; espejo con CSS (`transform: scaleX(-1)` en video y canvas) para que se vea como espejo.
4. **Landmarks (según la documentación de MediaPipe Face Mesh/Landmarker, 478 puntos):**
   - Iris A: centro `468`, anillo `469–472`. Iris B: centro `473`, anillo `474–477`. **No asumas cuál es izquierdo/derecho**; trata cada iris igual.
   - Radio del iris = promedio de distancias (en px) del centro a los 4 puntos del anillo.
   - Contorno del párpado para el recorte (valores estándar de MediaPipe): ojo 1 `[33,7,163,144,145,153,154,155,133,173,157,158,159,160,161,246]`, ojo 2 `[263,249,390,373,374,380,381,382,362,398,384,385,386,387,388,466]`. **Verifica visualmente** dibujando puntos de depuración (modo `?debug=1`) antes de aceptar.
5. **Suavizado anti-temblor:** filtra centro y radio con EMA (`α≈0.45`, menor al perder velocidad) o One-Euro filter. Sin esto el lente "vibra".
6. **Render por ojo:**
   - `ctx.save()`; `clip` con el **contorno del párpado** (polígono suavizado con curvas) → el lente nunca se sale a la piel.
   - Dibuja la textura (`iris-tex/{modelo}.webp`) centrada en el iris con diámetro `2 × radio × 1.02`.
   - **Hueco de pupila** ajustable (slider): recorta con `destination-out` un círculo central `pupila × radio` (0.28–0.5) con borde suave para ver la pupila real del usuario.
   - **Mezcla natural:** mide la luminancia media del iris original (muestreo de ~16 puntos dentro del anillo en un canvas offscreen). Si es **oscuro (ojos café)** usa `source-over` con `globalAlpha = intensidad` (0.55–0.9). Si es **claro**, usa `globalCompositeOperation='color'` (conserva sombras) + una pasada `source-over` a 0.3. El slider "Intensidad" controla el alpha.
   - **Borde:** difumina el contorno exterior de la textura ~6 % del radio con una máscara radial (`destination-in`) para que no se vea un sticker.
   - **Brillo:** redibuja un punto especular blanco suave (`radial-gradient`) en la posición del pixel más luminoso dentro del iris original (si existe), a `lighten`.
   - `ctx.restore()`.
7. **Pérdida de rostro:** si no hay landmarks, desvanece los lentes en 200 ms y muestra la sugerencia "Centra tu rostro y busca luz frontal".
8. **Oclusión/parpadeo:** como se recorta con el párpado, al parpadear el lente desaparece de forma natural.

### 8.3 UX del probador (pantalla completa, menos saturación)
- Ruta `/probador` **a sangre**: escenario de cámara que ocupa ~100 vw × 100 svh bajo el nav; controles flotantes y mínimos.
- **Carrusel inferior** de círculos (las 8 imágenes de iris, 64 px) con nombre del modelo; al seleccionar, **crossfade 300 ms** de la textura (mantén dos capas y anima `globalAlpha`).
- Controles: Intensidad, Pupila (sliders finos), botón **Comparar** (línea divisoria arrastrable antes/después), botón **Foto** (captura con marco fino `brass` + logo pequeño; descarga/compartir con Web Share API y fallback a descarga), botón "Agregar al carrito" con el modelo activo. Nada más en pantalla.
- Mensaje de privacidad en una línea: "Tu imagen se procesa en tu dispositivo."
- **Fallbacks en cascada:** (1) cámara; (2) **subir foto** (misma detección en modo IMAGE; permite probar sin cámara — ideal para la demo y para pruebas automáticas); (3) **modo ilustración** (el SVG actual) si el modelo no carga o no hay rostro tras 6 s en foto. Nunca dejar pantalla vacía.
- Estado de carga/errores con texto humano, sin "undefined".

### 8.4 Pruebas de esta fase (obligatorias)
- Prueba con **una foto de rostro** subida (pídele a Juan una foto de prueba suya o de stock con licencia) y captura screenshots del resultado con ojos claros y ojos oscuros; ajusta mezcla hasta que luzca natural.
- Prueba con Playwright en Chromium usando `--use-fake-ui-for-media-stream --use-fake-device-for-media-stream` (video falso) solo para verificar que el flujo no truena; la calidad se valida con la foto.
- Reporta FPS aproximado en escritorio y celular; objetivo ≥ 24 fps. Si baja, reduce la resolución del procesamiento (detecta sobre 640×360 y dibuja sobre el canvas grande).

---

## 9. Panel de Araceli (Fase 9) — misma calma, sin rehacer
- Migra al sistema: fondo `ink`, superficies `espresso`, bordes `cocoa` (no dorados), dorado solo en el ítem activo y en un botón primario por vista. Texto base 14px (hoy hay mucho `text-xs`/`text-[10px]`).
- Dashboard: reduce a **4 KPIs + 1 gráfica + checklist**; mueve lo demás a pestañas o vistas secundarias. Aire entre tarjetas (gap 24+).
- Matriz de inventario y Kanban: se conservan; solo suaviza colores del semáforo (usa los estados `ok/warn/bad` con 12 % de opacidad y texto claro).
- **No toques la lógica del store.**

---

## 10. Orden de ejecución y entregables por fase
| Fase | Qué | Criterio de aceptación |
|---|---|---|
| 1 | `npm i gsap @gsap/react lenis`, `lib/gsap.js`, Lenis provider, hooks, tokens/Tailwind nuevos, fuentes | build ok, scroll suave en `/`, nada roto |
| 2 | `Foto.jsx`, `data/imagenes.js`, `LEEME.md`, mapeo iris→modelos | catálogo muestra imágenes de iris reales, sin recuadros rotos |
| 3 | Navbar nuevo | oculta/muestra con scroll, móvil overlay, links funcionan en HashRouter |
| 4 | Hero con zoom a pupila | 60 fps, sin saltos, el zoom cubre la pantalla sin bordes en 390/1440/1920 |
| 5 | Resto de la landing (manifiesto, colecciones, Eye Lab, catálogo, pasos, cierre) | 1 idea por sección, a sangre, ritmo oscuro/claro |
| 6 | Tarjeta de membresía, cards, cursor | **cero parpadeo al pasar el mouse** (probar bordes y esquinas), sin re-renders por mousemove |
| 7 | Detalle, checkout, cuenta, seguimiento alineados | lógica intacta, estética nueva |
| 8 | Probador en vivo real | detecta ambos iris, recorta con párpados, funciona con foto subida y cámara |
| 9 | Panel suavizado | misma funcionalidad, menos ruido |
| 10 | QA | ver abajo |

### QA final (Fase 10)
- `npm run build` sin errores; consola sin errores/warnings en todas las rutas.
- Screenshots (Playwright) en **390×844, 768×1024, 1440×900 y 1920×1080** de: home (hero inicio, hero a mitad de zoom, manifiesto, colecciones, catálogo, cierre), nav (normal, oculto, menú móvil), tarjeta de membresía, catálogo, probador, panel. Revísalas tú mismo antes de reportar.
- Verifica: ningún scroll horizontal accidental; ningún elemento que desborde; el hero no deja "huecos" negros en ultrawide; `prefers-reduced-motion` desactiva pins/scrub.
- Rendimiento: imágenes WebP (< 200 KB cada una en la landing), `loading="lazy"` fuera del primer viewport, el JS inicial < ~250 KB gz (divide por rutas con `React.lazy`: el panel, `xlsx`, `jspdf` y `mediapipe` **no deben cargarse en la landing**).
- Actualiza `README.md` (cómo bajar el modelo, dónde poner fotos, guion de demo actualizado) y `DECISIONES.md`.

## 11. Reglas generales
- Texto de interfaz en español de México; copy editable en un solo archivo `src/data/copy.js` (titulares, frases, labels) para poder ajustarlo sin buscar en componentes.
- No inventes reseñas ni cifras de ventas visibles al cliente en la tienda. Los datos del panel siguen siendo de ejemplo y deben verse etiquetados así.
- No eliminar funcionalidad existente (checkout, cotizador, Kanban, inventario, importar/exportar Excel, WhatsApp).
- No hagas commit ni push salvo que Juan lo pida. Al terminar cada fase reporta en 3–5 líneas qué cambió y adjunta capturas.
