import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2, User } from 'lucide-react';
import { FormData, FamilyMember } from '../utils/types';
import {
  CATEGORY_LABELS,
  Category,
  AccommodationType,
} from '../utils/campConfig';
import { calculateAge } from '../utils/pricing';
import PriceSummary from './PriceSummary';

interface Props {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onNext: () => void;
  onBack: () => void;
}

type Person = {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  category: Category;
  foodAllergies: boolean;
  allergiesDetails: string;
  healthIssues: boolean;
  healthDetails: string;
};

const PersonCard = ({ person, isMain }: { person: Person; isMain?: boolean }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/40 rounded-lg"
      >
        <span className="flex items-center gap-2 text-left">
          <User className="w-4 h-4 text-sunrise-500" />
          <span className="font-medium">{person.fullName || '(no name)'}</span>
          {isMain && (
            <span className="text-xs bg-sunrise-100 dark:bg-sunrise-500/20 text-sunrise-700 dark:text-sunrise-300 px-2 py-0.5 rounded">
              Main
            </span>
          )}
        </span>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {open && (
        <div className="p-4 pt-0 grid grid-cols-2 gap-3 text-sm">
          <Field label="Category" value={CATEGORY_LABELS[person.category]} />
          <Field
            label="Age"
            value={person.dateOfBirth ? `${calculateAge(person.dateOfBirth)} yrs` : '—'}
          />
          <Field label="Gender" value={person.gender || '—'} />
          {person.foodAllergies && (
            <Field label="Allergies" value={person.allergiesDetails} span />
          )}
          {person.healthIssues && (
            <Field label="Health notes" value={person.healthDetails} span />
          )}
        </div>
      )}
    </div>
  );
};

const Field = ({ label, value, span }: { label: string; value: string; span?: boolean }) => (
  <div className={span ? 'col-span-2' : ''}>
    <p className="text-slate-500 dark:text-slate-400 text-xs">{label}</p>
    <p className="font-medium capitalize">{value}</p>
  </div>
);

const accommodationLabel: Record<AccommodationType, string> = {
  dorm: 'Dorm (included)',
  twin_room: 'Regular twin room',
  two_room_suite: 'Two-room suite (upgrade)',
};

const TERMS = [
  {
    title: 'Payment & confirmation',
    content:
      'Your spot is confirmed once payment (or a deferred-payment arrangement) is received and verified by the camp team.',
  },
  {
    title: 'Refunds',
    content:
      'Registration fees are non-refundable once paid. If you cannot attend, contact us about transferring your spot to someone else.',
  },
  {
    title: 'Family package',
    content:
      'The family discount applies to immediate family only (parents and their children). Other relatives should register separately.',
  },
  {
    title: 'Accommodation',
    content:
      'Room upgrades (extra mattress / two-room suite) are subject to availability and final confirmation by the camp team.',
  },
  {
    title: 'Dietary note',
    content:
      'All meals are vegetarian/vegan. We accommodate allergies where possible but cannot guarantee allergen-free food.',
  },
];

const ReviewTerms = ({ formData, setFormData, onNext, onBack }: Props) => {
  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.termsAccepted) onNext();
  };

  const toPerson = (m: FamilyMember | FormData): Person => ({
    fullName: m.fullName,
    dateOfBirth: m.dateOfBirth,
    gender: m.gender,
    category: m.category,
    foodAllergies: m.foodAllergies,
    allergiesDetails: m.allergiesDetails,
    healthIssues: m.healthIssues,
    healthDetails: m.healthDetails,
  });

  return (
    <div className="animate-fade-in">
      <h2 className="section-title">Review &amp; confirm</h2>
      <p className="section-subtitle">Please check everything before continuing to payment.</p>

      <div className="space-y-6">
        {/* People */}
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-white mb-2">
            Who's registering ({formData.hasFamily ? formData.familyDetails.length + 1 : 1})
          </h3>
          <div className="space-y-2">
            <PersonCard person={toPerson(formData)} isMain />
            {formData.hasFamily &&
              formData.familyDetails.map((m, i) => <PersonCard key={i} person={toPerson(m)} />)}
          </div>
        </div>

        {/* Guardian info (child 3–12 main registrant) */}
        {formData.category === 'child_3_12' && formData.guardianName && (
          <div className="text-sm bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg px-4 py-3">
            <p className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Guardian</p>
            <p className="text-slate-700 dark:text-slate-200">{formData.guardianName}</p>
            <p className="text-slate-500 dark:text-slate-400">{formData.guardianEmail} · {formData.guardianPhone}</p>
          </div>
        )}

        {/* Accommodation */}
        <div className="text-sm bg-slate-100 dark:bg-slate-800/60 rounded-lg px-4 py-3">
          <span className="text-slate-500 dark:text-slate-400">Accommodation: </span>
          <span className="font-medium">{accommodationLabel[formData.accommodation]}</span>
          {formData.accommodation === 'twin_room' && formData.extraMattresses > 0 && (
            <span> · {formData.extraMattresses} extra mattress(es)</span>
          )}
        </div>

        <PriceSummary formData={formData} />

        {/* Terms */}
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-white mb-3">Terms &amp; conditions</h3>
          <div className="space-y-2">
            {TERMS.map((t) => (
              <div
                key={t.title}
                className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-3 text-sm"
              >
                <p className="font-medium text-sunrise-700 dark:text-sunrise-400">{t.title}</p>
                <p className="text-slate-600 dark:text-slate-300">{t.content}</p>
              </div>
            ))}
          </div>
        </div>

        <label className="flex items-start gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-emerald-50 dark:bg-slate-700/30">
          <input
            type="checkbox"
            checked={formData.termsAccepted}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, termsAccepted: e.target.checked }))
            }
            className="h-4 w-4 mt-0.5 text-sunrise-600 focus:ring-sunrise-500 rounded"
          />
          <span className="text-sm text-slate-700 dark:text-slate-200">
            I confirm the information above is accurate and I agree to the terms &amp; conditions for DAHC Church Camp 2026.
          </span>
        </label>

        <div className="flex justify-between pt-2">
          <button type="button" onClick={onBack} className="btn-secondary">
            Back
          </button>
          <button
            type="button"
            onClick={handleContinue}
            disabled={!formData.termsAccepted}
            className="btn-primary inline-flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" /> Continue to payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewTerms;
