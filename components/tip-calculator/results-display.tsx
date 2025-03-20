interface ResultsDisplayProps {
  billAmount: string;
  tipPercentage: number | null;
  splitCount: string;
  results: {
    tipAmount: number;
    totalAmount: number;
    tipPerPerson: number;
    totalPerPerson: number;
  };
}

export function ResultsDisplay({
  billAmount,
  tipPercentage,
  splitCount,
  results,
}: ResultsDisplayProps) {
  if (!billAmount || tipPercentage === null) return null;

  return (
    <div className="mt-6 p-4 bg-muted rounded-lg space-y-2">
      <div className="flex justify-between">
        <span>Tip Amount:</span>
        <span>${results.tipAmount.toFixed(2)}</span>
      </div>
      <div className="flex justify-between">
        <span>Total Amount:</span>
        <span>${results.totalAmount.toFixed(2)}</span>
      </div>
      {parseInt(splitCount) > 1 && (
        <>
          <div className="flex justify-between">
            <span>Tip per person:</span>
            <span>${results.tipPerPerson.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Total per person:</span>
            <span>${results.totalPerPerson.toFixed(2)}</span>
          </div>
        </>
      )}
    </div>
  );
}
