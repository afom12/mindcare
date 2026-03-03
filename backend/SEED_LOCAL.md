# Local MongoDB Setup

Use this when running with `MONGO_URI=mongodb://localhost:27017/mindcare-ai` in `.env`.

## 1. Start MongoDB

Make sure MongoDB is running locally. On Windows, it may start automatically after install. Or run:

```bash
mongod
```

## 2. Seed the Database

From the `backend` folder:

```bash
npm run seed
```

Or:

```bash
node src/scripts/seedAll.js
```

This populates:
- **Resources** – crisis hotlines, articles, coping techniques, breathing exercises, videos, podcasts, tools
- **Community Chat Groups** – Anxiety, Depression, Trauma, Students, LGBTQ+, Wellness, Recovery, General

## 3. Create Admin Account

```bash
node src/scripts/createAdmin.js your@email.com YourPassword
```

## 4. Start the App

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

## What You Get

- **Resources** – Full library of crisis, articles, coping, breathing, videos, links
- **Community** – Posts, comments, reactions (create an account and post)
- **Community Chat** – Group chats and peer DMs (join groups, message members)
- **Mood** – Log moods (requires login)
- **Assessments** – Self-assessment tools (frontend data)
- **Admin** – Full dashboard (users, posts, reports, user reports, analytics, etc.)
