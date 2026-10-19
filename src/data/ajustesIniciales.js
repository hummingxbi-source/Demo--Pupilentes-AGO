// Ajustes y configuración general de Pupilentes AGO
// Versión 3.0: Incorpora las 5 preguntas abiertas del negocio como parámetros configurables

export const AJUSTES_INICIALES = {
  nombreNegocio: "Pupilentes AGO",
  slogan: "Tienda online CDMX · Lentes de contacto de color",
  fundadora: "Araceli Garrido Ortiz",
  telefonoWhatsApp: "525571113508",
  instagram: "@pupilentes.ago.cdmx",
  tiktok: "@pupilentes_ago",
  mercadolibre: "Pupilentes AGO Oficial",

  // -------------------------------------------------------------
  // PREGUNTAS ABIERTAS DEL NEGOCIO (Configurables sin suposiciones)
  // -------------------------------------------------------------
  // 1. ¿Graduación en pasos de 0.25 o 0.50?
  pasoGraduacion: 0.25, // 0.25 | 0.50

  // 2. ¿Los graduados son de color, transparentes o ambos?
  tipoGraduadosDisponibles: "color", // 'color' | 'transparentes' | 'ambos'

  // 3. ¿Estéticos y fantasía también existen graduados?
  permitirGraduacionEsteticosFantasia: false, // true | false

  // 4. ¿Costo de entrega en Pantitlán / Tepalcates?
  costoEntregaPantitlanTepalcates: 0.00, // 0.00 = Gratis | número en MXN

  // 5. ¿Cuáles fotos de Instagram son propias y cuáles de proveedores?
  origenFotosCatalogo: "mixto", // 'propias' | 'proveedores' | 'mixto'

  // Cuentas de banco para transferencia
  cuentasPago: [
    {
      banco: "BBVA México",
      tipo: "Transferencia SPEI (CLABE)",
      numero: "012 180 01548291029 3",
      titular: "Araceli Garrido Ortiz",
      conceptoSugerido: "Tu nombre o Pedido AGO"
    },
    {
      banco: "Mercado Pago",
      tipo: "CVU / Transferencia directa",
      numero: "0000003100098471625341",
      titular: "Araceli Garrido",
      conceptoSugerido: "Pupilentes AGO"
    },
    {
      banco: "Banco Azteca",
      tipo: "Depósito en OXXO o Banco Azteca",
      numero: "127 180 00192837482 1",
      titular: "Araceli Garrido Ortiz",
      conceptoSugerido: "Pago pupilentes"
    }
  ],

  // Horarios de entrega configurables por método
  horariosEntrega: [
    { id: 'metro', label: 'Metro Pantitlán / Tepalcates', horarios: ['10:00–14:00', '15:00–19:00'] },
    { id: 'didi', label: 'DiDi Express', horarios: ['Cualquier hora con 2h de aviso'] },
    { id: 'paqueteria', label: 'Paquetería', horarios: ['Lunes a viernes, recolección antes de 13:00'] }
  ],

  // Entregas personales en Metro CDMX
  entregasMetro: {
    estacionesGratuitas: [
      { id: "pantitlan", nombre: "Metro Pantitlán (Líneas 1, 5, 9, A)", costo: 0 },
      { id: "tepalcates", nombre: "Metro Tepalcates (Línea A)", costo: 0 }
    ],
    costoOtraEstacion: 45.00,
    diasEntrega: ["Lunes a Viernes de 15:00 a 19:00 hrs", "Sábados de 11:00 a 16:00 hrs"]
  },

  // Paqueterías simuladas (tarifas base aproximadas)
  tarifasPaqueteria: {
    cdmxLocal: { estandar: 95.00, express: 135.00 },
    edomex: { estandar: 110.00, express: 145.00 },
    nacional: { estandar: 140.00, express: 195.00 }
  },

  // Programa de lealtad: Puntos AGO
  lealtad: {
    pesosPorPunto: 10, // $10 gastados = 1 punto
    niveles: [
      { id: "bronce", nombre: "Bronce", minPuntos: 0, maxPuntos: 299, beneficio: "Acumula 1 punto por cada $10" },
      { id: "plata", nombre: "Plata", minPuntos: 300, maxPuntos: 599, beneficio: "5% de descuento en todos los kits + estuche regalo" },
      { id: "oro", nombre: "Oro VIP", minPuntos: 600, maxPuntos: 9999, beneficio: "10% permanente + Envíos gratis en CDMX" }
    ],
    catalogoCanjes: [
      { id: "canje-estuche", puntos: 150, titulo: "Estuche Joyero con Espejo", valorPesos: 89 },
      { id: "canje-solucion", puntos: 220, titulo: "Solución Multiusos 120 ml", valorPesos: 129 },
      { id: "canje-descuento-100", puntos: 300, titulo: "Bono de $100 MXN en tu pedido", valorPesos: 100 },
      { id: "canje-par-gratis", puntos: 900, titulo: "1 Par de Pupilentes a elección gratis", valorPesos: 649 }
    ]
  },

  // Alertas de inventario
  alertaStockMinimo: 3,

  // Días para aviso de renovación de lentes
  recordatorios: {
    diasAnticipacion: [30, 15, 7, 3]
  }
};

export default AJUSTES_INICIALES;
