package com.finance.Bean;

public class Stock extends Investment {
    private double marketPrice;

    public Stock() {
        super();
        setAssetType("STOCK");
    }

    public Stock(String symbol, double quantity, double purchasePrice, double marketPrice) {
        super(symbol, "STOCK", quantity, purchasePrice, marketPrice);
        this.marketPrice = marketPrice;
    }

    @Override
    public double getCurrentMarketPrice() {
        return marketPrice;
    }

    public double getMarketPrice() {
        return marketPrice;
    }

    public void setMarketPrice(double marketPrice) {
        this.marketPrice = marketPrice;
    }
}