import React, { useEffect, useState } from 'react';
import { BedDouble, Home, Building2, Minus, Plus, Check, AlertTriangle, Users, X } from 'lucide-react';
import { FormData } from '../utils/types';
import { Availability, fetchAvailability } from '../utils/api';
import {
  CAMP,
  AccommodationType,
  MATTRESS_PER_NIGHT,
  MAX_MATTRESSES,
  SUITE_UPGRADE_PER_NIGHT,
  SUITE_PRICE_CONFIRMED,
} from '../utils/campConfig';

import regularTwin1 from '../assets/rooms/regular-twin-1.jpeg';
import regularTwin2 from '../assets/rooms/regular-twin-2.jpg';
import suite1 from '../assets/rooms/two-room-suite-1.jpeg';
import suite2 from '../assets/rooms/two-room-suite-2.jpg';
import suite3 from '../assets/rooms/two-room-suite-3.jpg';
import suite4 from '../assets/rooms/two-room-suite-4.jpg';
import suite5 from '../assets/rooms/two-room-suite-5.jpg';

interface Props {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onNext: () => void;
  onBack: () => void;
}

const twinImages = [regularTwin1, regularTwin2];
const suiteImages = [suite1, suite2, suite3, suite4, suite5];

/** Accessible clickable card (a div, so it can safely contain buttons). */
const cardClasses = (active: boolean) =>
  `w-full text-left rounded-xl border-2 p-5 transition cursor-pointer ${
    active
      ? 'border-sunrise-500 bg-sunrise-50 dark:bg-slate-700/40'
      : 'border-slate-200 dark:border-slate-700 hover:border-sunrise-300'
  }`;

/** "X of Y left" / "Fully booked" pill shown on tracked room types. */
const AvailabilityBadge = ({ left, total }: { left: number; total: number }) => {
  if (left <= 0)
    return (
      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
        Fully booked
      </span>
    );
  const low = left <= 2;
  return (
    <span
      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
        low
          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
      }`}
    >
      {left} of {total} left
    </span>
  );
};

const Gallery = ({ images, alt }: { images: string[]; alt: string }) => {
  const [active, setActive] = useState(0);
  return (
    <div>
      <img src={images[active]} alt={alt} className="w-full h-44 object-cover rounded-lg" />
      {images.length > 1 && (
        <div className="flex gap-2 mt-2 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActive(i);
              }}
              className={`shrink-0 rounded-md overflow-hidden border-2 transition ${
                active === i ? 'border-sunrise-500' : 'border-transparent opacity-70'
              }`}
            >
              <img src={img} alt={`${alt} ${i + 1}`} className="h-12 w-16 object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Accommodation = ({ formData, setFormData, onNext, onBack }: Props) => {
  const { accommodation } = formData;
  const mattressEach = MATTRESS_PER_NIGHT * CAMP.nights;
  const suiteTotal = SUITE_UPGRADE_PER_NIGHT * CAMP.nights;
  const isSingle = !formData.hasFamily;

  const [avail, setAvail] = useState<Availability | null>(null);
  const [pendingType, setPendingType] = useState<AccommodationType | null>(null);

  // Pull live room counts; if a sold-out room is currently selected, fall back to dorm.
  useEffect(() => {
    fetchAvailability().then((a) => {
      if (!a) return;
      setAvail(a);
      setFormData((prev) => {
        if (prev.accommodation === 'twin_room' && a.twinLeft <= 0)
          return { ...prev, accommodation: 'dorm', extraMattresses: 0 };
        if (prev.accommodation === 'two_room_suite' && a.suiteLeft <= 0)
          return { ...prev, accommodation: 'dorm' };
        return prev;
      });
    });
  }, [setFormData]);

  const twinSoldOut = !!avail && avail.twinLeft <= 0;
  const suiteSoldOut = !!avail && avail.suiteLeft <= 0;

  const applySelection = (next: AccommodationType) => {
    setFormData((prev) => ({
      ...prev,
      accommodation: next,
      extraMattresses: next === 'twin_room' ? prev.extraMattresses : 0,
    }));
  };

  const select = (next: AccommodationType) => {
    if (next === 'twin_room' && twinSoldOut) return;
    if (next === 'two_room_suite' && suiteSoldOut) return;
    // Single registrants get a gateway warning before choosing a private room.
    if (isSingle && (next === 'twin_room' || next === 'two_room_suite')) {
      setPendingType(next);
      return;
    }
    applySelection(next);
  };

  const confirmSingleOverride = () => {
    if (pendingType) applySelection(pendingType);
    setPendingType(null);
  };

  const setMattresses = (n: number) =>
    setFormData((prev) => ({
      ...prev,
      extraMattresses: Math.max(0, Math.min(MAX_MATTRESSES, n)),
    }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  const cardProps = (type: AccommodationType, disabled = false) => ({
    role: 'radio' as const,
    'aria-checked': accommodation === type,
    'aria-disabled': disabled,
    tabIndex: disabled ? -1 : 0,
    onClick: () => select(type),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        select(type);
      }
    },
    className: cardClasses(accommodation === type) + (disabled ? ' opacity-60 cursor-not-allowed' : ''),
  });

  return (
    <div className="animate-fade-in">
      <h2 className="section-title">Accommodation</h2>
      <p className="section-subtitle">
        Lodging is already included in your registration fee — there's <strong>no extra
        charge</strong> unless you add extra mattresses or upgrade to a two-room suite. Choose what
        suits you below.
      </p>

      {/* Single-registrant notice */}
      {isSingle && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg mb-2 text-sm text-amber-800 dark:text-amber-200">
          <Users className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <p>
            <strong>Private rooms are reserved for couples and families.</strong> As a single
            attendee, the dormitory is your standard option. If you have a specific reason to
            request a private room, you may still select one — it will be subject to availability
            and approval by the camp team.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Dorm — default, no upgrade */}
        <div {...cardProps('dorm')}>
          <div className="flex items-center gap-3">
            <BedDouble className="w-6 h-6 text-sunrise-500 shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-800 dark:text-white">
                  Dormitory (included)
                </h3>
                {accommodation === 'dorm' && <Check className="w-5 h-5 text-sunrise-600 ml-auto" />}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Shared dorm lodging — perfect if you're coming on your own. No extra charge.
              </p>
            </div>
          </div>
        </div>

        {/* Regular twin room */}
        <div {...cardProps('twin_room', twinSoldOut)}>
          <div className="grid md:grid-cols-2 gap-5">
            <Gallery images={twinImages} alt="Regular twin room" />
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Home className="w-5 h-5 text-sunrise-500" />
                <h3 className="font-semibold text-slate-800 dark:text-white">Regular Twin Room</h3>
                {avail && <AvailabilityBadge left={avail.twinLeft} total={avail.twinTotal} />}
                {accommodation === 'twin_room' && (
                  <Check className="w-5 h-5 text-sunrise-600 ml-auto" />
                )}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                A private twin-bedded room — ideal for couples or families. Included at no extra
                charge; families with younger children can add up to {MAX_MATTRESSES} extra
                mattresses.
              </p>
              <p className="text-sm font-medium text-sunrise-600 dark:text-sunrise-400 mt-2">
                No extra charge (mattresses optional)
              </p>
            </div>
          </div>

          {accommodation === 'twin_room' && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
              <div className="flex items-center gap-2 mb-2">
                <BedDouble className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Extra mattresses (RM {MATTRESS_PER_NIGHT}/night each · max {MAX_MATTRESSES})
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMattresses(formData.extraMattresses - 1);
                    }}
                    className="p-2 rounded-lg bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-500"
                    aria-label="Remove mattress"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-semibold text-slate-800 dark:text-white">
                    {formData.extraMattresses}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMattresses(formData.extraMattresses + 1);
                    }}
                    className="p-2 rounded-lg bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-500"
                    aria-label="Add mattress"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {formData.extraMattresses > 0 && (
                  <span className="text-sm text-slate-600 dark:text-slate-300">
                    + RM {(formData.extraMattresses * mattressEach).toFixed(0)} ({CAMP.nights}{' '}
                    nights)
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Two-room suite */}
        <div {...cardProps('two_room_suite', suiteSoldOut)}>
          <div className="grid md:grid-cols-2 gap-5">
            <Gallery images={suiteImages} alt="Two-room suite" />
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Building2 className="w-5 h-5 text-sunrise-500" />
                <h3 className="font-semibold text-slate-800 dark:text-white">
                  Two-Room Suite (Upgrade)
                </h3>
                {avail && <AvailabilityBadge left={avail.suiteLeft} total={avail.suiteTotal} />}
                {accommodation === 'two_room_suite' && (
                  <Check className="w-5 h-5 text-sunrise-600 ml-auto" />
                )}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                A separate bedroom plus a living area with kitchenette — ideal for larger families.
              </p>
              <p className="text-sm font-medium text-sunrise-600 dark:text-sunrise-400 mt-2">
                + RM {suiteTotal.toFixed(0)} for the camp ({CAMP.nights} nights)
              </p>
              {!SUITE_PRICE_CONFIRMED && (
                <div className="mt-2 flex items-start gap-1.5 text-xs text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>
                    Suite pricing is indicative and being finalised — our team will confirm the
                    exact amount with you.
                  </span>
                </div>
              )}
            </div>
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

      {/* Gateway modal — single registrant choosing a private room */}
      {pendingType && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-500" />
                Private room — confirmation
              </h3>
              <button
                type="button"
                onClick={() => setPendingType(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-5">
              The{' '}
              <strong>
                {pendingType === 'twin_room' ? 'Regular Twin Room' : 'Two-Room Suite'}
              </strong>{' '}
              is reserved for <strong>couples and families</strong>. As a single attendee, the
              dormitory is your standard accommodation.
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
              If you have a specific reason to request a private room, the camp team will review
              it — select <em>Continue anyway</em> and we'll follow up with you.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => { applySelection('dorm'); setPendingType(null); }}
                className="btn-primary flex-1"
              >
                Choose Dormitory
              </button>
              <button
                type="button"
                onClick={confirmSingleOverride}
                className="btn-secondary flex-1 text-sm"
              >
                Continue anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accommodation;
