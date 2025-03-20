"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
}

const serviceTypes = [
  "Restaurant",
  "Food Delivery",
  "Hairstylist/Barber",
  "Taxi/Driver",
  "Hotel Room Service",
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
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [customTipPercentage, setCustomTipPercentage] = useState<string>("");

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

  const handleAIRecommendation = () => {
    // Prevent recommendation if tip percentage is already set
    if (state.tipPercentage !== null) {
      toast.warning("Clear the tip percentage first to get a recommendation");
      setIsDialogOpen(false);
      return;
    }

    if (!state.selectedCountry) {
      toast.error("Please select a country");
      return;
    }

    const countryData = (countriesData as CountriesData).countries[
      state.selectedCountry
    ];
    if (!countryData) {
      toast.error("Country data not found");
      return;
    }

    const averageRating =
      (state.ratings.serviceQuality + state.ratings.foodQuality) / 2;
    let recommendedTip: number;

    if (!countryData.tipping_customary) {
      // For countries where tipping is not customary
      if (averageRating >= 4) {
        recommendedTip = 10; // Excellent service
      } else if (averageRating >= 3) {
        recommendedTip = 5; // Good service
      } else {
        recommendedTip = 0; // Below average service
      }
    } else {
      // For countries where tipping is customary
      const basePercentage = countryData.recommended_percentage;

      // Adjust tip based on rating
      if (averageRating > 3) {
        // Above average service
        const increase = Math.floor(averageRating - 3); // 1 or 2
        if (increase === 1) {
          recommendedTip = Math.min(basePercentage + 5, 20); // +5% up to 20%
        } else {
          recommendedTip = Math.min(basePercentage + 10, 25); // +10% up to 25%
        }
      } else if (averageRating < 3) {
        // Below average service
        const decrease = Math.floor(3 - averageRating); // 1 or 2
        recommendedTip = Math.max(basePercentage - decrease * 3, 5); // -3% per point, minimum 5%
      } else {
        // Average service (rating = 3)
        recommendedTip = basePercentage;
      }
    }

    // Check if recommended tip matches any predefined percentage
    if (predefinedTipPercentages.includes(recommendedTip)) {
      setState((prev) => ({
        ...prev,
        tipPercentage: recommendedTip,
      }));
      setCustomTipPercentage("");
    } else {
      // If not, set it as custom percentage
      setState((prev) => ({
        ...prev,
        tipPercentage: recommendedTip,
      }));
      setCustomTipPercentage(recommendedTip.toString());
    }

    toast.success(`Recommended tip: ${recommendedTip}%`);
    setIsDialogOpen(false);
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Let us help you decide</DialogTitle>
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

          <Button onClick={handleAIRecommendation}>Get Recommendation</Button>
        </DialogContent>
      </Dialog>

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
