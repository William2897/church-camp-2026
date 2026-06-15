import React, { useState } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { FormData } from '../utils/types';
import { Category, CATEGORY_LABELS, CATEGORY_RATES } from '../utils/campConfig';
import { calculateAge, getCategoriesByAge } from '../utils/pricing';

interface Props {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onNext: () => void;
  onBack: () => void;
}

const validatePhone = (phone: string): boolean =>
  phone.replace(/[\s\-()]/g, '').length >= 9;

const validateEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const ParticipantInfo = ({ formData, setFormData, onNext, onBack }: Props) => {
  const [phoneError, setPhoneError] = useState('');
  const [showGuardianModal, setShowGuardianModal] = useState(false);
  const [localGuardian, setLocalGuardian] = useState({
    name: formData.guardianName,
    email: formData.guardianEmail,
    phone: formData.guardianPhone,
  });
  const [guardianErrors, setGuardianErrors] = useState<string[]>([]);

  const availableCategories = getCategoriesByAge(formData.dateOfBirth);
  const age = formData.dateOfBirth ? calculateAge(formData.dateOfBirth) : null;
  const maxDate = new Date().toISOString().split('T')[0];
  const isUnder3 = age !== null && age < 3;
  const isChild312 = formData.category === 'child_3_12';
  const guardianFilled =
    !!formData.guardianName && !!formData.guardianEmail && !!formData.guardianPhone;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateOfBirth = e.target.value;
    setFormData((prev) => {
      const valid = getCategoriesByAge(dateOfBirth);
      const category = valid.includes(prev.category) ? prev.category : valid[0] ?? prev.category;
      return { ...prev, dateOfBirth, category };
    });
  };

  const openGuardianModal = () => {
    setLocalGuardian({
      name: formData.guardianName,
      email: formData.guardianEmail,
      phone: formData.guardianPhone,
    });
    setGuardianErrors([]);
    setShowGuardianModal(true);
  };

  const saveGuardian = () => {
    const errs: string[] = [];
    if (!localGuardian.name.trim()) errs.push('name');
    if (!validateEmail(localGuardian.email)) errs.push('email');
    if (!validatePhone(localGuardian.phone)) errs.push('phone');
    if (errs.length) {
      setGuardianErrors(errs);
      return;
    }
    setFormData((prev) => ({
      ...prev,
      guardianName: localGuardian.name.trim(),
      guardianEmail: localGuardian.email.trim(),
      guardianPhone: localGuardian.phone,
    }));
    setShowGuardianModal(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isUnder3) return;

    if (!validatePhone(formData.phone)) {
      setPhoneError('Please enter a valid phone number.');
      return;
    }
    setPhoneError('');

    if (isChild312 && !guardianFilled) {
      openGuardianModal();
      return;
    }

    onNext();
  };

  const hasError = (field: string) => guardianErrors.includes(field);

  return (
    <div className="animate-fade-in">
      <h2 className="section-title">Your details</h2>
      <p className="section-subtitle">Tell us a bit about yourself (the main registrant).</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="email" className="form-label">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="input-field"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="fullName" className="form-label">Full Name *</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleChange}
              className="input-field"
              placeholder="As per IC / passport"
            />
          </div>

          <div>
            <label htmlFor="dateOfBirth" className="form-label">Date of Birth *</label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              required
              max={maxDate}
              value={formData.dateOfBirth}
              onChange={handleDobChange}
              className="input-field"
            />
          </div>

          <div>
            <label className="form-label">Gender *</label>
            <div className="flex gap-6 mt-2.5">
              {(['male', 'female'] as const).map((g) => (
                <label key={g} className="flex items-center gap-2 capitalize">
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    required
                    checked={formData.gender === g}
                    onChange={handleChange}
                    className="text-sunrise-600 focus:ring-sunrise-500"
                  />
                  <span>{g}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="form-label">Phone Number *</label>
            <PhoneInput
              country="my"
              value={formData.phone}
              onChange={(phone) => {
                setFormData((prev) => ({ ...prev, phone }));
                setPhoneError('');
              }}
              containerClass="phone-input-container"
              enableSearch
              countryCodeEditable={false}
              inputProps={{ id: 'phone', name: 'phone', required: true }}
            />
            {phoneError && <p className="text-red-500 text-sm mt-1">{phoneError}</p>}
          </div>

          <div>
            <label htmlFor="category" className="form-label">Registration Category *</label>
            <select
              id="category"
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="input-field"
              disabled={!formData.dateOfBirth}
            >
              {availableCategories.map((c: Category) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]} — RM {CATEGORY_RATES[c]}
                </option>
              ))}
            </select>
            {!formData.dateOfBirth && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter your date of birth to see available categories.
              </p>
            )}
            {age !== null && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Age: {age} years</p>
            )}
          </div>
        </div>

        {/* Under-3 blocking notice */}
        {isUnder3 && (
          <div className="p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-lg flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800 dark:text-amber-200">
              <p className="font-semibold mb-1">Children under 3 do not register individually.</p>
              <p>
                If you are a parent or guardian bringing a child under 3, please register yourself
                first and add the child as a family member.
              </p>
            </div>
          </div>
        )}

        {/* Child 3–12: guardian info notice */}
        {isChild312 && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200 flex-1">
              <p className="font-semibold mb-1">Guardian information required</p>
              <p className="mb-3">Registrants aged 3–12 must provide a parent or guardian's contact details.</p>
              {guardianFilled ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
                  <span className="text-green-700 dark:text-green-300 font-medium">
                    {formData.guardianName} · {formData.guardianEmail}
                  </span>
                  <button
                    type="button"
                    onClick={openGuardianModal}
                    className="ml-1 text-blue-600 dark:text-blue-400 underline text-xs"
                  >
                    Edit
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={openGuardianModal}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition"
                >
                  Enter Guardian Details
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-between pt-2">
          <button type="button" onClick={onBack} className="btn-secondary">
            Back
          </button>
          <button type="submit" disabled={isUnder3} className="btn-primary">
            Next
          </button>
        </div>
      </form>

      {/* Guardian modal */}
      {showGuardianModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Guardian Details</h3>
              <button
                type="button"
                onClick={() => setShowGuardianModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-5">
              Provide the contact details of this child's parent or guardian.
            </p>

            <div className="space-y-4">
              <div>
                <label className="form-label">Guardian Full Name *</label>
                <input
                  type="text"
                  value={localGuardian.name}
                  onChange={(e) => setLocalGuardian((g) => ({ ...g, name: e.target.value }))}
                  className={`input-field ${hasError('name') ? 'border-red-500 focus:ring-red-400' : ''}`}
                  placeholder="Parent / guardian name"
                />
                {hasError('name') && (
                  <p className="text-red-500 text-xs mt-1">Please enter the guardian's name.</p>
                )}
              </div>

              <div>
                <label className="form-label">Guardian Email *</label>
                <input
                  type="email"
                  value={localGuardian.email}
                  onChange={(e) => setLocalGuardian((g) => ({ ...g, email: e.target.value }))}
                  className={`input-field ${hasError('email') ? 'border-red-500 focus:ring-red-400' : ''}`}
                  placeholder="guardian@email.com"
                />
                {hasError('email') && (
                  <p className="text-red-500 text-xs mt-1">Please enter a valid email address.</p>
                )}
              </div>

              <div>
                <label className="form-label">Guardian Contact Number *</label>
                <PhoneInput
                  country="my"
                  value={localGuardian.phone}
                  onChange={(phone) => setLocalGuardian((g) => ({ ...g, phone }))}
                  containerClass={`phone-input-container${hasError('phone') ? ' phone-error' : ''}`}
                  enableSearch
                  countryCodeEditable={false}
                />
                {hasError('phone') && (
                  <p className="text-red-500 text-xs mt-1">Please enter a valid phone number.</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowGuardianModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button type="button" onClick={saveGuardian} className="btn-primary flex-1">
                Save & Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParticipantInfo;
