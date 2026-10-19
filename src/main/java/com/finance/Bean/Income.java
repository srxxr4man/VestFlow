package com.finance.Bean;

import java.time.LocalDate;

public class Income extends Transaction {

    public Income() {
        super();
        setType("INCOME");
    }

    public Income(double amount, String category) {
        super("INCOME", amount, category);
    }

    public Income(Long id, double amount, String category, LocalDate date) {
        super("INCOME", amount, category);
        setId(id);
        setDate(date);
    }

    @Override
    public double getSignedAmount() {
        return getAmount();
    }
}