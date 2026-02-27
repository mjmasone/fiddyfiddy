# Fiddyfiddy Feature Map

**Version:** 10.0  
**Last Updated:** February 2026

This document maps every feature to its location in the codebase, showing how data flows through the system.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [File Structure](#file-structure)
3. [Features by User Role](#features-by-user-role)
4. [Feature Deep Dives](#feature-deep-dives)
5. [Data Flow Diagrams](#data-flow-diagrams)
6. [Shared Libraries](#shared-libraries)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
│  Next.js App Router (app/)                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Player    │  │  Organizer  │  │    Owner    │             │
│  │   Pages     │  │   Pages     │  │   Pages     │             │
│  │  /r/[id]    │  │  /dashboard │  │  /admin     │             │
│  │  /lobby     │  │  /raffle/*  │  │             │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API LAYER                               │
│  Next.js API Routes (app/api/)                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │  /auth   │ │ /raffles │ │ /tickets │ │  /draw   │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SHARED LIBRARIES                           │
│  lib/                                                           │
│  ┌────────┐ ┌────────┐ ┌──────────┐ ┌───────┐ ┌───────────┐   │
│  │ knack  │ │  auth  │ │ sendgrid │ │ venmo │ │  drawing  │   │
│  └────────┘ └────────┘ └──────────┘ └───────┘ └───────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                      │
│  │  Knack   │  │ SendGrid │  │  Venmo   │                      │
│  │ Database │  │  Email   │  │ Payments │                      │
│  └──────────┘  └──────────┘  └──────────┘                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
fiddyfiddy/
├── app/                          # Next.js App Router
│   ├── layout.js                 # Root layout (global styles, meta)
│   ├── page.js                   # Homepage → redirects to /lobby
│   ├── globals.css               # Global CSS + Tailwind
│   │
│   │── ─── PLAYER PAGES ─────────────────────────────────────────
│   ├── lobby/page.js             # Browse active raffles
│   ├── about/page.js             # Info page, FAQ, how it works
│   ├── r/[id]/                   # Player raffle experience
│   │   ├── page.js               # View raffle, buy tickets
│   │   └── confirm/[ticket]/     
│   │       └── page.js           # Confirm payment after purchase
│   ├── ticket/[number]/page.js   # Check ticket status by number
│   │
│   │── ─── AUTH PAGES ───────────────────────────────────────────
│   ├── login/page.js             # Organizer/Owner login
│   ├── register/page.js          # Organizer self-registration
│   │
│   │── ─── ORGANIZER PAGES ──────────────────────────────────────
│   ├── dashboard/page.js         # Organizer home - list raffles
│   ├── raffle/
│   │   ├── new/page.js           # Create new raffle
│   │   └── [id]/
│   │       ├── edit/page.js      # Edit raffle details + cancel
│   │       ├── flyer/page.js     # Printable QR flyer
│   │       ├── verify/page.js    # Verify ticket payments
│   │       ├── draw/page.js      # Draw winner
│   │       ├── payout/page.js    # Confirm payout to winner
│   │       └── report/page.js    # Final raffle report
│   │
│   │── ─── OWNER PAGES ──────────────────────────────────────────
│   ├── admin/
│   │   └── users/page.js         # Manage organizers
│   │
│   │── ─── API ROUTES ───────────────────────────────────────────
│   └── api/
│       ├── auth/
│       │   ├── login/route.js    # POST - authenticate user
│       │   ├── logout/route.js   # POST - clear auth cookie
│       │   ├── register/route.js # POST - create organizer account
│       │   └── hash/route.js     # POST - utility to hash password
│       │
│       ├── dashboard/route.js    # GET - organizer's raffles
│       │
│       ├── raffles/
│       │   ├── route.js          # GET list, POST create
│       │   └── [id]/
│       │       ├── route.js      # GET, PUT, DELETE single raffle
│       │       ├── activate/route.js      # POST - set Active
│       │       ├── cancel/route.js        # POST - cancel + notify
│       │       ├── qr/route.js            # GET - QR code image
│       │       ├── pending-tickets/route.js  # GET - unverified
│       │       ├── verify-tickets/route.js   # POST - bulk verify
│       │       ├── payout-info/route.js      # GET - winner info
│       │       ├── confirm-payout/route.js   # POST - mark paid
│       │       └── report/route.js           # GET - full report
│       │
│       ├── tickets/
│       │   ├── route.js          # POST - create ticket
│       │   ├── [id]/
│       │   │   ├── route.js      # GET single ticket
│       │   │   └── verify/route.js  # POST - verify payment
│       │   └── by-number/[number]/route.js  # GET by ticket #
│       │
│       ├── draw/[id]/
│       │   ├── route.js          # POST - draw winner
│       │   ├── status/route.js   # GET - draw status
│       │   ├── confirm/route.js  # POST - confirm winner
│       │   └── redraw/route.js   # POST - pick new winner
│       │
│       ├── admin/users/route.js  # GET/PUT - manage organizers
│       │
│       └── debug/route.js        # GET - debug Knack data
│
├── lib/                          # Shared backend libraries
│   ├── knack.js                  # Database operations
│   ├── auth.js                   # JWT token handling
│   ├── sendgrid.js               # Email templates
│   ├── venmo.js                  # Payment link generation
│   ├── drawing.js                # Random winner selection
│   └── utils.js                  # Helpers (validation, formatting)
│
├── scripts/
│   └── create-user.js            # CLI tool to create users
│
└── Configuration Files
    ├── package.json              # Dependencies
    ├── next.config.js            # Next.js config
    ├── tailwind.config.js        # Tailwind CSS config
    ├── .env.example              # Environment variables template
    └── .gitignore                # Git ignore rules
```

---

## Features by User Role

### 👤 PLAYER (No Login Required)

| Feature | Page | API | Description |
|---------|------|-----|-------------|
| Browse Raffles | `/lobby` | `GET /api/raffles` | See all public, active raffles |
| View Raffle | `/r/[id]` | `GET /api/raffles/[id]` | See details, jackpot, buy tickets |
| Buy Ticket | `/r/[id]` | `POST /api/tickets` | Enter email/venmo, get ticket |
| Confirm Payment | `/r/[id]/confirm/[ticket]` | `POST /api/tickets/[id]/verify` | Optional - submit txn ID or screenshot |
| Check Ticket | `/ticket/[number]` | `GET /api/tickets/by-number/[number]` | Look up ticket status |
| Learn More | `/about` | — | FAQ, how it works, contact |

### 👔 ORGANIZER (Login Required)

| Feature | Page | API | Description |
|---------|------|-----|-------------|
| Register | `/register` | `POST /api/auth/register` | Create account (auto-approved) |
| Login | `/login` | `POST /api/auth/login` | Authenticate |
| Dashboard | `/dashboard` | `GET /api/dashboard` | See all your raffles |
| Create Raffle | `/raffle/new` | `POST /api/raffles` | New raffle setup |
| Edit Raffle | `/raffle/[id]/edit` | `PUT /api/raffles/[id]` | Modify details |
| Activate Raffle | `/raffle/[id]/edit` | `POST /api/raffles/[id]/activate` | Go live |
| Cancel Raffle | `/raffle/[id]/edit` | `POST /api/raffles/[id]/cancel` | Cancel + email players |
| Print Flyer | `/raffle/[id]/flyer` | — | QR code poster for printing |
| Verify Tickets | `/raffle/[id]/verify` | `GET /api/raffles/[id]/pending-tickets` | Review payments |
| Draw Winner | `/raffle/[id]/draw` | `POST /api/draw/[id]` | Random selection |
| Confirm Winner | `/raffle/[id]/draw` | `POST /api/draw/[id]/confirm` | Validate payment |
| Redraw | `/raffle/[id]/draw` | `POST /api/draw/[id]/redraw` | Pick new winner |
| Payout | `/raffle/[id]/payout` | `POST /api/raffles/[id]/confirm-payout` | Mark as paid |
| View Report | `/raffle/[id]/report` | `GET /api/raffles/[id]/report` | Final summary |

### 👑 OWNER (Login Required + Owner Role)

| Feature | Page | API | Description |
|---------|------|-----|-------------|
| All Organizer Features | (all above) | (all above) | Full access |
| Manage Users | `/admin/users` | `GET/PUT /api/admin/users` | Approve/suspend organizers |
| Receive Notifications | — | (via SendGrid) | New organizer alerts |

---

## Feature Deep Dives

### 🎫 Ticket Purchase Flow

```
Player visits /r/[id]
        │
        ▼
┌───────────────────┐
│  Raffle Page      │ ← GET /api/raffles/[id]
│  - Shows jackpot  │
│  - Ticket price   │
│  - Tickets left   │
└────────┬──────────┘
         │ Player fills form + clicks "Buy Ticket"
         ▼
┌───────────────────┐
│  POST /api/tickets│
│  - Validates input│
│  - Creates ticket │ → Knack: object_7
│  - Status=Verified│   (auto-verified)
│  - Sends email    │ → SendGrid: ticket confirmation
│  - Returns Venmo  │
│    payment URL    │
└────────┬──────────┘
         │ Redirect
         ▼
┌───────────────────┐
│  Confirm Page     │
│  /r/[id]/confirm/ │
│  [ticket]         │
│  - Opens Venmo    │ → Venmo app (external)
│  - Optional:      │
│    submit proof   │ → POST /api/tickets/[id]/verify
└───────────────────┘

Files involved:
- app/r/[id]/page.js                      (UI)
- app/r/[id]/confirm/[ticket]/page.js     (UI)
- app/api/tickets/route.js                (create)
- app/api/tickets/[id]/verify/route.js    (confirm)
- lib/knack.js                            (database)
- lib/sendgrid.js                         (email)
- lib/venmo.js                            (payment link)
- lib/utils.js                            (ticket number generation)
```

### 🎰 Drawing Flow

```
Organizer visits /raffle/[id]/draw
        │
        ▼
┌───────────────────┐
│  Draw Page        │ ← GET /api/draw/[id]/status
│  - Shows stats    │
│  - Eligible count │
└────────┬──────────┘
         │ Clicks "Draw Winner"
         ▼
┌───────────────────┐
│  POST /api/draw   │
│  [id]             │
│  - Gets verified  │ ← Knack: object_7 (status=Verified)
│    tickets        │
│  - Random select  │ ← lib/drawing.js (crypto.random)
│  - Updates raffle │ → Knack: object_6 (status=Drawing)
│  - Creates log    │ → Knack: object_8
│  - Emails winner  │ → SendGrid
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  Organizer checks │
│  Venmo for        │
│  winner's payment │
└────────┬──────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
Payment    No Payment
Found      Found
    │         │
    ▼         ▼
┌─────────┐ ┌─────────┐
│ Confirm │ │ Redraw  │
│ Winner  │ │         │
└────┬────┘ └────┬────┘
     │           │
     ▼           ▼
POST /api/   POST /api/
draw/[id]/   draw/[id]/
confirm      redraw

Files involved:
- app/raffle/[id]/draw/page.js            (UI)
- app/api/draw/[id]/route.js              (initial draw)
- app/api/draw/[id]/status/route.js       (check status)
- app/api/draw/[id]/confirm/route.js      (confirm winner)
- app/api/draw/[id]/redraw/route.js       (pick another)
- lib/drawing.js                          (random selection)
- lib/knack.js                            (database)
- lib/sendgrid.js                         (winner email)
```

### 🚫 Cancel Raffle Flow

```
Organizer visits /raffle/[id]/edit
        │
        ▼
┌───────────────────┐
│  Edit Page        │
│  - Scroll to      │
│    Cancel button  │
└────────┬──────────┘
         │ Clicks "Cancel Raffle"
         ▼
┌───────────────────┐
│  Modal appears    │
│  - Enter reason   │
│  - Shows player   │
│    count warning  │
└────────┬──────────┘
         │ Confirms
         ▼
┌───────────────────┐
│  POST /api/raffles│
│  /[id]/cancel     │
│  - Validates auth │
│  - Gets all       │ ← Knack: object_7 (all tickets)
│    tickets        │
│  - Updates status │ → Knack: object_6 (status=Cancelled)
│  - Emails ALL     │ → SendGrid: each player
│    players        │
└───────────────────┘

Files involved:
- app/raffle/[id]/edit/page.js            (UI + modal)
- app/api/raffles/[id]/cancel/route.js    (cancel logic)
- lib/knack.js                            (database)
- lib/sendgrid.js                         (sendRaffleCancellation)
```

### 📄 Flyer Generation

```
Organizer clicks "Flyer" on dashboard
        │
        ▼
┌───────────────────┐
│  /raffle/[id]/    │
│  flyer            │
│  - Fetches raffle │ ← GET /api/raffles/[id]
│  - Generates QR   │ ← qrcode.react library
│  - Displays 8.5x11│
│    printable page │
└────────┬──────────┘
         │ Clicks "Print"
         ▼
┌───────────────────┐
│  Browser print    │
│  dialog           │
│  - @media print   │
│    CSS hides      │
│    nav/buttons    │
└───────────────────┘

Files involved:
- app/raffle/[id]/flyer/page.js           (UI + print styles)
- app/api/raffles/[id]/route.js           (raffle data)
- package.json                            (qrcode.react dependency)
```

---

## Data Flow Diagrams

### Authentication Flow

```
┌──────────┐    POST /api/auth/login     ┌──────────┐
│  Login   │ ─────────────────────────── │  API     │
│  Page    │    {email, password}        │  Route   │
└──────────┘                             └────┬─────┘
                                              │
                                              ▼
                                    ┌─────────────────┐
                                    │  lib/knack.js   │
                                    │  getUserByEmail │
                                    └────────┬────────┘
                                              │
                                              ▼
                                    ┌─────────────────┐
                                    │  bcrypt.compare │
                                    │  (password)     │
                                    └────────┬────────┘
                                              │
                                              ▼
                                    ┌─────────────────┐
                                    │  lib/auth.js    │
                                    │  createToken    │
                                    │  (JWT)          │
                                    └────────┬────────┘
                                              │
                                              ▼
                                    ┌─────────────────┐
                                    │  Set cookie:    │
                                    │  fiddyfiddy_auth│
                                    └─────────────────┘
```

### Authorization Check (Protected Routes)

```
Request to /api/dashboard
        │
        ▼
┌───────────────────┐
│  Read cookie:     │
│  fiddyfiddy_auth  │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  lib/auth.js      │
│  verifyToken()    │
│  - Validates JWT  │
│  - Returns user   │
│    info           │
└────────┬──────────┘
         │
    ┌────┴────┐
    │         │
 Valid     Invalid
    │         │
    ▼         ▼
 Continue   Return
 request    401 Error
```

---

## Shared Libraries

### lib/knack.js — Database Operations

| Function | Purpose |
|----------|---------|
| `getSettings()` | Get platform settings (owner venmo) |
| `getUserByEmail(email)` | Find user for login |
| `createUser(data)` | Register new organizer |
| `updateUser(id, data)` | Change user status |
| `getAllUsers()` | List all organizers (admin) |
| `getRaffles(filters)` | List raffles with filters |
| `getRaffleById(id)` | Single raffle details |
| `createRaffle(data)` | New raffle |
| `updateRaffle(id, data)` | Edit raffle |
| `deleteRaffle(id)` | Remove raffle |
| `createTicket(data)` | New ticket |
| `getTicketById(id)` | Single ticket |
| `getTicketByNumber(num)` | Find by ticket number |
| `getTicketsByRaffle(id)` | All tickets for raffle |
| `updateTicket(id, data)` | Change ticket status |
| `countTicketsByRaffle(id)` | Ticket count |
| `createDrawLog(data)` | Record draw attempt |

### lib/auth.js — Authentication

| Function | Purpose |
|----------|---------|
| `createToken(user)` | Generate JWT |
| `verifyToken(request)` | Validate JWT from cookie |
| `hashPassword(password)` | Bcrypt hash |
| `comparePassword(input, hash)` | Verify password |

### lib/sendgrid.js — Email Templates

| Function | Purpose |
|----------|---------|
| `sendTicketConfirmation(ticket, raffle)` | Ticket purchase email |
| `sendWinnerNotification(ticket, raffle, jackpot)` | You won! email |
| `sendPayoutConfirmation(ticket, raffle, amount)` | Payment sent email |
| `sendRaffleCancellation(ticket, raffle, reason)` | Raffle cancelled email |
| `sendNewOrganizerNotification(organizer)` | Alert owner of new signup |

### lib/venmo.js — Payment Links

| Function | Purpose |
|----------|---------|
| `generateTicketPaymentLink(raffle, seq, ticketNum, ownerVenmo)` | Create Venmo deep link |
| `validateVenmoHandle(handle)` | Clean/validate Venmo username |

### lib/drawing.js — Winner Selection

| Function | Purpose |
|----------|---------|
| `selectWinner(tickets)` | Cryptographically random pick |
| `calculateJackpot(raffle)` | 50% of ticket sales |

### lib/utils.js — Utilities

| Function | Purpose |
|----------|---------|
| `generateTicketNumber(prefix, seq)` | Format: PREFIX-YYYYMMDD-0001 |
| `isStateRestricted(state)` | Check AL, HI, UT |
| `isValidEmail(email)` | Email format validation |
| `formatCurrency(amount)` | $X.XX formatting |
| `stripHtml(str)` | Remove HTML tags from Knack data |

---

## Knack Database Objects

| Object | ID | Purpose | Key Fields |
|--------|-----|---------|------------|
| Settings | object_4 | Platform config | owner_venmo |
| Users | object_5 | Organizers/Owner | email, password, role, status |
| Raffles | object_6 | Raffle instances | name, status, ticket_price, max_tickets |
| Tickets | object_7 | Player tickets | ticket_number, status, player_email |
| DrawLog | object_8 | Drawing history | raffle, ticket, timestamp |
| Transactions | object_9 | Payment records | (future use) |

---

## Environment Variables

| Variable | Used In | Purpose |
|----------|---------|---------|
| `KNACK_APP_ID` | lib/knack.js | Database connection |
| `KNACK_API_KEY` | lib/knack.js | Database auth |
| `SENDGRID_API_KEY` | lib/sendgrid.js | Email sending |
| `SENDGRID_FROM_EMAIL` | lib/sendgrid.js | Sender address |
| `JWT_SECRET` | lib/auth.js | Token signing |
| `NEXT_PUBLIC_SITE_URL` | lib/sendgrid.js | Links in emails |
| `OWNER_VENMO` | lib/venmo.js | Fallback payment recipient |
| `OWNER_EMAIL` | api/auth/register | New organizer alerts |

---

## Quick Reference: "Where do I change...?"

| If you want to change... | Edit this file |
|--------------------------|----------------|
| Homepage redirect | `app/page.js` |
| Global styles/colors | `app/globals.css` |
| Navigation header | Each page's `<header>` section |
| Ticket number format | `lib/utils.js` → `generateTicketNumber()` |
| Email templates | `lib/sendgrid.js` |
| Jackpot calculation (50%) | `lib/drawing.js` → `calculateJackpot()` |
| Restricted states | `lib/utils.js` → `isStateRestricted()` |
| Venmo link format | `lib/venmo.js` |
| Player ticket form | `app/r/[id]/page.js` |
| Organizer dashboard layout | `app/dashboard/page.js` |
| Raffle creation fields | `app/raffle/new/page.js` |
| Winner email content | `lib/sendgrid.js` → `sendWinnerNotification()` |
| Flyer design | `app/raffle/[id]/flyer/page.js` |
| About page content | `app/about/page.js` |

---

## Version History

| Version | Changes |
|---------|---------|
| 10.0 | Added flyer, cancel raffle, hybrid verification, about page |
| 9.0 | Verify table drill-down |
| 8.0 | Production deployment |

