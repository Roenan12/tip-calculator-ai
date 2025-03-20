import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TipPercentageSelectorProps {
  tipPercentage: number | null;
  customTipPercentage: string;
  onTipPercentageChange: (value: number | null) => void;
  onCustomTipChange: (value: string) => void;
}

const predefinedTipPercentages = [10, 18, 20, 25];

export function TipPercentageSelector({
  tipPercentage,
  customTipPercentage,
  onTipPercentageChange,
  onCustomTipChange,
}: TipPercentageSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>Tip Percentage</Label>
      <div className="flex flex-wrap gap-2 w-full">
        {predefinedTipPercentages.map((percentage) => (
          <Button
            key={percentage}
            variant={tipPercentage === percentage ? "default" : "outline"}
            className="flex-1"
            onClick={() => {
              onTipPercentageChange(percentage);
              onCustomTipChange("");
            }}
          >
            {percentage}%
          </Button>
        ))}
        <div className="flex gap-2 flex-1 min-w-[150px]">
          <Input
            type="number"
            placeholder="Custom %"
            className="w-full"
            value={customTipPercentage}
            onChange={(e) => {
              onCustomTipChange(e.target.value);
              const value = parseFloat(e.target.value);
              onTipPercentageChange(!isNaN(value) ? value : null);
            }}
          />
          {tipPercentage !== null && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onTipPercentageChange(null);
                onCustomTipChange("");
              }}
            >
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
