import { Receipt } from 'lucide-react';
import { FormData } from '../utils/types';
import { calculateTotalPrice } from '../utils/pricing';

const Row = ({
  label,
  value,
  accent,
  bold,
}: {
  label: string;
  value: string;
  accent?: 'green' | 'sunrise';
  bold?: boolean;
}) => (
  <div
    className={`flex justify-between ${bold ? 'font-bold text-lg' : ''} ${
      accent === 'green'
        ? 'text-emerald-600 dark:text-emerald-400'
        : accent === 'sunrise'
        ? 'text-sunrise-600 dark:text-sunrise-400'
        : ''
    }`}
  >
    <span>{label}</span>
    <span>{value}</span>
  </div>
);

const PriceSummary = ({ formData }: { formData: FormData }) => {
  const p = calculateTotalPrice(formData);

  return (
    <div className="bg-sunrise-50 dark:bg-slate-700/40 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Receipt className="w-5 h-5 text-sunrise-600 dark:text-sunrise-400" />
        <h3 className="font-semibold text-slate-800 dark:text-white">Price breakdown</h3>
      </div>

      <div className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
        <Row
          label={`Registration fees (${p.paxCount} ${p.paxCount === 1 ? 'person' : 'people'})`}
          value={`RM ${p.registrationFees.toFixed(2)}`}
        />

        {p.familyDiscount > 0 && (
          <Row
            label={`Family discount (${Math.round(p.familyDiscountRate * 100)}%)`}
            value={`− RM ${p.familyDiscount.toFixed(2)}`}
            accent="green"
          />
        )}

        {p.mattressTotal > 0 && (
          <Row
            label="Extra mattresses"
            value={`RM ${p.mattressTotal.toFixed(2)}`}
          />
        )}

        {p.suiteTotal > 0 && (
          <Row
            label="Two-room suite upgrade"
            value={`RM ${p.suiteTotal.toFixed(2)}`}
          />
        )}

        <div className="border-t border-slate-200 dark:border-slate-600 my-2" />
        <Row label="Total" value={`RM ${p.finalTotal.toFixed(2)}`} accent="sunrise" bold />
      </div>
    </div>
  );
};

export default PriceSummary;
