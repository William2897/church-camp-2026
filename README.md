# From Doubt to Trust — Church Camp 2026 Registration

A clean, mobile-friendly registration app for the **"From Doubt to Trust"** church camp
(29–31 August 2026, Port Dickson Methodist Center).

- **Frontend:** React + TypeScript + Vite + Tailwind CSS — a multi-step registration wizard.
- **Backend:** Google Apps Script → Google Sheet (free; the treasurer reads registrants directly),
  with payment-proof files saved to Google Drive.

```
from-doubt-to-trust-camp/
├── frontend/        # React app
└── apps-script/     # Google Apps Script backend (Code.gs + SETUP.md)
```

## Quick start

```bash
cd frontend
npm install
cp .env.example .env      # then paste your Apps Script URL into VITE_API_URL
npm run dev
```

Open the printed local URL (usually http://localhost:5173).

## Before going live — checklist

1. **Poster image.** Save the camp poster banner in `frontend/public/` as
   `poster-landscape.jpg`, `.jpeg`, or `.png` (landscape works best for the hero).
   Until then the landing page shows a styled gradient fallback.
2. **Backend.** Follow [`apps-script/SETUP.md`](apps-script/SETUP.md) to create the Google Sheet,
   deploy the Web App, and paste its URL into `frontend/.env` as `VITE_API_URL`.
3. **Bank details.** Fill in the real church camp account in
   [`frontend/src/utils/campConfig.ts`](frontend/src/utils/campConfig.ts) → `BANK_DETAILS`
   (currently a placeholder).
4. ⚠️ **Two-room suite price.** Confirm the suite top-up with **Kim**, then update
   `SUITE_UPGRADE_PER_NIGHT` (and set `SUITE_PRICE_CONFIRMED = true`) in `campConfig.ts`.
   Current placeholder: **RM150/night (RM300 for the 2-night camp)**.
   Suggested range to discuss: RM100–150/night, or a flat RM250–350.

## Pricing reference (edit in `frontend/src/utils/campConfig.ts`)

| Category | Fee |
|---|---|
| Working Adult | RM 220 |
| Ministry Worker / Housewife / Student | RM 180 |
| Child (3–12) | RM 130 |
| Child (under 3) | Free |
| Seminar Attendee (food, no lodging) | RM 110 |

- **Family package** (on registration fees): 3 people → 10% · 4 → 15% · 5+ → 20%.
- **Extra mattress:** RM 50/night each, max 2 per room.
- **Two-room suite:** upgrade top-up (see checklist #4).

## How it works

The form collects the main registrant, optional family members, food/health info, an
accommodation choice (skipped automatically for seminar-only bookings), then payment.
On submit it POSTs JSON (with the receipt as base64) to the Apps Script Web App, which writes a
`Bookings` summary row + per-person `Members` rows and stores the receipt in Drive.

### Room availability (no overbooking)

Regular twin rooms and two-room suites are limited stock (8 each, per the venue booking sheet).
The form shows "X of Y left" on those options and disables them when full, and the backend
re-checks availability inside a lock at submit time so the last room can't be double-booked.
Edit the totals anytime in the auto-created **`Settings`** tab of the Google Sheet.

## Build / deploy the frontend

```bash
cd frontend
npm run build       # outputs to frontend/dist
```

Deploy `frontend/dist` to any static host (Netlify, Vercel, GitHub Pages, Cloudflare Pages).
Set the `VITE_API_URL` environment variable on the host to your Apps Script URL.

## Contacts

William · 011-6093 7110 — Kimberley · 011-1988 7239 — FB **DAHCSDA** · IG **dahc.youth**
