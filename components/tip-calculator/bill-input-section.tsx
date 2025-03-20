import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BillInputSectionProps {
  billAmount: string;
  onBillAmountChange: (value: string) => void;
}

export function BillInputSection({
  billAmount,
  onBillAmountChange,
}: BillInputSectionProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="billAmount">Bill Amount</Label>
      <Input
        id="billAmount"
        type="number"
        placeholder="Enter bill amount"
        value={billAmount}
        onChange={(e) => onBillAmountChange(e.target.value)}
      />
    </div>
  );
}
