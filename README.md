# 🍣 Sakana Sushi — order sushi at home

Full-stack sushi ordering app:

| Layer    | Tech                                                        |
|----------|-------------------------------------------------------------|
| Frontend | React 18 + Vite + Material UI (dark theme, parallax hero)   |
| Backend  | ASP.NET Core 8 Web API (C#), JWT auth                       |
| Database | MongoDB 7 (NoSQL)                                           |
| Hosting  | Docker Compose (nginx serves the SPA and proxies `/api`)    |

## Run it

```bash
cp .env.example .env   # then set JWT_KEY, ADMIN_EMAIL and ADMIN_PASSWORD
docker compose up -d --build
```

| URL                              | What                         |
|----------------------------------|------------------------------|
| http://localhost:3000            | The website                  |
| http://localhost:3000/admin      | Admin panel                  |
| http://localhost:5000/swagger    | API docs (Swagger UI)        |

**Admin account:** seeded on first start from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in your `.env`.

The database is seeded on first start with a full menu. Data persists in the
`mongo-data` Docker volume; `docker compose down -v` resets everything.

## Features

- Browse the menu with category filters and search; cart persists in the browser.
- Checkout as a **guest** or with an **account** (register/login, JWT).
- Order tracking page with a live status timeline (`Pending → Confirmed → Preparing → Out for delivery → Delivered`).
- Logged-in users see their order history under **My orders**.
- Admin panel: add/edit/delete products, change prices, toggle availability, and
  advance order statuses.
- Delivery fee $3.99, free over $35 (constants in `OrdersController.cs` and `client.js`).

## Payments

Payment methods are pluggable (`backend/Services/Payments/`). Enabled today:
cash on delivery and card on delivery. A **Stripe provider slot** is included —
it appears at checkout automatically once `STRIPE_SECRET_KEY` is set in your
`.env` (see `docker-compose.yml`) and `StripeProvider.InitiateAsync` is implemented
(step-by-step notes are in that file). `POST /api/payments/webhook` is reserved
for the processor's payment confirmations.

## Development outside Docker

```bash
# backend (needs .NET 8 SDK + a local MongoDB or the mongo container)
cd backend && dotnet run

# frontend (proxies /api to localhost:5000)
cd frontend && npm install && npm run dev
```
