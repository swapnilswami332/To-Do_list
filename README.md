# Pulse List

A futuristic AI-powered to-do list that behaves like a personal productivity operating system — not just a checklist.

Pulse List learns from your behavior, suggests your next best task, adapts to your energy level, and responds to gestures with a living, glassmorphic interface.

## Features

- **Smart Task Input** — Natural language parsing (`"Finish assignment tomorrow 5pm high priority"`)
- **Pulse Engine** — AI-powered suggestions for your next 1–3 tasks
- **Energy-Based System** — Match tasks to your current energy (Low / Medium / High)
- **Gesture Interactions** — Swipe to complete/snooze, long-press radial menu, drag to reorder
- **Adaptive Dashboard** — UI shifts by time of day (morning plan / afternoon focus / night review)
- **Focus Mode** — Full-screen Pomodoro timer with optional ambient sound
- **Mission Control Timeline** — Horizontal scroll timeline of upcoming deadlines
- **Habit Intelligence** — Auto-detects repeated tasks and tracks streaks
- **Stats Dashboard** — Completion %, streaks, productivity score, weekly heatmap
- **Completion Effects** — Glow burst animations on task complete

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React (Vite), Tailwind CSS, Zustand, Framer Motion |
| Backend | FastAPI (Python) |
| Icons | Lucide React |
| Gestures | @use-gesture/react, @dnd-kit |
| Storage | localStorage (MVP) |

## Project Structure

```
To-Do_list/
├── frontend/          # React app (port 5173)
│   └── src/
│       ├── components/
│       ├── store/
│       ├── hooks/
│       └── utils/
└── backend/           # FastAPI API (port 8000)
    ├── routes/
    └── services/
```

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.10+

### Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Health check: [http://localhost:8000/api/health](http://localhost:8000/api/health)

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

The Vite dev server proxies `/api` requests to the backend on port 8000.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | No | Enables OpenAI fallback for low-confidence natural language parses |

When `OPENAI_API_KEY` is not set, the app uses rule-based parsing and works fully offline on the frontend (with a local parser fallback if the backend is unavailable).

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/parse` | Parse natural language → structured task |
| POST | `/api/pulse` | Score tasks → top 1–3 suggestions |

### Example: Parse a task

```bash
curl -X POST http://localhost:8000/api/parse \
  -H "Content-Type: application/json" \
  -d '{"text": "Finish assignment tomorrow 5pm high priority"}'
```

## Usage Tips

- **Add tasks**: Tap the floating `+` button and type naturally
- **Complete**: Swipe a task card right, or tap the progress ring
- **Snooze**: Swipe left
- **Quick actions**: Long-press a task for the radial menu
- **Reorder**: Drag the grip handle on the left of each card
- **Focus**: Use the bottom bar Focus tab or radial menu
- **Stats**: Tap Stats in the bottom bar

## Architecture

- **Frontend** owns all task data (Zustand + localStorage persistence)
- **Backend** provides intelligence: NL parsing and Pulse scoring
- No task CRUD on the backend for MVP — keeps the frontend as the single source of truth

## License

MIT
