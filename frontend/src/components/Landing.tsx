import { useState } from 'react';
import { Calendar, MapPin, Mic, Phone, Facebook, Instagram, ArrowRight } from 'lucide-react';
import {
  CAMP,
  CATEGORY_RATES,
  FAMILY_DISCOUNT_TIERS,
  MATTRESS_TOTAL,
} from '../utils/campConfig';

interface LandingProps {
  onNext: () => void;
}

const pricingCards = [
  { label: 'Working Adults', price: CATEGORY_RATES.working_adult },
  { label: 'Ministry / Homemakers / Students', price: CATEGORY_RATES.ministry_housewife_student },
  { label: 'Children (3–12 yrs)', price: CATEGORY_RATES.child_3_12 },
  { label: 'Seminar (food, no lodging)', price: CATEGORY_RATES.seminar }, 
];

// The poster file may be saved as .jpg, .jpeg, or .png — try each in turn.
const POSTER_CANDIDATES = [
  '/poster-landscape.jpg',
  '/poster-landscape.jpeg',
  '/poster-landscape.png',
];

const Landing = ({ onNext }: LandingProps) => {
  const [posterIndex, setPosterIndex] = useState(0);
  const posterFailed = posterIndex >= POSTER_CANDIDATES.length;

  return (
    <div className="animate-fade-in">
      {/* Poster hero */}
      <div className="relative -m-6 mb-6 rounded-t-xl overflow-hidden">
        {!posterFailed ? (
          <img
            src={POSTER_CANDIDATES[posterIndex]}
            alt="From Doubt to Trust — Church Camp 2026"
            className="w-full object-cover"
            onError={() => setPosterIndex((i) => i + 1)}
          />
        ) : (
          <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-sunrise-500 px-6 py-16 text-center">
            <p className="text-sunrise-200 tracking-[0.3em] text-xs font-semibold mb-3">
              CHURCH CAMP 2026
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
              From Doubt <span className="text-sunrise-300">to</span> Trust
            </h1>
            <p className="text-slate-200 mt-4">
              {CAMP.dates} · {CAMP.venue}
            </p>
          </div>
        )}
      </div>

      <h2 className="section-title">Let's get you registered!</h2>

      {/* Event details */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Detail icon={<Calendar />} title="Dates" value={CAMP.dates} />
        <Detail icon={<MapPin />} title="Venue" value={CAMP.venue} />
        <Detail icon={<Mic />} title="Speaker" value={CAMP.speaker} />
      </div>

      {/* Pricing */}
      <div className="bg-sunrise-50 dark:bg-slate-700/40 rounded-xl p-5 mb-6">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Registration Fees</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {pricingCards.map((card) => (
            <div
              key={card.label}
              className="bg-white dark:bg-slate-800 rounded-lg p-3 text-center shadow-sm"
            >
              <p className="text-xs text-slate-500 dark:text-slate-400 min-h-[2.5rem] flex items-center justify-center">
                {card.label}
              </p>
              <p className="text-xl font-bold text-sunrise-600 dark:text-sunrise-400">
                RM {card.price}
              </p>
            </div>
          ))}
        </div>
        <ul className="text-sm text-slate-600 dark:text-slate-300 mt-4 space-y-1 list-disc list-inside">
          <li>
            <strong>Family package:</strong>{' '}
            {FAMILY_DISCOUNT_TIERS.map((t) => t.label).reverse().join(' · ')} (on registration fees)
          </li>
          <li>Children under 3 attend for free. Add them as a family member when a parent/guardian registers.</li>
          <li>
            Optional room upgrades available. Extra mattress (RM {MATTRESS_TOTAL}) or a
            two-room suite for families.
          </li>
        </ul>
      </div>

      {/* Contacts */}
      <div className="bg-slate-100 dark:bg-slate-800/60 rounded-xl p-5 mb-8">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-3">Questions?</h3>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {CAMP.contacts.map((c) => (
            <a
              key={c.phone}
              href={`tel:${c.phone}`}
              className="inline-flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:text-sunrise-600 dark:hover:text-sunrise-400"
            >
              <Phone className="w-4 h-4" /> {c.name} · {c.display}
            </a>
          ))}
          <span className="inline-flex items-center gap-2 text-slate-700 dark:text-slate-200">
            <Facebook className="w-4 h-4" /> {CAMP.socials.facebook}
          </span>
          <span className="inline-flex items-center gap-2 text-slate-700 dark:text-slate-200">
            <Instagram className="w-4 h-4" /> {CAMP.socials.instagram}
          </span>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={onNext} className="btn-primary inline-flex items-center gap-2">
          Register Now <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const Detail = ({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) => (
  <div className="flex items-start gap-3 bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
    <span className="text-sunrise-500 mt-0.5 [&>svg]:w-5 [&>svg]:h-5">{icon}</span>
    <div>
      <p className="text-xs text-slate-500 dark:text-slate-400">{title}</p>
      <p className="font-medium text-slate-800 dark:text-white text-sm">{value}</p>
    </div>
  </div>
);

export default Landing;
