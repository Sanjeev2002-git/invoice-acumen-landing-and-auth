package com.invoiceacumen.service;

import com.invoiceacumen.entity.Order;
import com.invoiceacumen.entity.OrderItem;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.UnitValue;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;

@Service
public class InvoicePdfService {

    public byte[] generateInvoicePdf(Order order) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(out);
        PdfDocument pdfDoc = new PdfDocument(writer);
        Document doc = new Document(pdfDoc);

        doc.add(new Paragraph("TAX INVOICE").setBold().setFontSize(18));
        doc.add(new Paragraph("Invoice No: " + order.getInvoiceNumber()));
        doc.add(new Paragraph("Order No: " + order.getOrderNumber()));
        doc.add(new Paragraph("Date: " + order.getOrderDate()));
        doc.add(new Paragraph("Customer: " + order.getUser().getName()));
        doc.add(new Paragraph("Email: " + order.getUser().getEmail()));
        doc.add(new Paragraph(" "));

        Table table = new Table(UnitValue.createPercentArray(new float[]{4, 1, 2, 2}));
        table.setWidth(UnitValue.createPercentValue(100));
        table.addHeaderCell("Item");
        table.addHeaderCell("Qty");
        table.addHeaderCell("Price");
        table.addHeaderCell("Total");

        for (OrderItem item : order.getItems()) {
            table.addCell(item.getProduct().getName());
            table.addCell(String.valueOf(item.getQuantity()));
            table.addCell(item.getUnitPrice().toString());
            table.addCell(item.getUnitPrice().multiply(java.math.BigDecimal.valueOf(item.getQuantity())).toString());
        }
        doc.add(table);

        doc.add(new Paragraph(" "));
        doc.add(new Paragraph("Subtotal: " + order.getSubtotalAmount()));
        doc.add(new Paragraph("GST: " + order.getGstAmount()));
        doc.add(new Paragraph("Delivery: " + order.getDeliveryCharge()));
        doc.add(new Paragraph("Discount: -" + order.getDiscountAmount()));
        doc.add(new Paragraph("Total: " + order.getTotalAmount()).setBold());

        doc.close();
        return out.toByteArray();
    }
}

