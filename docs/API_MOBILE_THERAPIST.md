# MindCare API — Mobile app (students) & therapist assignment

**Base URL:** `https://<your-domain>/api/v1` (local dev: `http://localhost:5000/api/v1` with Vite proxy `/api` → backend).

All authenticated routes expect:

```http
Authorization: Bearer <JWT>
```

---

## Auth (student = role `user` in DB)

| Method | Path | Body | Notes |
|--------|------|------|-------|
| POST | `/auth/register` | `{ name, email, password }` | Creates `role: "user"` |
| POST | `/auth/login` | `{ email, password }` | |

**Response** includes (use any one token field your Flutter parser expects):

```json
{
  "message": "Login successful",
  "token": "<jwt>",
  "access_token": "<jwt>",
  "user": { "_id", "name", "email", "role", ... },
  "data": {
    "token": "<jwt>",
    "access_token": "<jwt>",
    "user": { ... }
  }
}
```

---

## AI chat (student)

| Method | Path | Body | Auth |
|--------|------|------|------|
| POST | `/ai/chat` | `{ message, recentMood? }` | Required |

---

## Therapist support (student mobile)

### Request a therapist

`POST /therapist/request`

- **Auth:** student (`role: user`) only.
- **Body:** none.

**201 / 200**

```json
{
  "assignmentId": "<id>",
  "status": "pending",
  "message": "Therapist support requested"
}
```

Idempotent: if already pending or assigned, returns existing state without creating duplicates.

---

### Poll connection status

`GET /therapist/status`

- **Auth:** student only.

**200**

```json
{
  "status": "none" | "pending" | "assigned" | "closed",
  "therapist": { "id": "<id>", "name": "Dr. Smith" } | null,
  "data": { "status": "...", "therapist": null }
}
```

---

### List messages (human thread)

`GET /therapist/messages`

- **Auth:** student — own thread only (no query params).
- **Auth:** therapist — **required** query `?studentId=<mongoId>` for the assigned student.

**200**

```json
{
  "messages": [
    {
      "id": "<id>",
      "senderId": "<userId>",
      "receiverId": "<userId>",
      "message": "text",
      "timestamp": "2026-01-01T12:00:00.000Z",
      "sender_id": "<userId>",
      "text": "text",
      "createdAt": "2026-01-01T12:00:00.000Z"
    }
  ],
  "data": { "messages": [ ... ] }
}
```

Optional query: `limit`, `before` (ISO date for pagination).

---

### Send a message

`POST /therapist/messages`

- **Auth:** student — body `{ "message": "Hello" }` (same thread as assigned therapist).
- **Auth:** therapist — body `{ "message": "Hi", "studentId": "<studentMongoId>" }`.

**201**

```json
{
  "message": { "id", "senderId", "receiverId", "message", "timestamp", ... },
  "messageRecord": { ... }
}
```

Messages are stored in the same `Conversation` / `Message` collections as the website **Messages** page.

---

## Therapist (website or API)

### Pending queue (accept yourself)

| Method | Path | Auth |
|--------|------|------|
| GET | `/therapist/pending-assignments` | Verified therapist |

**200**

```json
{
  "assignments": [
    {
      "id": "<assignmentId>",
      "studentId": "<id>",
      "studentName": "...",
      "studentEmail": "...",
      "requestedAt": "..."
    }
  ]
}
```

| Method | Path | Auth |
|--------|------|------|
| POST | `/therapist/assignments/:assignmentId/accept` | Verified therapist |

Creates/links the `Conversation` and sets assignment to `assigned`.

---

## Admin (website)

| Method | Path | Query / body |
|--------|------|----------------|
| GET | `/admin/therapist-assignments` | `?status=pending` optional |
| POST | `/admin/therapist-assignments/:assignmentId/assign` | `{ "therapistId": "<id>" }` |

---

## Security notes

- Students only see their own assignment and messages.
- Therapists only see threads for students assigned to them (`TherapistAssignment` + verified therapist).
- Admins use admin JWT for assignment endpoints.

---

## Test checklist

1. Register/login student in app → JWT present (`token` / `access_token`).
2. `POST /therapist/request` → `pending`.
3. On web: therapist **Student requests** → Accept **or** admin **Therapist assign.** → pick therapist.
4. Student `GET /therapist/status` → `assigned` + therapist `{ id, name }`.
5. Student `POST /therapist/messages` + `GET /therapist/messages`; therapist replies with `studentId` in body; both see the same thread.
