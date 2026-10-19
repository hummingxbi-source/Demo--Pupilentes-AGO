# BRIEF DE IMÁGENES — Pupilentes AGO
Para Juan (conseguir/crear las fotos) y para el agente (dónde van y cómo se nombran).

## 1. Qué hay en el Instagram de la marca (lo que se ve en tus capturas)
- **Macros de ojos con lente** (muchísimos): grises, verdes, avellana, azules.
- **Retratos de rostro** con maquillaje, fondo claro (útiles como "modelos" para el probador).
- **Lente visto desde arriba dentro del estuche** con el nombre del modelo (p. ej. "Siri green", "Breeze Hazel"): ideales para fotos de producto **y** para generar la textura realista del probador.
- **Empaque** (cajas con el patrón del logo), "Solución y estuche", envíos.
- **Videos** (íconos de play) y **marca de agua del logo** en varias.

## 2. Qué hacer con ellas (y precauciones)
1. **Pedirle a Araceli los originales** (celular/Drive). Las capturas de pantalla de Instagram son de baja resolución: se ven bien en el feed, pero se pixelan a pantalla completa. Meta: lado largo ≥ 1600 px.
2. **Preguntarle cuáles son suyas.** En varias imágenes se ven marcas de agua de otras marcas (proveedores) y textos de terceros: **no las usemos** sin permiso. Tampoco usar tal cual capturas con interfaz de Instagram, marca de agua de TikTok ni textos superpuestos (en el sitio van limpias).
3. **Personas retratadas:** usar solo con permiso (clientas/modelos). Anótalo en `CREDITOS-IMAGENES.md`.
4. **Fotos del producto real:** el color del lente en la foto debe corresponder al producto que se vende; si no, se generan devoluciones y reclamos. Por eso, para "así se ve este modelo" usa **fotos reales**.
5. **Imágenes hechas con IA:** sí para ambiente, fondos, texturas y retratos de ejemplo del probador (rotulados "modelo ilustrativo"). **No** para mostrar el resultado de un lente específico como si fuera el producto real. Yo no puedo generar fotografía realista desde aquí; abajo te dejo los *prompts* para tu herramienta de IA.
6. Si usas la marca de agua del logo, que sea pequeña y consistente (esquina inferior), nunca encima del ojo.

## 3. Carpetas y nombres (el agente crea la estructura; tú solo sueltas archivos)
```
public/img/originales/        ← aquí sueltas lo que tengas (se ignora en git)
public/img/fotos/             ← el script `npm run fotos` genera aquí versiones -800 y -1600 .webp
  hero/            hero-01
  macro/           miel-01, avellana-01, verde-01, azul-01, gris-01, violeta-01, cafe-01, aqua-01   (+ -02, -03)
  modelos/         modelo-01 … modelo-06   (rostro completo, frontal)
  producto/        {sku}.webp              (lente visto desde arriba en estuche; 1 por modelo)
  accesorios/      solucion, estuche, pinzas, gotas, kit-viaje
  empaque/         caja-01, caja-02, unboxing-01
  entregas/        metro-01, paqueteria-01, didi-01
  fondos/          satin-negro, polvo-oro, lino-arena
```
Formato: JPG/PNG/WebP de origen; el script convierte a WebP. Nombres en minúsculas, sin espacios ni acentos.

## 4. Lista de tomas y proporciones
| Carpeta | Cant. | Proporción | Uso en el sitio |
|---|---|---|---|
| `macro/` | 8 colores × 1–2 | 3:4 vertical y 3:2 horizontal | Colecciones (scroll horizontal), cierre, galerías |
| `modelos/` | 4–6 | 4:5 vertical | **Probador en vivo** y sección Eye Lab de la landing. Requisitos técnicos: rostro **completo y frontal**, ojos abiertos mirando al frente, luz pareja, sin lentes de armazón, cabello fuera de los ojos, fondo liso. Variar tonos de piel (el recomendador pregunta tono de piel) |
| `producto/` | 1 por modelo | 4:5 | Tarjetas del catálogo, detalle de producto, panel. Además **sirve para crear la textura del probador** (lente de frente, centrado, bien enfocado, sin reflejos fuertes) |
| `accesorios/` | 5 | 1:1 | Catálogo de accesorios |
| `empaque/` | 3 | 4:5 y 16:9 | Cómo funciona, detalle de producto |
| `entregas/` | 3 | 16:9 | Cómo funciona (paso 3), footer |
| `fondos/` | 3 | 16:9 | Texturas de secciones |
| `hero/` | 1–2 | 16:9 | Opcional (el hero actual usa iris generado) |

## 5. Prompts para tu herramienta de IA (en inglés rinden mejor)
**Estilo común (pégalo al final de cada prompt):**
`editorial beauty photography, warm black background, soft warm key light with subtle gold rim light, natural skin texture, shallow depth of field, high detail, realistic, no text, no watermark, no logo, no extra fingers, no distorted eyes`

**Fondos / texturas (seguros para IA):**
- `satin-negro`: "macro of black satin fabric with soft folds, warm black, subtle gold highlights, 16:9"
- `polvo-oro`: "fine gold dust scattered on matte black surface, top view, shallow depth of field, 16:9"
- `lino-arena`: "sand-colored linen texture, soft light, minimal, top view, 16:9"

**Retratos de modelo para el probador (marca como "modelo ilustrativo"):**
- "frontal portrait of a [young woman / man], [light / medium / tan / deep] skin tone, neutral relaxed expression, eyes open looking straight at camera, evenly lit face, hair pulled back from eyes, plain light-gray background, passport-style framing but editorial quality, 4:5" + estilo común (quita "warm black background").
- Genera 6 variantes cambiando tono de piel, edad aparente y cabello. Revisa que **los dos ojos estén completos y simétricos**; descarta los que tengan ojos deformados.

**Ambiente / editorial (no muestran un producto específico):**
- "extreme macro of a human eye, natural brown iris, long lashes, soft golden light, black background, 3:2"
- "close crop of eyes and brows with soft shimmer eyeshadow in champagne tones, editorial, 4:5"

**Accesorios (para IA solo como apoyo; ideal fotografiar los reales):**
- "minimalist product photo of a contact lens case and saline solution bottle on warm sand linen, soft shadow, top-down, no brand names, 1:1"

**Evitar en prompts:** nombres de marcas de lentes o de maquillaje, celebridades, logos.

## 6. Después de soltar las fotos
1. `npm run fotos` (convierte y redimensiona).
2. Revisar en el sitio; si alguna foto de modelo no sirve en el probador (no detecta rostro), reemplazarla por una más frontal.
3. En el panel → Catálogo → "Textura de prueba": subir la foto del lente visto desde arriba para que el probador use el diseño real del lente.
4. Anotar en `CREDITOS-IMAGENES.md`: archivo, origen (Araceli / IA / stock con licencia), permiso de la persona retratada.
