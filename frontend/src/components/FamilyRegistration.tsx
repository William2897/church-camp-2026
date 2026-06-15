import React, { useState } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { Plus, Trash2, Users, Info } from 'lucide-react';
import { FormData, FamilyMember } from '../utils/types';
import { Category, CATEGORY_LABELS, CATEGORY_RATES, MIN_FAMILY_PAX } from '../utils/campConfig';
import { calculateAge, getCategoriesByAge, getFamilyDiscountTier, needsLodging } from '../utils/pricing';

interface Props {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onNext: () => void;
  onBack: () => void;
}

const emptyMember = (): FamilyMember => ({
  fullName: '',
  dateOfBirth: '',
  gender: '',
  category: 'working_adult',
  phone: '',
  foodAllergies: false,
  allergiesDetails: '',
  healthIssues: false,
  healthDetails: '',
});

const validatePhone = (phone: string): boolean =>
  phone.replace(/[\s\-()]/g, '').length >= 9;

const isChildCategory = (category: Category): boolean =>
  category === 'child_3_12' || category === 'child_under_3';

const FamilyRegistration = ({ formData, setFormData, onNext, onBack }: Props) => {
  const [memberErrors, setMemberErrors] = useState<Record<number, string[]>>({});
  const maxDate = new Date().toISOString().split('T')[0];
  const totalPax = 1 + formData.familyDetails.length;
  const tier = getFamilyDiscountTier(totalPax);

  const setMembers = (familyDetails: FamilyMember[]) =>
    setFormData((prev) => ({ ...prev, familyDetails }));

  const addMember = () => setMembers([...formData.familyDetails, emptyMember()]);

  const removeMember = (index: number) => {
    setMembers(formData.familyDetails.filter((_, i) => i !== index));
    setMemberErrors((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const updateMember = (index: number, patch: Partial<FamilyMember>) =>
    setMembers(
      formData.familyDetails.map((m, i) => {
        if (i !== index) return m;
        const updated = { ...m, ...patch };
        if (patch.dateOfBirth !== undefined) {
          const valid = getCategoriesByAge(patch.dateOfBirth);
          if (valid.length && !valid.includes(updated.category)) updated.category = valid[0];
        }
        return updated;
      })
    );

  const clearError = (index: number, field: string) =>
    setMemberErrors((prev) => ({
      ...prev,
      [index]: (prev[index] ?? []).filter((f) => f !== field),
    }));

  const hasError = (index: number, field: string) =>
    memberErrors[index]?.includes(field) ?? false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.hasFamily) {
      onNext();
      return;
    }

    if (formData.familyDetails.length < MIN_FAMILY_PAX - 1) {
      alert(
        `A family booking needs at least ${MIN_FAMILY_PAX} people in total. Please add ${
          MIN_FAMILY_PAX - 1 - formData.familyDetails.length
        } more member(s), or uncheck the family option.`
      );
      return;
    }

    const newErrors: Record<number, string[]> = {};
    formData.familyDetails.forEach((m, i) => {
      const errs: string[] = [];
      if (!m.fullName) errs.push('fullName');
      if (!m.dateOfBirth) errs.push('dateOfBirth');
      if (!m.gender) errs.push('gender');
      if (!isChildCategory(m.category) && needsLodging(m.category) && !validatePhone(m.phone))
        errs.push('phone');
      if (errs.length) newErrors[i] = errs;
    });

    if (Object.keys(newErrors).length > 0) {
      setMemberErrors(newErrors);
      const firstIdx = Math.min(...Object.keys(newErrors).map(Number));
      document
        .getElementById(`member-card-${firstIdx}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setMemberErrors({});
    onNext();
  };

  return (
    <div className="animate-fade-in">
      <h2 className="section-title">Family registration</h2>
      <p className="section-subtitle">
        Registering your immediate family together unlocks the family-package discount.
      </p>

      <div className="bg-sunrise-50 dark:bg-slate-700/40 border-l-4 border-sunrise-500 p-4 rounded-md mb-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-sunrise-600 dark:text-sunrise-400 mt-0.5 shrink-0" />
          <div className="text-sm text-slate-700 dark:text-slate-200">
            <p className="font-medium mb-1">Family-package discount (on registration fees):</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>3 people → 10% off</li>
              <li>4 people → 15% off</li>
              <li>5 or more → 20% off</li>
            </ul>
            <p className="mt-2 text-xs">
              Immediate family only (parents &amp; their children). Other relatives register
              separately.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.hasFamily}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                hasFamily: e.target.checked,
                familyDetails: e.target.checked
                  ? prev.familyDetails.length
                    ? prev.familyDetails
                    : [emptyMember(), emptyMember()]
                  : [],
              }))
            }
            className="h-4 w-4 text-sunrise-600 focus:ring-sunrise-500 rounded"
          />
          <span className="form-label mb-0">I want to register family members with me</span>
        </label>

        {formData.hasFamily && (
          <>
            <div className="flex items-center gap-2 text-sm bg-slate-100 dark:bg-slate-800/60 rounded-lg px-4 py-2">
              <Users className="w-4 h-4 text-sunrise-500" />
              <span className="text-slate-700 dark:text-slate-200">
                {totalPax} people in this booking
                {tier ? (
                  <strong className="text-sunrise-600 dark:text-sunrise-400">
                    {' '}
                    — {tier.label} applied
                  </strong>
                ) : (
                  <span className="text-slate-500">
                    {' '}
                    — add {MIN_FAMILY_PAX - totalPax} more to unlock a discount
                  </span>
                )}
              </span>
            </div>

            {formData.familyDetails.map((member, index) => {
              const categories = getCategoriesByAge(member.dateOfBirth);
              const isChild = isChildCategory(member.category);
              const age = member.dateOfBirth ? calculateAge(member.dateOfBirth) : null;
              const anyError = (memberErrors[index]?.length ?? 0) > 0;

              return (
                <div
                  id={`member-card-${index}`}
                  key={index}
                  className={`relative bg-slate-50 dark:bg-slate-800/60 border rounded-xl p-5 animate-slide-up ${
                    anyError
                      ? 'border-red-400 dark:border-red-500'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => removeMember(index)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition"
                    aria-label="Remove member"
                  >
                    <Trash2 size={18} />
                  </button>

                  <h3 className="font-semibold text-slate-800 dark:text-white mb-1">
                    Family member {index + 1}
                  </h3>
                  {anyError && (
                    <p className="text-xs text-red-500 mb-3">
                      Please fill in all highlighted fields below.
                    </p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="form-label">Full Name *</label>
                      <input
                        type="text"
                        value={member.fullName}
                        onChange={(e) => {
                          updateMember(index, { fullName: e.target.value });
                          if (e.target.value) clearError(index, 'fullName');
                        }}
                        className={`input-field ${hasError(index, 'fullName') ? 'border-red-500 focus:ring-red-400' : ''}`}
                        placeholder="Full name"
                      />
                    </div>
                    <div>
                      <label className="form-label">Date of Birth *</label>
                      <input
                        type="date"
                        max={maxDate}
                        value={member.dateOfBirth}
                        onChange={(e) => {
                          updateMember(index, { dateOfBirth: e.target.value });
                          if (e.target.value) clearError(index, 'dateOfBirth');
                        }}
                        className={`input-field ${hasError(index, 'dateOfBirth') ? 'border-red-500 focus:ring-red-400' : ''}`}
                      />
                    </div>
                    <div>
                      <label className="form-label">Gender *</label>
                      <div
                        className={`flex gap-4 mt-2.5 ${
                          hasError(index, 'gender')
                            ? 'border border-red-500 rounded-lg p-2'
                            : ''
                        }`}
                      >
                        {(['male', 'female'] as const).map((g) => (
                          <label
                            key={g}
                            className="flex items-center gap-1.5 capitalize text-sm dark:text-slate-200"
                          >
                            <input
                              type="radio"
                              checked={member.gender === g}
                              onChange={() => {
                                updateMember(index, { gender: g });
                                clearError(index, 'gender');
                              }}
                              className="text-sunrise-600 focus:ring-sunrise-500"
                            />
                            {g}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="form-label">Category *</label>
                      <select
                        disabled={!member.dateOfBirth}
                        value={member.category}
                        onChange={(e) =>
                          updateMember(index, { category: e.target.value as Category })
                        }
                        className="input-field"
                      >
                        {categories.length > 0 ? (
                          categories.map((c) => (
                            <option key={c} value={c}>
                              {CATEGORY_LABELS[c]} — RM {CATEGORY_RATES[c]}
                            </option>
                          ))
                        ) : (
                          <option value="">— enter date of birth first —</option>
                        )}
                      </select>
                      {age !== null ? (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Age: {age} years
                        </p>
                      ) : (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Enter date of birth to auto-fill category.
                        </p>
                      )}
                    </div>

                    {!isChild && (
                      <div>
                        <label className="form-label">Phone Number *</label>
                        <PhoneInput
                          country="my"
                          value={member.phone}
                          onChange={(phone) => {
                            updateMember(index, { phone });
                            if (validatePhone(phone)) clearError(index, 'phone');
                          }}
                          containerClass={`phone-input-container${hasError(index, 'phone') ? ' phone-error' : ''}`}
                          enableSearch
                          countryCodeEditable={false}
                        />
                        {hasError(index, 'phone') && (
                          <p className="text-red-500 text-xs mt-1">
                            Please enter a valid phone number.
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={member.foodAllergies}
                        onChange={(e) =>
                          updateMember(index, {
                            foodAllergies: e.target.checked,
                            allergiesDetails: e.target.checked ? member.allergiesDetails : '',
                          })
                        }
                        className="h-4 w-4 text-sunrise-600 focus:ring-sunrise-500 rounded"
                      />
                      <span className="text-sm dark:text-slate-200">Food allergies</span>
                    </label>
                    {member.foodAllergies && (
                      <textarea
                        value={member.allergiesDetails}
                        onChange={(e) =>
                          updateMember(index, { allergiesDetails: e.target.value })
                        }
                        className="input-field"
                        rows={2}
                        placeholder="List allergies"
                        required
                      />
                    )}
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={member.healthIssues}
                        onChange={(e) =>
                          updateMember(index, {
                            healthIssues: e.target.checked,
                            healthDetails: e.target.checked ? member.healthDetails : '',
                          })
                        }
                        className="h-4 w-4 text-sunrise-600 focus:ring-sunrise-500 rounded"
                      />
                      <span className="text-sm dark:text-slate-200">Health issues / concerns</span>
                    </label>
                    {member.healthIssues && (
                      <textarea
                        value={member.healthDetails}
                        onChange={(e) => updateMember(index, { healthDetails: e.target.value })}
                        className="input-field"
                        rows={2}
                        placeholder="Describe health concerns"
                        required
                      />
                    )}
                  </div>
                </div>
              );
            })}

            <button
              type="button"
              onClick={addMember}
              className="flex items-center gap-2 text-sunrise-600 hover:text-sunrise-700 dark:text-sunrise-400 font-medium"
            >
              <Plus size={18} /> Add family member
            </button>
          </>
        )}

        <div className="flex justify-between pt-2">
          <button type="button" onClick={onBack} className="btn-secondary">
            Back
          </button>
          <button type="submit" className="btn-primary">
            Next
          </button>
        </div>
      </form>
    </div>
  );
};

export default FamilyRegistration;
