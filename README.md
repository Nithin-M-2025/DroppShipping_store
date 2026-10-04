# DroppShipping Store 🛍️

A full-stack e-commerce web application built with **React.js, Redux, Node.js, Express.js, and SQLite**, featuring product search, authentication, image search, and Twilio-powered services.

## 🚀 Features

* 🛒 Browse products
* 🔍 Product search
* 🖼️ Product image search
* 📦 Product details
* 🔐 User authentication
* 🛡️ JWT-based authentication
* 🔒 Protected routes
* 🗃️ Product and user data management
* 🔄 Global state management using Redux
* 📱 Responsive user interface
* 📲 Twilio service integration
* ⚡ REST API integration
* 💾 SQLite database

## 🛠️ Tech Stack

### Frontend

* React.js
* JavaScript
* HTML5
* CSS3
* Bootstrap
* React Router
* Redux
* Redux Toolkit
* REST APIs

### Backend

* Node.js
* Express.js
* SQLite
* JWT
* CORS

### External Services

* **Twilio** — communication/notification services
* **Product Image Search API** — used to search and retrieve product images

## 🏗️ Architecture

```text
                 ┌──────────────────────┐
                 │      React.js        │
                 │      Frontend        │
                 └──────────┬───────────┘
                            │
                            │ REST API
                            ▼
                 ┌──────────────────────┐
                 │    Node.js +         │
                 │     Express.js       │
                 └──────────┬───────────┘
                            │
             ┌──────────────┼──────────────┐
             │              │              │
             ▼              ▼              ▼
       ┌──────────┐   ┌──────────┐   ┌──────────┐
       │  SQLite  │   │  Twilio  │   │  Image   │
       │ Database │   │ Services │   │  Search  │
       └──────────┘   └──────────┘   └──────────┘
```

## 📁 Project Structure

```text
DroppShipping_store/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── redux/
│   │   ├── App.jsx
│   │   └── ...
│   ├── package.json
│   └── ...
│
├── server/
│   ├── routes/
│   ├── controllers/
│   ├── database/
│   ├── middleware/
│   ├── ...
│   └── package.json
│
├── .gitignore
└── README.md
```

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Nithin-M-2025/DroppShipping_store.git
```

```bash
cd DroppShipping_store
```

### 2. Install frontend dependencies

```bash
cd client
npm install
```

### 3. Install backend dependencies

Open another terminal:

```bash
cd server
npm install
```

## 🔐 Environment Variables

Create a `.env` file in the appropriate directory and configure the required credentials.

Example:

```env
PORT=3000
JWT_SECRET=your_jwt_secret

TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number

IMAGE_SEARCH_API_KEY=your_api_key
```

**Never commit your `.env` file or API keys to GitHub.**

## ▶️ Running the Application

### Start the backend

```bash
cd server
npm run dev
```

The backend runs on:

```text
http://localhost:3000
```

### Start the frontend

Open another terminal:

```bash
cd client
npm run dev
```

Then open the local URL provided by Vite.

## 🔐 Authentication & Authorization

The application uses **JWT-based authentication**.

The authentication flow:

```text
User
 │
 │ Login credentials
 ▼
React Frontend
 │
 │ Login API request
 ▼
Express Backend
 │
 │ Validate credentials
 ▼
JWT Token
 │
 ▼
Cookie
 │
 │ Authenticated API requests
 ▼
Protected Backend Routes
```

Protected resources are accessible only after the backend verifies the JWT.

## 🔄 State Management

**Redux** is used for managing global application state.

Instead of passing data through multiple levels of React components, shared state can be maintained in the Redux store and accessed by the required components.

```text
React Components
       │
       ▼
    Redux Store
       │
       ▼
Global Application State
```

## 🖼️ Product Image Search

The application integrates an **image search service** to search for relevant product images.

This allows product information and visual content to be retrieved dynamically instead of relying entirely on manually stored images.

## 📲 Twilio Integration

**Twilio** is integrated into the backend to provide communication-related functionality.

The backend communicates with Twilio through its API, allowing the application to trigger supported Twilio services.

## 🗄️ Database

The application uses **SQLite** as its database.

The backend uses Node.js and Express.js to interact with the database and expose REST APIs to the React frontend.

## 🔌 API Communication

The frontend communicates with the backend using HTTP requests.

```text
React + Redux
      │
      │ HTTP Request
      ▼
Express REST API
      │
      ├── Authentication
      ├── Products
      ├── Image Search
      ├── Twilio Services
      │
      ▼
SQLite Database / External APIs
```

## 📌 Future Improvements

* 🛒 Shopping cart
* 💳 Payment gateway integration
* 📦 Order management
* 👤 User profile
* 🛠️ Admin dashboard
* 🔎 Advanced product filtering
* 📄 Product pagination
* ☁️ Cloud deployment
* 🤖 AI-powered product recommendations
* 📊 Analytics dashboard

## 👨‍💻 Author

**Nithin M**

GitHub:
https://github.com/Nithin-M-2025
