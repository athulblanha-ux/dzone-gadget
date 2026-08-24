const PDFDocument = require('pdfkit');

/**
 * Generate a GST-ready PDF invoice for an order
 * @param {object} order - Populated order document
 * @returns {Promise<Buffer>} PDF buffer
 */
const generateInvoicePDF = (order) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // ─── Header ────────────────────────────────────────────────────────────
      doc
        .fontSize(24)
        .fillColor('#FF6B6B')
        .text('DZONE GADGET', 50, 50)
        .fontSize(10)
        .fillColor('#666')
        .text('Where Play Comes to Life', 50, 80)
        .text('www.dzonegadgetindia.com | support@dzonegadgetindia.com', 50, 95);

      doc
        .fontSize(20)
        .fillColor('#1a1a2e')
        .text('INVOICE', 400, 50, { align: 'right' })
        .fontSize(10)
        .fillColor('#666')
        .text(`Invoice #: ${order.invoiceNumber || order.orderNumber}`, 400, 80, { align: 'right' })
        .text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 400, 95, { align: 'right' });

      // ─── Divider ────────────────────────────────────────────────────────────
      doc.moveTo(50, 120).lineTo(545, 120).strokeColor('#eee').stroke();

      // ─── Bill To ────────────────────────────────────────────────────────────
      doc
        .fontSize(11)
        .fillColor('#1a1a2e')
        .font('Helvetica-Bold')
        .text('Bill To:', 50, 135)
        .font('Helvetica')
        .fillColor('#444')
        .text(order.shippingAddress.fullName, 50, 152)
        .text(order.shippingAddress.addressLine1, 50, 167)
        .text(`${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`, 50, 182)
        .text(`Phone: ${order.shippingAddress.phone}`, 50, 197);

      // ─── Order Info ─────────────────────────────────────────────────────────
      doc
        .font('Helvetica-Bold')
        .fillColor('#1a1a2e')
        .text('Order Details:', 350, 135)
        .font('Helvetica')
        .fillColor('#444')
        .text(`Order No: ${order.orderNumber}`, 350, 152)
        .text(`Payment: ${order.paymentMethod.toUpperCase()}`, 350, 167)
        .text(`Status: ${order.paymentStatus.toUpperCase()}`, 350, 182);

      // ─── Items Table ────────────────────────────────────────────────────────
      const tableTop = 230;
      doc.moveTo(50, tableTop).lineTo(545, tableTop).strokeColor('#eee').stroke();

      // Headers
      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor('#1a1a2e')
        .text('Item', 50, tableTop + 10)
        .text('Qty', 350, tableTop + 10)
        .text('Price', 410, tableTop + 10)
        .text('Total', 480, tableTop + 10);

      doc.moveTo(50, tableTop + 28).lineTo(545, tableTop + 28).strokeColor('#eee').stroke();

      let y = tableTop + 38;
      doc.font('Helvetica').fillColor('#444');

      for (const item of order.items) {
        const lineTotal = item.price * item.quantity;

        doc
          .text(item.name.substring(0, 45), 50, y)
          .text(item.quantity.toString(), 350, y)
          .text(`₹${item.price.toFixed(2)}`, 410, y)
          .text(`₹${lineTotal.toFixed(2)}`, 480, y);

        y += 22;
        if (y > 700) { doc.addPage(); y = 50; }
      }

      doc.moveTo(50, y).lineTo(545, y).strokeColor('#eee').stroke();
      y += 12;

      // ─── Totals ─────────────────────────────────────────────────────────────
      const addRow = (label, value, bold = false) => {
        doc
          .font(bold ? 'Helvetica-Bold' : 'Helvetica')
          .fillColor(bold ? '#1a1a2e' : '#555')
          .text(label, 380, y)
          .text(value, 480, y);
        y += 20;
      };

      addRow('Subtotal:', `₹${order.subtotal.toFixed(2)}`);
      addRow('Shipping:', order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee.toFixed(2)}`);
      if (order.codFee > 0) addRow('COD Fee:', `₹${order.codFee.toFixed(2)}`);
      if (order.discountAmount > 0) addRow('Discount:', `-₹${order.discountAmount.toFixed(2)}`);
      doc.moveTo(380, y).lineTo(545, y).strokeColor('#ccc').stroke();
      y += 8;
      addRow('TOTAL:', `₹${order.total.toFixed(2)}`, true);

      // ─── Footer ─────────────────────────────────────────────────────────────
      doc
        .fontSize(9)
        .fillColor('#999')
        .text('Thank you for shopping with DSTORE!', 50, 760, { align: 'center' })
        .text('This is a computer-generated invoice. No signature required.', 50, 775, { align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Generate a PDF invoice for a WhatsApp Order
 * @param {object} order - WhatsAppOrder document
 * @returns {Promise<Buffer>} PDF buffer
 */
const generateWhatsAppInvoicePDF = (order) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Header
      doc
        .fontSize(24)
        .fillColor('#059669')
        .text('DSTORE', 50, 50)
        .fontSize(10)
        .fillColor('#666')
        .text('WhatsApp Direct Order Invoice', 50, 80);

      doc
        .fontSize(20)
        .fillColor('#1a1a2e')
        .text('INVOICE', 400, 50, { align: 'right' })
        .fontSize(10)
        .fillColor('#666')
        .text(`Invoice #: ${order.orderNumber}`, 400, 80, { align: 'right' })
        .text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 400, 95, { align: 'right' });

      doc.moveTo(50, 120).lineTo(545, 120).strokeColor('#eee').stroke();

      // Bill To
      const addr = order.shippingAddressSnapshot || {};
      const fullName = addr.recipientName || order.customerName || 'Customer';

      const rawParts = [
        addr.houseFlatBuilding,
        addr.streetLocality,
        addr.landmark,
        addr.city,
        addr.state,
        addr.pincode,
      ].filter((p) => p && p !== 'N/A' && p !== '000000' && p !== 'Kochi' && p !== 'Kerala' && p !== '682030');

      const fullAddrText = rawParts.join(', ') || addr.houseFlatBuilding || 'Address details';
      const phone = addr.phone || order.whatsappNumber;

      doc
        .fontSize(11)
        .fillColor('#1a1a2e')
        .font('Helvetica-Bold')
        .text('Bill To:', 50, 135)
        .font('Helvetica')
        .fillColor('#444')
        .text(fullName, 50, 152)
        .text(fullAddrText.substring(0, 60), 50, 167)
        .text(`WhatsApp: ${phone}`, 50, 184);

      // Order Info
      const payStatus = order.paymentDetails?.status || 'paid';
      const payMethod = order.paymentDetails?.method || 'WhatsApp COD';

      doc
        .font('Helvetica-Bold')
        .fillColor('#1a1a2e')
        .text('Order Details:', 350, 135)
        .font('Helvetica')
        .fillColor('#444')
        .text(`Order No: ${order.orderNumber}`, 350, 152)
        .text(`Payment: ${payMethod}`, 350, 167)
        .text(`Status: ${payStatus.toUpperCase()}`, 350, 182);

      // Items Table
      const tableTop = 230;
      doc.moveTo(50, tableTop).lineTo(545, tableTop).strokeColor('#eee').stroke();

      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor('#1a1a2e')
        .text('Item', 50, tableTop + 10)
        .text('Qty', 350, tableTop + 10)
        .text('Price', 410, tableTop + 10)
        .text('Total', 480, tableTop + 10);

      doc.moveTo(50, tableTop + 28).lineTo(545, tableTop + 28).strokeColor('#eee').stroke();

      let y = tableTop + 38;
      doc.font('Helvetica').fillColor('#444');

      const items = order.items || [];
      for (const item of items) {
        const price = Number(item.unitPrice) || 0;
        const qty = Number(item.quantity) || 1;
        const lineTotal = Number(item.total) || (price * qty);

        doc
          .text((item.name || 'WhatsApp Item').substring(0, 45), 50, y)
          .text(qty.toString(), 350, y)
          .text(`₹${price.toFixed(2)}`, 410, y)
          .text(`₹${lineTotal.toFixed(2)}`, 480, y);

        y += 22;
        if (y > 700) { doc.addPage(); y = 50; }
      }

      doc.moveTo(50, y).lineTo(545, y).strokeColor('#eee').stroke();
      y += 12;

      // Totals
      const grandTotal = Number(order.paymentDetails?.grandTotal) || 0;
      const subtotal = Number(order.paymentDetails?.productAmount) || grandTotal;
      const discount = Number(order.paymentDetails?.discount) || 0;
      const shipping = Number(order.paymentDetails?.shippingCharge) || 0;

      const addRow = (label, value, bold = false) => {
        doc
          .font(bold ? 'Helvetica-Bold' : 'Helvetica')
          .fillColor(bold ? '#1a1a2e' : '#555')
          .text(label, 380, y)
          .text(value, 480, y);
        y += 20;
      };

      addRow('Subtotal:', `₹${subtotal.toFixed(2)}`);
      if (shipping > 0) addRow('Shipping:', `₹${shipping.toFixed(2)}`);
      else addRow('Shipping:', 'FREE');
      if (discount > 0) addRow('Discount:', `-₹${discount.toFixed(2)}`);
      doc.moveTo(380, y).lineTo(545, y).strokeColor('#ccc').stroke();
      y += 8;
      addRow('TOTAL:', `₹${grandTotal.toFixed(2)}`, true);

      // Footer
      doc
        .fontSize(9)
        .fillColor('#999')
        .text('Thank you for shopping with DSTORE!', 50, 760, { align: 'center' })
        .text('This is a computer-generated invoice. No signature required.', 50, 775, { align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Generate a 4x6 Shipping Label PDF for a WhatsApp Order
 * @param {object} order - WhatsAppOrder document
 * @returns {Promise<Buffer>} PDF buffer
 */
const generateShippingLabelPDF = (order) => {
  return new Promise((resolve, reject) => {
    try {
      // 4 x 6 inches in points: 288 x 432 pt
      const doc = new PDFDocument({
        size: [288, 432],
        margin: 10,
      });

      const buffers = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Outer Border
      doc.rect(10, 10, 268, 412).lineWidth(1.5).strokeColor('#000000').stroke();

      // Top Header Bar
      doc.rect(10, 10, 268, 42).fill('#182030');
      doc
        .font('Helvetica-Bold')
        .fontSize(15)
        .fillColor('#FFFFFF')
        .text(`ORDER #${order.orderNumber}`, 18, 23);

      const payStatus = (order.paymentDetails?.status || 'PAID').toUpperCase();
      doc
        .fontSize(11)
        .fillColor('#10B981')
        .text(payStatus === 'PAID' ? 'PREPAID' : payStatus, 175, 24, { align: 'right', width: 95 });

      // 1. SHIP FROM (Sender Address - FIRST)
      doc.rect(10, 52, 268, 108).fill('#F8FAFC');
      doc.rect(10, 52, 268, 108).lineWidth(1).strokeColor('#000000').stroke();

      doc
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .fillColor('#555555')
        .text('SHIP FROM / RETURN ADDRESS:', 18, 59);

      doc
        .font('Helvetica-Bold')
        .fontSize(13.5)
        .fillColor('#000000')
        .text('DSTORE', 18, 71);

      doc
        .font('Helvetica')
        .fontSize(9.5)
        .fillColor('#111111')
        .text(
          '1st Floor Nefna Complex, Near Abhilash Theatre\nMukkam via Calicut, PIN: 673602',
          18,
          88,
          { width: 252, lineGap: 2 }
        );

      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor('#000000')
        .text('PH: 9495302826', 18, 140);

      // 2. SHIP TO (Recipient Address - SECOND)
      doc.rect(10, 160, 268, 150).lineWidth(1).strokeColor('#000000').stroke();

      const addr = order.shippingAddressSnapshot || {};
      const recipientName = addr.recipientName || order.customerName || 'Customer';

      // Build clean address text without hardcoded Kochi/Kerala/682030 fallbacks
      const rawAddressParts = [
        addr.houseFlatBuilding,
        addr.streetLocality,
        addr.landmark,
        addr.city,
        addr.state,
        addr.pincode,
      ].filter((p) => p && p !== 'N/A' && p !== '000000' && p !== 'Kochi' && p !== 'Kerala' && p !== '682030');

      const fullAddressText = rawAddressParts.join(', ') || addr.houseFlatBuilding || 'Address details';
      const phone = addr.phone || order.whatsappNumber;

      doc
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .fillColor('#555555')
        .text('SHIP TO / DELIVER TO:', 18, 168);

      doc
        .font('Helvetica-Bold')
        .fontSize(13.5)
        .fillColor('#000000')
        .text(recipientName.toUpperCase(), 18, 182, { width: 252 });

      doc
        .font('Helvetica')
        .fontSize(9.5)
        .fillColor('#111111')
        .text(fullAddressText, 18, 202, { width: 252, lineGap: 2 });

      doc
        .font('Helvetica-Bold')
        .fontSize(10.5)
        .fillColor('#000000')
        .text(`PH: ${phone}`, 18, 290);

      // 3. PACKAGE CONTENTS (LAST)
      doc.rect(10, 310, 268, 112).lineWidth(1).strokeColor('#000000').stroke();
      doc
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .fillColor('#555555')
        .text('PACKAGE CONTENTS:', 18, 318);

      let itemY = 332;
      const items = order.items || [];
      for (const item of items.slice(0, 3)) {
        doc
          .font('Helvetica-Bold')
          .fontSize(9.5)
          .fillColor('#000000')
          .text(`${item.quantity}x ${item.name}`, 18, itemY, { width: 252 });
        itemY += 15;
      }

      const totalVal = Number(order.paymentDetails?.grandTotal) || 0;
      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor('#000000')
        .text(`VALUE: Rs. ${totalVal.toLocaleString('en-IN')}`, 18, 396);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { generateInvoicePDF, generateWhatsAppInvoicePDF, generateShippingLabelPDF };
