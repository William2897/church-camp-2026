# Google Apps Script backend — setup

This backend is **free**. It stores registrations in a Google Sheet you control and
saves payment-proof files to a Google Drive folder. Follow these steps once.

## 1. Create the Google Sheet

1. Go to <https://sheets.new> (signed in with the Google account that should own the data).
2. Rename it something like **"Camp 2026 Registrations"**.
   You don't need to add any tabs/headers — the script creates `Bookings` and `Members`
   automatically on the first submission.

## 2. Add the script

1. In the Sheet, click **Extensions ▸ Apps Script**. A new project opens.
2. Delete the placeholder `function myFunction() {}`.
3. Open `Code.gs` from this folder, copy **all** of it, and paste it into the editor.
4. Click the **Save** icon (💾).

## 3. Authorize it (run once)

1. In the Apps Script toolbar, choose the function **`doGet`** from the dropdown and click **Run**.
2. A permissions dialog appears → **Review permissions** → pick your account →
   "Google hasn't verified this app" → **Advanced** → **Go to (project) (unsafe)** → **Allow**.
   (This is expected — it's your own script.)
   It needs access to Sheets and Drive so it can write rows and save receipts.

## 4. Deploy as a Web App

1. Click **Deploy ▸ New deployment**.
2. Click the gear ⚙ next to "Select type" → **Web app**.
3. Set:
   - **Description:** Camp 2026 registration
   - **Execute as:** **Me** (your account)
   - **Who has access:** **Anyone**  ← required so the public form can post to it
4. Click **Deploy**, authorize again if asked, then **copy the Web app URL**
   (looks like `https://script.google.com/macros/s/AKfy…/exec`).

## 5. Connect the frontend

1. In `../frontend`, copy `.env.example` to `.env`.
2. Paste your Web app URL as the value of `VITE_API_URL`.
3. Restart `npm run dev` if it's running.

## Testing

- Open the Web app URL in a browser — you should see
  `{"ok":true,"message":"Camp 2026 registration endpoint is live."}`.
- Submit a test registration from the form. Check the Sheet for a new row in `Bookings`
  and matching rows in `Members`, plus a link in the **Payment Proof** column.

## Room availability (prevents overbooking)

The script tracks how many **Regular Twin Rooms** and **Two-Room Suites** are left so two
people can't book the last room at once:

- On the first submission a **`Settings`** tab is created with the totals
  (defaults: 8 twin rooms, 8 suites — from the PD Methodist Centre booking sheet).
  **Edit the `Value` cells** there if your booked quantity changes.
- Availability = total − rows in `Bookings` that chose that room type. The check runs inside a
  lock at submit time, so the room can't be oversold even with simultaneous submissions.
- The form calls the same URL (GET) to show "X of Y left" and to disable a fully-booked option.
- Dormitory is treated as unlimited (not tracked).

## Updating the code later

If you change `Code.gs`, click **Deploy ▸ Manage deployments ▸** (edit ✏) **▸ Version: New version ▸ Deploy**.
The Web app URL stays the same, so you don't need to touch the frontend.

> After pasting this updated `Code.gs`, redeploy a **New version** for the room-tracking to take effect.

## Confirmation emails

On each booking the script emails the registrant a confirmation (booking reference, who's
registered, accommodation, price breakdown, payment note) using `MailApp` — **free, no API key**.

- The email is sent **from the Google account that owns the script**.
- The first time the script sends mail you'll be asked to **re-authorize** (it now needs the
  "send email as you" permission). Run `doGet` once more from the editor and approve, or just
  approve when prompted during deployment.
- Free Gmail accounts can send ~**100 emails/day** (Google Workspace ~1,500). That's plenty for
  this camp. If an email ever fails, the booking is still saved — it just logs the error.
- Edit the email's event/bank/contact text in the `CAMP` and `BANK_DETAILS` blocks near the top of
  `Code.gs` (keep them in sync with the frontend `campConfig.ts`).

## Notes

- Payment-proof files are saved to a Drive folder named **"Camp 2026 — Payment Proofs"**
  (auto-created) and shared as *anyone with the link can view*, so the link in the Sheet works
  for your team. Move/restrict the folder if you prefer tighter access.
- Booking IDs are sequential per year, e.g. `C26-0001`.
