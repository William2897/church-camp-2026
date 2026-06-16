import { useMemo, useState } from 'react';
import { Moon, Sun, Loader2, CheckCircle2, PartyPopper, Mail } from 'lucide-react';
import { FormData } from './utils/types';
import { bookingNeedsLodging, calculateTotalPrice } from './utils/pricing';
import { CAMP } from './utils/campConfig';
import ProgressBar from './components/ProgressBar';
import Landing from './components/Landing';
import ParticipantInfo from './components/ParticipantInfo';
import HealthInfo from './components/HealthInfo';
import FamilyRegistration from './components/FamilyRegistration';
import Accommodation from './components/Accommodation';
import ReviewTerms from './components/ReviewTerms';
import Payment from './components/Payment';

const initialFormData: FormData = {
  step: 0,
  email: '',
  fullName: '',
  dateOfBirth: '',
  gender: '',
  phone: '',
  category: 'working_adult',
  guardianName: '',
  guardianEmail: '',
  guardianPhone: '',
  foodAllergies: false,
  allergiesDetails: '',
  healthIssues: false,
  healthDetails: '',
  hasFamily: false,
  familyDetails: [],
  accommodation: 'dorm',
  extraMattresses: 0,
  paymentMethod: '',
  paymentProof: null,
  termsAccepted: false,
};

type StepKey =
  | 'landing'
  | 'participant'
  | 'health'
  | 'family'
  | 'accommodation'
  | 'review'
  | 'payment';

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1] ?? '');
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  // The accommodation step only exists when the booking needs lodging.
  const stepKeys = useMemo<StepKey[]>(() => {
    const keys: StepKey[] = ['landing', 'participant', 'health', 'family'];
    if (bookingNeedsLodging(formData)) keys.push('accommodation');
    keys.push('review', 'payment');
    return keys;
  }, [formData]);

  const currentKey = stepKeys[Math.min(formData.step, stepKeys.length - 1)];
  const totalFormSteps = stepKeys.length - 1; // exclude landing

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
    document.documentElement.classList.toggle('dark');
  };

  const handleNext = () => setFormData((prev) => ({ ...prev, step: prev.step + 1 }));
  const handleBack = () => setFormData((prev) => ({ ...prev, step: prev.step - 1 }));

  const resetForm = () => {
    setFormData(initialFormData);
    setSubmitError(null);
    setBookingId(null);
    window.scrollTo({ top: 0 });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const pricing = calculateTotalPrice(formData);
      const proof = formData.paymentProof
        ? {
            filename: formData.paymentProof.name,
            mimeType: formData.paymentProof.type,
            data: await fileToBase64(formData.paymentProof),
          }
        : null;

      const payload = {
        camp: CAMP.theme,
        submittedAt: new Date().toISOString(),
        registrant: {
          email: formData.email,
          fullName: formData.fullName,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          phone: formData.phone,
          category: formData.category,
          foodAllergies: formData.foodAllergies,
          allergiesDetails: formData.allergiesDetails,
          healthIssues: formData.healthIssues,
          healthDetails: formData.healthDetails,
        },
        guardian: formData.category === 'child_3_12'
          ? { name: formData.guardianName, email: formData.guardianEmail, phone: formData.guardianPhone }
          : null,
        hasFamily: formData.hasFamily,
        familyDetails: formData.hasFamily ? formData.familyDetails : [],
        accommodation: formData.accommodation,
        extraMattresses: formData.extraMattresses,
        paymentMethod: formData.paymentMethod,
        pricing,
        proof,
      };

      const apiUrl = import.meta.env.VITE_API_URL;
      if (!apiUrl) throw new Error('Registration endpoint is not configured (VITE_API_URL).');

      // NOTE: a plain string body keeps this a CORS "simple request" so the
      // Apps Script endpoint (which can't answer preflight) accepts it.
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!data.ok) {
        if (data.soldOut) {
          // A room sold out between page-load and submit — bounce back so the
          // user can pick again (Accommodation refetches live counts on mount).
          const accIdx = stepKeys.indexOf('accommodation');
          if (accIdx >= 0) setFormData((prev) => ({ ...prev, step: accIdx }));
          window.scrollTo({ top: 0 });
        }
        throw new Error(data.message || 'Registration failed. Please try again.');
      }

      setBookingId(data.bookingId ?? 'CONFIRMED');
      window.scrollTo({ top: 0 });
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'An unexpected error occurred.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentKey) {
      case 'landing':
        return <Landing onNext={handleNext} />;
      case 'participant':
        return (
          <ParticipantInfo
            formData={formData}
            setFormData={setFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 'health':
        return (
          <HealthInfo
            formData={formData}
            setFormData={setFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 'family':
        return (
          <FamilyRegistration
            formData={formData}
            setFormData={setFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 'accommodation':
        return (
          <Accommodation
            formData={formData}
            setFormData={setFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 'review':
        return (
          <ReviewTerms
            formData={formData}
            setFormData={setFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 'payment':
        return (
          <Payment
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            onBack={handleBack}
          />
        );
    }
  };

  const showProgress = currentKey !== 'landing' && !bookingId;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sunrise-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 transition-colors duration-200">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold bg-gradient-to-r from-slate-700 to-sunrise-600 dark:from-slate-200 dark:to-sunrise-400 bg-clip-text text-transparent">
              From Doubt to Trust
            </span>
          </div>
          <button
            onClick={toggleDarkMode}
            aria-label="Toggle dark mode"
            className="p-2 rounded-full bg-white dark:bg-slate-800 text-sunrise-600 dark:text-sunrise-400 shadow-sm hover:scale-105 transition"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>

        {submitError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800">
            <p className="font-medium">Something went wrong</p>
            <p className="text-sm">{submitError}</p>
          </div>
        )}

        {isSubmitting && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-xl flex items-center gap-4">
              <Loader2 className="w-6 h-6 text-sunrise-600 dark:text-sunrise-400 animate-spin" />
              <p className="text-slate-900 dark:text-slate-100">Submitting your registration…</p>
            </div>
          </div>
        )}

        {bookingId ? (
          <SuccessScreen bookingId={bookingId} email={formData.email} onReset={resetForm} />
        ) : (
          <div className="card">
            {showProgress && (
              <ProgressBar currentStep={formData.step} totalSteps={totalFormSteps} />
            )}
            {renderStep()}
          </div>
        )}

        <footer className="text-center text-xs text-slate-400 dark:text-slate-500 mt-8">
          {CAMP.theme} · {CAMP.name} · {CAMP.dates} · {CAMP.venue}
        </footer>
      </div>
    </div>
  );
};

const SuccessScreen = ({
  bookingId,
  email,
  onReset,
}: {
  bookingId: string;
  email: string;
  onReset: () => void;
}) => (
  <div className="card text-center py-10 animate-fade-in">
    <PartyPopper className="w-14 h-14 text-sunrise-500 mx-auto mb-4" />
    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
      Registration received!
    </h2>
    <p className="text-slate-600 dark:text-slate-300 mb-4">
      Thank you for registering for <strong>{CAMP.theme}</strong>. We can't wait to see you
      at {CAMP.venue}.
    </p>
    <div className="inline-flex items-center gap-2 bg-sunrise-50 dark:bg-slate-700/60 text-sunrise-700 dark:text-sunrise-300 px-4 py-2 rounded-lg mb-4">
      <CheckCircle2 className="w-5 h-5" />
      <span className="font-mono font-medium">Reference: {bookingId}</span>
    </div>
    <p className="inline-flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
      <Mail className="w-4 h-4" />
      <span>
        A confirmation with your booking details has been emailed to{' '}
        <strong className="text-slate-700 dark:text-slate-200">{email}</strong>.
      </span>
    </p>
    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
      Please keep your reference. Our team will be in touch if anything is needed.
    </p>
    <button onClick={onReset} className="btn-primary">
      Register another person
    </button>
  </div>
);

export default App;
