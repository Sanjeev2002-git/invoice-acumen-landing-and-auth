package com.invoiceacumen.config;

import com.invoiceacumen.entity.Product;
import com.invoiceacumen.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

/**
 * Seeds the products table with common pharmacy/medical stock on first run.
 * Only inserts if the table is currently empty, so it's safe to leave in place
 * across restarts and won't duplicate data or clobber anything you've added manually.
 */
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final ProductRepository productRepository;

    @Override
    public void run(String... args) {
        if (productRepository.count() > 0) {
            return;
        }

        List<Product> items = List.of(
            // ---- Tablets ----
            product("Paracetamol 500mg", "TAB-PARA-500", "Tablets",
                new BigDecimal("2.50"), 1000, 100,
                "Pain reliever and fever reducer. Strip of 10 tablets, 500mg each. For adult use, common cold and headache relief."),
            product("Ibuprofen 400mg", "TAB-IBU-400", "Tablets",
                new BigDecimal("3.20"), 1000, 100,
                "Non-steroidal anti-inflammatory drug (NSAID) for pain, inflammation and fever. Strip of 10 tablets, 400mg each."),
            product("Amoxicillin 500mg", "TAB-AMOX-500", "Tablets",
                new BigDecimal("6.75"), 1000, 100,
                "Broad-spectrum penicillin antibiotic capsule for bacterial infections. Strip of 10 capsules, 500mg each. Requires prescription."),
            product("Azithromycin 250mg", "TAB-AZI-250", "Tablets",
                new BigDecimal("8.40"), 1000, 100,
                "Macrolide antibiotic used for respiratory and skin infections. Strip of 6 tablets, 250mg each. Requires prescription."),
            product("Cetirizine 10mg", "TAB-CET-10", "Tablets",
                new BigDecimal("1.90"), 1000, 100,
                "Antihistamine for allergy relief, hay fever, and itching. Strip of 10 tablets, 10mg each."),
            product("Metformin 500mg", "TAB-MET-500", "Tablets",
                new BigDecimal("2.10"), 1000, 100,
                "Oral antidiabetic medication for type 2 diabetes management. Strip of 10 tablets, 500mg each. Requires prescription."),
            product("Aspirin 75mg", "TAB-ASP-75", "Tablets",
                new BigDecimal("1.50"), 1000, 100,
                "Low-dose aspirin for cardiovascular protection and blood thinning. Strip of 14 tablets, 75mg each."),
            product("Omeprazole 20mg", "TAB-OME-20", "Tablets",
                new BigDecimal("4.60"), 1000, 100,
                "Proton pump inhibitor for acid reflux, GERD and stomach ulcers. Strip of 10 capsules, 20mg each."),
            product("Vitamin C 500mg", "TAB-VITC-500", "Tablets",
                new BigDecimal("2.80"), 1000, 100,
                "Immune support supplement, chewable tablets. Bottle of 30 tablets, 500mg each."),
            product("Multivitamin Daily", "TAB-MVIT-DLY", "Tablets",
                new BigDecimal("5.50"), 1000, 100,
                "Daily multivitamin and mineral supplement tablets. Bottle of 30 tablets."),

            // ---- Syrups ----
            product("Paracetamol Syrup 125mg/5ml", "SYR-PARA-125", "Syrups",
                new BigDecimal("3.90"), 1000, 100,
                "Pediatric fever and pain relief syrup. 60ml bottle, 125mg per 5ml. Suitable for children."),
            product("Cough Syrup (Dextromethorphan)", "SYR-COUGH-DM", "Syrups",
                new BigDecimal("4.75"), 1000, 100,
                "Dry cough suppressant syrup for adults and children above 6 years. 100ml bottle."),
            product("Amoxicillin Suspension 250mg/5ml", "SYR-AMOX-250", "Syrups",
                new BigDecimal("7.20"), 1000, 100,
                "Antibiotic oral suspension for children with bacterial infections. 60ml bottle. Requires prescription."),
            product("Iron Tonic Syrup", "SYR-IRON-TON", "Syrups",
                new BigDecimal("5.10"), 1000, 100,
                "Iron and folic acid supplement syrup for anemia support. 200ml bottle."),
            product("Antacid Syrup", "SYR-ANTAC-STD", "Syrups",
                new BigDecimal("3.40"), 1000, 100,
                "Fast-relief antacid syrup for indigestion, heartburn and acidity. 170ml bottle."),
            product("ORS Rehydration Syrup", "SYR-ORS-STD", "Syrups",
                new BigDecimal("2.60"), 1000, 100,
                "Oral rehydration solution syrup for dehydration and diarrhea management. 200ml bottle."),
            product("Vitamin D3 Syrup", "SYR-VITD3-STD", "Syrups",
                new BigDecimal("6.30"), 1000, 100,
                "Vitamin D3 supplement drops/syrup for bone health support. 15ml bottle."),

            // ---- Other medical items ----
            product("Digital Thermometer", "MED-THERM-DIG", "Medical Devices",
                new BigDecimal("12.99"), 1000, 50,
                "Fast-read digital body thermometer with fever alert beep. Includes battery."),
            product("Blood Pressure Monitor", "MED-BP-MON", "Medical Devices",
                new BigDecimal("34.50"), 1000, 50,
                "Automatic upper-arm digital blood pressure monitor with memory storage."),
            product("Pulse Oximeter", "MED-OXI-STD", "Medical Devices",
                new BigDecimal("18.75"), 1000, 50,
                "Fingertip pulse oximeter for measuring blood oxygen saturation (SpO2) and pulse rate."),
            product("N95 Face Mask (Pack of 10)", "MED-MASK-N95", "Protective Equipment",
                new BigDecimal("9.99"), 1000, 100,
                "NIOSH-approved N95 respirator face masks, pack of 10, for infection protection."),
            product("Surgical Gloves (Box of 100)", "MED-GLOVE-SURG", "Protective Equipment",
                new BigDecimal("11.40"), 1000, 100,
                "Latex-free disposable surgical gloves, powder-free, box of 100 pieces."),
            product("Antiseptic Liquid 500ml", "MED-ANTISEP-500", "First Aid",
                new BigDecimal("4.20"), 1000, 100,
                "Multi-purpose antiseptic disinfectant liquid for wound cleaning and surface disinfection. 500ml bottle."),
            product("Adhesive Bandages (Pack of 50)", "MED-BAND-50", "First Aid",
                new BigDecimal("3.10"), 1000, 100,
                "Assorted sterile adhesive bandages for minor cuts and wounds, pack of 50."),
            product("Elastic Crepe Bandage", "MED-CREPE-BAND", "First Aid",
                new BigDecimal("2.75"), 1000, 100,
                "Stretchable crepe bandage roll for sprains and joint support, 4-inch width."),
            product("Hand Sanitizer 500ml", "MED-SANIT-500", "Protective Equipment",
                new BigDecimal("3.60"), 1000, 100,
                "70% alcohol-based hand sanitizer gel for germ protection. 500ml pump bottle.")
        );

        productRepository.saveAll(items);
    }

    private Product product(String name, String sku, String category, BigDecimal price,
                             int stockQuantity, int reorderThreshold, String description) {
        Product p = new Product();
        p.setName(name);
        p.setSku(sku);
        p.setCategory(category);
        p.setPrice(price);
        p.setStockQuantity(stockQuantity);
        p.setReorderThreshold(reorderThreshold);
        p.setDescription(description);
        return p;
    }
}
