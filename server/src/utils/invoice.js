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

module.exports = { generateInvoicePDF };
