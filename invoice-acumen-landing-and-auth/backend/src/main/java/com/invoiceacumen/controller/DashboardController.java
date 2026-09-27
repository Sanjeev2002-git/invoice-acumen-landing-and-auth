package com.invoiceacumen.controller;

import com.invoiceacumen.dto.DashboardSummaryDTO;
import com.invoiceacumen.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/summary")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PHARMACIST')")
    public DashboardSummaryDTO getSummary() {
        return dashboardService.getSummary();
    }
}
