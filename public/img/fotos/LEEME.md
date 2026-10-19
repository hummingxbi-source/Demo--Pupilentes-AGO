# Slots de Fotografía — Pupilentes AGO (V2)

Este directorio alberga la fotografía editorial y de producto que reemplaza los respaldos gráficos de forma automática.

## Reglas y Recomendaciones Técnicas
- **Formato:** WebP (o JPEG de alta calidad con compresión ≤ 85%).
- **Resolución:** ≥ 1600 px en el lado más largo (≥ 2400 px para `heroRetrato`).
- **Peso objetivo:** ≤ 250 KB por imagen.
- **Modo:** Sin tocar código, basta con colocar el archivo con el nombre exacto de la ranura (slot) con extensión `.webp`, `.jpg` o `.png`.

## Lista de Slots Disponibles

| Slot | Propósito | Proporción recomendada | Tamaño ideal |
|---|---|---|---|
| `heroRetrato` | Retrato principal de portada / close-up | 16:9 o 1:1 | 2400 × 1600 px |
| `editorial1` | Mirada macro editorial (luz natural de día) | 4:5 | 1600 × 2000 px |
| `editorial2` | Mirada macro editorial (contraste cálido/dorado) | 4:5 | 1600 × 2000 px |
| `editorial3` | Retrato de clienta en exterior CDMX | 4:5 | 1600 × 2000 px |
| `editorial4` | Detalle de colocación de lente / kit | 4:5 | 1600 × 2000 px |
| `producto1` | Estuche de lujo y pinzas sobre fondo oscuro | 1:1 | 1600 × 1600 px |
| `producto2` | Solución multipropósito y blíster individual | 1:1 | 1600 × 1600 px |
| `producto3` | Empaque rígido AGO Privilège con sello | 1:1 | 1600 × 1600 px |
| `entrega1` | Entrega personal en estación de metro CDMX / DiDi | 16:9 | 1920 × 1080 px |
| `cta` | Fondo de llamada a la acción final | 21:9 o 16:9 | 2400 × 1000 px |

Si un archivo no existe, el componente `<Foto />` mostrará un render artístico de respaldo (iris macro recortado o degradado texturizado con grano editorial).
