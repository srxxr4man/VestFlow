# VestFlow 📈

[![Java](https://img.shields.io/badge/Java-17%2B-ED8B00?logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A modern, full-stack investment portfolio tracker and personal wealth analytics dashboard. VestFlow bridges an enterprise-grade **Spring Boot** REST backend with a reactive **React + Vite** frontend to deliver real-time asset valuation, allocation breakdowns, performance analytics, and dynamic transaction auditing.

---

## 🖥️ Application Preview

| Portfolio Dashboard | Asset Management & Ledger |
| :---: | :---: |
| *(Add your screenshot / GIF here: `docs/assets/dashboard.png`)* | *(Add your screenshot / GIF here: `docs/assets/transactions.png`)* |

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

## 🏗️ Architecture & Data Flow

```text
[ Browser / Client ]
       │
       ▼ (HTTP / JSON via Vite Proxy :5173)
[ Spring Boot REST API (:8080) ]
   ├── Web Layer (CORS Filter, Controllers)
   ├── Service Layer (Valuation Engine, Business Logic)
   └── Data Access Layer (Spring Data JPA Repositories)
       │
       ├── (Dev Profile)  ──► [ In-Memory H2 Database / Web Console ]
       └── (Prod Profile) ──► [ PostgreSQL / MySQL Instance ]
