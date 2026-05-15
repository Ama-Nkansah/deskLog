# Desklog

A daily activity tracking system for applications support teams.

---

## What it does

Support teams deal with many recurring tasks every day checking SMS counts, monitoring logs, verifying system states. Desklog gives the team a central place to:

- Record what tasks need to be tracked each day
- Update the status of each task (done or pending) with a remark explaining what happened
- See a full shift handover summary so the incoming team knows exactly what was completed and what is still open
- Query activity history across any date range for reporting

---

## Features

| Feature | Description |
|---|---|
| Activity management | Create daily activities with a title, description, and date |
| Status updates | Log status changes (done / pending) with a remark every update is preserved, nothing is overwritten |
| Bio capture | Every update records who made it, which department they are in, and the exact time |
| Daily view | A handover page showing all activities and their full update timeline for any selected date |
| Reports | Filter activity history by date range and status |
| Authentication | All pages require login built with Laravel Fortify |

---

## Tech stack

- **Laravel 13** — backend routing, database queries, validation, authentication
- **React 19** — frontend UI components
- **Inertia.js** — connects Laravel and React without needing a separate API
- **PostgreSQL** — production database (hosted on Render)
- **Tailwind CSS** — styling
- **Vite** — frontend asset bundling

---

## Running locally

### Requirements

- PHP 8.4
- Composer 2
- Node.js 22 + npm

### Steps

```bash
# Clone the repository
git clone <repo-url>
cd desklog

# Install PHP dependencies
composer install

# Install JS dependencies
npm install

# Copy the environment file
cp .env.example .env

# Generate the app key
php artisan key:generate

# Run database migrations
php artisan migrate

# Start the development server
composer run dev
```

The app will be available at `http://localhost:8000`.

---

## User roles

| Role | What they can do |
|---|---|
| `staff` | Log in, view activities, add status updates |
| `admin` | Everything staff can do, plus create new activities |

Roles are selected from a dropdown during registration.

---

## Deployment


The app is deployed on [Render](https://render.com) using Docker.

- Web service runs on `serversideup/php:8.4-fpm-nginx-alpine` (PHP 8.4, NGINX + PHP-FPM)
- Database is Render's managed PostgreSQL
- On every deploy, migrations run automatically before traffic is served

Live URL: [https://desklog.onrender.com](https://desklog.onrender.com)
