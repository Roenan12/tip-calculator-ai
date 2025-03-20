"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BillInputSection } from "./tip-calculator/bill-input-section";
import { TipPercentageSelector } from "./tip-calculator/tip-percentage-selector";
import { ServiceTypeSelector } from "./tip-calculator/service-type-selector";
import { AIRecommendationDialog } from "./tip-calculator/ai-recommendation-dialog";
import { ResultsDisplay } from "./tip-calculator/results-display";
import { toast } from "sonner";

interface TipCalculatorState {
  billAmount: string;
  tipPercentage: number | null;
  serviceType: string;
  splitCount: string;
  showAIRecommendation: boolean;
  selectedCountry: string | null;
  ratings: {
    serviceQuality: number;
    foodQuality: number;
  };
  experience: string;
}

interface AIRecommendation {
  recommendedTipPercentage: number;
  explanation: string;
  confidence: number;
}

const predefinedTipPercentages = [10, 18, 20, 25];

export default function TipCalculator() {
  const [state, setState] = useState<TipCalculatorState>({
    billAmount: "",
    tipPercentage: null,
    serviceType: "",
    splitCount: "1",
    showAIRecommendation: false,
    selectedCountry: null,
    ratings: {
      serviceQuality: 3,
      foodQuality: 3,
    },
    experience: "",
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [customTipPercentage, setCustomTipPercentage] = useState<string>("");
  const [aiRecommendation, setAiRecommendation] =
    useState<AIRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const calculateTip = () => {
    const billAmount = parseFloat(state.billAmount) || 0;
    const tipPercentage = state.tipPercentage || 0;
    const splitCount = parseInt(state.splitCount) || 1;

    const tipAmount = billAmount * (tipPercentage / 100);
    const totalAmount = billAmount + tipAmount;

    return {
      tipAmount,
      totalAmount,
      tipPerPerson: tipAmount / splitCount,
      totalPerPerson: totalAmount / splitCount,
    };
  };

  const handleAIRecommendation = async () => {
    if (state.tipPercentage !== null) {
      toast.warning("Clear the tip percentage first to get a recommendation");
      setIsDialogOpen(false);
      return;
    }

    if (!state.selectedCountry || !state.serviceType || !state.billAmount) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!state.experience.trim()) {
      toast.error("Please describe your experience");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/recommend-tip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          billAmount: parseFloat(state.billAmount),
          serviceType: state.serviceType,
          country: state.selectedCountry,
          serviceQuality: state.ratings.serviceQuality,
          foodQuality: state.ratings.foodQuality,
          experience: state.experience,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setAiRecommendation(data);
      setState((prev) => ({
        ...prev,
        tipPercentage: data.recommendedTipPercentage,
      }));

      if (predefinedTipPercentages.includes(data.recommendedTipPercentage)) {
        setCustomTipPercentage("");
      } else {
        setCustomTipPercentage(data.recommendedTipPercentage.toString());
      }

      toast.success(`AI Recommendation: ${data.recommendedTipPercentage}%`);
      setIsDialogOpen(false);
    } catch {
      toast.error("Failed to get AI recommendation");
    } finally {
      setIsLoading(false);
    }
  };

  const results = calculateTip();

  return (
    <div className="space-y-6 bg-card p-6 rounded-lg shadow-sm w-full">
      <BillInputSection
        billAmount={state.billAmount}
        onBillAmountChange={(value) =>
          setState((prev) => ({ ...prev, billAmount: value }))
        }
      />

      <TipPercentageSelector
        tipPercentage={state.tipPercentage}
        customTipPercentage={customTipPercentage}
        onTipPercentageChange={(value) =>
          setState((prev) => ({ ...prev, tipPercentage: value }))
        }
        onCustomTipChange={setCustomTipPercentage}
      />

      <ServiceTypeSelector
        serviceType={state.serviceType}
        onServiceTypeChange={(value) =>
          setState((prev) => ({ ...prev, serviceType: value }))
        }
      />

      <div className="space-y-2">
        <Label htmlFor="splitCount">Split Bill</Label>
        <Input
          id="splitCount"
          type="number"
          min="1"
          placeholder="Number of people"
          value={state.splitCount}
          onChange={(e) =>
            setState((prev) => ({ ...prev, splitCount: e.target.value }))
          }
        />
      </div>

      <AIRecommendationDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        state={{
          selectedCountry: state.selectedCountry,
          experience: state.experience,
          ratings: state.ratings,
        }}
        onStateChange={(key, value) =>
          setState((prev) => ({ ...prev, [key]: value }))
        }
        onGetRecommendation={handleAIRecommendation}
        isLoading={isLoading}
        tipPercentage={state.tipPercentage}
      />

      {aiRecommendation && (
        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <h3 className="font-medium mb-2">AI Recommendation</h3>
          <p className="text-sm text-muted-foreground">
            {aiRecommendation.explanation}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Confidence:</span>
            <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary"
                style={{ width: `${aiRecommendation.confidence * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      <ResultsDisplay
        billAmount={state.billAmount}
        tipPercentage={state.tipPercentage}
        splitCount={state.splitCount}
        results={results}
      />
    </div>
  );
}
