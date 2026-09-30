package com.invoiceacumen;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class InvoiceAcumenApplication {
    public static void main(String[] args) {
        SpringApplication.run(InvoiceAcumenApplication.class, args);
    }
}

