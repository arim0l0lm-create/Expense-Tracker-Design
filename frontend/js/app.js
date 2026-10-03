// ==========================================================================
// Expense Tracker - Frontend Application Logic
// ==========================================================================

const API_BASE_URL = "http://localhost:3000/api";

let expensesData = [];
let incomeData = [];
let searchQuery = "";
let selectedCategory = "All";
let currentCurrency = localStorage.getItem("app_currency") || "USD";

document.addEventListener("DOMContentLoaded", initApp);

function initApp() {
  initUserProfile();
  setupEventListeners();
  updateCurrency(currentCurrency);
  loadDashboardData();
}

// ==========================================================================
// User Profile
// ==========================================================================

function initUserProfile() {
  let savedName = localStorage.getItem("app_user_name");

  if (!savedName) {
    savedName = "Rami";
    localStorage.setItem("app_user_name", savedName);
  }

  applyUserName(savedName);
}

function applyUserName(name) {
  const hour = new Date().getHours();

  const greeting =
    hour < 12 ? "Good morning" :
    hour < 18 ? "Good afternoon" :
    "Good evening";

  const greetingEl = document.querySelector(".greeting-title, h1");

  if (greetingEl) {
    greetingEl.innerText = `${greeting}, ${name}`;
  }

  document
    .querySelectorAll(".profile-name, .user-name")
    .forEach(el => el.innerText = name);

  const initials = name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  document
    .querySelectorAll(".avatar, .user-avatar")
    .forEach(el => el.innerText = initials || "U");
}

function updateUserName(name) {
  if (!name || !name.trim()) return;

  name = name.trim();

  localStorage.setItem("app_user_name", name);
  applyUserName(name);
}

// ==========================================================================
// Currency
// ==========================================================================

function updateCurrency(currency) {
  const currencies = {
    USD: "$",
    EUR: "€",
    JOD: "JD",
    GBP: "£"
  };

  currentCurrency = currency || "USD";

  localStorage.setItem("app_currency", currentCurrency);

  const symbol = currencies[currentCurrency] || "$";

  document
    .querySelectorAll(".currency-symbol")
    .forEach(el => el.innerText = symbol);

  document
    .querySelectorAll(".currency-code")
    .forEach(el => el.innerText = currentCurrency);

  const currencySelect = document.getElementById("settingCurrency");

  if (currencySelect) {
    currencySelect.value = currentCurrency;
  }
}

// ==========================================================================
// Events
// ==========================================================================

function setupEventListeners() {
  document
    .getElementById("expenseForm")
    .addEventListener("submit", handleAddExpense);

  document
    .getElementById("incomeForm")
    .addEventListener("submit", handleAddIncome);

  document
    .getElementById("editExpenseForm")
    .addEventListener("submit", handleUpdateExpense);

  document
    .getElementById("editIncomeForm")
    .addEventListener("submit", handleUpdateIncome);

  document
    .getElementById("categoryFilter")
    .addEventListener("change", handleCategoryFilter);

  const searchInput = document.querySelector('input[placeholder*="Search"]');

  if (searchInput) {
    searchInput.addEventListener("input", handleLiveSearch);
  }

  window.addEventListener("click", event => {
    if (event.target.classList.contains("custom-modal-overlay")) {
      event.target.classList.remove("active");
    }
  });
}

// ==========================================================================
// Search & Filter
// ==========================================================================

function handleLiveSearch(event) {
  searchQuery = event.target.value.toLowerCase().trim();
  renderTables();
}

function handleCategoryFilter(event) {
  selectedCategory = event.target.value;
  renderTables();
}

function renderTables() {
  let expenses = [...expensesData];

  if (selectedCategory !== "All") {
    expenses = expenses.filter(
      item => item.category === selectedCategory
    );
  }

  if (searchQuery) {
    expenses = expenses.filter(item =>
      item.title.toLowerCase().includes(searchQuery) ||
      item.category.toLowerCase().includes(searchQuery) ||
      item.date.includes(searchQuery) ||
      item.amount.toString().includes(searchQuery)
    );
  }

  let income = [...incomeData];

  if (searchQuery) {
    income = income.filter(item =>
      item.title.toLowerCase().includes(searchQuery) ||
      item.source.toLowerCase().includes(searchQuery) ||
      item.date.includes(searchQuery) ||
      item.amount.toString().includes(searchQuery)
    );
  }

  renderExpensesTable(expenses);
  renderIncomeTable(income);
}

// ==========================================================================
// UI Helpers
// ==========================================================================

function showSpinner(show) {
  const spinner = document.getElementById("loadingSpinner");

  if (spinner) {
    spinner.classList.toggle("d-none", !show);
  }
}

function showAlert(message, type = "success") {
  const container = document.getElementById("alertContainer");

  if (!container) return;

  const alert = document.createElement("div");

  alert.className = `alert-box alert-${type}`;
  alert.innerText = message;

  container.innerHTML = "";
  container.appendChild(alert);

  setTimeout(() => alert.remove(), 4000);
}

function openModal(id) {
  const modal = document.getElementById(id);

  if (modal) {
    modal.classList.add("active");
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);

  if (modal) {
    modal.classList.remove("active");
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ==========================================================================
// Load Data
// ==========================================================================

async function loadDashboardData() {
  showSpinner(true);

  try {
    await Promise.all([
      fetchExpenses(),
      fetchIncome()
    ]);

    updateDashboardMetrics();
    renderTables();
    updateFinancialChart();
    updateCategoryBreakdown();

  } catch (error) {
    console.error(error);
    showAlert("Failed to load dashboard data", "danger");

  } finally {
    showSpinner(false);
  }
}

async function fetchExpenses() {
  const response = await fetch(`${API_BASE_URL}/expenses`);

  if (!response.ok) {
    throw new Error("Failed to fetch expenses");
  }

  expensesData = await response.json();
}

async function fetchIncome() {
  const response = await fetch(`${API_BASE_URL}/income`);

  if (!response.ok) {
    throw new Error("Failed to fetch income");
  }

  incomeData = await response.json();
}

// ==========================================================================
// Dashboard Metrics
// ==========================================================================

function updateDashboardMetrics() {
  const totalIncome = incomeData.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  );

  const totalExpense = expensesData.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  );

  const currentBalance = totalIncome - totalExpense;

  const highestExpense = expensesData.length
    ? Math.max(...expensesData.map(item => Number(item.amount)))
    : 0;

  document.getElementById("balance").innerText =
    currentBalance.toFixed(2);

  document.getElementById("totalIncome").innerText =
    totalIncome.toFixed(2);

  document.getElementById("totalAmount").innerText =
    totalExpense.toFixed(2);

  document.getElementById("expenseCount").innerText =
    expensesData.length;

  document.getElementById("highestExpense").innerText =
    highestExpense.toFixed(2);

  updateExpenseProgress(highestExpense, totalExpense);
  updateMonthlyIndicators();
}

// ==========================================================================
// KPI Indicators
// ==========================================================================

function getMonthTotal(data, year, month) {
  return data
    .filter(item => {
      const date = new Date(item.date);

      return (
        date.getFullYear() === year &&
        date.getMonth() === month
      );
    })
    .reduce((sum, item) => sum + Number(item.amount), 0);
}

function getMonthlyChange(data) {
  if (!data.length) {
    return 0;
  }

  const now = new Date();

  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const previousDate = new Date(
    currentYear,
    currentMonth - 1,
    1
  );

  const previousMonth = previousDate.getMonth();
  const previousYear = previousDate.getFullYear();

  const currentTotal = getMonthTotal(
    data,
    currentYear,
    currentMonth
  );

  const previousTotal = getMonthTotal(
    data,
    previousYear,
    previousMonth
  );

  if (previousTotal === 0) {
    return currentTotal > 0 ? 100 : 0;
  }

  return ((currentTotal - previousTotal) / previousTotal) * 100;
}

function updateMonthlyIndicators() {
  const incomeChange = getMonthlyChange(incomeData);
  const expenseChange = getMonthlyChange(expensesData);

  updateIndicator(
    document.getElementById("incomeChange"),
    incomeChange,
    true
  );

  updateIndicator(
    document.getElementById("expenseChange"),
    expenseChange,
    false
  );
}

function updateIndicator(element, value, incomeIndicator) {
  if (!element) return;

  const roundedValue = Math.abs(value).toFixed(1);

  if (value > 0) {
    element.innerHTML = incomeIndicator
      ? `↑ ${roundedValue}%`
      : `↑ ${roundedValue}%`;

    element.className = incomeIndicator
      ? "badge badge-success"
      : "badge badge-danger";

  } else if (value < 0) {
    element.innerHTML = incomeIndicator
      ? `↓ ${roundedValue}%`
      : `↓ ${roundedValue}%`;

    element.className = incomeIndicator
      ? "badge badge-danger"
      : "badge badge-success";

  } else {
    element.innerHTML = "→ 0%";
    element.className = "badge";
  }
}

// ==========================================================================
// Expense Progress Bar
// ==========================================================================

function updateExpenseProgress(highestExpense, totalExpense) {
  const progressBar = document.getElementById("expenseProgressBar");

  if (!progressBar) return;

  if (totalExpense <= 0 || highestExpense <= 0) {
    progressBar.style.width = "0%";
    return;
  }

  const percentage = Math.min(
    (highestExpense / totalExpense) * 100,
    100
  );

  progressBar.style.width = `${percentage}%`;
}

// ==========================================================================
// Monthly Financial Chart
// ==========================================================================

function updateFinancialChart() {
  const incomePath = document.getElementById("incomeChartPath");
  const expensePath = document.getElementById("expenseChartPath");

  if (!incomePath || !expensePath) return;

  const incomeValues = getMonthlyValues(incomeData);
  const expenseValues = getMonthlyValues(expensesData);

  const allValues = [
    ...incomeValues,
    ...expenseValues
  ];

  const maxValue = Math.max(...allValues, 1);

  incomePath.setAttribute(
    "d",
    createChartPath(incomeValues, maxValue)
  );

  expensePath.setAttribute(
    "d",
    createChartPath(expenseValues, maxValue)
  );
}

function getMonthlyValues(data) {
  const values = Array(12).fill(0);

  data.forEach(item => {
    const date = new Date(item.date);

    if (!Number.isNaN(date.getTime())) {
      values[date.getMonth()] += Number(item.amount);
    }
  });

  return values;
}

function createChartPath(values, maxValue) {
  const width = 400;
  const height = 150;
  const top = 15;
  const bottom = 165;

  const step = width / 11;

  return values
    .map((value, index) => {
      const x = index * step;
      const y =
        bottom - (value / maxValue) * (bottom - top);

      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

// ==========================================================================
// Category Breakdown
// ==========================================================================

function updateCategoryBreakdown() {
  const container = document.getElementById("categoryBreakdownList");

  if (!container) return;

  const categories = [
    "Food",
    "Transport",
    "Bills",
    "Entertainment",
    "Other"
  ];

  const totals = {};

  categories.forEach(category => {
    totals[category] = expensesData
      .filter(item => item.category === category)
      .reduce((sum, item) => sum + Number(item.amount), 0);
  });

  const totalExpense = Object.values(totals)
    .reduce((sum, value) => sum + value, 0);

  container.innerHTML = "";

  categories.forEach(category => {
    const amount = totals[category];

    const percentage = totalExpense > 0
      ? (amount / totalExpense) * 100
      : 0;

    const color = getCategoryColor(category);

    const item = document.createElement("div");

    item.className = "cat-item";

    item.innerHTML = `
      <span class="cat-name">${category}</span>

      <div class="cat-bar">
        <div
          class="fill"
          style="width:${percentage}%;background:${color};"
        ></div>
      </div>

      <span class="cat-percent">${percentage.toFixed(0)}%</span>
    `;

    container.appendChild(item);
  });
}

function getCategoryColor(category) {
  const colors = {
    Food: "#10b981",
    Transport: "#3b82f6",
    Bills: "#f59e0b",
    Entertainment: "#8b5cf6",
    Other: "#64748b"
  };

  return colors[category] || "#64748b";
}

// ==========================================================================
// Tables
// ==========================================================================

function renderExpensesTable(data) {
  const tbody = document.getElementById("expensesTableBody");

  if (!tbody) return;

  tbody.innerHTML = "";

  if (!data.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center;color:#94a3b8;">
          No expenses recorded yet.
        </td>
      </tr>
    `;

    return;
  }

  data.forEach(item => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td><strong>${escapeHtml(item.title)}</strong></td>

      <td>
        <span class="badge" style="background:#e2e8f0;color:#334155;">
          ${escapeHtml(item.category)}
        </span>
      </td>

      <td>${item.date}</td>

      <td style="color:#ef4444;font-weight:600;">
        -${getCurrencySymbol()}${Number(item.amount).toFixed(2)}
      </td>

      <td>
        <div class="action-btns">
          <button
            class="btn-icon btn-edit"
            onclick="setupEditExpense(${item.id})"
          >
            Edit
          </button>

          <button
            class="btn-icon btn-delete"
            onclick="handleDeleteExpense(${item.id})"
          >
            Delete
          </button>
        </div>
      </td>
    `;

    tbody.appendChild(row);
  });
}

function renderIncomeTable(data) {
  const tbody = document.getElementById("incomeTableBody");

  if (!tbody) return;

  tbody.innerHTML = "";

  if (!data.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center;color:#94a3b8;">
          No income recorded yet.
        </td>
      </tr>
    `;

    return;
  }

  data.forEach(item => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td><strong>${escapeHtml(item.title)}</strong></td>

      <td>
        <span class="badge" style="background:#d1fae5;color:#065f46;">
          ${escapeHtml(item.source)}
        </span>
      </td>

      <td>${item.date}</td>

      <td style="color:#10b981;font-weight:600;">
        +${getCurrencySymbol()}${Number(item.amount).toFixed(2)}
      </td>

      <td>
        <div class="action-btns">
          <button
            class="btn-icon btn-edit"
            onclick="setupEditIncome(${item.id})"
          >
            Edit
          </button>

          <button
            class="btn-icon btn-delete"
            onclick="handleDeleteIncome(${item.id})"
          >
            Delete
          </button>
        </div>
      </td>
    `;

    tbody.appendChild(row);
  });
}

function getCurrencySymbol() {
  const symbols = {
    USD: "$",
    EUR: "€",
    JOD: "JD",
    GBP: "£"
  };

  return symbols[currentCurrency] || "$";
}

// ==========================================================================
// Expenses
// ==========================================================================

async function handleAddExpense(event) {
  event.preventDefault();

  const title = document.getElementById("title").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const category = document.getElementById("category").value;
  const date = document.getElementById("date").value;

  showSpinner(true);

  try {
    const response = await fetch(`${API_BASE_URL}/expenses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title,
        amount,
        category,
        date
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to add expense");
    }

    document.getElementById("expenseForm").reset();

    showAlert("Expense added successfully!");

    await loadDashboardData();

  } catch (error) {
    showAlert(error.message, "danger");

  } finally {
    showSpinner(false);
  }
}

function setupEditExpense(id) {
  const item = expensesData.find(
    expense => expense.id === id
  );

  if (!item) return;

  document.getElementById("editId").value = item.id;
  document.getElementById("editTitle").value = item.title;
  document.getElementById("editAmount").value = item.amount;
  document.getElementById("editCategory").value = item.category;
  document.getElementById("editDate").value = item.date;

  openModal("editModal");
}

async function handleUpdateExpense(event) {
  event.preventDefault();

  const id = document.getElementById("editId").value;
  const title = document.getElementById("editTitle").value;
  const amount = parseFloat(
    document.getElementById("editAmount").value
  );
  const category = document.getElementById("editCategory").value;
  const date = document.getElementById("editDate").value;

  showSpinner(true);

  try {
    const response = await fetch(
      `${API_BASE_URL}/expenses/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title,
          amount,
          category,
          date
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to update expense"
      );
    }

    closeModal("editModal");

    showAlert("Expense updated successfully!");

    await loadDashboardData();

  } catch (error) {
    showAlert(error.message, "danger");

  } finally {
    showSpinner(false);
  }
}

async function handleDeleteExpense(id) {
  if (!confirm("Are you sure you want to delete this expense?")) {
    return;
  }

  showSpinner(true);

  try {
    const response = await fetch(
      `${API_BASE_URL}/expenses/${id}`,
      {
        method: "DELETE"
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to delete expense"
      );
    }

    showAlert("Expense deleted successfully!");

    await loadDashboardData();

  } catch (error) {
    showAlert(error.message, "danger");

  } finally {
    showSpinner(false);
  }
}

// ==========================================================================
// Income
// ==========================================================================

async function handleAddIncome(event) {
  event.preventDefault();

  const title = document.getElementById("incomeTitle").value;
  const amount = parseFloat(
    document.getElementById("incomeAmount").value
  );
  const source = document.getElementById("incomeSource").value;
  const date = document.getElementById("incomeDate").value;

  showSpinner(true);

  try {
    const response = await fetch(`${API_BASE_URL}/income`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title,
        amount,
        source,
        date
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to add income"
      );
    }

    document.getElementById("incomeForm").reset();

    showAlert("Income added successfully!");

    await loadDashboardData();

  } catch (error) {
    showAlert(error.message, "danger");

  } finally {
    showSpinner(false);
  }
}

function setupEditIncome(id) {
  const item = incomeData.find(
    income => income.id === id
  );

  if (!item) return;

  document.getElementById("editIncomeId").value = item.id;
  document.getElementById("editIncomeTitle").value = item.title;
  document.getElementById("editIncomeAmount").value = item.amount;
  document.getElementById("editIncomeSource").value = item.source;
  document.getElementById("editIncomeDate").value = item.date;

  openModal("editIncomeModal");
}

async function handleUpdateIncome(event) {
  event.preventDefault();

  const id = document.getElementById("editIncomeId").value;
  const title = document.getElementById("editIncomeTitle").value;

  const amount = parseFloat(
    document.getElementById("editIncomeAmount").value
  );

  const source =
    document.getElementById("editIncomeSource").value;

  const date =
    document.getElementById("editIncomeDate").value;

  showSpinner(true);

  try {
    const response = await fetch(
      `${API_BASE_URL}/income/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title,
          amount,
          source,
          date
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to update income"
      );
    }

    closeModal("editIncomeModal");

    showAlert("Income updated successfully!");

    await loadDashboardData();

  } catch (error) {
    showAlert(error.message, "danger");

  } finally {
    showSpinner(false);
  }
}

async function handleDeleteIncome(id) {
  if (!confirm("Are you sure you want to delete this income entry?")) {
    return;
  }

  showSpinner(true);

  try {
    const response = await fetch(
      `${API_BASE_URL}/income/${id}`,
      {
        method: "DELETE"
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to delete income"
      );
    }

    showAlert("Income deleted successfully!");

    await loadDashboardData();

  } catch (error) {
    showAlert(error.message, "danger");

  } finally {
    showSpinner(false);
  }
}

// ==========================================================================
// CSV Report
// ==========================================================================

function downloadCSVReport() {
  const rows = [
    ["Type", "Title", "Category / Source", "Date", "Amount"]
  ];

  expensesData.forEach(item => {
    rows.push([
      "Expense",
      item.title,
      item.category,
      item.date,
      Number(item.amount).toFixed(2)
    ]);
  });

  incomeData.forEach(item => {
    rows.push([
      "Income",
      item.title,
      item.source,
      item.date,
      Number(item.amount).toFixed(2)
    ]);
  });

  const csv = rows
    .map(row =>
      row
        .map(value =>
          `"${String(value).replace(/"/g, '""')}"`
        )
        .join(",")
    )
    .join("\n");

  const blob = new Blob(
    [csv],
    {
      type: "text/csv;charset=utf-8;"
    }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "expense-tracker-report.csv";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);

  closeModal("reportsModal");

  showAlert("CSV report downloaded successfully!");
}