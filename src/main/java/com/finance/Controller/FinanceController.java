package com.finance.Controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.finance.Bean.Investment;
import com.finance.Bean.Transaction;
import com.finance.Bean.User;
import com.finance.Dao.UserDao;
import com.finance.Service.PortfolioService;
import com.finance.Service.ReportGenerator;

import java.io.IOException;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/finance")
public class FinanceController {

    private final PortfolioService portfolioService;
    private final ReportGenerator reportGenerator;
    private final UserDao userDao;

    public FinanceController(PortfolioService portfolioService, ReportGenerator reportGenerator, UserDao userDao) {
        this.portfolioService = portfolioService;
        this.reportGenerator = reportGenerator;
        this.userDao = userDao;
    }

    // =========================================================================
    // DTOs
    // =========================================================================

    public static class TransactionRequest {
        public String userId;
        public double amount;
        public String category;
        public String date;
    }

    public static class StockRequest {
        public String userId;
        public String symbol;
        public double qty;
        public double buyPrice;
        public double marketPrice;
        public String date;
    }

    public static class CryptoRequest {
        public String userId;
        public String symbol;
        public double qty;
        public double buyPrice;
        public double marketPrice;
        public double fee;
        public String date;
    }

    public static class GoldRequest {
        public String userId;
        public String symbol;
        public double quantityGrams;
        public double purchasePricePerGram;
        public double pricePerGram;
        public String date;
    }

    public static class SellRequest {
        public double sellPrice;
    }

    public static class UserRequest {
        public String id;
        public String name;
        public String email;
        public String password;
    }

    public static class RegisterRequest {
        public String id;
        public String name;
        public String email;
        public String password;
    }

    public static class LoginRequest {
        public String email;
        public String password;
    }

    public static class ResetPasswordRequest {
        public String email;
        public String newPassword;
    }

    public static class UpdatePriceRequest {
        public double marketPrice;
    }

    // =========================================================================
    // Transactions & Investments
    // =========================================================================

    @PostMapping("/income")
    public ResponseEntity<String> addIncome(@RequestBody TransactionRequest req) {
        LocalDate txDate = (req.date != null && !req.date.isBlank()) ? LocalDate.parse(req.date.trim()) : LocalDate.now();
        Transaction tx = new Transaction("INCOME", req.amount, req.category, txDate);
        tx.setUserId(req.userId);
        portfolioService.addTransaction(tx);
        return ResponseEntity.ok("Income logged successfully.");
    }

    @PostMapping("/expense")
    public ResponseEntity<String> addExpense(@RequestBody TransactionRequest req) {
        LocalDate txDate = (req.date != null && !req.date.isBlank()) ? LocalDate.parse(req.date.trim()) : LocalDate.now();
        Transaction tx = new Transaction("EXPENSE", req.amount, req.category, txDate);
        tx.setUserId(req.userId);
        portfolioService.addTransaction(tx);
        return ResponseEntity.ok("Expense logged successfully.");
    }

    @PostMapping("/investment/stock")
    public ResponseEntity<?> addStock(@RequestBody StockRequest req) {
        try {
            LocalDate invDate = (req.date != null && !req.date.isBlank()) ? LocalDate.parse(req.date.trim()) : LocalDate.now();
            Investment inv = new Investment(req.symbol, "STOCK", req.qty, req.buyPrice, req.marketPrice, 0.0, invDate);
            inv.setUserId(req.userId);
            portfolioService.buyInvestment(inv);
            return ResponseEntity.ok("Stock position purchased. Cost deducted from liquid balance.");
        } catch (IllegalStateException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @PostMapping("/investment/crypto")
    public ResponseEntity<?> addCrypto(@RequestBody CryptoRequest req) {
        try {
            LocalDate invDate = (req.date != null && !req.date.isBlank()) ? LocalDate.parse(req.date.trim()) : LocalDate.now();
            Investment inv = new Investment(
                    req.symbol,
                    "CRYPTO",
                    req.qty,
                    req.buyPrice,
                    req.marketPrice,
                    req.fee > 0 ? req.fee : 0.0,
                    invDate
            );
            inv.setUserId(req.userId);
            portfolioService.buyInvestment(inv);
            return ResponseEntity.ok("Crypto position purchased. Cost + trading fee deducted from liquid balance.");
        } catch (IllegalStateException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @PostMapping("/investment/gold")
    public ResponseEntity<?> addGold(@RequestBody GoldRequest req) {
        try {
            LocalDate invDate = (req.date != null && !req.date.isBlank()) ? LocalDate.parse(req.date.trim()) : LocalDate.now();
            Investment inv = new Investment(
                    req.symbol,
                    "GOLD",
                    req.quantityGrams,
                    req.purchasePricePerGram,
                    req.pricePerGram,
                    0.0,
                    invDate
            );
            inv.setUserId(req.userId);
            portfolioService.buyInvestment(inv);
            return ResponseEntity.ok("Gold position purchased. Cost deducted from liquid balance.");
        } catch (IllegalStateException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @PostMapping("/investments/{id}/sell")
    public ResponseEntity<?> sellInvestment(@PathVariable Long id, @RequestBody SellRequest req) {
        try {
            double pnl = portfolioService.sellInvestment(id, req.sellPrice);
            String pnlMsg = pnl >= 0
                    ? "profit of ₹" + String.format("%.2f", pnl)
                    : "loss of ₹" + String.format("%.2f", Math.abs(pnl));
            return ResponseEntity.ok("Position closed with " + pnlMsg + ". Total proceeds credited to liquid balance.");
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(404).body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body("Failed to sell position: " + ex.getMessage());
        }
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<Transaction>> getTransactions(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String category) {
        if (category != null && !category.isBlank()) {
            return ResponseEntity.ok(portfolioService.getTransactionsByCategory(userId, category));
        }
        return ResponseEntity.ok(portfolioService.getAllTransactions(userId));
    }

    @GetMapping("/transactions/{id}")
    public ResponseEntity<?> getTransactionById(@PathVariable Long id) {
        return portfolioService.getTransactionById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(404).body("Transaction not found with ID: " + id));
    }

    @GetMapping("/investments")
    public ResponseEntity<List<Investment>> getAllInvestments(@RequestParam(required = false) String userId) {
        return ResponseEntity.ok(portfolioService.getAllInvestments(userId));
    }

    @GetMapping("/investments/{id}")
    public ResponseEntity<?> getInvestmentById(@PathVariable Long id) {
        return portfolioService.getInvestmentById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(404).body("Investment not found with ID: " + id));
    }

    @PutMapping("/investments/{id}/price")
    public ResponseEntity<?> updateInvestmentMarketPrice(@PathVariable Long id, @RequestBody UpdatePriceRequest req) {
        if (req.marketPrice < 0) {
            return ResponseEntity.badRequest().body("Market price cannot be negative.");
        }
        return portfolioService.updateInvestmentMarketPrice(id, req.marketPrice)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(404).body("Investment not found with ID: " + id));
    }

    @GetMapping("/all")
    public ResponseEntity<Map<String, Object>> getAllData(@RequestParam(required = false) String userId)
            throws ExecutionException, InterruptedException {
        double balance = portfolioService.calculateNetBalance(userId);
        double portfolioVal = portfolioService.computeTotalPortfolioValueAsync(userId).get();
        double profitLoss = portfolioService.computeTotalProfitLossAsync(userId).get();
        String status = profitLoss > 0 ? "PROFIT" : (profitLoss < 0 ? "LOSS" : "BREAK-EVEN");

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("netBalance", balance);
        metrics.put("portfolioValue", portfolioVal);
        metrics.put("totalProfitLoss", profitLoss);
        metrics.put("status", status);

        Map<String, Object> fullSummary = new HashMap<>();
        fullSummary.put("metrics", metrics);
        fullSummary.put("transactions", portfolioService.getAllTransactions(userId));
        fullSummary.put("investments", portfolioService.getAllInvestments(userId));

        return ResponseEntity.ok(fullSummary);
    }

    @DeleteMapping("/transactions/{id}")
    public ResponseEntity<String> deleteTransaction(@PathVariable Long id) {
        boolean deleted = portfolioService.deleteTransaction(id);
        if (!deleted) {
            return ResponseEntity.status(404).body("Transaction not found with ID: " + id);
        }
        return ResponseEntity.ok("Transaction deleted successfully: " + id);
    }

    @DeleteMapping("/investments/{id}")
    public ResponseEntity<String> deleteInvestment(@PathVariable Long id) {
        boolean deleted = portfolioService.deleteInvestment(id);
        if (!deleted) {
            return ResponseEntity.status(404).body("Investment not found with ID: " + id);
        }
        return ResponseEntity.ok("Investment removed and purchase expense reversed: " + id);
    }

    // =========================================================================
    // Report Export
    // =========================================================================

    @GetMapping("/report/export/excel")
    public ResponseEntity<byte[]> exportExcelReport(@RequestParam(required = false) String userId)
            throws ExecutionException, InterruptedException, IOException {

        List<Transaction> userTx = portfolioService.getAllTransactions(userId);
        List<Investment> userInv = portfolioService.getAllInvestments(userId);

        String userName = "Consolidated Account";
        String userEmail = "N/A";
        if (userId != null && !userId.isBlank()) {
            Optional<User> userOpt = userDao.findById(userId.trim());
            if (userOpt.isPresent()) {
                userName = userOpt.get().getName();
                userEmail = userOpt.get().getEmail();
            }
        }

        double balance = portfolioService.calculateNetBalance(userId);
        double portfolioVal = portfolioService.computeTotalPortfolioValueAsync(userId).get();
        double profitLoss = portfolioService.computeTotalProfitLossAsync(userId).get();
        String status = profitLoss > 0 ? "PROFIT" : (profitLoss < 0 ? "LOSS" : "BREAK-EVEN");

        byte[] excelData = reportGenerator.generateExcelReport(
                userName,
                userEmail,
                balance,
                portfolioVal,
                profitLoss,
                status,
                userTx,
                userInv
        );

        String safeUserId = (userId != null && !userId.isBlank()) ? userId.trim() : "summary";
        String filename = "portfolio_statement_" + safeUserId + "_" + System.currentTimeMillis() + ".xlsx";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelData);
    }

    // =========================================================================
    // Standard User Authentication
    // =========================================================================

    @PostMapping("/users/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest req) {
        if (req.id == null || req.id.trim().isEmpty() || 
            req.email == null || req.email.trim().isEmpty() || 
            req.password == null || req.password.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("ID, email, and password are required.");
        }

        String userId = Objects.requireNonNull(req.id).trim();
        String userEmail = Objects.requireNonNull(req.email).trim();
        String userName = (req.name != null) ? req.name.trim() : "";
        String userPassword = Objects.requireNonNull(req.password).trim();

        if (userDao.existsById(userId)) {
            return ResponseEntity.status(409).body("User ID already exists: " + userId);
        }

        if (userDao.existsByEmailIgnoreCase(userEmail)) {
            return ResponseEntity.status(409).body("Email already registered: " + userEmail);
        }

        User user = new User(userId, userName, userEmail, userPassword);
        userDao.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("message", "User registered successfully.");

        return ResponseEntity.ok(response);
    }

    @PostMapping("/users/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest req) {
        if (req.email == null || req.email.trim().isEmpty() || 
            req.password == null || req.password.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Email and password are required.");
        }

        String userEmail = Objects.requireNonNull(req.email).trim();
        Optional<User> userOpt = userDao.findByEmailIgnoreCase(userEmail);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body("No account found with email: " + userEmail);
        }

        User user = userOpt.get();
        if (!user.getPassword().equals(req.password.trim())) {
            return ResponseEntity.status(401).body("Invalid credentials.");
        }

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("message", "Login successful.");

        return ResponseEntity.ok(response);
    }

    @PostMapping("/users/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest req) {
        if (req.email == null || req.email.trim().isEmpty() || 
            req.newPassword == null || req.newPassword.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Email and new password are required.");
        }

        String userEmail = Objects.requireNonNull(req.email).trim();
        Optional<User> userOpt = userDao.findByEmailIgnoreCase(userEmail);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body("No account registered with email: " + userEmail);
        }

        User user = userOpt.get();
        user.setPassword(req.newPassword.trim());
        userDao.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("email", user.getEmail());
        response.put("message", "Password has been successfully reset. Please log in.");
        return ResponseEntity.ok(response);
    }
}