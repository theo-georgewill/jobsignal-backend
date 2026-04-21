# Remote Jobs Aggregator

A full-stack platform that aggregates global remote software engineering jobs from multiple sources into a single searchable dashboard.

## Overview

This project was built to solve a personal pain point: checking many job boards, startup career pages, and remote hiring platforms manually. The system centralizes opportunities into one place with filtering, deduplication, and relevance scoring.

The application is intentionally split into **frontend** and **backend** services for cleaner maintenance, independent deployment, and easier scaling.

## Architecture

### Frontend

Built with React.

Responsibilities:

* Browse and search jobs
* Filter by stack, seniority, timezone, salary, source
* Save jobs / track applications
* Dashboard analytics
* Authentication flows
* Responsive UI

### Backend

Built with NestJS.

Responsibilities:

* Source ingestion pipelines
* Scheduled sync jobs
* Job normalization
* Deduplication engine
* REST API for frontend
* Authentication / user management
* Alerts / notifications
* Admin controls

### Database

PostgreSQL.

Stores:

* Jobs
* Companies
  n- Sources
* Users
* Saved jobs
* Application tracking
* Sync logs
* Metrics

## Why Split Frontend and Backend?

Separating the codebases improves maintainability:

* Independent deployments
* Cleaner ownership boundaries
* Easier scaling of ingestion workers
* Frontend can evolve without backend coupling
* Better testing strategy
* Easier onboarding for contributors

## Core Features

* Aggregate jobs from 50+ sources
* Global remote engineering focus
* Search + advanced filtering
* Deduplicate repeated listings
* Personalized relevance ranking
* Saved jobs
* Application tracker
* Email alerts
* Fresh job prioritization
* Source health monitoring

## Planned Sources

* Startup job boards
* Remote-only job boards
* YC startup careers pages
* SaaS company careers pages
* Community job feeds
* Curated engineering opportunities

## Tech Stack

### Frontend

* React
* TypeScript
* React Query / state management
* UI component system

### Backend

* NestJS
* TypeScript
* BullMQ / queues
* Cron jobs
* Validation / DTO patterns

### Data

* PostgreSQL
* Redis (queues/cache)

## Example Monorepo Structure

```text
/apps
  /frontend
  /backend
/packages
  /shared-types
  /ui
/docs
```

## Backend Modules

```text
src/
  auth/
  jobs/
  users/
  sources/
  workers/
  alerts/
  analytics/
  admin/
```

## Ingestion Pipeline

1. Scheduler triggers source syncs
2. Queue creates jobs per source
3. Worker fetches API/feed/page
4. Parser normalizes fields
5. Deduplication runs
6. Records saved to PostgreSQL
7. Frontend receives updated data

## Local Development

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npm run start:dev
```

## Environment Variables

### Frontend

```env
VITE_API_URL=
```

### Backend

```env
DATABASE_URL=
REDIS_URL=
JWT_SECRET=
```

## Product Vision

Become the best private job intelligence tool for software engineers seeking global remote opportunities.

## Long-Term Roadmap

* AI job matching
* Resume-to-job fit scoring
* Salary insights
* Recruiter CRM
* Browser extension
* Community recommendations
* Public premium version

## Status

Active development.

## Author

Theo Georgewill
