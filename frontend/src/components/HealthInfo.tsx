import React from 'react';
import { Leaf } from 'lucide-react';
import { FormData } from '../utils/types';

interface Props {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onNext: () => void;
  onBack: () => void;
}

const HealthInfo = ({ formData, setFormData, onNext, onBack }: Props) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div className="animate-fade-in">
      <h2 className="section-title">Health &amp; food preferences</h2>
      <p className="section-subtitle">Help us cater for you and keep you safe.</p>

      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 mb-6 flex items-start gap-3">
        <Leaf className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
        <div className="text-sm text-emerald-800 dark:text-emerald-200">
          <p className="font-medium">All meals are vegetarian / vegan.</p>
          <p className="mt-1">
            We'll do our best to accommodate dietary restrictions and allergies, but we cannot
            guarantee any dish is 100% free of a specific allergen. Please take your own precautions
            if you have severe allergies.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              checked={formData.foodAllergies}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  foodAllergies: e.target.checked,
                  allergiesDetails: e.target.checked ? prev.allergiesDetails : '',
                }))
              }
              className="h-4 w-4 text-sunrise-600 focus:ring-sunrise-500 rounded"
            />
            <span className="form-label mb-0">I have food allergies</span>
          </label>
          {formData.foodAllergies && (
            <textarea
              value={formData.allergiesDetails}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, allergiesDetails: e.target.value }))
              }
              className="input-field animate-slide-up"
              placeholder="Please list your food allergies"
              rows={2}
              required
            />
          )}
        </div>

        <div>
          <label className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              checked={formData.healthIssues}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  healthIssues: e.target.checked,
                  healthDetails: e.target.checked ? prev.healthDetails : '',
                }))
              }
              className="h-4 w-4 text-sunrise-600 focus:ring-sunrise-500 rounded"
            />
            <span className="form-label mb-0">I have health issues or concerns</span>
          </label>
          {formData.healthIssues && (
            <textarea
              value={formData.healthDetails}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, healthDetails: e.target.value }))
              }
              className="input-field animate-slide-up"
              placeholder="Please describe any health concerns we should know about"
              rows={2}
              required
            />
          )}
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

export default HealthInfo;
