# Tickr

A social trading platform where traders share positions, analysis, and market insights.

## Tech Stack

- **Framework** — Next.js 14 (App Router)
- **Database** — PostgreSQL + Prisma ORM
- **Auth** — NextAuth.js
- **Styling** — Tailwind CSS + Framer Motion

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Fill in the values in `.env`:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_URL` | Your app URL (e.g. `http://localhost:3000`) |
| `NEXTAUTH_SECRET` | Random secret — generate with `openssl rand -base64 32` |

### 3. Set up the database

```bash
npm run db:migrate   # run migrations
npm run db:seed      # optional: seed with sample data
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed the database |
| `npm run db:studio` | Open Prisma Studio |
