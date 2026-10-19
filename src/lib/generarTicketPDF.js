import { jsPDF } from 'jspdf';

/**
 * Genera y descarga un ticket de compra boutique en PDF de alta calidad
 * con diseño editorial, logotipo, desglose óptico OD/OI y datos bancarios.
 * @param {Object} pedido - Objeto con datos del pedido (id, fecha, clienta, items, totales, entrega)
 */
export function generarTicketPDF(pedido) {
  if (!pedido) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 22;

  // Paleta de colores boutique
  const colorGold = [176, 141, 87]; // #B08D57
  const colorDark = [26, 22, 19];   // #1A1613
  const colorMuted = [115, 107, 98]; // #736B62
  const colorBgLight = [247, 245, 240]; // #F7F5F0

  // 1. CABECERA BOUTIQUE
  doc.setFillColor(...colorDark);
  doc.rect(margin, y, contentWidth, 24, 'F');

  doc.setTextColor(245, 239, 228);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('PUPILENTES AGO · CDMX', margin + 8, y + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(217, 190, 133); // Gilt
  doc.text('BOUTIQUE DE LENTES DE CONTACTO Y SALUD VISUAL', margin + 8, y + 16);

  doc.setTextColor(245, 239, 228);
  doc.setFontSize(9);
  doc.text('ORDEN DE COMPRA', pageWidth - margin - 8, y + 10, { align: 'right' });
  doc.setFont('helvetica', 'bold');
  doc.text(`#${pedido.id || 'PEDIDO'}`, pageWidth - margin - 8, y + 16, { align: 'right' });

  y += 32;

  // 2. METADATOS DEL PEDIDO Y CLIENTA (DOS COLUMNAS)
  doc.setFillColor(...colorBgLight);
  doc.rect(margin, y, contentWidth, 34, 'F');

  // Columna Izquierda: Datos de la Clienta
  doc.setTextColor(...colorDark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('CLIENTA / DESTINATARIA:', margin + 6, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  const nombreClienta = pedido.cliente?.nombre || pedido.nombre || 'Clienta Pupilentes AGO';
  doc.text(nombreClienta, margin + 6, y + 13);

  doc.setFontSize(8.5);
  doc.setTextColor(...colorMuted);
  const telClienta = pedido.cliente?.whatsapp || pedido.telefono || 'Sin teléfono';
  doc.text(`WhatsApp: ${telClienta}`, margin + 6, y + 19);
  doc.text(`Canal: ${pedido.canal || 'Tienda Web Oficial'}`, margin + 6, y + 25);

  // Columna Derecha: Datos de Entrega y Fecha
  doc.setTextColor(...colorDark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('DETALLES DE ENTREGA:', margin + 85, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...colorDark);
  const metodoEntrega = pedido.entrega?.metodo || pedido.metodoEntrega || 'Entrega Personal CDMX';
  doc.text(`Método: ${metodoEntrega}`, margin + 85, y + 13);

  doc.setTextColor(...colorMuted);
  const fechaStr = pedido.fecha ? new Date(pedido.fecha).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleDateString('es-MX');
  doc.text(`Fecha: ${fechaStr}`, margin + 85, y + 19);

  const direccion = pedido.entrega?.direccion || pedido.direccion || 'Metro Pantitlán / Tepalcates';
  const direccionCorta = direccion.length > 45 ? direccion.substring(0, 42) + '...' : direccion;
  doc.text(`Lugar: ${direccionCorta}`, margin + 85, y + 25);

  y += 42;

  // 3. TABLA DE PRODUCTOS
  // Cabecera de la tabla
  doc.setFillColor(...colorGold);
  doc.rect(margin, y, contentWidth, 7, 'F');

  doc.setTextColor(26, 22, 19);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('PRODUCTO / MODELO', margin + 4, y + 4.8);
  doc.text('GRADUACIÓN ÓPTICA', margin + 70, y + 4.8);
  doc.text('CANT.', margin + 118, y + 4.8, { align: 'center' });
  doc.text('PRECIO', margin + 140, y + 4.8, { align: 'right' });
  doc.text('TOTAL', pageWidth - margin - 4, y + 4.8, { align: 'right' });

  y += 7;

  // Filas de productos
  const items = pedido.items || pedido.productos || [];
  let subtotal = 0;

  items.forEach((item, index) => {
    const isEven = index % 2 === 0;
    if (isEven) {
      doc.setFillColor(252, 251, 248);
      doc.rect(margin, y, contentWidth, 12, 'F');
    }

    doc.setTextColor(...colorDark);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(item.nombre || 'Lente de Contacto', margin + 4, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...colorMuted);
    const tipoStr = item.tipo || item.familiaColor || 'Graduado';
    doc.text(`Categoría: ${tipoStr}`, margin + 4, y + 9.5);

    // Graduación OD / OI
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...colorDark);
    const odText = item.od !== undefined ? `OD: ${item.od}` : 'OD: Plano';
    const oiText = item.oi !== undefined ? `OI: ${item.oi}` : 'OI: Plano';
    doc.text(`${odText}  |  ${oiText}`, margin + 70, y + 7);

    // Cantidad
    const cant = item.cantidad || 1;
    doc.text(String(cant), margin + 118, y + 7, { align: 'center' });

    // Precio Unitario
    const precio = item.precioUnitario || item.precio || 649;
    doc.text(`$${Number(precio).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, margin + 140, y + 7, { align: 'right' });

    // Total renglón
    const totalLinea = item.subtotal || (precio * cant);
    subtotal += totalLinea;
    doc.setFont('helvetica', 'bold');
    doc.text(`$${Number(totalLinea).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, pageWidth - margin - 4, y + 7, { align: 'right' });

    // Línea separadora tenue
    doc.setDrawColor(230, 225, 218);
    doc.line(margin, y + 12, pageWidth - margin, y + 12);

    y += 12;
  });

  y += 4;

  // 4. TOTALES (Alineados a la derecha)
  const costoEnvio = pedido.totales?.envio !== undefined ? pedido.totales.envio : (pedido.costoEnvio || 0);
  const descuento = pedido.totales?.descuento || pedido.descuento || 0;
  const granTotal = pedido.totales?.total || pedido.total || (subtotal + costoEnvio - descuento);

  const startTotalsX = pageWidth - margin - 75;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...colorMuted);

  // Subtotal
  doc.text('Subtotal:', startTotalsX, y + 4);
  doc.text(`$${Number(subtotal).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`, pageWidth - margin - 4, y + 4, { align: 'right' });

  // Envío
  doc.text(`Envío (${metodoEntrega.split(' ')[0]}):`, startTotalsX, y + 9);
  const envioStr = costoEnvio === 0 ? 'GRATIS ($0.00)' : `$${Number(costoEnvio).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`;
  doc.text(envioStr, pageWidth - margin - 4, y + 9, { align: 'right' });

  // Descuento si aplica
  let totalOffset = 15;
  if (descuento > 0) {
    doc.setTextColor(34, 139, 34);
    doc.text('Descuento aplicado:', startTotalsX, y + 14);
    doc.text(`-$${Number(descuento).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`, pageWidth - margin - 4, y + 14, { align: 'right' });
    totalOffset = 20;
  }

  // Recuadro Gran Total
  doc.setFillColor(...colorDark);
  doc.rect(startTotalsX - 4, y + totalOffset - 2, 79, 10, 'F');

  doc.setTextColor(245, 239, 228);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('TOTAL A PAGAR:', startTotalsX, y + totalOffset + 4.5);
  doc.setTextColor(217, 190, 133); // Gilt
  doc.text(`$${Number(granTotal).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`, pageWidth - margin - 4, y + totalOffset + 4.5, { align: 'right' });

  y += totalOffset + 18;

  // 5. CAJA DE DATOS BANCARIOS PARA PAGO / TRANSFERENCIA
  doc.setFillColor(...colorBgLight);
  doc.setDrawColor(...colorGold);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentWidth, 32, 2, 2, 'FD');

  doc.setTextColor(...colorDark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('DATOS PARA PAGO O TRANSFERENCIA BANCARIA (SPEI)', margin + 6, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...colorMuted);
  doc.text('Banco Destino: ', margin + 6, y + 14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colorDark);
  doc.text('BBVA México', margin + 34, y + 14);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colorMuted);
  doc.text('Titular de la Cuenta: ', margin + 6, y + 20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colorDark);
  doc.text('Pupilentes AGO Oficial', margin + 34, y + 20);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colorMuted);
  doc.text('CLABE Interbancaria: ', margin + 6, y + 26);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colorGold);
  doc.text('0121 8001 5489 7231 09', margin + 34, y + 26);

  // Concepto al lado derecho
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colorMuted);
  doc.text('Concepto de Pago:', margin + 95, y + 14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colorDark);
  doc.text(`#${pedido.id}`, margin + 128, y + 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...colorMuted);
  doc.text('Envía tu comprobante por WhatsApp para agilizar', margin + 95, y + 21);
  doc.text('la preparación y entrega de tu pedido.', margin + 95, y + 26);

  y += 40;

  // 6. PIE DE PÁGINA
  doc.setDrawColor(220, 215, 208);
  doc.line(margin, y, pageWidth - margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text('Pupilentes AGO · Boutique de Salud Visual y Estética Ocular · Ciudad de México', margin, y + 6);
  doc.text('Atención directa y asesoría WhatsApp: 55 7111 3508 · pupilentesago.com', margin, y + 13);

  // Guardar archivo PDF con nombre descriptivo
  const fileName = `Ticket-Pupilentes-AGO-${pedido.id || 'Pedido'}.pdf`;
  doc.save(fileName);
}

export default generarTicketPDF;
