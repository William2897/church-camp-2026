/**
 * Central configuration for the "From Doubt to Trust" church camp.
 * Edit values here — the whole app reads from this file.
 */

export const CAMP = {
  theme: 'From Doubt to Trust',
  name: 'Church Camp 2026',
  dates: '29 – 31 August 2026',
  nights: 2, // nights of 29 Aug & 30 Aug
  venue: 'Port Dickson Methodist Center',
  speaker: 'Elder Theo',
  socials: {
    facebook: 'DAHCSDA',
    instagram: 'dahc.youth',
  },
  contacts: [
    { name: 'William', phone: '01160937110', display: '011-6093 7110' },
    { name: 'Karshni', phone: '01154117197', display: '011-5411 7197' },
  ],
};

/**
 * ⚠️ PLACEHOLDER bank details — replace with the real church camp account
 * before going live (see README, step 3).
 */
export const BANK_DETAILS = {
  bank: 'CIMB Bank Berhad',
  accountName: 'SEVENTH-DAY ADVENTIST CORPORATION (MALAYSIA) BHD',
  accountNumber: 'XXXX XXXX XXXX',
  reference: 'Camp2026 + Your Name',
};

/* ------------------------------------------------------------------ */
/* Pricing                                                             */
/* ------------------------------------------------------------------ */

export type Category =
  | 'working_adult'
  | 'ministry_housewife_student'
  | 'child_3_12'
  | 'child_under_3'
  | 'seminar';

export const CATEGORY_RATES: Record<Category, number> = {
  working_adult: 220,
  ministry_housewife_student: 180,
  child_3_12: 130,
  child_under_3: 0,
  seminar: 110,
};

export const CATEGORY_LABELS: Record<Category, string> = {
  working_adult: 'Working Adult',
  ministry_housewife_student: 'Ministry Worker / Homemaker / Student',
  child_3_12: 'Child (3–12 years)',
  child_under_3: 'Child (under 3)',
  seminar: 'Seminar Attendee (food only, no lodging)',
};

/** Family-package discount tiers, applied to registration fees only. */
export const FAMILY_DISCOUNT_TIERS = [
  { minPax: 5, rate: 0.2, label: '20% off (5 or more)' },
  { minPax: 4, rate: 0.15, label: '15% off (4 people)' },
  { minPax: 3, rate: 0.1, label: '10% off (3 people)' },
];

export const MIN_FAMILY_PAX = 3;

/* ------------------------------------------------------------------ */
/* Accommodation add-ons                                              */
/* ------------------------------------------------------------------ */

/** Extra mattress in a regular twin room: RM50 per night, max 2 per room. */
export const MATTRESS_PER_NIGHT = 50;
export const MAX_MATTRESSES = 2;

/**
 * ⚠️ PLACEHOLDER — Kimberley has not confirmed the two-room-suite top-up yet.
 * Suggested figures to discuss with Kim:
 *   • RM100–150 / night per suite, OR
 *   • a flat RM250–350 for the whole camp.
 * Update this constant once confirmed (see README, step 4).
 */
export const SUITE_UPGRADE_PER_NIGHT = 150;
export const SUITE_PRICE_CONFIRMED = false;

export type AccommodationType = 'dorm' | 'twin_room' | 'two_room_suite';
