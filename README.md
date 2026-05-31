# ACGME Fellowship Tracker — React

Premium React dashboard for tracking PGY-5 Anesthesiology fellow requirements completion. Built with Bun + Hono backend and Vite + React frontend as a design showcase.

## Stack

- **Backend**: Bun + Hono (`backend/src/index.ts`, port 3003)
- **Frontend**: Vite + React 18 + TypeScript + React Router v6 (port 8173)
- **Data**: UTF-16 LE encoded CSV files read directly by the backend

## Quick Start

```bash
# Backend
cd backend && bun run src/index.ts

# Frontend (new terminal)
cd frontend && bun install && bun run dev
```

Open http://localhost:8173

## Features

- Dark sidebar with fellow navigation
- Animated SVG progress rings per category
- Binary completion status: green (100%) / red (<100%)
- Fellow drill-down with per-requirement progress bars
- Skeleton loading states

## Design

Binary color system only:
- `#2E7D52` — 100% complete
- `#B3261E` — below 100%

Design tokens documented in `DESIGN.md`.

## Data Source

CSV files in `/home/yollama/Documents/acgme_test/data/` (UTF-16 LE with BOM):
- `ASA.csv`
- `AP_Airway.csv`
- `Neonatal_Procedures.csv`
- `Surgical_Procedures.csv`
- `Total_Number_of_Patients.csv`
