# Expense Tracker

A full-stack web application for tracking personal expenses.

## Features

* Add expenses
* View all expenses
* Edit expenses
* Delete expenses
* Filter expenses by category
* Display total expenses
* Display number of expenses
* Display highest expense
* Data stored in PostgreSQL
* REST API using Node.js and Express
* Responsive design using Bootstrap

## Technologies

### Frontend

* HTML
* CSS
* JavaScript
* Bootstrap

### Backend

* Node.js
* Express.js
* PostgreSQL
* pg
* dotenv
* CORS

## Project Structure

```text
expense-tracker/
├── frontend/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
│
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── schema.sql
│   └── .env.example
│
├── .gitignore
└── README.md
```

## Setup

### 1. Create the database

Create a PostgreSQL database named:

```text
expense_tracker
```

Then open `backend/schema.sql` and run it inside the `expense_tracker` database.

### 2. Configure environment variables

Create a `.env` file inside the `backend` folder.

Use `.env.example` as a template:

```env
DB_NAME=expense_tracker
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_HOST=localhost
DB_PORT=5432
```

Replace `your_password_here` with your PostgreSQL password.

### 3. Install backend dependencies

Open a terminal inside the `backend` folder and run:

```bash
npm install
```

### 4. Start the server

Run:

```bash
node server.js
```

The server will run at:

```text
http://localhost:3000
```

### 5. Open the frontend

Open:

```text
frontend/index.html
```

in a web browser.

## API Endpoints

| Method | Endpoint            | Description       |
| ------ | ------------------- | ----------------- |
| GET    | `/api/expenses`     | Get all expenses  |
| GET    | `/api/expenses/:id` | Get one expense   |
| POST   | `/api/expenses`     | Add an expense    |
| PUT    | `/api/expenses/:id` | Update an expense |
| DELETE | `/api/expenses/:id` | Delete an expense |

## Categories

The available expense categories are:

* Food
* Transport
* Bills
* Entertainment
* Other

## Notes

The `.env` file contains local database credentials and should not be submitted.

The `node_modules` folder should also not be included in the submitted project.

## Demo Video
[Click here to watch the demo video] https://www.youtube.com/watch?v=c1Cr_MlsoXU