# NeighbourGig – Hyperlocal Gig Worker Platform

NeighbourGig is a production-ready, full-stack hyperlocal marketplace that connects nearby gig workers (maids, cooks, electricians, plumbers, tutors, etc.) with local customers. Features include real-time distance-based queries, interactive map interfaces, automatic QR code creation for worker profiles, instant bookings, review systems, and in-app updates.

---

## 🛠️ Tech Stack

*   **Frontend**: React (Vite), React Router, Axios, Tailwind CSS, React Leaflet (maps), `html5-qrcode` scanner
*   **Backend**: Django, Django REST Framework, JWT Authentication (`djangorestframework-simplejwt`), `django-cors-headers`
*   **Database**: PostgreSQL (Neon, Supabase, or standard RDS)
*   **Media Cloud Storage**: Cloudinary (for profile pictures and automatically generated QR codes)
*   **Deployment**: Vercel (Frontend) & Render (Backend)

---

## 📂 Project Structure

```text
neighbourgig/
├── backend/            # Django REST API
└── frontend/           # React Client (Vite + Tailwind)
```

---

## 🔧 Local Development & Installation

### Prerequisite Setup

1.  **PostgreSQL**: Setup a local database or a free tier instance on [Neon](https://neon.tech) or [Supabase](https://supabase.com). Copy the PostgreSQL Connection URI.
2.  **Cloudinary**: Create a free account on [Cloudinary](https://cloudinary.com) and retrieve your **Cloud Name**, **API Key**, and **API Secret**.

### 1. Backend Setup (Django)

1.  Navigate into the `backend/` directory:
    ```bash
    cd backend
    ```
2.  Create and activate a python virtual environment:
    ```bash
    python -m venv venv
    # Windows
    venv\Scripts\activate
    # macOS/Linux
    source venv/bin/activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Create a `.env` file inside `backend/` using the template below:
    ```ini
    DEBUG=True
    DJANGO_SECRET_KEY=your_django_secret_key_here
    DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
    JWT_SECRET_KEY=your_jwt_signing_key_here
    CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret
    ALLOWED_HOSTS=localhost,127.0.0.1
    ```
5.  Generate database schemas and migrations:
    ```bash
    python manage.py makemigrations accounts workers customers bookings reviews notifications
    python manage.py migrate
    ```
6.  Create an Admin/Superuser account:
    ```bash
    python manage.py createsuperuser
    ```
7.  Run the local Django API server:
    ```bash
    python manage.py runserver
    ```
    Your API will be active at `http://127.0.0.1:8000/`.

---

### 2. Frontend Setup (React Vite)

1.  Navigate into the `frontend/` directory:
    ```bash
    cd ../frontend
    ```
2.  Install npm packages:
    ```bash
    npm install
    ```
3.  Create a `.env` file inside `frontend/` using the template below:
    ```ini
    VITE_API_URL=http://localhost:8000
    ```
4.  Run the React Vite development server:
    ```bash
    npm run dev
    
    ```
    Open `http://localhost:3000/` in your browser.

---

## 📡 Core API Specification

### 1. Authentication
*   `POST /api/auth/register` - Create user (Customer/Worker). Returns JWT credentials.
*   `POST /api/auth/login` - Login. Returns user object & JWT credentials.
*   `POST /api/auth/refresh` - Refresh access token using refresh token payload.
*   `GET /api/auth/profile` - Read/update profile coordinates, names, and phone numbers.

### 2. Workers
*   `GET /api/workers/profiles/` - List/filter active gig worker profiles.
*   `GET /api/workers/nearby` - Get workers filtered by radius. Params: `lat` (decimal), `lng` (decimal), `radius` (km, default 5).
*   `POST /api/workers/register` - Complete worker profile (bio, hourly rate, coordinates, address, skills list).
*   `GET /api/workers/availabilities/` - Manage weekday availability slots.

### 3. Bookings
*   `POST /api/bookings/` - Book services.
*   `PATCH /api/bookings/{id}/status/` - Manage gig statuses (`ACCEPTED`, `REJECTED`, `COMPLETED`, `CANCELLED`). Logs historical tracking record.
*   `GET /api/bookings/user` - Fetch bookings belonging to the logged-in user.

### 4. Reviews
*   `POST /api/reviews/` - Review completed bookings. Automatically updates the average rating of the worker.

### 5. Notifications
*   `GET /api/notifications/` - Get in-app alerts.
*   `PATCH /api/notifications/{id}/read/` - Mark notification as read.

---

## 🚀 Production Deployment Guide

### Backend Deployment (Render)

1.  Create a new Web Service on **Render**.
2.  Connect your GitHub repository.
3.  Configure environment details:
    *   **Runtime**: `Python 3`
    *   **Build Command**: `./build.sh` (or `pip install -r requirements.txt && python manage.py collectstatic --no-input && python manage.py migrate`)
    *   **Start Command**: `gunicorn neighbourgig.wsgi:application`
4.  Add Env variables on Render Console:
    *   `DJANGO_SECRET_KEY` = *production_secret*
    *   `DEBUG` = `False`
    *   `DATABASE_URL` = *your_postgres_connection_uri*
    *   `JWT_SECRET_KEY` = *production_jwt_secret*
    *   `CLOUDINARY_CLOUD_NAME` = *cloudinary_name*
    *   `CLOUDINARY_API_KEY` = *cloudinary_key*
    *   `CLOUDINARY_API_SECRET` = *cloudinary_secret*
    *   `ALLOWED_HOSTS` = *render_assigned_domain_name*

### Frontend Deployment (Vercel)

1.  Connect your repository on **Vercel**.
2.  Configure Framework Preset: **Vite**.
3.  Set environment variables:
    *   `VITE_API_URL` = *your_deployed_render_backend_api_url*
4.  Click **Deploy**.
