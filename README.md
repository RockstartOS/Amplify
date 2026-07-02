# Amplify Europe

The event platform for the **Amplify Europe** series — a travelling 2.5-day event
that opens with **Invested Day** and continues with **Amplify It** tracks. The
first edition lands in **Amsterdam**.

This repo contains both the public website and the organiser backend, sharing a
single database so that whatever you edit in the back office shows up on the
front immediately.

## What's inside

**Public website**

- Landing page explaining the 1.5-day format, tracks and passes
- **Schedule explorer** (`/schedule`) — browse the programme, filter by day and
  track, and add sessions to a personal agenda
- **Tickets** (`/tickets`) and **registration** (`/register`) with a mock
  checkout that issues a reference code
- **My agenda** (`/agenda`) — sign in with a reference code to build and manage
  a personal schedule

**Organiser backend** (`/admin`, password-gated)

- Dashboard with registrations, revenue and programme counts
- Event & days settings (publish toggle, 1.5-day structure)
- **Tracks** — add any number of tracks (Energy, Food & Bio, Scaling, …)
- **Schedule editor** — create/edit/delete sessions; assign day, track, kind,
  room, times and speakers. Everything here drives the public schedule.
- **Speakers**, **Tickets** and **Registrations** management

## Tech stack

- [Next.js 16](https://nextjs.org/) (App Router, React 19, Server Actions)
- [Prisma 6](https://www.prisma.io/) ORM with SQLite (swap to Postgres for prod)
- Tailwind CSS v4

## Getting started

```bash
npm install            # also runs `prisma generate`
npm run db:reset       # create the SQLite schema and seed the Amsterdam edition
npm run dev            # http://localhost:3000
```

The organiser backend is at [`/admin`](http://localhost:3000/admin). The default
demo password is `amplify` — override it with the `ADMIN_PASSWORD` environment
variable.

### Useful scripts

| Script              | Description                                  |
| ------------------- | -------------------------------------------- |
| `npm run dev`       | Start the dev server                         |
| `npm run build`     | Production build                             |
| `npm run db:push`   | Sync the Prisma schema to the database       |
| `npm run db:seed`   | Seed sample data                             |
| `npm run db:reset`  | Reset the schema and reseed                  |
| `npm run db:studio` | Open Prisma Studio to inspect the data       |

## Attendee accounts & social login

Attendees log in with email + password, or with **Google** / **LinkedIn**
(OpenID Connect). Copy `.env.example` to `.env` and set the provider
credentials; register these redirect URIs with each provider:

- `{BASE_URL}/api/auth/google/callback`
- `{BASE_URL}/api/auth/linkedin/callback`

When credentials are not set, the social buttons fall back to a clearly
labelled **demo identity in development only** (disabled in production) so the
flow is testable without real apps. New social users are sent to registration
to choose a pass; the verified email becomes their login.

## Moving to production

SQLite keeps local development zero-config. For a deployed environment, point
the `datasource` in `prisma/schema.prisma` at Postgres, run `prisma migrate`,
set a strong `SESSION_SECRET`, and configure the OAuth apps above. The
shared-password admin gate in `src/lib/auth.ts` should move to a real identity
provider, and the mock checkout in `src/app/register/actions.ts` is where a
payment provider (e.g. Stripe) would slot in.
