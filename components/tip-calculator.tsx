"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import countriesData from "@/data/countries.json";
import type { CountriesData } from "@/types/countries";
import { Textarea } from "./ui/textarea";

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

const serviceTypes = [
  "Restaurant",
  "Food Delivery",
  "Hairstylist/Barber",
  "Taxi/Driver",
  "Hotel Room Service",
  "Other",
];

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

      // Update tip percentage based on AI recommendation
      setState((prev) => ({
        ...prev,
        tipPercentage: data.recommendedTipPercentage,
      }));

      // Update UI to show recommended percentage
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
      {/* Bill Amount Input */}
      <div className="space-y-2">
        <Label htmlFor="billAmount">Bill Amount</Label>
        <Input
          id="billAmount"
          type="number"
          placeholder="Enter bill amount"
          value={state.billAmount}
          onChange={(e) =>
            setState((prev) => ({ ...prev, billAmount: e.target.value }))
          }
        />
      </div>

      {/* Tip Percentage Selection */}
      <div className="space-y-2">
        <Label>Tip Percentage</Label>
        <div className="flex flex-wrap gap-2 w-full">
          {predefinedTipPercentages.map((percentage) => (
            <Button
              key={percentage}
              variant={
                state.tipPercentage === percentage ? "default" : "outline"
              }
              className="flex-1"
              onClick={() => {
                setState((prev) => ({ ...prev, tipPercentage: percentage }));
                setCustomTipPercentage("");
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
                setCustomTipPercentage(e.target.value);
                const value = parseFloat(e.target.value);
                if (!isNaN(value)) {
                  setState((prev) => ({ ...prev, tipPercentage: value }));
                } else {
                  setState((prev) => ({ ...prev, tipPercentage: null }));
                }
              }}
            />
            {state.tipPercentage !== null && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setState((prev) => ({ ...prev, tipPercentage: null }));
                  setCustomTipPercentage("");
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Service Type Selection */}
      <div className="space-y-2">
        <Label>Service Type</Label>
        <Select
          value={state.serviceType}
          onValueChange={(value) =>
            setState((prev) => ({ ...prev, serviceType: value }))
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select service type" />
          </SelectTrigger>
          <SelectContent>
            {serviceTypes.map((service) => (
              <SelectItem key={service} value={service}>
                {service}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Split Bill Input */}
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

      {/* AI Recommendation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              if (state.tipPercentage !== null) {
                toast.warning(
                  "Clear the tip percentage to use AI recommendation"
                );
                return;
              }
              setIsDialogOpen(true);
            }}
          >
            Don&apos;t know how much to tip?
          </Button>
        </DialogTrigger>
        <DialogContent
          className="sm:max-w-[425px]"
          aria-describedby="dialog-description"
        >
          <DialogHeader>
            <DialogTitle>Let us help you decide</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Tell us about your experience and location, and we&apos;ll help
              you calculate the appropriate tip amount.
            </DialogDescription>
          </DialogHeader>

          {/* Country Selection */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Country</Label>
              <Select
                value={state.selectedCountry || ""}
                onValueChange={(value) =>
                  setState((prev) => ({ ...prev, selectedCountry: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys((countriesData as CountriesData).countries).map(
                    (country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Experience Input */}
            <div className="space-y-2">
              <Label>Describe your experience</Label>
              <Textarea
                placeholder="How was your experience? Was the service good? Any issues?"
                value={state.experience}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setState((prev) => ({
                    ...prev,
                    experience: e.target.value,
                  }))
                }
                className="min-h-[100px]"
              />
            </div>

            {/* Rating Sliders */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Service Quality</Label>
                <Slider
                  value={[state.ratings.serviceQuality]}
                  min={1}
                  max={5}
                  step={1}
                  onValueChange={([value]) =>
                    setState((prev) => ({
                      ...prev,
                      ratings: { ...prev.ratings, serviceQuality: value },
                    }))
                  }
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Poor</span>
                  <span>Excellent</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Food Quality</Label>
                <Slider
                  value={[state.ratings.foodQuality]}
                  min={1}
                  max={5}
                  step={1}
                  onValueChange={([value]) =>
                    setState((prev) => ({
                      ...prev,
                      ratings: { ...prev.ratings, foodQuality: value },
                    }))
                  }
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Poor</span>
                  <span>Excellent</span>
                </div>
              </div>
            </div>
          </div>

          <Button onClick={handleAIRecommendation} disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Getting Recommendation...
              </>
            ) : (
              "Get Recommendation"
            )}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Add AI Recommendation Display */}
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

      {/* Results Display */}
      {state.billAmount && state.tipPercentage !== null && (
        <div className="mt-6 p-4 bg-muted rounded-lg space-y-2">
          <div className="flex justify-between">
            <span>Tip Amount:</span>
            <span>${results.tipAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Amount:</span>
            <span>${results.totalAmount.toFixed(2)}</span>
          </div>
          {parseInt(state.splitCount) > 1 && (
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
      )}
    </div>
  );
}
