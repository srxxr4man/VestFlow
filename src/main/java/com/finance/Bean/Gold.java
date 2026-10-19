package com.finance.Bean;

public class Gold extends Investment {
    private double pricePerGram;

    public Gold() {
        super();
        setAssetType("GOLD");
    }

    public Gold(String symbol, double quantityGrams, double purchasePricePerGram, double pricePerGram) {
        super(symbol, "GOLD", quantityGrams, purchasePricePerGram, pricePerGram);
        this.pricePerGram = pricePerGram;
    }

    @Override
    public double getCurrentMarketPrice() {
        return pricePerGram;
    }

    public double getPricePerGram() { 
        return pricePerGram; 
    }
    
    public void setPricePerGram(double pricePerGram) { 
        this.pricePerGram = pricePerGram; 
    }
}