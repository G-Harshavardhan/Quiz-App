# Quiz App | Learn & Ace
[![Live Demo](https://img.shields.io/badge/demo-online-brightgreen)](https://ai-quiz-online.vercel.app/)

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

## 💡 Technical Decisions & Challenges

### 1. The LLM Pivot: From Gemini to Groq
- **Challenge**: Initially, we integrated Google Gemini Pro. However, we faced inconsistent API versioning (404s on stable endpoints) and significant latency (8-10s per quiz).
- **Solution**: Pivoted to **Groq (Llama 3.3 70b)**.
- **Result**: Near-instantaneous quiz generation (< 2s) and 100% reliable JSON schema enforcement.

### 2. JWT "Ghost" Sessions
- **Challenge**: Users remained "logged in" visually when tokens expired, causing 401 errors on background fetches like History or Profile.
- **Solution**: Implemented a **Double-Axios Interceptor** system. A "Response" interceptor monitors 401 Unauthorized status codes, triggers a silent `/token/refresh` with the stored Refresh Token, and retries the failed request.
- **Result**: A seamless session experience where tokens are handled silently without interrupting the user flow.

### 3. Database Atomicity
- **Challenge**: Large quiz sets (20 Qs + 80 Choices) could lead to "dirty data" if the LLM output was malformed or the API failed mid-loop.
- **Solution**: Wrapped the entire AI generation and database seeding logic in a `transaction.atomic()` block.
- **Result**: Guaranteed data integrity; the system ensures that either the entire quiz is created perfectly, or no records are created at all.

### 4. Glassmorphic Performance Optimization
- **Challenge**: Heavy use of `backdrop-filter: blur()` and complex gradients caused significant frame-rate drops (jank) on mobile devices and low-end hardware.
- **Solution**: Optimized CSS by using `will-change: transform` to trigger GPU acceleration and restricted heavy blur effects only to core structural elements (Nav, Panels).
- **Result**: Achieved a buttery-smooth 60fps experience across all modern devices without sacrificing the premium aesthetic.

---

## ⏭️ Skipped Features

1.  **Social Login**: Focus remained on custom JWT logic for maximum control over security.
2.  **Leaderboards**: Deprioritized to ensure sub-second AI generation speed and polished core mechanics for the MVP.
