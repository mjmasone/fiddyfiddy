# 🎟️ Fiddyfiddy

Digital 50/50 Raffle Platform - Quick and easy fundraising with Venmo.

## Quick Start

### 1. Prerequisites

- Node.js 18+ 
- Knack account (database)
- SendGrid account (emails)
- Venmo account (payments)

### 2. Installation

```bash
# Clone/download this project
cd fiddyfiddy

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Fill in your values (see below)
```

### 3. Environment Setup

Edit `.env.local` with your credentials:

```env
# Knack - get from Settings → API & Code
KNACK_APP_ID=your_app_id
KNACK_API_KEY=your_api_key

# Knack Object IDs - get from Builder after creating objects
KNACK_OBJECT_SETTINGS=object_1
KNACK_OBJECT_USERS=object_2
KNACK_OBJECT_RAFFLES=object_3
KNACK_OBJECT_TICKETS=object_4
KNACK_OBJECT_DRAW_LOG=object_5
KNACK_OBJECT_TRANSACTIONS=object_6

# SendGrid - get from sendgrid.com
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_FROM_EMAIL=noreply@fiddyfiddy.org

# Auth - generate random string
JWT_SECRET=your_random_32_char_secret

# Site
NEXT_PUBLIC_SITE_URL=https://fiddyfiddy.org
OWNER_VENMO=your_venmo_handle

# Optional - Google Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### 4. Set Up Knack Database

Follow the **fiddyfiddy-knack-setup-v2.md** guide to create these objects in Knack:

1. **Settings** (1 record) - Platform configuration
2. **Users** - Organizers/Owners
3. **Raffles** - The raffle events
4. **Tickets** - Player purchases
5. **Draw Log** - Audit trail
6. **Transactions** - Payment log

After creating objects, update the `KNACK_OBJECT_*` IDs in `.env.local`.

Also update `lib/knack.js` FIELD_MAP with your actual field IDs.

### 5. Create First User

In Knack, manually create an Organizer user:
- Email: your@email.com
- Password: (Knack will hash it)
- Role: Organizer (or Owner)
- Status: Active
- Venmo Handle: your_handle

### 6. Run Locally

```bash
npm run dev
```

Visit http://localhost:3000

### 7. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

---

## Project Structure

```
fiddyfiddy/
├── app/
│   ├── page.js                    # Redirects to /lobby
│   ├── lobby/page.js              # Public raffle listing
│   ├── r/[id]/page.js             # Buy ticket
│   ├── r/[id]/confirm/[ticket]/   # Confirm payment
│   ├── ticket/[number]/           # Check ticket status
│   ├── login/page.js              # Organizer login
│   ├── dashboard/page.js          # Organizer dashboard
│   ├── raffle/new/                # Create raffle
│   ├── raffle/[id]/verify/        # Verify pending tickets
│   ├── raffle/[id]/draw/          # Execute drawing
│   └── api/                       # API routes
├── lib/
│   ├── knack.js                   # Database wrapper
│   ├── venmo.js                   # Payment links
│   ├── sendgrid.js                # Email
│   ├── drawing.js                 # Drawing logic
│   ├── auth.js                    # JWT auth
│   └── utils.js                   # Helpers
└── components/                    # Shared UI (future)
```

---

## Key Features

### For Players
- 📱 Scan QR code to buy ticket
- 💳 Pay via Venmo deep link (pre-filled)
- ✉️ Get email confirmation
- 🎫 Check ticket status anytime

### For Organizers
- ➕ Create raffles with configurable settings
- ✓ Verify payments (auto or manual)
- 🎲 Execute drawings with confirm/redraw
- 📊 Download reports (PDF/CSV)

### Platform Features
- 💰 $600 jackpot cap (no IRS reporting)
- 🔄 Prime number owner split (configurable)
- 🛡️ Redraw limits + audit logs
- 📧 Automatic notifications
- 🚫 State restrictions (AL, HI, UT)

---

## Configuration Summary

| Setting | Default |
|---------|---------|
| Owner Prime | 11 (~9% to owner) |
| First Ticket | Always to Organizer |
| Max Jackpot | $600 |
| Payout Deadline | 48 hours |
| Max Redraws | 3 |
| Refund Window | 7 days |
| Restricted States | AL, HI, UT |

---

## API Endpoints

### Public
- `GET /api/raffles` - List active raffles
- `GET /api/raffles/[id]` - Get raffle
- `POST /api/tickets` - Buy ticket
- `POST /api/tickets/[id]/verify` - Submit payment proof
- `GET /api/tickets/by-number/[number]` - Check status

### Authenticated (Organizer)
- `POST /api/auth/login` - Login
- `GET /api/dashboard` - Dashboard data
- `POST /api/raffles` - Create raffle
- `PUT /api/raffles/[id]` - Update raffle
- `POST /api/raffles/[id]/activate` - Go live
- `GET /api/raffles/[id]/pending-tickets` - Pending verifications
- `POST /api/raffles/[id]/verify-tickets` - Batch verify
- `POST /api/draw/[id]` - Execute draw
- `POST /api/draw/[id]/confirm` - Confirm winner
- `POST /api/draw/[id]/redraw` - Redraw (invalid)
- `GET /api/raffles/[id]/qr` - Get QR code

---

## Testing Checklist

- [ ] Create Knack objects
- [ ] Create test user in Knack
- [ ] Run locally, login works
- [ ] Create test raffle ($1 tickets)
- [ ] Buy ticket, Venmo link opens correctly
- [ ] Confirm payment with Txn ID
- [ ] Verify tickets page shows pending
- [ ] Execute drawing
- [ ] Confirm winner, check emails
- [ ] Download report

---

## Troubleshooting

**Login fails**: Check Knack user exists with correct email and Active status

**Venmo link doesn't open**: Make sure Venmo app is installed, or opens in browser

**Tickets not showing**: Check Knack object connections are set up correctly

**Emails not sending**: Verify SendGrid API key and sender email is verified

---

## Support

Questions? Check the technical spec documents or open an issue.

---

Built with ❤️ for easy fundraising.
