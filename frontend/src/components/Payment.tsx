import React, { useRef, useState } from 'react';
import { Upload, HeartHandshake, Clock, CheckCircle2, ExternalLink } from 'lucide-react';
import { FormData } from '../utils/types';
import { ADVENTIST_GIVING } from '../utils/campConfig';
import PriceSummary from './PriceSummary';

interface Props {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onSubmit: () => void;
  onBack: () => void;
}

const MAX_FILE_SIZE = 1024 * 1024; // 1MB
const VALID_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

const Payment = ({ formData, setFormData, onSubmit, onBack }: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!VALID_TYPES.includes(file.type)) {
      setError('Please upload a JPEG, PNG, or PDF file.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('File size must be under 1MB.');
      return;
    }
    setError('');
    setFormData((prev) => ({ ...prev, paymentProof: file }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.paymentMethod === 'adventist_giving' && !formData.paymentProof) {
      setError('Please upload your payment receipt.');
      return;
    }
    setError('');
    onSubmit();
  };

  const canSubmit =
    !!formData.paymentMethod &&
    (formData.paymentMethod === 'deferred' || !!formData.paymentProof);

  return (
    <div className="animate-fade-in">
      <h2 className="section-title">Payment</h2>
      <p className="section-subtitle">Almost done — choose how you'd like to pay.</p>

      <div className="space-y-6">
        <PriceSummary formData={formData} />

        <form onSubmit={handleSubmit} className="space-y-5">
          <fieldset className="space-y-3">
            <legend className="form-label">Payment method *</legend>

            <label className="flex items-start gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-sunrise-50 dark:hover:bg-slate-700/40 transition">
              <input
                type="radio"
                name="paymentMethod"
                value="adventist_giving"
                checked={formData.paymentMethod === 'adventist_giving'}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    paymentMethod: e.target.value as 'adventist_giving',
                  }))
                }
                className="mt-1 text-sunrise-600 focus:ring-sunrise-500"
              />
              <div>
                <p className="font-medium flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-sunrise-500" /> Adventist Giving
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Pay online via Adventist Giving and upload your receipt. Registrations without a
                  valid receipt may be voided.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-sunrise-50 dark:hover:bg-slate-700/40 transition">
              <input
                type="radio"
                name="paymentMethod"
                value="deferred"
                checked={formData.paymentMethod === 'deferred'}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, paymentMethod: e.target.value as 'deferred' }))
                }
                className="mt-1 text-sunrise-600 focus:ring-sunrise-500"
              />
              <div>
                <p className="font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sunrise-500" /> Pay later (deferred)
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Can't pay right now? Choose this and our team will follow up to arrange payment.
                </p>
              </div>
            </label>
          </fieldset>

          {formData.paymentMethod === 'adventist_giving' && (
            <div className="animate-slide-up bg-slate-50 dark:bg-slate-800/60 rounded-lg p-5 space-y-4">
              <div className="text-sm space-y-2">
                <p className="font-medium text-slate-800 dark:text-white mb-1">How to pay</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-300">
                  <li>
                    Go to{' '}
                    <a
                      href={ADVENTIST_GIVING.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sunrise-600 dark:text-sunrise-400 underline inline-flex items-center gap-1"
                    >
                      adventistgiving.org.my/donate <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </li>
                  <li>
                    Select <strong>{ADVENTIST_GIVING.church}</strong> as your church
                  </li>
                  <li>
                    Scroll down and choose the <strong>{ADVENTIST_GIVING.fund}</strong> option
                  </li>
                  <li>Complete your payment and save your receipt</li>
                  <li>
                    Upload the receipt below, and send a copy to{' '}
                    <strong>
                      {ADVENTIST_GIVING.receiptContact.name} ({ADVENTIST_GIVING.receiptContact.phone})
                    </strong>
                  </li>
                </ol>
              </div>

              <div>
                <label className="form-label">Upload payment receipt *</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-1 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center cursor-pointer hover:border-sunrise-500 transition"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    onChange={handleFile}
                    className="hidden"
                  />
                  <Upload className="mx-auto h-10 w-10 text-slate-400" />
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    Click to upload your receipt
                  </p>
                  <p className="text-xs text-slate-500">JPEG, PNG or PDF · max 1MB</p>
                </div>
                {formData.paymentProof && (
                  <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> {formData.paymentProof.name}
                  </p>
                )}
              </div>
            </div>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-between pt-2">
            <button type="button" onClick={onBack} className="btn-secondary">
              Back
            </button>
            <button type="submit" disabled={!canSubmit} className="btn-primary">
              Complete registration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Payment;
