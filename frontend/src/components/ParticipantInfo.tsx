import React, { useState } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
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

const ParticipantInfo = ({ formData, setFormData, onNext, onBack }: Props) => {
  const [phoneError, setPhoneError] = useState('');

  const availableCategories = getCategoriesByAge(formData.dateOfBirth);
  const maxDate = new Date().toISOString().split('T')[0];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateOfBirth = e.target.value;
    setFormData((prev) => {
      const valid = getCategoriesByAge(dateOfBirth);
      // Reset category if the existing one no longer fits the new age.
      const category = valid.includes(prev.category) ? prev.category : valid[0] ?? prev.category;
      return { ...prev, dateOfBirth, category };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePhone(formData.phone)) {
      setPhoneError('Please enter a valid phone number.');
      return;
    }
    setPhoneError('');
    onNext();
  };

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
                Enter your date of birth to see the categories available to you.
              </p>
            )}
            {formData.dateOfBirth && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Age: {calculateAge(formData.dateOfBirth)} years
              </p>
            )}
          </div>
        </div>

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

export default ParticipantInfo;
