import { Category, AccommodationType } from './campConfig';

export type Gender = 'male' | 'female' | '';

/** A family member added to the main registrant's booking. */
export interface FamilyMember {
  fullName: string;
  dateOfBirth: string;
  gender: Gender;
  category: Category;
  phone: string;
  foodAllergies: boolean;
  allergiesDetails: string;
  healthIssues: boolean;
  healthDetails: string;
}

/** The complete registration form state for one booking. */
export interface FormData {
  step: number;

  // Main registrant
  email: string;
  fullName: string;
  dateOfBirth: string;
  gender: Gender;
  phone: string;
  category: Category;

  // Guardian info (required when main registrant is child_3_12)
  guardianName: string;
  guardianEmail: string;
  guardianPhone: string;

  // Main registrant — health & food
  foodAllergies: boolean;
  allergiesDetails: string;
  healthIssues: boolean;
  healthDetails: string;

  // Family
  hasFamily: boolean;
  familyDetails: FamilyMember[];

  // Accommodation (applies to the whole booking)
  accommodation: AccommodationType;
  extraMattresses: number;

  // Payment
  paymentMethod: '' | 'adventist_giving' | 'deferred';
  paymentProof: File | null;
  termsAccepted: boolean;
}
