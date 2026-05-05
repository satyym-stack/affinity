# Affinity Proto

**A thought-first social network prototype for discovering people through shared ideas.**

Affinity Proto explores a different social discovery model: instead of leading with profile metadata, users publish thoughts, build a personal idea space, and discover nearby people through semantic similarity and shared interests.

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-20232A?logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Radix UI](https://img.shields.io/badge/Radix_UI-Components-161618?logo=radixui&logoColor=white)
![Motion](https://img.shields.io/badge/Motion-Animation-0055FF?logo=framer&logoColor=white)
![Lucide React](https://img.shields.io/badge/Lucide_React-Icons-F56565?logo=lucide&logoColor=white)
![Python](https://img.shields.io/badge/Python-3-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-pgvector-4169E1?logo=postgresql&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2-D71F00?logo=sqlalchemy&logoColor=white)
![Alembic](https://img.shields.io/badge/Alembic-Migrations-222222)
![Pydantic](https://img.shields.io/badge/Pydantic-Settings-E92063?logo=pydantic&logoColor=white)
![Uvicorn](https://img.shields.io/badge/Uvicorn-ASGI-2B5B84)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![sentence-transformers](https://img.shields.io/badge/sentence--transformers-Embeddings-FFD21E?logo=huggingface&logoColor=black)
![OpenAI](https://img.shields.io/badge/OpenAI-Compatible_Embeddings-412991?logo=openai&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-Linting-4B32C3?logo=eslint&logoColor=white)

## Overview

Affinity Proto is a full-stack product prototype built around expression, matching, and discovery. The frontend presents the main product experience, while the backend provides a feature-based FastAPI architecture with PostgreSQL persistence, authentication scaffolding, thought publishing, matching, map placement, and embedding-related modules.

The project is intentionally structured as a portfolio-ready prototype: the UI demonstrates the product vision, the backend shows how the system can scale by feature area, and the `ml/` workspace captures early experiments for semantic placement and similarity.

## Product Walkthrough

The screenshots below are arranged in the same order a reviewer would naturally experience the prototype: first the product pitch, then authentication, publishing, semantic placement, discovery, and profile management.

### 1. Landing Page

The landing page introduces the core idea: users publish thoughts, then Affinity places them in a shared semantic space.

![Affinity landing page](docs/screenshots/landing-page.png)

### 2. Authentication

Affinity includes focused login and account creation screens for entering a personal thought space.

| Log in | Create account |
| --- | --- |
| ![Affinity login screen](docs/screenshots/login.png) | ![Affinity create account screen](docs/screenshots/create-account.png) |

### 3. Publish A Thought

The write flow gives users a quiet editor for publishing raw thoughts or saving drafts.

![Affinity write screen](docs/screenshots/write-thought.png)

### 4. Semantic Space

The home view maps users as dots in a semantic space, where similar thoughts appear closer together. The interface supports light and dark modes.

| Light mode | Dark mode |
| --- | --- |
| ![Affinity semantic space in light mode](docs/screenshots/semantic-space-light.png) | ![Affinity semantic space in dark mode](docs/screenshots/semantic-space-dark.png) |

### 5. Discover People

The discover view shows nearby users by semantic distance, supports search, and can switch to recent public thoughts.

| Nearby users | User search |
| --- | --- |
| ![Affinity discover nearby users](docs/screenshots/discover-nearby-users.png) | ![Affinity discover user search](docs/screenshots/discover-search.png) |

![Affinity recent public thoughts](docs/screenshots/discover-recent-thoughts.png)

### 6. Manage Profile And Thoughts

The profile view shows a user's published thoughts, supports editing and deleting, and previews recent public thoughts.

![Affinity profile and thought management](docs/screenshots/profile-thought-management.png)

## What It Demonstrates

- A polished Next.js app experience with landing, onboarding, thought writing, home feed, discovery, placement, profile, login, and signup flows.
- A FastAPI backend organized by product feature instead of one large app module.
- SQLAlchemy models, repositories, services, schemas, and routes separated by responsibility.
- PostgreSQL migrations with Alembic and pgvector support for embedding storage.
- Early ML experimentation for embeddings, similarity scoring, and placement logic.
- A product direction that connects UI design, backend architecture, and semantic discovery.

## Tech Stack

**Frontend**

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Radix UI
- Motion
- Lucide React

**Backend**

- Python
- FastAPI
- SQLAlchemy 2
- Alembic
- PostgreSQL
- pgvector
- Pydantic Settings
- Uvicorn

**ML / Experimentation**

- sentence-transformers
- OpenAI-compatible embedding configuration
- Python scripts for embedding, similarity, and placement experiments

## Repository Structure

```text
affinity-proto/
├── frontend/                 # Next.js prototype UI
│   ├── src/app/              # App entry, login, signup, layout
│   ├── src/components/       # Affinity screens and UI primitives
│   ├── src/lib/              # API clients, auth/theme context, helpers
│   └── package.json
├── backend/                  # FastAPI backend
│   ├── app/
│   │   ├── core/             # Config, dependencies, security
│   │   ├── db/               # Database session/base setup
│   │   ├── features/         # Auth, users, thoughts, matching, map, embeddings
│   │   └── shared/           # Shared helpers and exceptions
│   ├── alembic/              # Database migrations
│   ├── docker-compose.yml    # Local pgvector PostgreSQL service
│   └── requirements.txt
├── ml/                       # Early semantic similarity experiments
├── docs/screenshots/         # README product walkthrough images
└── README.md
```

## Getting Started

### Prerequisites

- Node.js and npm
- Python 3
- Docker, for the easiest PostgreSQL + pgvector setup

### 1. Run The Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at:

```text
http://localhost:3000
```

### 2. Set Up The Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 3. Start PostgreSQL With pgvector

```bash
cd backend
docker compose up -d postgres
```

The local database defaults to:

```text
postgresql+psycopg://postgres:postgres@localhost:5432/affinity
```

### 4. Run Migrations

```bash
cd backend
source .venv/bin/activate
alembic upgrade head
```

### 5. Run The Backend

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload
```

The backend runs at:

```text
http://localhost:8000
```

FastAPI docs are available at:

```text
http://localhost:8000/docs
```

## Configuration

Backend configuration is loaded from environment variables, with development defaults in `backend/app/core/config.py`.

Create a backend environment file from the example when you need to override local defaults:

```bash
cp backend/.env.example backend/.env
```

Common backend variables:

```text
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/affinity
SECRET_KEY=change-this-dev-secret-key
OPENAI_API_KEY=
EMBEDDING_PROVIDER=local
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
EMBEDDING_DIMENSIONS=384
```

For frontend API configuration, use:

```bash
cp frontend/.env.example frontend/.env.local
```

Do not commit real secrets or personal credentials.

## Current Status

Affinity Proto is an active prototype. The frontend is the most complete user-facing part of the project and is designed to communicate the product vision clearly. The backend has a feature-based architecture with several implemented or partially implemented slices, including auth, users, thoughts, embeddings, matching, and map placement.

Some flows are still prototype-driven or partially integrated. The project is best evaluated as a full-stack product prototype rather than a production-ready social platform.

## Validation

Run these checks before pushing portfolio updates:

```bash
cd frontend
npm run lint
npm run build
```

For backend syntax validation:

```bash
cd backend
source .venv/bin/activate
python -m compileall app
```

