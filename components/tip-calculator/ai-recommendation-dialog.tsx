import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import type { CountriesData } from "@/types/countries";
import countriesData from "@/data/countries.json";
import { toast } from "sonner";

type AIDialogState = {
  selectedCountry: string | null;
  experience: string;
  ratings: {
    serviceQuality: number;
    foodQuality: number;
  };
};

type StateChangeValue = string | AIDialogState["ratings"] | null;

interface AIRecommendationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  state: AIDialogState;
  onStateChange: (key: keyof AIDialogState, value: StateChangeValue) => void;
  onGetRecommendation: () => Promise<void>;
  isLoading: boolean;
  tipPercentage: number | null;
}

export function AIRecommendationDialog({
  isOpen,
  onOpenChange,
  state,
  onStateChange,
  onGetRecommendation,
  isLoading,
  tipPercentage,
}: AIRecommendationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            if (tipPercentage !== null) {
              toast.warning(
                "Clear the tip percentage to use AI recommendation"
              );
              return;
            }
            onOpenChange(true);
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
            Tell us about your experience and location, and we&apos;ll help you
            calculate the appropriate tip amount.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Select Country</Label>
            <Select
              value={state.selectedCountry || ""}
              onValueChange={(value) => onStateChange("selectedCountry", value)}
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

          <div className="space-y-2">
            <Label>Describe your experience</Label>
            <Textarea
              placeholder="How was your experience? Was the service good? Any issues?"
              value={state.experience}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                onStateChange("experience", e.target.value)
              }
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Service Quality</Label>
              <Slider
                value={[state.ratings.serviceQuality]}
                min={1}
                max={5}
                step={1}
                onValueChange={([value]) =>
                  onStateChange("ratings", {
                    ...state.ratings,
                    serviceQuality: value,
                  })
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
                  onStateChange("ratings", {
                    ...state.ratings,
                    foodQuality: value,
                  })
                }
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Poor</span>
                <span>Excellent</span>
              </div>
            </div>
          </div>
        </div>

        <Button onClick={onGetRecommendation} disabled={isLoading}>
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
  );
}
