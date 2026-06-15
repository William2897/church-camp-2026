/**
 * "From Doubt to Trust" — Church Camp 2026 registration backend.
 *
 * This Apps Script is bound to a Google Sheet (Extensions ▸ Apps Script).
 * It receives registration submissions from the React frontend, saves any
 * payment-proof file to Google Drive, and writes the data to two tabs:
 *   • "Bookings" — one row per submission (the treasurer's overview)
 *   • "Members" — one row per person (main registrant + each family member)
 *
 * See SETUP.md for deployment steps.
 */

var PROOF_FOLDER_NAME = 'Camp 2026 — Payment Proofs';

var CATEGORY_LABELS = {
  working_adult: 'Working Adult',
  ministry_housewife_student: 'Ministry / Homemaker / Student',
  child_3_12: 'Child (3-12)',
  child_under_3: 'Child (under 3)',
  seminar: 'Seminar Attendee',
};

var ACCOMMODATION_LABELS = {
  dorm: 'Dormitory (included)',
  twin_room: 'Regular Twin Room',
  two_room_suite: 'Two-Room Suite (upgrade)',
};

// Used in the confirmation email. Keep in sync with frontend campConfig.ts.
var CAMP = {
  theme: 'From Doubt to Trust',
  dates: '29 - 31 August 2026',
  venue: 'Port Dickson Methodist Center',
  fromName: 'DAHC Church Camp 2026',
  contacts: 'William 011-6093 7110 &middot; Kimberley 011-1988 7239',
};

// ⚠️ Placeholder — keep in sync with the real account in frontend campConfig.ts.
var BANK_DETAILS = {
  bank: 'CIMB Bank Berhad',
  accountName: 'SEVENTH-DAY ADVENTIST CORPORATION (MALAYSIA) BHD',
  accountNumber: 'XXXX XXXX XXXX',
  reference: 'Camp2026 + Your Name',
};

var BOOKINGS_HEADERS = [
  'Timestamp', 'Booking ID', 'Full Name', 'Email', 'Phone', 'Category',
  '# People', 'Accommodation', 'Extra Mattresses',
  'Registration Fees (RM)', 'Family Discount (RM)', 'Accommodation Add-ons (RM)',
  'Total (RM)', 'Payment Method', 'Payment Proof', 'Allergy / Health Notes',
];

var MEMBERS_HEADERS = [
  'Booking ID', 'Role', 'Full Name', 'Date of Birth', 'Age', 'Gender',
  'Category', 'Phone', 'Food Allergies', 'Health Notes',
];

/* ---------------------------------------------------------------- */

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000); // avoid two submissions writing at once

    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // Room-inventory guard (atomic — we're inside the script lock).
    var avail = getAvailability(ss);
    if (data.accommodation === 'twin_room' && avail.twinLeft <= 0) {
      return jsonOutput({
        ok: false,
        soldOut: 'twin_room',
        message: 'Sorry, all regular twin rooms have just been booked. Please choose another option.',
      });
    }
    if (data.accommodation === 'two_room_suite' && avail.suiteLeft <= 0) {
      return jsonOutput({
        ok: false,
        soldOut: 'two_room_suite',
        message: 'Sorry, all two-room suites have just been booked. Please choose another option.',
      });
    }

    var bookingId = generateBookingId(ss);
    var timestamp = new Date();

    var r = data.registrant || {};
    var family = data.familyDetails || [];
    var pricing = data.pricing || {};

    // 1) Save payment proof to Drive (if provided).
    var proofLink = '';
    if (data.proof && data.proof.data) {
      proofLink = saveProof(bookingId, data.proof);
    } else if (data.paymentMethod === 'deferred') {
      proofLink = 'Deferred — to follow up';
    }

    // 2) Bookings sheet — one summary row.
    var bookings = getOrCreateSheet(ss, 'Bookings', BOOKINGS_HEADERS);
    var paxCount = 1 + family.length;
    var guardianNote = '';
    if (data.guardian && r.category === 'child_3_12') {
      guardianNote = 'Guardian: ' + (data.guardian.name || '') +
        ' / ' + (data.guardian.email || '') +
        ' / ' + (data.guardian.phone || '');
    }
    var notes = collectNotes(r, family);
    if (guardianNote) notes = guardianNote + (notes ? ' | ' + notes : '');
    bookings.appendRow([
      timestamp,
      bookingId,
      r.fullName || '',
      r.email || '',
      r.phone || '',
      labelCategory(r.category),
      paxCount,
      ACCOMMODATION_LABELS[data.accommodation] || data.accommodation || '',
      data.extraMattresses || 0,
      num(pricing.registrationFees),
      num(pricing.familyDiscount),
      num(pricing.accommodationTotal),
      num(pricing.finalTotal),
      labelPayment(data.paymentMethod),
      proofLink,
      notes,
    ]);

    // 3) Members sheet — one row per person.
    var members = getOrCreateSheet(ss, 'Members', MEMBERS_HEADERS);
    members.appendRow(memberRow(bookingId, 'Main', r));
    for (var i = 0; i < family.length; i++) {
      members.appendRow(memberRow(bookingId, 'Family', family[i]));
    }

    // 4) Email the registrant their booking confirmation (best-effort).
    var emailSent = false;
    try {
      if (r.email) {
        sendConfirmationEmail(bookingId, data, proofLink);
        emailSent = true;
      }
    } catch (mailErr) {
      // The booking is already saved — don't fail it if the email can't be sent.
      Logger.log('Confirmation email failed: ' + mailErr);
    }

    return jsonOutput({ ok: true, bookingId: bookingId, emailSent: emailSent });
  } catch (err) {
    return jsonOutput({ ok: false, message: String(err && err.message ? err.message : err) });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Health-check + live room availability (the frontend calls this to show
 * "X rooms left" and to disable sold-out options).
 */
function doGet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return jsonOutput({
    ok: true,
    message: 'Camp 2026 registration endpoint is live.',
    availability: getAvailability(ss),
  });
}

/* ---------------------------------------------------------------- */
/* Helpers                                                           */
/* ---------------------------------------------------------------- */

function generateBookingId(ss) {
  var props = PropertiesService.getScriptProperties();
  var counter = Number(props.getProperty('bookingCounter') || '0') + 1;
  props.setProperty('bookingCounter', String(counter));
  var year = new Date().getFullYear();
  // e.g. C26-0001
  return 'C' + String(year).slice(-2) + '-' + padLeft(counter, 4);
}

function padLeft(n, width) {
  var s = String(n);
  while (s.length < width) s = '0' + s;
  return s;
}

function getOrCreateSheet(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function saveProof(bookingId, proof) {
  var folder = getOrCreateFolder(PROOF_FOLDER_NAME);
  var bytes = Utilities.base64Decode(proof.data);
  var blob = Utilities.newBlob(bytes, proof.mimeType || 'application/octet-stream', proof.filename || bookingId);
  var ext = (proof.filename && proof.filename.indexOf('.') >= 0)
    ? proof.filename.slice(proof.filename.lastIndexOf('.'))
    : '';
  blob.setName(bookingId + ext);
  var file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return file.getUrl();
}

function getOrCreateFolder(name) {
  var folders = DriveApp.getFoldersByName(name);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(name);
}

/* ---------------------------------------------------------------- */
/* Room inventory                                                    */
/* ---------------------------------------------------------------- */

var TWIN_SETTING = 'Regular Twin Rooms (total)';
var SUITE_SETTING = 'Two-Room Suites (total)';
var DEFAULT_TWIN_TOTAL = 8; // from the PD Methodist Centre booking sheet
var DEFAULT_SUITE_TOTAL = 8;

/** Reads room totals from an editable "Settings" sheet (created on first run). */
function getTotals(ss) {
  var sheet = ss.getSheetByName('Settings');
  if (!sheet) {
    sheet = ss.insertSheet('Settings');
    sheet.appendRow(['Setting', 'Value']);
    sheet.appendRow([TWIN_SETTING, DEFAULT_TWIN_TOTAL]);
    sheet.appendRow([SUITE_SETTING, DEFAULT_SUITE_TOTAL]);
    sheet.getRange(1, 1, 1, 2).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  var map = {};
  if (sheet.getLastRow() > 1) {
    var vals = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues();
    for (var i = 0; i < vals.length; i++) map[vals[i][0]] = Number(vals[i][1]);
  }
  return {
    twin: map[TWIN_SETTING] || 0,
    suite: map[SUITE_SETTING] || 0,
  };
}

/** Counts rooms already booked (from the Bookings sheet) and returns what's left. */
function getAvailability(ss) {
  var totals = getTotals(ss);
  var twinBooked = 0;
  var suiteBooked = 0;
  var bookings = ss.getSheetByName('Bookings');
  if (bookings && bookings.getLastRow() > 1) {
    var col = BOOKINGS_HEADERS.indexOf('Accommodation') + 1;
    var vals = bookings.getRange(2, col, bookings.getLastRow() - 1, 1).getValues();
    for (var i = 0; i < vals.length; i++) {
      if (vals[i][0] === ACCOMMODATION_LABELS.twin_room) twinBooked++;
      else if (vals[i][0] === ACCOMMODATION_LABELS.two_room_suite) suiteBooked++;
    }
  }
  return {
    twinTotal: totals.twin,
    twinBooked: twinBooked,
    twinLeft: Math.max(0, totals.twin - twinBooked),
    suiteTotal: totals.suite,
    suiteBooked: suiteBooked,
    suiteLeft: Math.max(0, totals.suite - suiteBooked),
  };
}

/* ---------------------------------------------------------------- */
/* Confirmation email                                                */
/* ---------------------------------------------------------------- */

function sendConfirmationEmail(bookingId, data, proofLink) {
  var r = data.registrant || {};
  MailApp.sendEmail({
    to: r.email,
    subject: 'Registration received — ' + CAMP.theme + ' (' + bookingId + ')',
    htmlBody: buildEmailHtml(bookingId, data, proofLink),
    name: CAMP.fromName,
  });
}

function buildEmailHtml(bookingId, data, proofLink) {
  var r = data.registrant || {};
  var family = data.familyDetails || [];
  var pricing = data.pricing || {};

  var people = personLine(r.fullName, r.category);
  for (var i = 0; i < family.length; i++) people += personLine(family[i].fullName, family[i].category);

  var accom = ACCOMMODATION_LABELS[data.accommodation] || data.accommodation || '';
  if (data.accommodation === 'twin_room' && data.extraMattresses > 0) {
    accom += ' (+ ' + data.extraMattresses + ' extra mattress' + (data.extraMattresses > 1 ? 'es' : '') + ')';
  }

  var priceRows = priceRow('Registration fees', money(pricing.registrationFees));
  if (pricing.familyDiscount > 0) priceRows += priceRow('Family discount', '- ' + money(pricing.familyDiscount));
  if (pricing.accommodationTotal > 0) priceRows += priceRow('Accommodation add-ons', money(pricing.accommodationTotal));
  priceRows +=
    '<tr><td style="padding:6px 0;font-weight:bold;border-top:1px solid #e2e8f0;">Total</td>' +
    '<td style="padding:6px 0;font-weight:bold;text-align:right;border-top:1px solid #e2e8f0;color:#d97706;">' +
    money(pricing.finalTotal) + '</td></tr>';

  var paymentNote = '';
  if (data.paymentMethod === 'bank') {
    var received = (proofLink && proofLink.indexOf('http') === 0)
      ? 'We have received your payment proof.'
      : 'Please complete your bank transfer and submit your payment proof.';
    paymentNote =
      '<p style="margin:0 0 6px;"><strong>Payment:</strong> Bank transfer. ' + received + '</p>' +
      '<p style="margin:0;color:#64748b;font-size:13px;">' + BANK_DETAILS.bank + ' &middot; ' +
      BANK_DETAILS.accountName + ' &middot; ' + BANK_DETAILS.accountNumber +
      ' &middot; Ref: ' + BANK_DETAILS.reference + '</p>';
  } else if (data.paymentMethod === 'deferred') {
    paymentNote = '<p style="margin:0;"><strong>Payment:</strong> Pay later — our team will contact you to arrange payment.</p>';
  }

  return '' +
    '<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#1e293b;">' +
      '<div style="background:linear-gradient(90deg,#334155,#d97706);padding:24px;border-radius:12px 12px 0 0;text-align:center;">' +
        '<div style="color:#fde68a;font-size:11px;letter-spacing:3px;">CHURCH CAMP 2026</div>' +
        '<div style="color:#ffffff;font-size:26px;font-weight:bold;">From Doubt to Trust</div>' +
      '</div>' +
      '<div style="border:1px solid #e2e8f0;border-top:0;border-radius:0 0 12px 12px;padding:24px;">' +
        '<p>Hi ' + escapeHtml(r.fullName || 'there') + ',</p>' +
        '<p>Thank you for registering for <strong>' + CAMP.theme + '</strong>! We have received your booking. Here are your details:</p>' +
        '<p style="background:#fff7ed;border-radius:8px;padding:10px 14px;font-size:15px;"><strong>Booking reference:</strong> ' +
          '<span style="color:#d97706;font-family:monospace;">' + bookingId + '</span></p>' +
        '<table style="width:100%;font-size:14px;margin:12px 0;">' +
          '<tr><td style="color:#64748b;width:90px;">Dates</td><td>' + CAMP.dates + '</td></tr>' +
          '<tr><td style="color:#64748b;">Venue</td><td>' + CAMP.venue + '</td></tr></table>' +
        (data.guardian && r.category === 'child_3_12'
          ? '<p style="background:#eff6ff;border-radius:8px;padding:10px 14px;font-size:13px;margin:12px 0;">' +
            '<strong>Guardian:</strong> ' + escapeHtml(data.guardian.name || '') +
            ' &middot; ' + escapeHtml(data.guardian.email || '') +
            ' &middot; ' + escapeHtml(data.guardian.phone || '') + '</p>'
          : '') +
        '<h3 style="font-size:15px;margin:18px 0 6px;">Who\'s registered</h3>' +
        '<ul style="margin:0;padding-left:18px;font-size:14px;">' + people + '</ul>' +
        '<h3 style="font-size:15px;margin:18px 0 6px;">Accommodation</h3>' +
        '<p style="margin:0;font-size:14px;">' + escapeHtml(accom) + '</p>' +
        '<h3 style="font-size:15px;margin:18px 0 6px;">Price</h3>' +
        '<table style="width:100%;font-size:14px;">' + priceRows + '</table>' +
        '<div style="margin:18px 0;font-size:14px;">' + paymentNote + '</div>' +
        '<p style="font-size:13px;color:#64748b;border-top:1px solid #e2e8f0;padding-top:14px;">Questions? Contact ' + CAMP.contacts + '.</p>' +
        '<p style="font-size:13px;color:#64748b;">See you at camp!<br/>' + CAMP.fromName + '</p>' +
      '</div>' +
    '</div>';
}

function personLine(name, category) {
  return '<li style="margin:2px 0;">' + escapeHtml(name || '') +
    ' &mdash; <span style="color:#64748b;">' + (CATEGORY_LABELS[category] || category || '') + '</span></li>';
}

function priceRow(label, value) {
  return '<tr><td style="padding:4px 0;">' + label + '</td>' +
    '<td style="padding:4px 0;text-align:right;">' + value + '</td></tr>';
}

function money(v) {
  return 'RM ' + (Number(v) || 0).toFixed(2);
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function memberRow(bookingId, role, p) {
  return [
    bookingId,
    role,
    p.fullName || '',
    p.dateOfBirth || '',
    ageFromDob(p.dateOfBirth),
    p.gender || '',
    labelCategory(p.category),
    p.phone || '',
    p.foodAllergies ? (p.allergiesDetails || 'Yes') : '',
    p.healthIssues ? (p.healthDetails || 'Yes') : '',
  ];
}

function collectNotes(r, family) {
  var notes = [];
  function add(label, p) {
    if (p.foodAllergies && p.allergiesDetails) notes.push(label + ' allergy: ' + p.allergiesDetails);
    if (p.healthIssues && p.healthDetails) notes.push(label + ' health: ' + p.healthDetails);
  }
  add(r.fullName || 'Main', r);
  for (var i = 0; i < family.length; i++) add(family[i].fullName || ('Family ' + (i + 1)), family[i]);
  return notes.join(' | ');
}

function ageFromDob(dob) {
  if (!dob) return '';
  var birth = new Date(dob);
  if (isNaN(birth.getTime())) return '';
  var today = new Date();
  var age = today.getFullYear() - birth.getFullYear();
  var m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function labelCategory(c) { return CATEGORY_LABELS[c] || c || ''; }
function labelPayment(m) { return m === 'bank' ? 'Bank Transfer' : m === 'deferred' ? 'Deferred' : (m || ''); }
function num(v) { return typeof v === 'number' ? v : Number(v || 0); }

function jsonOutput(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
