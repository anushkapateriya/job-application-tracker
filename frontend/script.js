
const API_BASE = "/api";

const authSection = document.getElementById("auth-section");
const appSection = document.getElementById("app-section");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const authMessage = document.getElementById("auth-message");
const appMessage = document.getElementById("app-message");

let currentUser = null;

// Make requests to our backend.
async function apiRequest(url, options = {}) {
  const response = await fetch(`${API_BASE}${url}`, {
    credentials: "same-origin",
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({
    success: false,
    message: "The server returned an invalid response.",
  }));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
}

// Show a message on the login or registration screen.
function showAuthMessage(message, type = "") {
  authMessage.textContent = message;
  authMessage.className = `message ${type}`;
}

// Show a message inside the main application.
function showAppMessage(message, type = "") {
  appMessage.textContent = message;
  appMessage.className = `message ${type}`;
}

// Switch between the login and registration forms.
document.getElementById("show-login").addEventListener("click", () => {
  loginForm.classList.remove("hidden");
  registerForm.classList.add("hidden");

  document.getElementById("show-login").classList.add("active");
  document.getElementById("show-register").classList.remove("active");

  showAuthMessage("");
});

document.getElementById("show-register").addEventListener("click", () => {
  registerForm.classList.remove("hidden");
  loginForm.classList.add("hidden");

  document.getElementById("show-register").classList.add("active");
  document.getElementById("show-login").classList.remove("active");

  showAuthMessage("");
});

// Register a new user.
registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = document.getElementById("register-name").value.trim();
  const email = document.getElementById("register-email").value.trim();
  const password = document.getElementById("register-password").value;

  if (!name || !email || !password) {
    showAuthMessage("Please fill in all required fields.", "error");
    return;
  }

  try {
    showAuthMessage("Creating your account...");

    const data = await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });

    showAuthMessage(
      data.message || "Registration successful! You can now log in.",
      "success"
    );

    registerForm.reset();
    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");

    document.getElementById("show-login").classList.add("active");
    document.getElementById("show-register").classList.remove("active");
  } catch (error) {
    showAuthMessage(error.message, "error");
  }
});

// Log in an existing user.
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  try {
    showAuthMessage("Logging in...");

    await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    loginForm.reset();
    await loadCurrentUser();
  } catch (error) {
    showAuthMessage(error.message, "error");
  }
});

// Find the currently logged-in user.
async function loadCurrentUser() {
  try {
    const data = await apiRequest("/auth/me");

    currentUser = data.user;

    if (!currentUser) {
      throw new Error("Unable to retrieve your account information.");
    }

    authSection.classList.add("hidden");
    appSection.classList.remove("hidden");

    document.getElementById("user-name").textContent = currentUser.name;
    document.getElementById("user-avatar").textContent =
      currentUser.name.charAt(0).toUpperCase();

    showAuthMessage("");
    await loadDashboard();
  } catch (error) {
    currentUser = null;
    appSection.classList.add("hidden");
    authSection.classList.remove("hidden");

    showAuthMessage(
      error.message === "Authentication required. Please log in."
        ? ""
        : error.message,
      "error"
    );
  }
}

// Load dashboard information from the backend.
async function loadDashboard() {
  try {
    const data = await apiRequest("/dashboard");
    const dashboard = data.dashboard;

    document.getElementById("stat-total").textContent =
      dashboard.totalApplications;

    document.getElementById("stat-applied").textContent =
      dashboard.statusCounts.Applied || 0;

    document.getElementById("stat-interview").textContent =
      dashboard.statusCounts.Interview || 0;

    document.getElementById("stat-offer").textContent =
      dashboard.statusCounts.Offer || 0;

    renderDashboardInterviews(dashboard.upcomingInterviews || []);
    renderRecentApplications(dashboard.recentApplications || []);
  } catch (error) {
    showAppMessage(`Could not load dashboard: ${error.message}`, "error");
  }
}

// Display upcoming interviews on the dashboard.
function renderDashboardInterviews(interviews) {
  const container = document.getElementById("dashboard-interviews");

  if (interviews.length === 0) {
    container.textContent = "No upcoming interviews yet.";
    return;
  }

  container.replaceChildren();

  interviews.forEach((interview) => {
    const card = document.createElement("div");
    card.className = "dashboard-item";

    const company = document.createElement("strong");
    company.textContent = interview.application?.companyName || "Company";

    const details = document.createElement("p");
    details.textContent =
      `${interview.application?.jobTitle || "Job"} · ` +
      `${formatDate(interview.interviewDate)}`;

    card.append(company, details);
    container.appendChild(card);
  });
}

// Display recently added applications.
function renderRecentApplications(applications) {
  const container = document.getElementById("dashboard-recent");

  if (applications.length === 0) {
    container.textContent = "No applications added yet.";
    return;
  }

  container.replaceChildren();

  applications.forEach((application) => {
    const item = document.createElement("div");
    item.className = "dashboard-item";

    const company = document.createElement("strong");
    company.textContent = application.companyName;

    const details = document.createElement("p");
    details.textContent =
      `${application.jobTitle} · ${application.status}`;

    item.append(company, details);
    container.appendChild(item);
  });
}

// Format dates for display.
function formatDate(value) {
  if (!value) return "Date not set";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

// Navigate between the main pages.
function showPage(pageId) {
  document.querySelectorAll(".page-section").forEach((section) => {
    section.classList.toggle("hidden", section.id !== pageId);
  });

  document.querySelectorAll(".nav-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.page === pageId);
  });

  const headings = {
    "dashboard-page": "Dashboard",
    "applications-page": "My Applications",
    "interviews-page": "Interviews",
  };

  document.getElementById("page-heading").textContent =
    headings[pageId] || "JobTrack";

  if (pageId === "dashboard-page") {
    loadDashboard();
  }
}

document.querySelectorAll(".nav-button").forEach((button) => {
  button.addEventListener("click", () => {
    showPage(button.dataset.page);
  });
});

document.querySelectorAll("[data-go-page]").forEach((button) => {
  button.addEventListener("click", () => {
    showPage(button.dataset.goPage);
  });
});

// Log out and return to the login screen.
document.getElementById("logout-button").addEventListener("click", async () => {
  try {
    await apiRequest("/auth/logout", { method: "POST" });

    currentUser = null;
    appSection.classList.add("hidden");
    authSection.classList.remove("hidden");

    loginForm.reset();
    registerForm.reset();
    showAuthMessage("You have logged out successfully.", "success");
  } catch (error) {
    showAppMessage(`Logout failed: ${error.message}`, "error");
  }
});

// Check whether a session already exists when the page opens.
document.addEventListener("DOMContentLoaded", loadCurrentUser);


async function loadApplications(page = 1) {
  const container = document.getElementById("applications-list");
  const search = document.getElementById("application-search").value.trim();

  try {
    showAppMessage("Loading applications...");

    const params = new URLSearchParams({
      page: String(page),
      limit: "10",
    });

    if (search) {
      params.set("search", search);
    }

    const data = await apiRequest(`/applications?${params.toString()}`);

    renderApplications(data.applications || []);

    const pagination = data.pagination;
    document.getElementById("page-info").textContent =
      `Page ${pagination.currentPage} of ${Math.max(1, pagination.totalPages)}`;

    document.getElementById("previous-page").disabled =
      pagination.currentPage <= 1;

    document.getElementById("next-page").disabled =
      pagination.currentPage >= pagination.totalPages;

    showAppMessage("");
    window.currentApplicationsPage = pagination.currentPage;
  } catch (error) {
    container.textContent = "Unable to load applications.";
    showAppMessage(error.message, "error");
  }
}


function renderApplications(applications) {
  const container = document.getElementById("applications-list");
  container.replaceChildren();

  if (applications.length === 0) {
    container.textContent = "No applications found. Add your first application!";
    return;
  }

  applications.forEach((application) => {
    const row = document.createElement("tr");

    [
      application.companyName,
      application.jobTitle,
      application.status,
      application.appliedAt || "—",
    ].forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = value || "—";
      row.appendChild(cell);
    });

    const actionsCell = document.createElement("td");

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.textContent = "Edit";
    editButton.className = "secondary-button";

    editButton.addEventListener("click", () => {
      document.getElementById("application-id").value = application.id;
      document.getElementById("company-name").value = application.companyName || "";
      document.getElementById("job-title").value = application.jobTitle || "";
      document.getElementById("job-url").value = application.jobUrl || "";
      document.getElementById("application-status").value = application.status || "Applied";
      document.getElementById("applied-at").value = application.appliedAt || "";
      document.getElementById("application-notes").value = application.notes || "";

      document.getElementById("application-form-heading").textContent = "Edit Application";
      document.getElementById("application-form").classList.remove("hidden");
      showAppMessage("");
      document.getElementById("application-form").scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.className = "danger-button";

    deleteButton.addEventListener("click", async () => {
      const confirmed = window.confirm(
        `Delete the application at ${application.companyName}?`
      );

      if (!confirmed) return;

      try {
        const data = await apiRequest(`/applications/${application.id}`, {
          method: "DELETE",
        });

        showAppMessage(data.message || "Application deleted successfully.", "success");
        await loadApplications(window.currentApplicationsPage || 1);
        await loadDashboard();
      } catch (error) {
        showAppMessage(error.message, "error");
      }
    });

    actionsCell.append(editButton, deleteButton);
    row.appendChild(actionsCell);
    container.appendChild(row);
  });
}


// Track which page is currently displayed.
window.currentApplicationsPage = 1;

// Load applications whenever the Applications page is opened.
document.querySelector('[data-page="applications-page"]')
  .addEventListener("click", () => loadApplications(1));

// Search by company name or job title.
document.getElementById("search-button").addEventListener("click", () => {
  loadApplications(1);
});

document.getElementById("application-search").addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    loadApplications(1);
  }
});

// Pagination.
document.getElementById("previous-page").addEventListener("click", () => {
  loadApplications(Math.max(1, window.currentApplicationsPage - 1));
});

document.getElementById("next-page").addEventListener("click", () => {
  loadApplications(window.currentApplicationsPage + 1);
});


const applicationForm = document.getElementById("application-form");

document.getElementById("add-application-button").addEventListener("click", () => {
  applicationForm.reset();
  document.getElementById("application-id").value = "";
  document.getElementById("application-form-heading").textContent = "Add Application";
  document.getElementById("cancel-application-button").classList.remove("hidden");
  applicationForm.classList.remove("hidden");
  showAppMessage("");
});

document.getElementById("cancel-application-button").addEventListener("click", () => {
  applicationForm.reset();
  applicationForm.classList.add("hidden");
});

applicationForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const id = document.getElementById("application-id").value;

  const application = {
    companyName: document.getElementById("company-name").value.trim(),
    jobTitle: document.getElementById("job-title").value.trim(),
    jobUrl: document.getElementById("job-url").value.trim(),
    status: document.getElementById("application-status").value,
    appliedAt: document.getElementById("applied-at").value,
    notes: document.getElementById("application-notes").value.trim(),
  };

  if (!application.companyName || !application.jobTitle) {
    showAppMessage("Company name and job title are required.", "error");
    return;
  }

  // Avoid sending empty optional values.
  Object.keys(application).forEach((key) => {
    if (application[key] === "") delete application[key];
  });

  try {
    const data = await apiRequest(
      id ? `/applications/${id}` : "/applications",
      {
        method: id ? "PUT" : "POST",
        body: JSON.stringify(application),
      }
    );

    showAppMessage(
      data.message || (id ? "Application updated successfully." : "Application added successfully."),
      "success"
    );

    applicationForm.reset();
    applicationForm.classList.add("hidden");
    await loadApplications(window.currentApplicationsPage || 1);
    await loadDashboard();
  } catch (error) {
    showAppMessage(error.message, "error");
  }
});


async function loadInterviews() {
  const container = document.getElementById("interviews-list");

  try {
    showAppMessage("Loading interviews...");

    const data = await apiRequest("/interviews");
    renderInterviews(data.interviews || []);

    showAppMessage("");
  } catch (error) {
    container.textContent = "Unable to load interviews.";
    showAppMessage(error.message, "error");
  }
}


function renderInterviews(interviews) {
  const container = document.getElementById("interviews-list");
  container.replaceChildren();

  if (interviews.length === 0) {
    container.textContent = "No interviews scheduled yet.";
    return;
  }

  interviews.forEach((interview) => {
    const row = document.createElement("tr");
    const application = interview.application || {};

    [
      application.companyName || "Unknown company",
      application.jobTitle || "Unknown position",
      formatDate(interview.interviewDate),
      interview.interviewType || "—",
      interview.notes || "—",
    ].forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.appendChild(cell);
    });

    const actionsCell = document.createElement("td");

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.textContent = "Edit";
    editButton.className = "secondary-button";

    editButton.addEventListener("click", async () => {
      await loadApplicationOptions();

      document.getElementById("interview-id").value = interview.id;
      document.getElementById("interview-application").value =
        interview.applicationId || application.id || "";
      document.getElementById("interview-type").value =
        interview.interviewType || "online";
      document.getElementById("interview-notes").value =
        interview.notes || "";

      const dateValue = interview.interviewDate;
      if (dateValue) {
        const date = new Date(dateValue);
        const localDate = new Date(
          date.getTime() - date.getTimezoneOffset() * 60000
        );
        document.getElementById("interview-date").value =
          localDate.toISOString().slice(0, 16);
      } else {
        document.getElementById("interview-date").value = "";
      }

      document.getElementById("interview-form-heading").textContent =
        "Edit Interview";
      interviewForm.classList.remove("hidden");

      interviewForm.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      showAppMessage("");
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.className = "danger-button";

    deleteButton.addEventListener("click", async () => {
      if (!window.confirm("Are you sure you want to delete this interview?")) {
        return;
      }

      try {
        const data = await apiRequest(`/interviews/${interview.id}`, {
          method: "DELETE",
        });

        showAppMessage(data.message || "Interview deleted successfully.", "success");
        await loadInterviews();
        await loadDashboard();
      } catch (error) {
        showAppMessage(error.message, "error");
      }
    });

    actionsCell.append(editButton, deleteButton);
    row.appendChild(actionsCell);
    container.appendChild(row);
  });
}


document.querySelector('[data-page="interviews-page"]')
  .addEventListener("click", loadInterviews);


const interviewForm = document.getElementById("interview-form");

async function loadApplicationOptions() {
  const select = document.getElementById("interview-application");

  try {
    const data = await apiRequest("/applications?limit=50");
    const applications = data.applications || [];

    select.replaceChildren();

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Select a job application";
    select.appendChild(placeholder);

    applications.forEach((application) => {
      const option = document.createElement("option");
      option.value = application.id;
      option.textContent = `${application.companyName} — ${application.jobTitle}`;
      select.appendChild(option);
    });
  } catch (error) {
    showAppMessage(`Could not load job applications: ${error.message}`, "error");
  }
}

document.getElementById("add-interview-button").addEventListener("click", async () => {
  interviewForm.reset();
  document.getElementById("interview-id").value = "";
  document.getElementById("interview-form-heading").textContent = "Schedule Interview";

  await loadApplicationOptions();

  interviewForm.classList.remove("hidden");
  showAppMessage("");
});

document.getElementById("cancel-interview-button").addEventListener("click", () => {
  interviewForm.reset();
  interviewForm.classList.add("hidden");
});

interviewForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const id = document.getElementById("interview-id").value;

  const interview = {
    applicationId: document.getElementById("interview-application").value,
    interviewDate: document.getElementById("interview-date").value,
    interviewType: document.getElementById("interview-type").value,
    notes: document.getElementById("interview-notes").value.trim(),
  };

  if (!interview.applicationId || !interview.interviewDate) {
    showAppMessage("Please select a job application and interview date.", "error");
    return;
  }

  if (interview.notes === "") {
    delete interview.notes;
  }

  try {
    const data = await apiRequest(
      id ? `/interviews/${id}` : "/interviews",
      {
        method: id ? "PUT" : "POST",
        body: JSON.stringify(interview),
      }
    );

    showAppMessage(
      data.message || (id ? "Interview updated successfully." : "Interview scheduled successfully."),
      "success"
    );

    interviewForm.reset();
    interviewForm.classList.add("hidden");

    await loadInterviews();
    await loadDashboard();
  } catch (error) {
    showAppMessage(error.message, "error");
  }
});
