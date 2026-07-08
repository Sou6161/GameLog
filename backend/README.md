# GameLog Backend

Node.js + Express + Postgres backend for GameLog. Replaces Appwrite for
authentication and reviews, and serves the IGDB game proxy.

## Setup

1. Install dependencies:

   ```bash
   cd backend
   npm install
   ```

2. Create a Postgres database (locally or via Docker):

   ```bash
   createdb gamelog
   # or: docker run --name gamelog-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=gamelog -p 5432:5432 -d postgres
   ```

3. Copy the env template and fill it in:

   ```bash
   cp .env.example .env
   # set DATABASE_URL, JWT_SECRET, IGDB_CLIENT_ID, IGDB_CLIENT_SECRET
   ```

4. Apply the schema:

   ```bash
   npm run db:init
   ```

5. Run the server:

   ```bash
   npm run dev    # or: npm start
   ```

The API listens on `http://localhost:3001` by default.

## API

### Auth (`/api/auth`)
- `POST /register` — `{ email, password, username }` → `{ token, user }`
- `POST /login` — `{ email, password }` → `{ token, user }`
- `GET  /me` — Bearer token → `{ user }`
- `POST /logout` — no-op for stateless JWT

### Reviews (`/api/reviews`)
- `GET    /` — filter by `?gameId=&userId=&isPublic=&limit=` → `{ reviews }`
- `GET    /:id` → `{ review }`
- `POST   /` — Bearer token, review body → `{ review }`
- `PATCH  /:id` — Bearer token (owner only) → `{ review }`
- `DELETE /:id` — Bearer token (owner only) → `{ success }`

### Games / IGDB (`/api/games`)
- `POST /search` — `{ query, limit }`
- `GET  /featured | /trending | /popular | /top-rated | /upcoming | /indie | /recent |`
  `/anticipated | /racing | /sports | /fighting | /strategy | /horror` — `?limit=`
- `GET  /genre/:genreId` — `?limit=`
- `GET  /:id` — game details

The mobile/web app points at this server via `EXPO_PUBLIC_API_URL`
(defaults to `http://localhost:3001`).
