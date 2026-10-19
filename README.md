# VestFlow 📈

A modern, full-stack investment portfolio tracker and personal wealth analytics dashboard. VestFlow bridges an enterprise-grade **Spring Boot** REST backend with a reactive **React + Vite** frontend to deliver real-time asset valuation, allocation breakdowns, performance analytics, and dynamic transaction auditing.

---

## Features

- **Portfolio Analytics & Net Worth Tracking:** Aggregate equities, fixed income, crypto, and cash into a unified real-time valuation engine with historical gain/loss tracking.
- **RESTful API Architecture:** Decoupled Spring Boot service layer with repository pattern abstraction, validation pipelines, and configured Cross-Origin Resource Sharing (CORS).
- **Reactive UI & Dynamic Transitions:** Built with React 18 and Vite, featuring animated loading states, modular card dashboards, and asynchronous state synchronization.
- **Persistent & In-Memory Storage:** Seamless multi-profile database support with zero-config in-memory H2 for development and PostgreSQL/MySQL compatibility for production.
- **Audit-Ready Transaction Engine:** Create, read, update, and delete (CRUD) asset allocations and trade orders with server-side validation.
- **Monorepo Architecture:** Single unified repository pairing backend API code and frontend single-page application (SPA) with zero dependency pollution.

---

## Core Modules & Capabilities

1. **Dashboard Overview:** Real-time net worth computation, percentage daily return, and total allocation distribution.
2. **Asset Allocation Engine:** Automatic portfolio categorization across asset classes (Equities, Indices, Commodities, Cash).
3. **Transaction History & Ledger:** Granular trade log capturing purchase price, execution date, order quantity, and realized gains.
4. **Market Telemetry (Simulated & Live):** Service hooks ready for live stock/crypto price feed ingestion.
5. **Database Web Inspector:** Built-in H2 Web Console to inspect database tables, schemas, and queries in real time.
6. **Animated Client Gateway:** Custom-engineered CSS keyframe loading screens to mask asynchronous data hydration and prevent UI layout shift.

---

## Tech Stack

### Backend
- **Language:** Java 17+
- **Framework:** Spring Boot 3.x
- **Core Modules:** Spring Web, Spring Data JPA, Spring Boot DevTools
- **Build Tool:** Apache Maven (`mvnw`)
- **Database (Dev):** H2 Database (In-Memory)
- **Database (Prod):** PostgreSQL / MySQL

### Frontend
- **Framework:** React 18+
- **Build Tool & Bundler:** Vite
- **Styling:** Modular CSS3 (Flexbox/Grid, Keyframe Animations)
- **Tooling:** Oxlint, NPM

---

## REST API Specification

### Endpoints

| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/portfolio` | Retrieve net worth summary, asset allocations, and return metrics | `200 OK` |
| **GET** | `/api/assets` | Fetch all tracked assets and active holdings | `200 OK` |
| **GET** | `/api/assets/{id}` | Retrieve details and trade history for a single asset | `200 OK` |
| **POST** | `/api/assets` | Register a new investment holding or trade entry | `201 Created` |
| **PUT** | `/api/assets/{id}` | Update quantity, average cost basis, or asset metadata | `200 OK` |
| **DELETE** | `/api/assets/{id}` | Liquidate or remove an asset record from portfolio tracking | `204 No Content` |

### Sample Payload (`POST /api/assets`)

```json
{
  "ticker": "AAPL",
  "name": "Apple Inc.",
  "assetType": "EQUITY",
  "quantity": 15.0,
  "buyPrice": 182.50,
  "currency": "USD"
}
