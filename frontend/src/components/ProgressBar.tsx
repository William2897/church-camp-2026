interface ProgressBarProps {
  /** 1-based index of the current form step (landing excluded). */
  currentStep: number;
  /** Total number of form steps (landing excluded). */
  totalSteps: number;
}

const ProgressBar = ({ currentStep, totalSteps }: ProgressBarProps) => {
  const pct = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="mb-8">
      <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
        <span>
          Step {currentStep} of {totalSteps}
        </span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-sunrise-400 to-sunrise-600 rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
