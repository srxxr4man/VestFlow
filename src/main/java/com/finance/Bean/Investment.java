package com.finance.Bean;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "investments")
public class Investment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userId;
    private String symbol;
    private String assetType; // STOCK, CRYPTO, GOLD
    private double quantity;
    private double purchasePrice;
    private double currentMarketPrice;
    private double fee; // Direct trading/gas fee
    private LocalDate purchaseDate;

    public Investment() {
        this.purchaseDate = LocalDate.now();
    }

    public Investment(String symbol, String assetType, double quantity, double purchasePrice, double currentMarketPrice) {
        this(symbol, assetType, quantity, purchasePrice, currentMarketPrice, 0.0, LocalDate.now());
    }

    public Investment(String symbol, String assetType, double quantity, double purchasePrice, double currentMarketPrice, LocalDate purchaseDate) {
        this(symbol, assetType, quantity, purchasePrice, currentMarketPrice, 0.0, purchaseDate);
    }

    public Investment(String symbol, String assetType, double quantity, double purchasePrice, double currentMarketPrice, double fee, LocalDate purchaseDate) {
        this.symbol = symbol;
        this.assetType = assetType;
        this.quantity = quantity;
        this.purchasePrice = purchasePrice;
        this.currentMarketPrice = currentMarketPrice;
        this.fee = fee;
        this.purchaseDate = (purchaseDate != null) ? purchaseDate : LocalDate.now();
    }

    // =========================================================================
    // Financial Computations
    // =========================================================================

    public double getCurrentValue() {
        return quantity * currentMarketPrice;
    }

    public double getTotalCost() {
        return (quantity * purchasePrice) + fee;
    }

    public double getProfitOrLoss() {
        return getCurrentValue() - getTotalCost();
    }

    // =========================================================================
    // Getters and Setters
    // =========================================================================

    public Long getId() { 
        return id; 
    }

    public void setId(Long id) { 
        this.id = id; 
    }

    public String getUserId() { 
        return userId; 
    }

    public void setUserId(String userId) { 
        this.userId = userId; 
    }

    public String getSymbol() { 
        return symbol; 
    }

    public void setSymbol(String symbol) { 
        this.symbol = symbol; 
    }

    public String getAssetType() { 
        return assetType; 
    }

    public void setAssetType(String assetType) { 
        this.assetType = assetType; 
    }

    public double getQuantity() { 
        return quantity; 
    }

    public void setQuantity(double quantity) { 
        this.quantity = quantity; 
    }

    public double getPurchasePrice() { 
        return purchasePrice; 
    }

    public void setPurchasePrice(double purchasePrice) { 
        this.purchasePrice = purchasePrice; 
    }

    public double getCurrentMarketPrice() { 
        return currentMarketPrice; 
    }

    public void setCurrentMarketPrice(double currentMarketPrice) { 
        this.currentMarketPrice = currentMarketPrice; 
    }

    public double getFee() { 
        return fee; 
    }

    public void setFee(double fee) { 
        this.fee = fee; 
    }

    public LocalDate getPurchaseDate() { 
        return purchaseDate; 
    }

    public void setPurchaseDate(LocalDate purchaseDate) { 
        this.purchaseDate = purchaseDate; 
    }
}