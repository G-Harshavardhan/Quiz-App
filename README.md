# AI-Powered Quiz Application

A high-performance fullstack application that enables users to generate dynamic, AI-powered multiple-choice quizzes, track their performance, and review their history with detailed analytics. Built for scalability and developer experience using **Next.js**, **Django**, and **Groq AI**.

## 📖 Project Overview

The AI Quiz App is designed to turn any topic into a learning opportunity. By leveraging state-of-the-art Large Language Models (LLMs), the application constructs structured education content on the fly. Users can customize their learning path by specifying topics, difficulty levels, and the number of questions, while the backend ensures a smooth, authenticated, and persistent experience.

---

## 🚀 Key Features

*   **⚡ Instant AI Generation**: Powered by Groq (Llama 3.3) for near-zero latency quiz creation.
*   **🔐 Secure Authentication**: JWT-based session management with auto-refreshing tokens and secure logout.
*   **📊 Real-time Progress & Scoring**: Interactive quiz taking with immediate score calculation and grade-based color coding.
*   **🔍 Detailed Review System**: After every quiz, users can review correct vs. incorrect answers with specific feedback.
*   **📅 History & Analytics**: A personalized dashboard showing past attempts, performance trends, and bulk history management.
*   **🛡️ Account Privacy**: Full user control over profile data, including permanent account erasure.
*   **📱 Responsive Glassmorphic UI**: A premium, modern interface optimized for desktop and mobile devices.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Library**: React 18
- **State Management**: Context API (Auth, User State)
- **API Client**: Axios (with custom Interceptors for Auth synchronization)
- **Styling**: Vanilla CSS (Modern Design System with Glassmorphism)

### Backend
- **Framework**: Django 4.2+
- **API Engine**: Django REST Framework (DRF)
- **Authentication**: SimpleJWT (JSON Web Tokens)
- **Database**: PostgreSQL
- **AI Engine**: Groq Official SDK (Llama 3.3 70B Model)

---

## 🏛️ Architecture & Database Design

### Data Models
1.  **User**: Custom user model (`accounts.User`) supporting both Username and Email logins.
2.  **Quiz**: Metadata for the generated set (`topic`, `difficulty`, `num_questions`).
3.  **Question**: Text-based questions linked to a `Quiz`.
4.  **AnswerChoice**: Options (4 per question) with a `is_correct` flag.
5.  **QuizAttempt**: Tracks a user's specific performance on a quiz (`score`, `completed_at`).
6.  **UserAnswer**: Maps a user's choice to a specific question to allow post-quiz reviews.

---

## 🏗️ Setup & Installation (Local)

### 1. Backend Setup
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate # Windows
source venv/bin/activate # Linux/Mac

pip install -r requirements.txt
cp .env.example .env
# Update .env with your DB credentials and GROQ_API_KEY
python manage.py migrate
python manage.py runserver
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🚀 Deployment Guide

Follow these steps to take your application from local to live.

### 1. Database (Neon.tech - Recommended Free Tier)
1.  **Sign Up**: Create a free account on [Neon.tech](https://neon.tech/).
2.  **Project**: Create a new project and select "PostgreSQL".
3.  **Connection String**: Copy the **Connection String** (it starts with `postgres://`). You will need this for the backend.

### 2. Backend (Render.com)
1.  **GitHub**: Push your `backend/` folder to a new GitHub repository.
2.  **Render**: Create a "Web Service" on [Render](https://render.com/).
3.  **Configure**:
    *   **Build Command**: `pip install -r requirements.txt`
    *   **Start Command**: `gunicorn quiz_project.wsgi` (Render detects the Procfile, but you can set this manually).
4.  **Environment Variables**: Add these in the "Env Vars" tab:
    *   `DATABASE_URL`: (The connection string from Neon)
    *   `GROQ_API_KEY`: (Your Key)
    *   `ALLOWED_HOSTS`: `*`
    *   `CORS_ALLOWED_ORIGINS`: `https://YOUR_VERCEL_APP_URL.vercel.app`
    *   `SECRET_KEY`: (Any random string)
    *   `DEBUG`: `False`

### 3. Frontend (Vercel)
1.  **GitHub**: Push your `frontend/` folder to GitHub.
2.  **Vercel**: Import the project.
3.  **Rewrites**: Open [`vercel.json`](file:///d:/OneDrive/Desktop/Code%20editor/quiz_app/frontend/vercel.json) and replace `YOUR_RAILWAY_APP_URL` with your **Render Web Service URL**.
4.  **Deploy**: Hit deploy!

---

## 💡 Technical Decisions & Challenges

### 1. The LLM Pivot: From Gemini to Groq
**Challenge**: Initially, we integrated Google Gemini Pro. However, we faced inconsistent API versioning (404s on stable endpoints) and significant latency (8-10s per quiz).
**Solution**: Pivoted to **Groq (Llama 3.3 70b)**.
**Result**: Near-instantaneous quiz generation (< 2s) and 100% reliable JSON schema enforcement.

### 2. JWT "Ghost" Sessions
**Challenge**: Users remained "logged in" visually when tokens expired, causing 401 errors on background fetches like History.
**Solution**: Implemented a **Double-Axios Interceptor**. One interceptor attaches the token to every request, while a second "Response" interceptor catches 401s, silently calls `/token/refresh`, and retries the original request.

### 3. Database Atomicity
**Challenge**: Large quiz sets (20 Qs + 80 Choices) could lead to partial data if the API failed mid-loop.
**Solution**: Wrapped AI generation in a `transaction.atomic()` block.
**Result**: Guaranteed data integrity for every generated quiz.

---

## ⏭️ Skipped Features

1.  **Social Login**: Focus remained on custom JWT logic.
2.  **Leaderboards**: Deprioritized to ensure sub-second AI generation speed and polished core mechanics.
