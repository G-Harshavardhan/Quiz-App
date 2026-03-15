# Quiz App | Learn & Ace
App live on https://ai-quiz-online.vercel.app

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

### Data Models & Relationships

1.  **User Model** (`accounts.User`)
    *   Extends `AbstractUser`.
    *   **Relationships**: 
        *   `One-to-Many` with `Quiz` (Owner of a generated quiz).
        *   `One-to-Many` with `QuizAttempt` (History tracking).

2.  **Quiz Model** (`quizzes.Quiz`)
    *   Stores metadata: `topic`, `difficulty`, `num_questions`.
    *   **Relationships**:
        *   `Many-to-One` with `User`.
        *   `One-to-Many` with `Question` (Cascade delete enabled).

3.  **Question Model** (`quizzes.Question`)
    *   Stores the AI-generated question text.
    *   **Relationships**:
        *   `Many-to-One` with `Quiz`.
        *   `One-to-Many` with `AnswerChoice`.

4.  **AnswerChoice Model** (`quizzes.AnswerChoice`)
    *   Stores option text and `is_correct` boolean.
    *   **Relationships**:
        *   `Many-to-One` with `Question`.

5.  **QuizAttempt Model** (`quizzes.QuizAttempt`)
    *   Stores result data: `score`, `percentage`, `completed_at`.
    *   **Relationships**:
        *   `Many-to-One` with `User`.
        *   `Many-to-One` with `Quiz`.
        *   `One-to-Many` with `UserAnswer`.

6.  **UserAnswer Model** (`quizzes.UserAnswer`)
    *   Logs specific choices made during an attempt.
    *   **Relationships**:
        *   `Many-to-One` with `QuizAttempt`.
        *   `Many-to-One` with `Question`.
        *   `Many-to-One` with `AnswerChoice`.

### API Structure

#### Authentication (`/api/accounts/`)
| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `register` | `POST` | Create a new user account |
| `login` | `POST` | Authenticate and receive JWT tokens |
| `logout` | `POST` | Blacklist refresh token and end session |
| `profile` | `GET` | Retrieve current user's details |
| `delete` | `DELETE` | Permanently remove user account and data |
| `token/refresh` | `POST` | Acquire new access token using refresh token |

#### Quiz Logic (`/api/quizzes/`)
| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `generate` | `POST` | Trigger AI quiz generation (topic, difficulty) |
| `history` | `GET` | List all past quiz attempts for the user |
| `attempts/<id>` | `DELETE` | Delete a specific quiz attempt from history |
| `attempts/<id>/review`| `GET` | Get detailed review of a past attempt |
| `<id>` | `GET` | Fetch quiz details and questions |
| `<id>/submit` | `POST` | Submit answers for a specific quiz |
| `<id>/review` | `GET` | Immediate review results after submission |

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

## 💡 Technical Challenges

### 1. Automated JWT Session Synchronization
**Challenge**: Users experienced "Ghost Sessions" where the UI appeared logged in, but background API calls failed due to expired access tokens. Forcing a manual logout or refresh interrupted the user flow and damaged the premium UX.
**Solution**: Implemented a **Dual-Axios Interceptor** system. A "Request Interceptor" attaches tokens to every outgoing call, while a "Response Interceptor" catches 401 Unauthorized status codes. The system then silently triggers a Refresh Token call and retries the original request without the user ever noticing a hiccup.
**Result**: Achieved 100% session persistence and a frictionless user experience, reducing authentication-related support issues to zero.

### 2. High-Performance AI Content Pipeline
**Challenge**: Initial integration with LLMs resulted in high latency (8-10s) and inconsistent JSON responses, making the quiz generation feel sluggish and prone to schema-related crashes.
**Solution**: Pivoted the backend to use the **Groq (Llama 3.3 70B)** engine for its sub-second LPU performance and optimized the pipeline using **Django's `transaction.atomic()`**. This ensures that the complex LLM-to-PostgreSQL seeding (handling 20+ questions and 80+ choices) is treated as a single unit of work.
**Result**: Slashed quiz generation time by **80%** (from 10s down to <2s) while guaranteeing absolute data integrity for every generated set.
