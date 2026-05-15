# Fluffy - E-commerce & Factory Management Platform
## Project Documentation for Course Project

---

### 1. Project Problem Statement
In the modern fashion and textile industry, businesses often struggle to manage both their retail storefronts and their internal factory operations efficiently. Traditional systems typically separate e-commerce sales from production tracking, leading to miscommunication, delayed orders, and inaccurate stock management. 
**"Fluffy"** solves this problem by providing a unified, full-stack platform that seamlessly integrates a customer-facing e-commerce storefront with a robust backend factory management dashboard. It bridges the gap between the point of sale and the production floor, allowing owners to track orders, manage workers, and oversee production lines in real-time, all within a single application.

---

### 2. Functional and Non-Functional Requirements

#### Functional Requirements:
- **User Authentication:** Customers, Workers, and Admins must be able to securely register and log in with role-based access control.
- **Product Management:** Admins can add, update, and remove products from the catalog.
- **Shopping Cart & Checkout:** Customers can browse products, add them to a cart, and place orders.
- **Order Tracking:** Customers and Admins can track the status of orders.
- **Factory Management:** Admins can manage factory clients, assign tasks to workers, and track production stages.
- **Virtual Try-On (AI Integration):** Customers can use an AI-powered module to visualize how products look on them.

#### Non-Functional Requirements:
- **Scalability:** The system architecture must be designed to handle an increasing number of users and products using a decoupled backend.
- **Maintainability:** The backend must adhere to clean code principles, utilizing **Inversion of Control (IoC)** and **Dependency Injection (DI)** to ensure components are modular and testable.
- **Performance:** API response times should be optimized, and the frontend should provide a responsive, seamless Single Page Application (SPA) experience.
- **Security:** User passwords must be hashed, and API endpoints must be protected using JWT tokens.

---

### 3. Team Member Responsibilities (Component Distribution)
To ensure balanced contribution and adherence to the project guidelines, the work is divided into four main components:

1. **Member 1: Frontend & UI Component (React/Vite)**
   - Responsible for building the user interface, including the e-commerce storefront, admin dashboard, and integrating the styling (Tailwind CSS/shadcn).
2. **Member 2: API & Routing Component (Express.js)**
   - Responsible for setting up the RESTful API endpoints, handling HTTP requests, and configuring route middleware (`userRoutes`, `productRoutes`, etc.).
3. **Member 3: Business Logic & Architecture (IoC/DI)**
   - Responsible for implementing the core business logic and applying advanced architectural patterns. Specifically, implementing the **Dependency Injection (DI) Container** and **Service Layer** for the Order module to achieve **Inversion of Control (IoC)**.
4. **Member 4: Data Access & Database Component (MongoDB/Mongoose)**
   - Responsible for designing the database schema, creating Mongoose Models (`User`, `Product`, `Order`, `Production`), and writing database query logic.

---

### 4. Overall System Design/Architecture & Key Concepts Applied

#### System Architecture:
The application follows a **Client-Server Architecture** using the MERN stack:
- **Presentation Layer (Frontend):** Built with React.js, Vite, and Tailwind CSS. It communicates with the backend via RESTful APIs.
- **Application Layer (Backend):** Built with Node.js and Express.js. It handles business logic, authentication, and request routing.
- **Data Access Layer (Database):** Uses MongoDB to store user, product, order, and factory data.

#### Key Concepts Applied: Inversion of Control (IoC) & Dependency Injection (DI)
To satisfy the advanced course requirements, we refactored the **Order Management Module** to utilize **IoC** and **DI**:
- **Problem Avoided:** Tight coupling between Controllers and Models makes code hard to test and maintain.
- **Solution Implemented:** 
  - We created an `OrderService` class (Business Logic) that requires `OrderModel` and `ProductModel`.
  - We created an `OrderController` class (Presentation Logic) that requires `OrderService`.
  - We built an **IoC Container** (`container.js`) that automatically resolves and injects these dependencies from the outside. The Controller no longer creates its own dependencies (Inversion of Control).

---

### 5. Diagrams (For you to draw/recreate in your Report)

#### A. Use Case Diagram (High-level)
- **Actor: Customer** -> (Browse Products, Add to Cart, Place Order, Virtual Try-On)
- **Actor: Admin** -> (Manage Products, View Orders, Manage Factory Workers, Manage Production)
- **Actor: Worker** -> (View Assigned Tasks, Update Production Status)

#### B. Component Diagram (Focusing on IoC Implementation)
```text
[ Express Router (orderRoutes) ] 
       |
       | (uses)
       v
[ DI Container (container.js) ] --(injects)--> [ Order Controller ]
                                                      |
                                                      | (injects)
                                                      v
                                               [ Order Service ]
                                                      |
                                                      | (injects)
                                                      v
                                     [ Order Model ] & [ Product Model ]
```

---

### 6. Screenshots for the User Interface
*(Please take screenshots of the following pages while running your project locally and insert them into your Word document)*
1. Home Page / Product Catalog
2. Shopping Cart & Checkout Page
3. Admin Dashboard (Factory Management / Best Sellers)
4. Virtual Try-On Interface
