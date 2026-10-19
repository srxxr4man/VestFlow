package com.finance.Service;

import com.finance.Bean.Investment;
import com.finance.Bean.Transaction;
import com.finance.Dao.InvestmentDao;
import com.finance.Dao.TransactionDao;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
public class PortfolioService {

    private final TransactionDao transactionDao;
    private final InvestmentDao investmentDao;
    private final ExecutorService executorService = Executors.newFixedThreadPool(2);

    public PortfolioService(TransactionDao transactionDao, InvestmentDao investmentDao) {
        this.transactionDao = transactionDao;
        this.investmentDao = investmentDao;
    }

    // =========================================================================
    // Transaction Operations
    // =========================================================================

    public void addTransaction(Transaction transaction) {
        transactionDao.save(transaction);
    }

    public List<Transaction> getAllTransactions() {
        return transactionDao.findAll();
    }

    public List<Transaction> getAllTransactions(String userId) {
        return (userId != null && !userId.isBlank())
                ? transactionDao.findByUserId(userId.trim())
                : transactionDao.findAll();
    }

    public List<Transaction> getTransactionsByCategory(String category) {
        return transactionDao.findAll().stream()
                .filter(t -> t.getCategory() != null && t.getCategory().equalsIgnoreCase(category.trim()))
                .toList();
    }

    public List<Transaction> getTransactionsByCategory(String userId, String category) {
        return getAllTransactions(userId).stream()
                .filter(t -> t.getCategory() != null && t.getCategory().equalsIgnoreCase(category.trim()))
                .toList();
    }

    public Optional<Transaction> getTransactionById(Long id) {
        return transactionDao.findById(id);
    }

    public boolean deleteTransaction(Long id) {
        if (transactionDao.existsById(id)) {
            transactionDao.deleteById(id);
            return true;
        }
        return false;
    }

    // =========================================================================
    // Investment Operations (Buy, Sell & Reversible Delete)
    // =========================================================================

    public void addInvestment(Investment investment) {
        investmentDao.save(investment);
    }

    /**
     * Purchases an investment using available liquid balance.
     * Total cost = (quantity * purchasePrice) + fee.
     * Blocks the transaction if funds are insufficient, then logs an auto-expense.
     */
    @Transactional
    public Investment buyInvestment(Investment inv) {
        double fee = inv.getFee() > 0 ? inv.getFee() : 0.0;
        inv.setFee(fee);

        double tokenCost = inv.getQuantity() * inv.getPurchasePrice();
        double totalRequired = tokenCost + fee;

        double currentBalance = calculateNetBalance(inv.getUserId());
        if (currentBalance < totalRequired) {
            throw new IllegalStateException("Insufficient liquid funds! Available: ₹" +
                    String.format("%.2f", currentBalance) + ", Required: ₹" + String.format("%.2f", totalRequired));
        }

        Investment savedInv = investmentDao.save(inv);

        LocalDate txDate = (inv.getPurchaseDate() != null) ? inv.getPurchaseDate() : LocalDate.now();
        String description = fee > 0
                ? "Investment (" + inv.getSymbol() + " + Fee: ₹" + String.format("%.2f", fee) + ")"
                : "Investment (" + inv.getSymbol() + ")";

        Transaction autoExpense = new Transaction(
                "EXPENSE",
                totalRequired,
                description,
                txDate
        );
        autoExpense.setUserId(inv.getUserId());
        transactionDao.save(autoExpense);

        return savedInv;
    }

    /**
     * Sells an investment position:
     * Calculates proceeds, credits them back as INCOME, and removes the holding.
     */
    @Transactional
    public double sellInvestment(Long investmentId, double sellPrice) {
        Optional<Investment> opt = investmentDao.findById(investmentId);
        if (opt.isEmpty()) {
            throw new IllegalArgumentException("Investment position not found with ID: " + investmentId);
        }

        Investment inv = opt.get();
        double totalProceeds = inv.getQuantity() * sellPrice;
        double costBasis = inv.getTotalCost();
        double profitOrLoss = totalProceeds - costBasis;

        String category = "Sold " + inv.getSymbol() + (profitOrLoss >= 0 ? " (+Profit)" : " (-Loss)");
        Transaction autoIncome = new Transaction(
                "INCOME",
                totalProceeds,
                category,
                LocalDate.now()
        );
        autoIncome.setUserId(inv.getUserId());
        transactionDao.save(autoIncome);

        investmentDao.delete(inv);
        return profitOrLoss;
    }

    /**
     * Deletes an erroneous investment and restores the debited liquid cash.
     */
    @Transactional
    public boolean deleteInvestment(Long id) {
        Optional<Investment> opt = investmentDao.findById(id);
        if (opt.isPresent()) {
            Investment inv = opt.get();
            double totalCost = inv.getTotalCost();

            List<Transaction> userTx = (inv.getUserId() != null && !inv.getUserId().isBlank())
                    ? transactionDao.findByUserId(inv.getUserId().trim())
                    : transactionDao.findAll();

            userTx.stream()
                    .filter(t -> "EXPENSE".equalsIgnoreCase(t.getType()))
                    .filter(t -> t.getCategory() != null && t.getCategory().startsWith("Investment (" + inv.getSymbol()))
                    .filter(t -> Math.abs(t.getAmount() - totalCost) < 0.05)
                    .findFirst()
                    .ifPresent(transactionDao::delete);

            investmentDao.delete(inv);
            return true;
        }
        return false;
    }

    public List<Investment> getAllInvestments() {
        return investmentDao.findAll();
    }

    public List<Investment> getAllInvestments(String userId) {
        return (userId != null && !userId.isBlank())
                ? investmentDao.findByUserId(userId.trim())
                : investmentDao.findAll();
    }

    public Optional<Investment> getInvestmentById(Long id) {
        return investmentDao.findById(id);
    }

    public Optional<Investment> updateInvestmentMarketPrice(Long id, double newMarketPrice) {
        return investmentDao.findById(id).map(inv -> {
            inv.setCurrentMarketPrice(newMarketPrice);
            return investmentDao.save(inv);
        });
    }

    // =========================================================================
    // Financial Computations
    // =========================================================================

    public double calculateNetBalance() {
        return getAllTransactions().stream()
                .mapToDouble(Transaction::getSignedAmount)
                .sum();
    }

    public double calculateNetBalance(String userId) {
        return getAllTransactions(userId).stream()
                .mapToDouble(Transaction::getSignedAmount)
                .sum();
    }

    public CompletableFuture<Double> computeTotalPortfolioValueAsync(String userId) {
        return CompletableFuture.supplyAsync(() ->
                getAllInvestments(userId).stream()
                        .mapToDouble(Investment::getCurrentValue)
                        .sum(),
                executorService
        );
    }

    public CompletableFuture<Double> computeTotalProfitLossAsync(String userId) {
        return CompletableFuture.supplyAsync(() ->
                getAllInvestments(userId).stream()
                        .mapToDouble(Investment::getProfitOrLoss)
                        .sum(),
                executorService
        );
    }
}