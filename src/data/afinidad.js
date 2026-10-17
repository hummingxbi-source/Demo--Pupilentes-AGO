// Algoritmo de recomendación y afinidad de color para Eye Lab (Pupilentes AGO)

export const PREGUNTAS_QUIZ = [
  {
    id: "tonoPiel",
    titulo: "¿Cuál es tu tono de piel aproximado?",
    subtitulo: "Para encontrar los matices que armonicen con tu calidez o frialdad natural",
    tipo: "colores",
    opciones: [
      { id: "porcelana", label: "Porcelana Muy Claro", hex: "#F7E1D7", sub: "Subtono frío o neutro" },
      { id: "marfil", label: "Marfil Claro", hex: "#F3D5B5", sub: "Subtono cálido o rosado" },
      { id: "beige", label: "Beige Natural", hex: "#E7BC91", sub: "Subtono dorado neutro" },
      { id: "medio_calido", label: "Medio Cálido", hex: "#D4A373", sub: "Tono trigueño claro latino" },
      { id: "canela", label: "Canela / Trigueño", hex: "#BB8557", sub: "Dorado tostado" },
      { id: "bronce", label: "Bronce Profundo", hex: "#9C6644", sub: "Cálido vibrante" },
      { id: "moreno", label: "Moreno Cálido", hex: "#7F4F24", sub: "Rico en pigmentos cálidos" },
      { id: "ebano", label: "Ébano Profundo", hex: "#582F0E", sub: "Intenso y luminoso" }
    ]
  },
  {
    id: "colorOjos",
    titulo: "¿Cuál es tu color natural de ojos?",
    subtitulo: "Nuestros lentes tienen opacidad estudiada para cubrir o fusionarse con tu base",
    tipo: "selector",
    opciones: [
      { id: "negro", label: "Casi Negro / Café Muy Oscuro", hex: "#1A0F07", desc: "El más común en México, requiere buena cobertura peripupilar" },
      { id: "castano_oscuro", label: "Castaño Oscuro Profundo", hex: "#2E1A0C", desc: "Base rica que da calidez a tonos miel y verdes" },
      { id: "castano_medio", label: "Castaño Medio Chocolate", hex: "#523218", desc: "Permite transiciones suaves y naturales" },
      { id: "avellana", label: "Avellana con destellos verdes", hex: "#6F4E24", desc: "Los colores claros resaltan con facilidad" },
      { id: "claro", label: "Verde o Azul Claro natural", hex: "#4C6B5C", desc: "Buscas intensificar o cambiar de tono" }
    ]
  },
  {
    id: "efecto",
    titulo: "¿Qué efecto buscas provocar?",
    subtitulo: "¿Quieres que piensen que naciste con ellos o buscas un impacto wow?",
    tipo: "cards",
    opciones: [
      { id: "natural", icon: "Sparkles", label: "Natural Indetectable", desc: "Luz y reflejo sutil que nadie sepa que son pupilentes." },
      { id: "glam", icon: "Crown", label: "Mirada Glam & Luminosa", desc: "Ojos con brillo hipnótico ideal para fotos y eventos especiales." },
      { id: "intenso", icon: "Flame", label: "Cambio Radical & Penetrante", desc: "Color evidente, definido y llamativo incluso desde lejos." },
      { id: "editorial", icon: "Camera", label: "Moda, Cosplay & Fotos", desc: "Tono de pasarela, perfecto para creadoras de contenido." }
    ]
  },
  {
    id: "ocasion",
    titulo: "¿Para qué ocasión los usarás principalmente?",
    subtitulo: "Esto define la comodidad de diámetro y el tipo de anillo limbal",
    tipo: "cards",
    opciones: [
      { id: "diario", icon: "Sun", label: "Uso Diario y Trabajo", desc: "Elegante, sobrio y compatible con jornadas de 8+ horas." },
      { id: "fiesta", icon: "Wine", label: "Fiestas y Vida Nocturna", desc: "Pigmentos que capturan la luz tenue y de discoteca." },
      { id: "fotografia", icon: "Camera", label: "Sesiones de Fotos y TikTok", desc: "Lentes que no se ven planos frente al aro de luz o flash." },
      { id: "especial", icon: "Heart", label: "Bodas, Graduación o Citas", desc: "El complemento perfecto para maquillaje profesional." }
    ]
  },
  {
    id: "intensidad",
    titulo: "Nivel de cobertura del iris",
    subtitulo: "Desliza para elegir entre translucidez acuarelada o pigmento puro",
    tipo: "slider",
    min: 1,
    max: 3,
    labels: ["Sutil / Translúcido", "Equilibrado / Radiante", "Cobertura Total / Opaco"]
  }
];

// Función de puntaje que evalúa afinidad de un producto frente a las respuestas
export const calcularRecomendacion = (respuestas, productos) => {
  const { tonoPiel, colorOjos, efecto, ocasion, intensidad } = respuestas;

  const resultados = productos.map((producto) => {
    let score = 70; // Base score

    // 1. Afinidades por tono de piel
    if (["medio_calido", "canela", "bronce", "moreno"].includes(tonoPiel)) {
      if (["miel", "avellana", "verde"].includes(producto.familia)) score += 18;
      if (producto.familia === "gris" && producto.tonalidad === "natural") score += 12;
    } else if (["porcelana", "marfil", "beige"].includes(tonoPiel)) {
      if (["azul", "gris", "verde"].includes(producto.familia)) score += 18;
      if (producto.familia === "miel") score += 14;
    } else if (tonoPiel === "ebano") {
      if (["avellana", "miel", "gris"].includes(producto.familia)) score += 20;
    }

    // 2. Afinidades por color de ojos natural
    if (["negro", "castano_oscuro"].includes(colorOjos)) {
      // Necesita buena cobertura o halo peripupilar
      if (producto.anilloLimbal) score += 8;
      if (producto.id === "miel-satin" || producto.id === "avellana-ambar" || producto.id === "verde-esmeralda") score += 10;
    }

    // 3. Efecto
    if (efecto === "natural") {
      if (producto.tonalidad === "natural") score += 16;
      if (!producto.anilloLimbal) score += 8;
    } else if (efecto === "glam" || efecto === "intenso") {
      if (producto.tonalidad === "intenso") score += 16;
      if (producto.anilloLimbal) score += 6;
    } else if (efecto === "editorial") {
      if (producto.tonalidad === "cosmetico" || producto.familia === "violeta" || producto.id === "perla-ahumada") score += 22;
    }

    // 4. Intensidad deseada
    if (intensidad === 1 && producto.tonalidad === "natural") score += 10;
    if (intensidad === 3 && (producto.tonalidad === "intenso" || producto.tonalidad === "cosmetico")) score += 12;

    // Normalizar a escala 82% - 99%
    const matchPercent = Math.min(99, Math.max(82, Math.round(score)));

    // Razón editorial personalizada
    let razon = "Equilibrio armónico con tu fisionomía.";
    if (producto.familia === "miel") {
      razon = "Aporta calidez inmediata, ilumina ojos oscuros y suaviza los rasgos bajo cualquier iluminación.";
    } else if (producto.familia === "verde") {
      razon = "Genera un contraste joya sofisticado con subtonos cálidos, dando profundidad hipnótica.";
    } else if (producto.familia === "gris") {
      razon = "Crea una mirada cuarzo editorial que refleja la luz en fotos y videos de forma espectacular.";
    } else if (producto.familia === "azul") {
      razon = "Efecto zafiro real que resalta la mirada sin verse plano o artificial frente a luces de noche.";
    } else if (producto.familia === "avellana") {
      razon = "Fusión indetectable de pigmentos cálidos; nadie sabrá si son tus ojos reales o pupilentes.";
    } else if (producto.familia === "violeta") {
      razon = "Mirada misteriosa de alta gama, ideal para makeup artístico, eventos y creadoras de contenido.";
    }

    return {
      producto,
      matchPercent,
      razon
    };
  });

  // Ordenar de mayor a menor y tomar Top 3
  resultados.sort((a, b) => b.matchPercent - a.matchPercent);
  return resultados.slice(0, 3);
};
