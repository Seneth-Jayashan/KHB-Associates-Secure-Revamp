# KHB Web Application

## Project Overview

The **KHB Web Application** is an e-commerce platform developed for **KHB Associates Pvt Ltd**, specializing in selling textile machines. This application is built using the **MERN stack** to manage product listings, customer orders, and user roles efficiently. The platform is designed to enhance the online shopping experience with user-friendly features and responsive UI.

## Features

* **User Authentication and Authorization:** Role-based access control (Admin, Customer, Inventory Manager, Customer Supporter, Delivery).
* **Product Management:** Add, update, delete, and view products.
* **Order Management:** Place, update, and track orders.
* **User Management:** Create and manage user accounts with role assignments.
* **Dashboard Analytics:** Visual representation of user roles and activities.
* **Data Security:** JWT-based authentication and secure data handling.
* **Reports and Analysis:** PDF generation and chart-based analytics.

## Tech Stack

* **Frontend:** React, Tailwind CSS
* **Backend:** Node.js, Express.js
* **Database:** MongoDB
* **Authentication:** JSON Web Tokens (JWT)
* **Version Control:** Git & GitHub

## Installation

### Prerequisites

* Node.js
* MongoDB
* Git

### Steps

1. **Clone the repository:**

   ```bash
   git clone https://github.com/S-JAY-Web-Solutions/KHB-Web-Application.git
   cd KHB-Web-Application
   ```

2. **Backend Setup:**

   ```bash
   cd backend
   npm install
   ```

   * Create a `.env` file in the backend directory:

     ```bash
     PORT=3000
     MONGO_URI=mongodb://localhost:27017/khb-web-app
     JWT_SECRET=your_jwt_secret
     ```

3. **Frontend Setup:**

   ```bash
   cd ../frontend
   npm install
   ```

4. **Running the Application:**

   * To start both frontend and backend :

     ```bash
     npm start
     ```

## Project Structure

```
KHB Web Application
├── backend
│   ├── models
│   ├── routes
│   ├── controllers
│   ├── server
│   ├── .env
│   ├── middleware
│   ├── uploads
│   └── utils
├── frontend
│   └── src
│       ├── components
│       ├── pages
│       ├── Admin
│       ├── Customer
│       ├── CustomerSupporter
│       ├── ChatBot
│       ├── Deliver
│       ├── InventoryManager
│       ├── assets
│       └── routes
└── README.md
```

## Usage

Visit the application at:

```
http://localhost:3000
```

## Contributing

1. Fork the repository
2. Create a new branch:

   ```bash
   git checkout -b feature-branch
   ```
3. Make your changes and commit:

   ```bash
   git commit -m "Add new feature"
   ```
4. Push the changes:

   ```bash
   git push origin feature-branch
   ```
5. Create a pull request

## License

This project is licensed under the **MIT License**.

## Contact

For any inquiries, please contact:

* **Company:** S JAY Web Solutions (Pvt) Ltd
* **Email:** [S JAY Web Solutions](mailto:sjayashan35@gmail.com)
