package com.finance.Bean;

import java.time.LocalDate;

public class Expense extends Transaction {

    public Expense() {
        super();
        setType("EXPENSE");
    }

    public Expense(double amount, String category) {
        super("EXPENSE", amount, category);
    }

    public Expense(Long id, double amount, String category, LocalDate date) {
        super("EXPENSE", amount, category);
        setId(id);
        setDate(date);
    }

    @Override
    public double getSignedAmount() {
        return -getAmount();
    }
}