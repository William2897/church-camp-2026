import {
  CAMP,
  CATEGORY_RATES,
  Category,
  FAMILY_DISCOUNT_TIERS,
  MATTRESS_PER_NIGHT,
  SUITE_UPGRADE_PER_NIGHT,
} from './campConfig';
import { FormData } from './types';

/* ------------------------------------------------------------------ */
/* Age / category helpers                                             */
/* ------------------------------------------------------------------ */

export const calculateAge = (dateOfBirth: string): number => {
  if (!dateOfBirth) return NaN;
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

/** Categories selectable for a given date of birth. */
export const getCategoriesByAge = (dateOfBirth: string): Category[] => {
  const age = calculateAge(dateOfBirth);
  if (Number.isNaN(age)) return [];
  if (age < 3) return ['child_under_3'];
  if (age <= 12) return ['child_3_12'];
  return ['working_adult', 'ministry_housewife_student', 'seminar'];
};

export const isCategoryValidForAge = (
  dateOfBirth: string,
  category: Category
): boolean => getCategoriesByAge(dateOfBirth).includes(category);

/** A person needs lodging unless they are a seminar-only attendee. */
export const needsLodging = (category: Category): boolean => category !== 'seminar';

export const bookingNeedsLodging = (formData: FormData): boolean => {
  if (needsLodging(formData.category)) return true;
  return formData.hasFamily && formData.familyDetails.some((m) => needsLodging(m.category));
};

/* ------------------------------------------------------------------ */
/* Price calculation                                                  */
/* ------------------------------------------------------------------ */

export interface PriceBreakdown {
  registrationFees: number; // sum of all category base rates
  paxCount: number;
  familyDiscountRate: number;
  familyDiscountLabel: string;
  familyDiscount: number;
  mattressTotal: number;
  suiteTotal: number;
  accommodationTotal: number;
  finalTotal: number;
}

export const getFamilyDiscountTier = (paxCount: number) =>
  FAMILY_DISCOUNT_TIERS.find((tier) => paxCount >= tier.minPax);

export const calculateTotalPrice = (formData: FormData): PriceBreakdown => {
  const everyone: Category[] = [
    formData.category,
    ...(formData.hasFamily ? formData.familyDetails.map((m) => m.category) : []),
  ];

  const registrationFees = everyone.reduce(
    (sum, category) => sum + (CATEGORY_RATES[category] ?? 0),
    0
  );

  const paxCount = everyone.length;

  // Family discount applies only when registering as a family, on fees only.
  const tier = formData.hasFamily ? getFamilyDiscountTier(paxCount) : undefined;
  const familyDiscountRate = tier?.rate ?? 0;
  const familyDiscount = Math.round(registrationFees * familyDiscountRate);

  // Accommodation add-ons (only relevant if the booking needs lodging).
  const lodging = bookingNeedsLodging(formData);
  const mattressTotal =
    lodging && formData.accommodation === 'twin_room'
      ? formData.extraMattresses * MATTRESS_PER_NIGHT * CAMP.nights
      : 0;
  const suiteTotal =
    lodging && formData.accommodation === 'two_room_suite'
      ? SUITE_UPGRADE_PER_NIGHT * CAMP.nights
      : 0;
  const accommodationTotal = mattressTotal + suiteTotal;

  const finalTotal = registrationFees - familyDiscount + accommodationTotal;

  return {
    registrationFees,
    paxCount,
    familyDiscountRate,
    familyDiscountLabel: tier?.label ?? '',
    familyDiscount,
    mattressTotal,
    suiteTotal,
    accommodationTotal,
    finalTotal,
  };
};
