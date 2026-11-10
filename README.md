# 📈 VestFlow — Investment Portfolio Tracker

<p align="center">
  <b>Track Your Wealth. Analyze Your Investments. Make Smarter Decisions.</b>
  <br>
  A modern, full-stack investment portfolio management and personal wealth analytics platform.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React%2018-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Backend-Spring%20Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" />
  <img src="https://img.shields.io/badge/Build-Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Database-H2%20%7C%20PostgreSQL-4479A1?style=for-the-badge" />
</p>

---

## 📌 About the Project

**VestFlow** is a modern, full-stack investment portfolio tracker designed to simplify personal wealth management through an intuitive analytics dashboard.

The application combines a robust **Java Spring Boot REST API** with a reactive **React + Vite frontend**, providing a centralized platform to monitor investment holdings, analyze asset allocation, track portfolio performance, and manage financial transactions.

From equities and fixed-income investments to cryptocurrencies and cash holdings, VestFlow brings different asset classes together into a unified portfolio management experience.

Built with scalability, modularity, and maintainability in mind, the project follows a decoupled frontend-backend architecture with flexible database integration.

## ✨ Key Features

- 📊 **Portfolio Analytics:** Monitor total portfolio value, net worth, and investment performance.
- 💰 **Asset Allocation:** Categorize investments across equities, indices, commodities, fixed income, cryptocurrencies, and cash.
- 📈 **Performance Tracking:** Analyze portfolio gains, losses, and percentage returns.
- 🔄 **Transaction Management:** Create, view, update, and delete investment records.
- 🧾 **Transaction Ledger:** Maintain detailed records of purchase prices, quantities, execution dates, and trade information.
- ⚡ **Reactive Dashboard:** Dynamic React components with asynchronous data synchronization.
- 🎨 **Animated UI:** Custom CSS animations, loading screens, and responsive dashboard components.
- 🗄️ **Flexible Database Support:** H2 for development with PostgreSQL and MySQL compatibility for production.
- 🔌 **RESTful API:** Structured backend endpoints with validation and CORS configuration.
- 🧪 **Database Inspection:** Integrated H2 Web Console for inspecting database tables and queries.

## 🚀 Core Modules & Capabilities

### 1. 📊 Dashboard Overview
- Displays total portfolio value and net worth.
- Provides percentage-based return metrics.
- Presents investment distribution across different asset classes.
- Offers a centralized overview of financial holdings.

### 2. 💹 Asset Allocation Engine
- Organizes investments into different asset categories.
- Supports equities, indices, commodities, and cash.
- Provides a structured overview of portfolio distribution.

### 3. 🧾 Transaction History & Ledger
- Records individual investment transactions.
- Tracks purchase price, execution date, and order quantity.
- Supports CRUD operations for investment records.
- Maintains structured transaction information.

### 4. 🌐 Market Telemetry
- Provides service hooks for market price integration.
- Supports simulated market data.
- Designed for future integration with live stock and cryptocurrency price feeds.

### 5. 🗄️ Database Web Inspector
- Uses the H2 Database Console during development.
- Allows inspection of database tables and schemas.
- Helps monitor stored records and execute database queries.

### 6. 🎬 Animated Client Gateway
- Custom CSS keyframe animations.
- Animated loading screens during asynchronous operations.
- Smooth transitions between dashboard states.
- Designed to improve the overall user experience.

## 🛠️ Technology Stack

### Backend

| Technology | Purpose |
|---|---|
| ☕ Java 17+ | Core programming language |
| 🍃 Spring Boot 3.x | Backend application framework |
| 🌐 Spring Web | REST API development |
| 🗃️ Spring Data JPA | Database interaction |
| 🔧 Spring Boot DevTools | Development productivity |
| 📦 Apache Maven | Dependency and build management |
| 💾 H2 Database | In-memory development database |
| 🐘 PostgreSQL / MySQL | Production database compatibility |

### Frontend

| Technology | Purpose |
|---|---|
| ⚛️ React 18+ | Component-based UI development |
| ⚡ Vite | Frontend build tool and development server |
| 🎨 CSS3 | Styling and responsive layouts |
| 📐 Flexbox & Grid | Dashboard layout management |
| 🎬 CSS Keyframes | Animations and transitions |
| 📦 NPM | Package management |
| 🔍 Oxlint | Code quality and linting |

## 🏗️ System Architecture

VestFlow follows a decoupled client-server architecture.

```text
             👤 USER
                |
                v
      +--------------------+
      |   React Frontend   |
      |     + Vite         |
      +--------------------+
                |
                | HTTP Requests
                | REST API
                v
      +--------------------+
      |  Spring Boot       |
      |  Backend Server    |
      +--------------------+
                |
                v
      +--------------------+
      |  Service Layer     |
      |  Business Logic    |
      +--------------------+
                |
                v
      +--------------------+
      |  Spring Data JPA   |
      |  Repository Layer  |
      +--------------------+
                |
                v
      +--------------------+
      |   Database         |
      | H2 / PostgreSQL /  |
      |       MySQL        |
      +--------------------+
```

## 🔌 REST API Documentation

The backend exposes RESTful endpoints to manage portfolio information and investment records.

### 📡 API Endpoints

| HTTP Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/portfolio` | Retrieve portfolio summary and analytics |
| `GET` | `/api/assets` | Fetch all tracked assets |
| `GET` | `/api/assets/{id}` | Retrieve a specific asset and its trade history |
| `POST` | `/api/assets` | Register a new investment holding |
| `PUT` | `/api/assets/{id}` | Update an existing asset |
| `DELETE` | `/api/assets/{id}` | Remove an asset record |

### 📥 Sample API Request

**POST** `/api/assets`

```json
{
  "ticker": "AAPL",
  "name": "Apple Inc.",
  "assetType": "EQUITY",
  "quantity": 15.0,
  "buyPrice": 182.50,
  "currency": "USD"
}
```

### 📤 Expected API Response

```json
{
  "ticker": "AAPL",
  "name": "Apple Inc.",
  "assetType": "EQUITY",
  "quantity": 15.0,
  "buyPrice": 182.50,
  "currency": "USD"
}
```

*Response fields may vary depending on the backend implementation.*

## 🗄️ Database Architecture

VestFlow supports flexible database configurations for different environments.

| Environment | Database | Purpose |
|---|---|---|
| Development | H2 | Lightweight in-memory storage |
| Production | PostgreSQL | Relational data persistence |
| Production | MySQL | Alternative relational database |

**Database Highlights:**
- Spring Data JPA integration.
- Repository-based data access.
- Structured investment record storage.
- H2 Web Console for development inspection.
- Configurable database connectivity.

## 🎯 Project Objectives & Learning Outcomes

This project explores the development of a full-stack financial application using modern web technologies.

Key concepts explored:

- Building RESTful APIs using Spring Boot.
- Developing reusable UI components with React.
- Managing asynchronous frontend-backend communication.
- Implementing CRUD operations.
- Working with Spring Data JPA and relational databases.
- Understanding client-server architecture.
- Designing modular and maintainable applications.
- Implementing responsive interfaces and CSS animations.

## 🔮 Future Enhancements

- 📡 Integrate real-time stock market and cryptocurrency APIs.
- 📉 Add interactive portfolio performance charts.
- 🔐 Implement secure user authentication and authorization.
- 👥 Introduce individual user portfolios and profile management.
- 📊 Add advanced financial analytics and investment insights.
- 🔔 Implement price alerts and portfolio notifications.
- 📱 Improve mobile responsiveness.
- ☁️ Deploy the application using cloud infrastructure.

## 👨‍💻 Project Team

<p align="center">
  <b>Built with ❤️ by Team VestFlow</b>
</p>

<p align="center">
  <b>A Sreeram</b> · <b>Astin Shibu</b> · <b>Asil Sameer</b> · <b>Vidyasagar V S</b>
</p>

🎓 Artificial Intelligence & Data Science Students

💡 Interested in Full-Stack Development, Java, React, Financial Technology, and Machine Learning.

---

<p align="center">
  <b>📈 Build Wealth. Track Progress. Stay Ahead.</b>
  <br><br>
  ⭐ If you find VestFlow interesting, consider giving this repository a star!
  <br><br>
  <b>Made with ❤️ and Code.</b>
</p>
