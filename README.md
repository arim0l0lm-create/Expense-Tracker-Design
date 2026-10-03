# Expense Tracker

A simple full-stack web application for managing personal expenses.
The application allows users to add, view, edit, and delete expenses, with data stored in a PostgreSQL database.

## Links

* GitHub Repository: https://github.com/arim0l0lm-create/Expense-Tracker-Design
* Demo Video: https://www.youtube.com/watch?v=c1Cr_MlsoXU

---

## Features

* Add new expenses
* View all expenses
* Edit existing expenses
* Delete expenses
* Filter expenses by category
* View total expenses
* View the highest expense
* View the number of expenses
* Store expense data using PostgreSQL
* REST API using Node.js and Express
* Responsive user interface

---

## Technologies Used

### Frontend

* HTML5
* CSS3
* JavaScript (ES6+)
* Bootstrap 5

### Backend

* Node.js
* Express.js
* PostgreSQL
* pg
* dotenv
* CORS

---

## Project Structure

Expense-Tracker-Design/
├── frontend/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
│
├── backend/
│   ├── server.js
│   ├── schema.sql
│   ├── package.json
│   └── .env.example
│
├── .gitignore
└── README.md

---

## How to Run the Application

### 1. Database Setup

Create a PostgreSQL database named:

expense_tracker

Then run the SQL commands inside:

backend/schema.sql

This will create the required database table.

### 2. Backend Setup

Open a terminal and navigate to the backend folder:

cd backend

Create a `.env` file based on `.env.example` and add your PostgreSQL connection details:

DB_NAME=expense_tracker
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_HOST=localhost
DB_PORT=5432
PORT=3000

Install the required packages:

npm install

Start the backend server:

node server.js

The server should run at:

http://localhost:3000

### 3. Frontend Setup

Open the `frontend` folder and open:

index.html

The frontend can be opened directly in a browser or using the Live Server extension in VS Code.

Make sure the backend server is running before using the application.

---

## API Endpoints

| Method | Endpoint          | Description          |
| ------ | ----------------- | -------------------- |
| GET    | /api/expenses     | Get all expenses     |
| GET    | /api/expenses/:id | Get a single expense |
| POST   | /api/expenses     | Create a new expense |
| PUT    | /api/expenses/:id | Update an expense    |
| DELETE | /api/expenses/:id | Delete an expense    |

---

## Challenges Faced

During the development of the project, I faced a few challenges, especially while setting up the PostgreSQL database and connecting it to the backend.

Another challenge was handling the connection between the frontend and backend and making sure API requests were handled correctly using async/await.

I also had to configure environment variables and make sure sensitive information such as the database password was not included in the repository.

---

## Notes

* The `.env` file is not included in the repository because it contains local database credentials.
* The `node_modules` folder is also excluded from the repository.
* The project uses PostgreSQL for storing expense data.
* Make sure PostgreSQL is running before starting the backend server.
