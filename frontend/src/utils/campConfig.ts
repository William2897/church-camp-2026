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

/** Payment is made via Adventist Giving — no bank transfer. */
export const ADVENTIST_GIVING = {
  url: 'https://adventistgiving.org.my/donate',
  church: 'Damansara Adventist Hope Centre',
  fund: 'Church Camp',
  receiptContact: { name: 'Karshni', phone: '011-5411 7197' },
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

/** Extra mattress in a twin room or suite: RM30 flat for the whole camp, max 2 per room. */
export const MATTRESS_TOTAL = 30;
export const MAX_MATTRESSES = 2;

/** Two-room suite upgrade: RM100 flat for the whole camp (confirmed). */
export const SUITE_UPGRADE_TOTAL = 100;
export const SUITE_PRICE_CONFIRMED = true;

export type AccommodationType = 'dorm' | 'twin_room' | 'two_room_suite';
