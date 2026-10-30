# Job Application Tracker

A beginner-friendly full-stack web application that helps students and job seekers organize job applications, track application progress, manage interviews, and receive email reminders for upcoming interviews.

## Features

- User registration and login
- Session-based authentication
- Secure password hashing
- Create, view, update, and delete job applications
- Track application statuses: Applied, Interview, Offer, and Rejected
- Search applications by company name or job title
- Paginated application listings
- Schedule, edit, view, and delete interviews
- Dashboard with application statistics and upcoming interviews
- Automated email reminders for upcoming interviews
- Responsive frontend built with HTML, CSS, and JavaScript

## Technology Stack

Frontend
- HTML
- CSS
- JavaScript

Backend
- Node.js
- Express.js
- Sequelize ORM
- MySQL
- express-session
- bcrypt
- Nodemailer
- node-cron

## Project Structure


job-application-tracker/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── database/
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
└── README.md


## Prerequisites

Install the following before running the project:

- Node.js and npm
- MySQL Server
- Git (optional, for version control)

## Setup Instructions

### 1. Clone or download the project

If cloning from GitHub, use your repository URL:

    git clone YOUR_REPOSITORY_URL
    cd job-application-tracker

### 2. Install backend dependencies

    cd backend
    npm install

### 3. Create the database

Create a MySQL database named:

    CREATE DATABASE job_application_tracker;

### 4. Configure environment variables

Copy `backend/.env.example` to `backend/.env`.

Fill in your own local MySQL credentials, session secret, and email SMTP settings. Never commit your real `.env` file or share its secrets publicly.

### 5. Start the application

From the `backend` directory, run:

    npm run dev

Open the application in your browser:

http://localhost:3000

The backend serves the frontend and API from the same origin.

## API Overview

All API endpoints use the `/api` prefix.

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register an account |
| POST | `/api/auth/login` | Log in |
| POST | `/api/auth/logout` | Log out |
| GET | `/api/auth/me` | Get the current user |

### Applications

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/applications` | Create an application |
| GET | `/api/applications` | List applications |
| GET | `/api/applications/:id` | Get one application |
| PUT | `/api/applications/:id` | Update an application |
| DELETE | `/api/applications/:id` | Delete an application |

Application listing supports search and pagination using query parameters such as `?search=developer&page=1&limit=10`.

### Interviews

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/interviews` | Schedule an interview |
| GET | `/api/interviews` | List interviews |
| GET | `/api/interviews/:id` | Get one interview |
| PUT | `/api/interviews/:id` | Update an interview |
| DELETE | `/api/interviews/:id` | Delete an interview |

### Dashboard and Health

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard` | Get dashboard statistics |
| GET | `/api/health` | Check API status |

Protected endpoints require an authenticated session.

## Email Reminders

The application uses Nodemailer to send email reminders and node-cron to schedule reminder checks. Configure valid SMTP credentials in your local `.env` file for email functionality.

## Security Notes

- Passwords are hashed before storage.
- Protected routes require authentication.
- Application and interview access is restricted to the logged-in user's data.
- Environment files containing secrets must not be committed.
- Production deployment requires appropriate session storage and secure environment configuration.

## Future Improvements

- Deploy the application to a hosting platform.
- Configure persistent session storage for production.
- Improve automated tests and input validation.
- Enhance accessibility and user experience.

