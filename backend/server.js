
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const allowedCategories = [
  "Food",
  "Transport",
  "Bills",
  "Entertainment",
  "Other"
];

const allowedIncomeSources = [
  "Full-time",
  "Freelance"
];

// Test database connection
pool.query("SELECT NOW()", (err) => {
  if (err) {
    console.error("Database connection error:", err);
  } else {
    console.log("Database connected successfully!");
  }
});

// =========================
// EXPENSES
// =========================

// GET all expenses
app.get("/api/expenses", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        title,
        amount,
        category,
        TO_CHAR(date, 'YYYY-MM-DD') AS date
      FROM expenses
      ORDER BY id ASC
    `);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to get expenses"
    });
  }
});

// GET one expense by ID
app.get("/api/expenses/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(404).json({
      message: "Expense not found"
    });
  }

  try {
    const result = await pool.query(
      `
      SELECT
        id,
        title,
        amount,
        category,
        TO_CHAR(date, 'YYYY-MM-DD') AS date
      FROM expenses
      WHERE id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Expense not found"
      });
    }

    res.status(200).json(result.rows[0]);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to get expense"
    });
  }
});

// Validate expense data
function validateExpense(title, amount, category, date) {
  if (
    typeof title !== "string" ||
    title.trim() === ""
  ) {
    return "Title is required";
  }

  if (
    typeof amount !== "number" ||
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    return "Amount must be a number greater than 0";
  }

  if (!allowedCategories.includes(category)) {
    return "Invalid category";
  }

  if (
    typeof date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date)
  ) {
    return "Date must be in YYYY-MM-DD format";
  }

  return null;
}

// POST new expense
app.post("/api/expenses", async (req, res) => {
  const { title, amount, category, date } = req.body;

  const validationError = validateExpense(
    title,
    amount,
    category,
    date
  );

  if (validationError) {
    return res.status(400).json({
      message: validationError
    });
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO expenses (title, amount, category, date)
      VALUES ($1, $2, $3, $4)
      RETURNING
        id,
        title,
        amount,
        category,
        TO_CHAR(date, 'YYYY-MM-DD') AS date
      `,
      [title.trim(), amount, category, date]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error(error);

    res.status(400).json({
      message: "Failed to add expense"
    });
  }
});

// PUT update expense
app.put("/api/expenses/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(404).json({
      message: "Expense not found"
    });
  }

  const { title, amount, category, date } = req.body;

  const validationError = validateExpense(
    title,
    amount,
    category,
    date
  );

  if (validationError) {
    return res.status(400).json({
      message: validationError
    });
  }

  try {
    const result = await pool.query(
      `
      UPDATE expenses
      SET
        title = $1,
        amount = $2,
        category = $3,
        date = $4
      WHERE id = $5
      RETURNING
        id,
        title,
        amount,
        category,
        TO_CHAR(date, 'YYYY-MM-DD') AS date
      `,
      [title.trim(), amount, category, date, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Expense not found"
      });
    }

    res.status(200).json(result.rows[0]);

  } catch (error) {
    console.error(error);

    res.status(400).json({
      message: "Failed to update expense"
    });
  }
});

// DELETE expense
app.delete("/api/expenses/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(404).json({
      message: "Expense not found"
    });
  }

  try {
    const result = await pool.query(
      `
      DELETE FROM expenses
      WHERE id = $1
      RETURNING id
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Expense not found"
      });
    }

    res.status(200).json({
      message: "Expense deleted successfully"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete expense"
    });
  }
});


// =========================
// INCOME
// =========================

// GET all income
app.get("/api/income", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        title,
        amount,
        source,
        TO_CHAR(date, 'YYYY-MM-DD') AS date
      FROM income
      ORDER BY id ASC
    `);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to get income"
    });
  }
});

// GET one income by ID
app.get("/api/income/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(404).json({
      message: "Income not found"
    });
  }

  try {
    const result = await pool.query(
      `
      SELECT
        id,
        title,
        amount,
        source,
        TO_CHAR(date, 'YYYY-MM-DD') AS date
      FROM income
      WHERE id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Income not found"
      });
    }

    res.status(200).json(result.rows[0]);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to get income"
    });
  }
});

// Validate income data
function validateIncome(title, amount, source, date) {
  if (
    typeof title !== "string" ||
    title.trim() === ""
  ) {
    return "Income title is required";
  }

  if (
    typeof amount !== "number" ||
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    return "Income amount must be a number greater than 0";
  }

  if (!allowedIncomeSources.includes(source)) {
    return "Invalid income source";
  }

  if (
    typeof date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date)
  ) {
    return "Date must be in YYYY-MM-DD format";
  }

  return null;
}

// POST new income
app.post("/api/income", async (req, res) => {
  const { title, amount, source, date } = req.body;

  const validationError = validateIncome(
    title,
    amount,
    source,
    date
  );

  if (validationError) {
    return res.status(400).json({
      message: validationError
    });
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO income (title, amount, source, date)
      VALUES ($1, $2, $3, $4)
      RETURNING
        id,
        title,
        amount,
        source,
        TO_CHAR(date, 'YYYY-MM-DD') AS date
      `,
      [title.trim(), amount, source, date]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error(error);

    res.status(400).json({
      message: "Failed to add income"
    });
  }
});

// PUT update income
app.put("/api/income/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(404).json({
      message: "Income not found"
    });
  }

  const { title, amount, source, date } = req.body;

  const validationError = validateIncome(
    title,
    amount,
    source,
    date
  );

  if (validationError) {
    return res.status(400).json({
      message: validationError
    });
  }

  try {
    const result = await pool.query(
      `
      UPDATE income
      SET
        title = $1,
        amount = $2,
        source = $3,
        date = $4
      WHERE id = $5
      RETURNING
        id,
        title,
        amount,
        source,
        TO_CHAR(date, 'YYYY-MM-DD') AS date
      `,
      [title.trim(), amount, source, date, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Income not found"
      });
    }

    res.status(200).json(result.rows[0]);

  } catch (error) {
    console.error(error);

    res.status(400).json({
      message: "Failed to update income"
    });
  }
});

// DELETE income
app.delete("/api/income/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(404).json({
      message: "Income not found"
    });
  }

  try {
    const result = await pool.query(
      `
      DELETE FROM income
      WHERE id = $1
      RETURNING id
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Income not found"
      });
    }

    res.status(200).json({
      message: "Income deleted successfully"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete income"
    });
  }
});


app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});

