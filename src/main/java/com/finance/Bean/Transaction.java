package com.finance.Bean;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userId;
    private String type; // INCOME or EXPENSE
    private double amount;
    private String category;
    private LocalDate date;

    public Transaction() {
        this.date = LocalDate.now();
    }

    public Transaction(String type, double amount, String category) {
        this.type = type;
        this.amount = amount;
        this.category = category;
        this.date = LocalDate.now();
    }

    public Transaction(String type, double amount, String category, LocalDate date) {
        this.type = type;
        this.amount = amount;
        this.category = category;
        this.date = (date != null) ? date : LocalDate.now();
    }

    public double getSignedAmount() {
        return "EXPENSE".equalsIgnoreCase(type) ? -amount : amount;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
}