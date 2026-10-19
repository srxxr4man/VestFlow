package com.finance.Bean;

public class Crypto extends Investment {
    private double livePrice;
    private double networkGasFee;

    public Crypto() {
        super();
    }

    public Crypto(String symbol, double quantity, double purchasePrice, double livePrice, double networkGasFee) {
        super(symbol, "CRYPTO", quantity, purchasePrice, livePrice);
        this.livePrice = livePrice;
        this.networkGasFee = networkGasFee;
    }

    @Override
    public double getCurrentMarketPrice() {
        return livePrice;
    }

    @Override
    public double getCurrentValue() {
        return (getQuantity() * getCurrentMarketPrice()) - networkGasFee;
    }

    public double getLivePrice() { return livePrice; }
    public void setLivePrice(double livePrice) { this.livePrice = livePrice; }

    public double getNetworkGasFee() { return networkGasFee; }
    public void setNetworkGasFee(double networkGasFee) { this.networkGasFee = networkGasFee; }
}