package com.invoiceacumen.service;

import com.invoiceacumen.entity.Address;
import com.invoiceacumen.entity.Order;
import com.invoiceacumen.entity.OrderItem;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;

@Service
public class InvoiceService {

    private static final float MARGIN = 50;
    private static final float PAGE_WIDTH = PDRectangle.A4.getWidth();
    private static final float PAGE_HEIGHT = PDRectangle.A4.getHeight();
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm");

    public byte[] generateInvoice(Order order) throws IOException {
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);
            PDPageContentStream cs = new PDPageContentStream(document, page);

            PDType1Font bold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
            PDType1Font regular = new PDType1Font(Standard14Fonts.FontName.HELVETICA);

            float y = PAGE_HEIGHT - MARGIN;

            // Header
            y = writeText(cs, bold, 20, MARGIN, y, "INVOICE ACUMEN");
            y = writeText(cs, regular, 10, MARGIN, y - 4, "Pharmacy Billing & Invoice Management");
            y -= 15;

            String invoiceLabel = order.getInvoiceNumber() != null ? order.getInvoiceNumber() : "INV-" + order.getId();
            String orderLabel = order.getOrderNumber() != null ? order.getOrderNumber() : "ORD-" + order.getId();
            y = writeText(cs, bold, 13, MARGIN, y, "Invoice #" + invoiceLabel);
            y = writeText(cs, regular, 10, MARGIN, y - 2, "Order #" + orderLabel);
            y = writeText(cs, regular, 10, MARGIN, y - 2, "Order Date: " + order.getOrderDate().format(DATE_FORMAT));
            if (order.getExpectedDeliveryDate() != null) {
                y = writeText(cs, regular, 10, MARGIN, y - 2, "Expected Delivery: " + order.getExpectedDeliveryDate());
            }
            y = writeText(cs, regular, 10, MARGIN, y - 2, "Order Status: " + order.getStatus());
            y = writeText(cs, regular, 10, MARGIN, y - 2, "Payment: " + order.getPaymentMethod() + " (" + order.getPaymentStatus() + ")");
            y -= 15;

            // Bill To
            y = writeText(cs, bold, 12, MARGIN, y, "Bill To");
            Address addr = order.getDeliveryAddress();
            String billName = addr != null && addr.getFullName() != null ? addr.getFullName()
                    : (order.getUser() != null ? order.getUser().getName() : "N/A");
            y = writeText(cs, regular, 10, MARGIN, y - 2, billName);
            if (addr != null && addr.getPhone() != null) {
                y = writeText(cs, regular, 10, MARGIN, y - 2, addr.getPhone());
            } else if (order.getUser() != null) {
                y = writeText(cs, regular, 10, MARGIN, y - 2, order.getUser().getEmail());
            }
            if (addr != null) {
                String house = addr.getHouseNo() != null ? addr.getHouseNo() + ", " : "";
                String building = addr.getBuildingName() != null && !addr.getBuildingName().isBlank() ? addr.getBuildingName() + ", " : "";
                String streetNo = addr.getStreetNo() != null && !addr.getStreetNo().isBlank() ? addr.getStreetNo() + " " : "";
                y = writeText(cs, regular, 10, MARGIN, y - 2, house + building + streetNo + safe(addr.getStreetName()));
                String landmark = addr.getLandmark() != null && !addr.getLandmark().isBlank() ? " (Near " + addr.getLandmark() + ")" : "";
                y = writeText(cs, regular, 10, MARGIN, y - 2, safe(addr.getArea()) + landmark);
                y = writeText(cs, regular, 10, MARGIN, y - 2, addr.getCity() + ", " + addr.getState() + " - " + addr.getPincode() + ", " + addr.getCountry());
            }
            y -= 20;

            // Table header
            float col1 = MARGIN;
            float col2 = MARGIN + 250;
            float col3 = MARGIN + 330;
            float col4 = MARGIN + 420;

            cs.setLineWidth(0.5f);
            cs.moveTo(MARGIN, y);
            cs.lineTo(PAGE_WIDTH - MARGIN, y);
            cs.stroke();
            y -= 15;

            writeText(cs, bold, 10, col1, y, "Item");
            writeText(cs, bold, 10, col2, y, "Qty");
            writeText(cs, bold, 10, col3, y, "Unit Price");
            writeText(cs, bold, 10, col4, y, "Subtotal");
            y -= 5;

            cs.moveTo(MARGIN, y);
            cs.lineTo(PAGE_WIDTH - MARGIN, y);
            cs.stroke();
            y -= 15;

            for (OrderItem item : order.getItems()) {
                if (y < MARGIN + 100) {
                    cs.close();
                    PDPage newPage = new PDPage(PDRectangle.A4);
                    document.addPage(newPage);
                    cs = new PDPageContentStream(document, newPage);
                    y = PAGE_HEIGHT - MARGIN;
                }
                String name = item.getProduct() != null ? item.getProduct().getName() : "Product";
                writeText(cs, regular, 10, col1, y, truncate(name, 38));
                writeText(cs, regular, 10, col2, y, String.valueOf(item.getQuantity()));
                writeText(cs, regular, 10, col3, y, formatMoney(item.getUnitPrice()));
                writeText(cs, regular, 10, col4, y, formatMoney(item.getSubtotal()));
                y -= 18;
            }

            y -= 10;
            cs.moveTo(MARGIN, y);
            cs.lineTo(PAGE_WIDTH - MARGIN, y);
            cs.stroke();
            y -= 20;

            float labelX = PAGE_WIDTH - MARGIN - 180;
            float valueX = PAGE_WIDTH - MARGIN - 70;

            if (order.getSubtotalAmount() != null) {
                writeText(cs, regular, 10, labelX, y, "Subtotal:");
                writeText(cs, regular, 10, valueX, y, formatMoney(order.getSubtotalAmount()));
                y -= 16;
            }
            if (order.getDiscountAmount() != null && order.getDiscountAmount().signum() > 0) {
                String label = "Discount" + (order.getCouponCode() != null ? " (" + order.getCouponCode() + ")" : "") + ":";
                writeText(cs, regular, 10, labelX, y, label);
                writeText(cs, regular, 10, valueX, y, "-" + formatMoney(order.getDiscountAmount()));
                y -= 16;
            }
            if (order.getGstAmount() != null && order.getGstAmount().signum() > 0) {
                writeText(cs, regular, 10, labelX, y, "GST (18%):");
                writeText(cs, regular, 10, valueX, y, formatMoney(order.getGstAmount()));
                y -= 16;
            }
            if (order.getDeliveryCharge() != null) {
                writeText(cs, regular, 10, labelX, y, "Delivery Charge:");
                writeText(cs, regular, 10, valueX, y, order.getDeliveryCharge().signum() > 0 ? formatMoney(order.getDeliveryCharge()) : "FREE");
                y -= 16;
            }
            writeText(cs, bold, 12, labelX, y, "Total:");
            writeText(cs, bold, 12, valueX, y, formatMoney(order.getTotalAmount()));

            cs.close();
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            document.save(out);
            return out.toByteArray();
        }
    }

    private float writeText(PDPageContentStream cs, PDType1Font font, float size, float x, float y, String text) throws IOException {
        cs.beginText();
        cs.setFont(font, size);
        cs.newLineAtOffset(x, y);
        cs.showText(text == null ? "" : text);
        cs.endText();
        return y;
    }

    private String safe(String s) {
        return s == null ? "" : s;
    }

    private String truncate(String s, int max) {
        if (s == null) return "";
        return s.length() > max ? s.substring(0, max - 1) + "…" : s;
    }

    private String formatMoney(java.math.BigDecimal amount) {
        return "Rs. " + amount.setScale(2, java.math.RoundingMode.HALF_UP).toPlainString();
    }
}
