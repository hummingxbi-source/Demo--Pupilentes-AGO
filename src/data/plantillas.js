// Plantillas de mensajes para WhatsApp e Instagram de Pupilentes AGO
// Con soporte para variables dinámicas y apertura directa en WhatsApp

export const PLANTILLAS_MENSAJES = [
  {
    id: "catalogo_precios",
    titulo: "1. Catálogo y precios de bienvenida",
    categoria: "atencion",
    texto: `¡Hola {nombre}! ✨ Bienvenida a Pupilentes AGO · CDMX 👁️\n\nNuestros pupilentes son de duración anual y trimestral, súper cómodos y de aspecto ultra natural o intenso según tu gusto. Tenemos graduación disponible desde 0.00 (cosméticos) hasta -8.00 miopía con graduación independiente por ojo.\n\nPuedes explorar todo nuestro catálogo interactivo y probarte los modelos en vivo con tu cámara aquí:\n👉 {link_catalogo}\n\n¿Buscas algún tono en especial (miel, verde, gris, azul, avellana) o te gustaría que te recomendemos según tu tono de piel? 💛`
  },
  {
    id: "que_incluye",
    titulo: "2. ¿Qué incluye tu pedido?",
    categoria: "atencion",
    texto: `Tu compra de pupilentes en AGO incluye:\n✨ 1 Par de lentes en frascos sellados y estériles\n✨ Estuche antibacterial de regalo\n✨ Pinzas y aplicador ergonómico\n✨ Guía digital de cuidados y colocación paso a paso\n✨ Asesoría personalizada antes y después de tu compra\n\nTambién puedes añadir solución hidratante por solo $129 extra. ¿Te gustaría que te apartemos tu par?`
  },
  {
    id: "pedir_cp",
    titulo: "3. Pedir Código Postal y Colonia para cotizar",
    categoria: "envios",
    texto: `¡Excelente elección {nombre}! Para cotizar tu envío a la medida o coordinar tu entrega personal en CDMX:\n\n📍 Si estás en CDMX: Entregamos sin costo en Metro Pantitlán y Metro Tepalcates, o en otra estación con un pequeño costo de $45.\n🚗 Si prefieres DiDi: Enviamos en menos de 1 hora en CDMX.\n📦 Si es por Paquetería: ¿Me podrías compartir tu Código Postal y Colonia? Con gusto te paso opciones económicas y express.`
  },
  {
    id: "cuentas_pago",
    titulo: "4. Datos para transferencia o depósito",
    categoria: "pago",
    texto: `Perfecto {nombre}, tu pedido por {total} está apartado. Te comparto las cuentas para tu pago:\n\n🏦 BBVA México\nCLABE: {clabe_bbva}\nBeneficiaria: Araceli Garrido Ortiz\n\n📱 Mercado Pago / Transferencia\nCLABE / CVU: {clabe_mp}\n\nPor favor envíame foto o captura de tu comprobante en cuanto lo tengas para verificarlo de inmediato y preparar tu paquete. ¡Muchas gracias por tu confianza!`
  },
  {
    id: "confirmacion_pago",
    titulo: "5. Pago confirmado exitosamente",
    categoria: "pago",
    texto: `¡Listo {nombre}! 💛 Tu pago por {total} ha sido verificado con éxito.\nTu número de orden es: #{pedido_id}.\n\nTu pedido de {modelo} ya está en preparación en nuestro taller boutique.`
  },
  {
    id: "datos_guia",
    titulo: "6. Solicitud de datos para la guía de envío",
    categoria: "envios",
    texto: `Para generar tu guía de paquetería de forma automática, por favor ayúdanos confirmando los siguientes datos:\n\n• Nombre completo de quien recibe:\n• Teléfono de contacto:\n• Calle y número exterior/interior:\n• Colonia y Código Postal:\n• Referencias del domicilio (color de fachada o entre calles):`
  },
  {
    id: "guia_generada",
    titulo: "7. Aviso de envío y número de guía",
    categoria: "envios",
    texto: `¡Buenas noticias {nombre}! 📦 Tu paquete de Pupilentes AGO ya está en camino.\n\nPaquetería: {paqueteria}\nNúmero de guía: {guia}\nPuedes rastrear tu paquete en tiempo real aquí:\n👉 {link_tracking}\n\nCualquier duda en la colocación cuando te lleguen, ¡aquí estamos para ayudarte!`
  },
  {
    id: "recordatorio_renovacion",
    titulo: "8. Recordatorio de renovación de lentes",
    categoria: "recompra",
    texto: `¡Hola {nombre}! 👋 Te escribe Araceli de Pupilentes AGO. Notamos que tus lentes {modelo} están por cumplir su tiempo recomendado de uso en {dias} días.\n\nPara cuidar la salud de tu córnea es ideal renovarlos a tiempo. Tienes {puntos} Puntos AGO acumulados que puedes canjear hoy mismo por un descuento directo o un estuche joyero gratis.\n\n¿Te preparo el mismo pedido con tu graduación habitual? 💛`
  }
];

// Reemplazo de variables
export const procesarPlantilla = (plantillaTexto, variables = {}) => {
  let resultado = plantillaTexto;
  Object.keys(variables).forEach((key) => {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    resultado = resultado.replace(regex, variables[key] || '');
  });
  return resultado;
};

// Generador de enlace de WhatsApp
export const generarEnlaceWhatsApp = (telefono = "525571113508", texto = "") => {
  const telLimpio = telefono.replace(/\D/g, '');
  return `https://wa.me/${telLimpio}?text=${encodeURIComponent(texto)}`;
};
