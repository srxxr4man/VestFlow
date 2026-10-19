package com.finance.Service;

import com.finance.Bean.Investment;
import com.finance.Bean.Transaction;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ReportGenerator {

    private static final DateTimeFormatter TIMESTAMP_FORMATTER =
            DateTimeFormatter.ofPattern("dd-MMM-yyyy HH:mm:ss");

    public byte[] generateExcelReport(
            String userName,
            String userEmail,
            double netBalance,
            double portfolioValue,
            double totalProfitLoss,
            String status,
            List<Transaction> transactions,
            List<Investment> investments) throws IOException {

        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

            XSSFSheet sheet = workbook.createSheet("Financial Portfolio");
            sheet.setDisplayGridlines(true);

            DataFormat dataFormat = workbook.createDataFormat();

            // Brand Color Palette
            byte[] primaryNavyRgb = new byte[]{(byte) 15, (byte) 23, (byte) 42};    // #0F172A
            byte[] accentBlueRgb  = new byte[]{(byte) 30, (byte) 58, (byte) 138};   // #1E3A8A
            byte[] zebraRowRgb    = new byte[]{(byte) 248, (byte) 250, (byte) 252}; // #F8FAFC
            byte[] totalBarRgb    = new byte[]{(byte) 226, (byte) 232, (byte) 240}; // #E2E8F0

            XSSFColor primaryNavy = new XSSFColor(primaryNavyRgb, null);
            XSSFColor accentBlue  = new XSSFColor(accentBlueRgb, null);
            XSSFColor zebraColor  = new XSSFColor(zebraRowRgb, null);
            XSSFColor totalColor  = new XSSFColor(totalBarRgb, null);

            // Typography
            Font titleFont = workbook.createFont();
            titleFont.setFontName("Calibri");
            titleFont.setFontHeightInPoints((short) 16);
            titleFont.setBold(true);
            titleFont.setColor(IndexedColors.WHITE.getIndex());

            Font sectionFont = workbook.createFont();
            sectionFont.setFontName("Calibri");
            sectionFont.setFontHeightInPoints((short) 11);
            sectionFont.setBold(true);
            sectionFont.setColor(IndexedColors.WHITE.getIndex());

            Font headerFont = workbook.createFont();
            headerFont.setFontName("Calibri");
            headerFont.setFontHeightInPoints((short) 10);
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());

            Font boldFont = workbook.createFont();
            boldFont.setFontName("Calibri");
            boldFont.setFontHeightInPoints((short) 10);
            boldFont.setBold(true);

            Font regularFont = workbook.createFont();
            regularFont.setFontName("Calibri");
            regularFont.setFontHeightInPoints((short) 10);

            // Status Badge Fonts
            Font profitBadgeFont = workbook.createFont();
            profitBadgeFont.setFontName("Calibri");
            profitBadgeFont.setFontHeightInPoints((short) 9);
            profitBadgeFont.setBold(true);
            profitBadgeFont.setColor(IndexedColors.DARK_GREEN.getIndex());

            Font lossBadgeFont = workbook.createFont();
            lossBadgeFont.setFontName("Calibri");
            lossBadgeFont.setFontHeightInPoints((short) 9);
            lossBadgeFont.setBold(true);
            lossBadgeFont.setColor(IndexedColors.RED.getIndex());

            Font neutralBadgeFont = workbook.createFont();
            neutralBadgeFont.setFontName("Calibri");
            neutralBadgeFont.setFontHeightInPoints((short) 9);
            neutralBadgeFont.setBold(true);
            neutralBadgeFont.setColor(IndexedColors.GREY_50_PERCENT.getIndex());

            // General Cell Styles
            CellStyle titleStyle = workbook.createCellStyle();
            titleStyle.setFillForegroundColor(primaryNavy);
            titleStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            titleStyle.setFont(titleFont);
            titleStyle.setAlignment(HorizontalAlignment.LEFT);
            titleStyle.setVerticalAlignment(VerticalAlignment.CENTER);

            CellStyle metaLabelStyle = workbook.createCellStyle();
            metaLabelStyle.setFont(boldFont);

            CellStyle metaValStyle = workbook.createCellStyle();
            metaValStyle.setFont(regularFont);

            CellStyle sectionBannerStyle = workbook.createCellStyle();
            sectionBannerStyle.setFillForegroundColor(accentBlue);
            sectionBannerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            sectionBannerStyle.setFont(sectionFont);
            sectionBannerStyle.setVerticalAlignment(VerticalAlignment.CENTER);

            CellStyle tableHeaderStyle = workbook.createCellStyle();
            tableHeaderStyle.setFillForegroundColor(primaryNavy);
            tableHeaderStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            tableHeaderStyle.setFont(headerFont);
            tableHeaderStyle.setAlignment(HorizontalAlignment.CENTER);
            tableHeaderStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            setBorders(tableHeaderStyle);

            CellStyle dataLeft = workbook.createCellStyle();
            dataLeft.setFont(regularFont);
            setBorders(dataLeft);

            CellStyle dataCenter = workbook.createCellStyle();
            dataCenter.setFont(regularFont);
            dataCenter.setAlignment(HorizontalAlignment.CENTER);
            setBorders(dataCenter);

            CellStyle currencyStyle = workbook.createCellStyle();
            currencyStyle.setFont(regularFont);
            currencyStyle.setDataFormat(dataFormat.getFormat("₹ #,##0.00"));
            setBorders(currencyStyle);

            CellStyle percentStyle = workbook.createCellStyle();
            percentStyle.setFont(regularFont);
            percentStyle.setDataFormat(dataFormat.getFormat("0.00%"));
            percentStyle.setAlignment(HorizontalAlignment.RIGHT);
            setBorders(percentStyle);

            CellStyle zebraCurrency = workbook.createCellStyle();
            zebraCurrency.cloneStyleFrom(currencyStyle);
            zebraCurrency.setFillForegroundColor(zebraColor);
            zebraCurrency.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            CellStyle zebraLeft = workbook.createCellStyle();
            zebraLeft.cloneStyleFrom(dataLeft);
            zebraLeft.setFillForegroundColor(zebraColor);
            zebraLeft.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            CellStyle zebraCenter = workbook.createCellStyle();
            zebraCenter.cloneStyleFrom(dataCenter);
            zebraCenter.setFillForegroundColor(zebraColor);
            zebraCenter.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            CellStyle zebraPercent = workbook.createCellStyle();
            zebraPercent.cloneStyleFrom(percentStyle);
            zebraPercent.setFillForegroundColor(zebraColor);
            zebraPercent.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            CellStyle totalRowCurrency = workbook.createCellStyle();
            totalRowCurrency.setFont(boldFont);
            totalRowCurrency.setDataFormat(dataFormat.getFormat("₹ #,##0.00"));
            totalRowCurrency.setFillForegroundColor(totalColor);
            totalRowCurrency.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setBorders(totalRowCurrency);

            CellStyle totalRowLabel = workbook.createCellStyle();
            totalRowLabel.setFont(boldFont);
            totalRowLabel.setFillForegroundColor(totalColor);
            totalRowLabel.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setBorders(totalRowLabel);

            // Status Badge Styles
            CellStyle profitStyle = workbook.createCellStyle();
            profitStyle.setFont(profitBadgeFont);
            profitStyle.setFillForegroundColor(new XSSFColor(new byte[]{(byte) 209, (byte) 250, (byte) 229}, null)); // #D1FAE5
            profitStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            profitStyle.setAlignment(HorizontalAlignment.CENTER);
            profitStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            setBorders(profitStyle);

            CellStyle lossStyle = workbook.createCellStyle();
            lossStyle.setFont(lossBadgeFont);
            lossStyle.setFillForegroundColor(new XSSFColor(new byte[]{(byte) 254, (byte) 226, (byte) 226}, null)); // #FEE2E2
            lossStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            lossStyle.setAlignment(HorizontalAlignment.CENTER);
            lossStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            setBorders(lossStyle);

            CellStyle neutralStyle = workbook.createCellStyle();
            neutralStyle.setFont(neutralBadgeFont);
            neutralStyle.setFillForegroundColor(new XSSFColor(new byte[]{(byte) 241, (byte) 245, (byte) 249}, null)); // #F1F5F9
            neutralStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            neutralStyle.setAlignment(HorizontalAlignment.CENTER);
            neutralStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            setBorders(neutralStyle);

            int rowIdx = 0;

            // =========================================================================
            // 1. BANNER HEADER
            // =========================================================================
            Row bannerRow = sheet.createRow(rowIdx++);
            bannerRow.setHeightInPoints(34);
            Cell bannerCell = bannerRow.createCell(0);
            bannerCell.setCellValue("  FINANCETRACKER • CONSOLIDATED PORTFOLIO STATEMENT");
            bannerCell.setCellStyle(titleStyle);
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 10));

            // Metadata Rows
            rowIdx++;
            createMetaRow(sheet, rowIdx++, "Account Holder:", userName != null ? userName : "Account Member", metaLabelStyle, metaValStyle);
            createMetaRow(sheet, rowIdx++, "Email Address:", userEmail != null ? userEmail : "N/A", metaLabelStyle, metaValStyle);
            createMetaRow(sheet, rowIdx++, "Generated On:", LocalDateTime.now().format(TIMESTAMP_FORMATTER), metaLabelStyle, metaValStyle);
            createMetaRow(sheet, rowIdx++, "Currency:", "INR (Indian Rupee - ₹)", metaLabelStyle, metaValStyle);
            rowIdx++;

            // =========================================================================
            // 2. EXECUTIVE PERFORMANCE METRICS (KPIs)
            // =========================================================================
            Row kpiBanner = sheet.createRow(rowIdx++);
            kpiBanner.setHeightInPoints(22);
            Cell kpiBannerCell = kpiBanner.createCell(0);
            kpiBannerCell.setCellValue("  EXECUTIVE FINANCIAL OVERVIEW");
            kpiBannerCell.setCellStyle(sectionBannerStyle);
            sheet.addMergedRegion(new CellRangeAddress(rowIdx - 1, rowIdx - 1, 0, 2));

            createKpiRow(sheet, rowIdx++, "Liquid Net Balance", netBalance, currencyStyle, metaLabelStyle);
            createKpiRow(sheet, rowIdx++, "Total Portfolio Holdings", portfolioValue, currencyStyle, metaLabelStyle);

            // Unrealized P/L Row with Status Badge
            Row pnlRow = sheet.createRow(rowIdx++);
            pnlRow.setHeightInPoints(20);
            Cell pnlLabel = pnlRow.createCell(0);
            pnlLabel.setCellValue("Unrealized Profit / Loss");
            pnlLabel.setCellStyle(metaLabelStyle);

            Cell pnlValue = pnlRow.createCell(1);
            pnlValue.setCellValue(totalProfitLoss);
            pnlValue.setCellStyle(currencyStyle);

            Cell pnlStatus = pnlRow.createCell(2);
            String overallStatus = resolveStatus(totalProfitLoss);
            pnlStatus.setCellValue(overallStatus);
            pnlStatus.setCellStyle(resolveStatusStyle(totalProfitLoss, profitStyle, lossStyle, neutralStyle));

            createKpiRow(sheet, rowIdx++, "Consolidated Net Worth", (netBalance + portfolioValue), totalRowCurrency, boldFont);
            rowIdx += 2;

            // =========================================================================
            // 3. INVESTMENT PORTFOLIO TABLE
            // =========================================================================
            Row invBanner = sheet.createRow(rowIdx++);
            invBanner.setHeightInPoints(22);
            Cell invBannerCell = invBanner.createCell(0);
            invBannerCell.setCellValue("  INVESTMENT HOLDINGS LEDGER");
            invBannerCell.setCellStyle(sectionBannerStyle);
            sheet.addMergedRegion(new CellRangeAddress(rowIdx - 1, rowIdx - 1, 0, 10));

            String[] invHeaders = {
                    "Asset Ticker", "Class", "Acquisition Date", "Quantity",
                    "Cost Price", "Market Price", "Total Cost", "Current Value",
                    "Unrealized P/L", "ROI %", "Status"
            };

            Row invHeadRow = sheet.createRow(rowIdx++);
            invHeadRow.setHeightInPoints(24);
            for (int i = 0; i < invHeaders.length; i++) {
                Cell c = invHeadRow.createCell(i);
                c.setCellValue(invHeaders[i]);
                c.setCellStyle(tableHeaderStyle);
            }

            double sumCost = 0.0;
            double sumCurrent = 0.0;
            double sumPnl = 0.0;

            if (investments != null && !investments.isEmpty()) {
                boolean zebra = false;
                for (Investment inv : investments) {
                    Row r = sheet.createRow(rowIdx++);
                    r.setHeightInPoints(20);

                    CellStyle cLeft = zebra ? zebraLeft : dataLeft;
                    CellStyle cCenter = zebra ? zebraCenter : dataCenter;
                    CellStyle cCurr = zebra ? zebraCurrency : currencyStyle;
                    CellStyle cPct = zebra ? zebraPercent : percentStyle;

                    double cost = inv.getQuantity() * inv.getPurchasePrice();
                    double val = inv.getCurrentValue();
                    double pnl = inv.getProfitOrLoss();
                    double roi = cost > 0 ? (pnl / cost) : 0.0;

                    sumCost += cost;
                    sumCurrent += val;
                    sumPnl += pnl;

                    createCell(r, 0, inv.getSymbol(), cCenter);
                    createCell(r, 1, inv.getAssetType(), cCenter);
                    createCell(r, 2, inv.getPurchaseDate() != null ? inv.getPurchaseDate().toString() : "—", cCenter);
                    createNumericCell(r, 3, inv.getQuantity(), cCenter);
                    createNumericCell(r, 4, inv.getPurchasePrice(), cCurr);
                    createNumericCell(r, 5, inv.getCurrentMarketPrice(), cCurr);
                    createNumericCell(r, 6, cost, cCurr);
                    createNumericCell(r, 7, val, cCurr);
                    createNumericCell(r, 8, pnl, cCurr);
                    createNumericCell(r, 9, roi, cPct);

                    // Status Badge Cell
                    Cell statusCell = r.createCell(10);
                    statusCell.setCellValue(resolveStatus(pnl));
                    statusCell.setCellStyle(resolveStatusStyle(pnl, profitStyle, lossStyle, neutralStyle));

                    zebra = !zebra;
                }
            }

            // Investment Totals Row
            Row invTot = sheet.createRow(rowIdx++);
            invTot.setHeightInPoints(22);
            for (int i = 0; i < 11; i++) invTot.createCell(i).setCellStyle(totalRowLabel);
            invTot.getCell(0).setCellValue("PORTFOLIO TOTAL");
            createNumericCell(invTot, 6, sumCost, totalRowCurrency);
            createNumericCell(invTot, 7, sumCurrent, totalRowCurrency);
            createNumericCell(invTot, 8, sumPnl, totalRowCurrency);
            createNumericCell(invTot, 9, sumCost > 0 ? (sumPnl / sumCost) : 0.0, percentStyle);

            Cell totStatusCell = invTot.createCell(10);
            totStatusCell.setCellValue(resolveStatus(sumPnl));
            totStatusCell.setCellStyle(resolveStatusStyle(sumPnl, profitStyle, lossStyle, neutralStyle));

            rowIdx += 2;

            // =========================================================================
            // 4. TRANSACTION & CASH FLOW LEDGER
            // =========================================================================
            Row txBanner = sheet.createRow(rowIdx++);
            txBanner.setHeightInPoints(22);
            Cell txBannerCell = txBanner.createCell(0);
            txBannerCell.setCellValue("  TRANSACTION & CASH FLOW AUDIT");
            txBannerCell.setCellStyle(sectionBannerStyle);
            sheet.addMergedRegion(new CellRangeAddress(rowIdx - 1, rowIdx - 1, 0, 6));

            String[] txHeaders = {
                    "Txn ID", "Flow Type", "Date", "Category",
                    "Cash Inflow", "Cash Outflow", "Net Impact"
            };

            Row txHeadRow = sheet.createRow(rowIdx++);
            txHeadRow.setHeightInPoints(24);
            for (int i = 0; i < txHeaders.length; i++) {
                Cell c = txHeadRow.createCell(i);
                c.setCellValue(txHeaders[i]);
                c.setCellStyle(tableHeaderStyle);
            }

            double sumInflow = 0.0;
            double sumOutflow = 0.0;

            if (transactions != null && !transactions.isEmpty()) {
                boolean zebra = false;
                for (Transaction tx : transactions) {
                    Row r = sheet.createRow(rowIdx++);
                    r.setHeightInPoints(20);

                    CellStyle cLeft = zebra ? zebraLeft : dataLeft;
                    CellStyle cCenter = zebra ? zebraCenter : dataCenter;
                    CellStyle cCurr = zebra ? zebraCurrency : currencyStyle;

                    boolean isIncome = "INCOME".equalsIgnoreCase(tx.getType());
                    double inflow = isIncome ? tx.getAmount() : 0.0;
                    double outflow = isIncome ? 0.0 : tx.getAmount();
                    double net = isIncome ? tx.getAmount() : -tx.getAmount();

                    sumInflow += inflow;
                    sumOutflow += outflow;

                    createCell(r, 0, "TX-" + (tx.getId() != null ? String.format("%04d", tx.getId()) : "0000"), cCenter);
                    createCell(r, 1, tx.getType(), cCenter);
                    createCell(r, 2, tx.getDate() != null ? tx.getDate().toString() : "—", cCenter);
                    createCell(r, 3, tx.getCategory() != null ? tx.getCategory() : "General", cLeft);
                    createNumericCell(r, 4, inflow, cCurr);
                    createNumericCell(r, 5, outflow, cCurr);
                    createNumericCell(r, 6, net, cCurr);

                    zebra = !zebra;
                }
            }

            // Transaction Totals Row
            Row txTot = sheet.createRow(rowIdx++);
            txTot.setHeightInPoints(22);
            for (int i = 0; i < 7; i++) txTot.createCell(i).setCellStyle(totalRowLabel);
            txTot.getCell(0).setCellValue("CUMULATIVE TOTAL");
            createNumericCell(txTot, 4, sumInflow, totalRowCurrency);
            createNumericCell(txTot, 5, sumOutflow, totalRowCurrency);
            createNumericCell(txTot, 6, netBalance, totalRowCurrency);

            // Dynamic Auto-sizing across all columns (0 to 10)
            for (int i = 0; i < 11; i++) {
                sheet.autoSizeColumn(i);
                sheet.setColumnWidth(i, Math.max(sheet.getColumnWidth(i) + 1200, 3600));
            }

            workbook.write(baos);
            return baos.toByteArray();
        }
    }

    // =========================================================================
    // Status Badge Resolvers
    // =========================================================================

    private String resolveStatus(double profitOrLoss) {
        if (profitOrLoss > 0.001) return "PROFIT";
        if (profitOrLoss < -0.001) return "LOSS";
        return "BREAK-EVEN";
    }

    private CellStyle resolveStatusStyle(double profitOrLoss, CellStyle profitStyle, CellStyle lossStyle, CellStyle neutralStyle) {
        if (profitOrLoss > 0.001) return profitStyle;
        if (profitOrLoss < -0.001) return lossStyle;
        return neutralStyle;
    }

    // =========================================================================
    // Helper Row & Cell Builders
    // =========================================================================

    private void createMetaRow(XSSFSheet sheet, int rowIdx, String label, String val, CellStyle lblStyle, CellStyle valStyle) {
        Row r = sheet.createRow(rowIdx);
        Cell l = r.createCell(0);
        l.setCellValue(label);
        l.setCellStyle(lblStyle);
        Cell v = r.createCell(1);
        v.setCellValue(val);
        v.setCellStyle(valStyle);
    }

    private void createKpiRow(XSSFSheet sheet, int rowIdx, String label, double amount, CellStyle valStyle, Object lblStyle) {
        Row r = sheet.createRow(rowIdx);
        r.setHeightInPoints(20);
        Cell l = r.createCell(0);
        l.setCellValue(label);
        if (lblStyle instanceof CellStyle) l.setCellStyle((CellStyle) lblStyle);
        Cell v = r.createCell(1);
        v.setCellValue(amount);
        v.setCellStyle(valStyle);
    }

    private void createCell(Row row, int col, String val, CellStyle style) {
        Cell c = row.createCell(col);
        c.setCellValue(val);
        c.setCellStyle(style);
    }

    private void createNumericCell(Row row, int col, double val, CellStyle style) {
        Cell c = row.createCell(col);
        c.setCellValue(val);
        c.setCellStyle(style);
    }

    private void setBorders(CellStyle style) {
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setTopBorderColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setBottomBorderColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setLeftBorderColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setRightBorderColor(IndexedColors.GREY_25_PERCENT.getIndex());
    }
}